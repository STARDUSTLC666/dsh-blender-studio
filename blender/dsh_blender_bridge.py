bl_info = {
    "name": "DSH Blender Bridge",
    "author": "stardustlc / DeepSeek Harness",
    "version": (0, 1, 0),
    "blender": (3, 6, 0),
    "location": "View3D > Sidebar (N) > DSH Bridge",
    "description": "Loopback-only JSON-RPC live bridge for DeepSeek Harness (dsh-blender-studio)",
    "warning": "",
    "doc_url": "",
    "category": "System",
}

import atexit
import base64
import contextlib
import datetime
import hmac
import io
import json
import math
import os
import queue
import socket
import struct
import tempfile
import threading
import traceback

import bpy

try:
    import mathutils
except ImportError:
    mathutils = None


BRIDGE_HOST = "127.0.0.1"
DEFAULT_PORT = 9876
MAX_FRAME_BYTES = 8 * 1024 * 1024  # 8 MB
TIMER_INTERVAL_SECONDS = 0.05
DEFAULT_COMMAND_TIMEOUT_SECONDS = 60.0
MAX_COMMAND_TIMEOUT_SECONDS = 300.0
MAX_CONCURRENT_CLIENTS = 8
MAX_SCENE_OBJECTS = 250


def _iso_now():
    return (
        datetime.datetime.now(datetime.timezone.utc)
        .isoformat()
        .replace("+00:00", "Z")
    )


def _blender_version_str():
    return ".".join(str(part) for part in bpy.app.version)


def _round_vec(vec, digits=4):
    return [round(float(vec[0]), digits), round(float(vec[1]), digits), round(float(vec[2]), digits)]


def _safe_undo_push(message):
    try:
        if hasattr(bpy.ops, "ed") and hasattr(bpy.ops.ed, "undo_push"):
            bpy.ops.ed.undo_push(message=message)
    except Exception:
        pass


def _resolve_eevee_engine():
    """Return the valid EEVEE engine identifier for Blender 3.6, 4.x, and 5.x."""
    if bpy.app.version >= (4, 2, 0):
        # Blender 4.2-4.x uses BLENDER_EEVEE_NEXT; check enum in case 5.x renames back.
        try:
            enum_items = {
                item.identifier
                for item in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items
            }
            if "BLENDER_EEVEE_NEXT" in enum_items:
                return "BLENDER_EEVEE_NEXT"
            if "BLENDER_EEVEE" in enum_items:
                return "BLENDER_EEVEE"
        except Exception:
            return "BLENDER_EEVEE_NEXT"
    return "BLENDER_EEVEE"


def _collect_scene_summary():
    scene = bpy.context.scene
    objects = []
    mesh_count = 0
    light_count = 0
    camera_count = 0
    total_polygons = 0

    all_objs = list(scene.objects)
    for obj in all_objs:
        obj_type = str(obj.type)
        if obj_type == "MESH":
            mesh_count += 1
        elif obj_type == "LIGHT":
            light_count += 1
        elif obj_type == "CAMERA":
            camera_count += 1

        verts = None
        polys = None
        if obj_type == "MESH" and obj.data is not None:
            try:
                verts = int(len(obj.data.vertices))
                polys = int(len(obj.data.polygons))
                total_polygons += polys
            except Exception:
                pass

        if len(objects) < MAX_SCENE_OBJECTS:
            entry = {
                "name": obj.name,
                "type": obj_type,
                "location": _round_vec(obj.location),
            }
            try:
                entry["dimensions"] = _round_vec(obj.dimensions)
            except Exception:
                pass
            try:
                entry["materialCount"] = int(len(obj.material_slots))
            except Exception:
                pass
            if verts is not None:
                entry["vertices"] = verts
            if polys is not None:
                entry["polygons"] = polys
            objects.append(entry)

    collections = []
    seen_collections = set()
    if scene.collection is not None:
        collections.append(scene.collection.name)
        seen_collections.add(scene.collection.name)
    for col in bpy.data.collections:
        if col.name not in seen_collections:
            collections.append(col.name)
            seen_collections.add(col.name)

    materials = [mat.name for mat in bpy.data.materials]

    summary = {
        "capturedAt": _iso_now(),
        "blenderVersion": _blender_version_str(),
        "engine": str(scene.render.engine),
        "objectCount": int(len(all_objs)),
        "meshCount": int(mesh_count),
        "lightCount": int(light_count),
        "cameraCount": int(camera_count),
        "totalPolygons": int(total_polygons),
        "materials": materials,
        "collections": collections,
        "objects": objects,
    }
    if scene.camera is not None:
        summary["activeCamera"] = scene.camera.name
    return summary


def _clear_current_scene():
    """Safely clear objects and unused data blocks in the active scene without resetting UI/Add-ons."""
    scene = bpy.context.scene

    try:
        if bpy.context.mode != "OBJECT" and hasattr(bpy.ops.object, "mode_set"):
            bpy.ops.object.mode_set(mode="OBJECT")
    except Exception:
        pass

    for obj in list(scene.objects):
        try:
            bpy.data.objects.remove(obj, do_unlink=True)
        except Exception:
            pass

    for child_col in list(scene.collection.children):
        try:
            scene.collection.children.unlink(child_col)
            if child_col.users == 0:
                bpy.data.collections.remove(child_col)
        except Exception:
            pass

    # Purge zero-user datablocks safely across Blender 3.6-5.x
    block_collections = (
        "meshes",
        "lights",
        "cameras",
        "materials",
        "curves",
        "metaballs",
        "grease_pencils",
        "grease_pencils_v3",
        "node_groups",
        "actions",
        "worlds",
    )
    for attr in block_collections:
        datablocks = getattr(bpy.data, attr, None)
        if datablocks is None:
            continue
        for block in list(datablocks):
            try:
                if block.users == 0:
                    datablocks.remove(block)
            except Exception:
                pass


def _find_view3d_override():
    wm = bpy.context.window_manager
    if wm is None:
        return None
    for window in wm.windows:
        screen = window.screen
        if screen is None:
            continue
        for area in screen.areas:
            if area.type == "VIEW_3D":
                window_region = None
                for region in area.regions:
                    if region.type == "WINDOW":
                        window_region = region
                        break
                override = {"window": window, "screen": screen, "area": area}
                if window_region is not None:
                    override["region"] = window_region
                return override
    return None


def _read_png_dimensions(data, fallback_w, fallback_h):
    if len(data) >= 24 and data[:8] == b"\x89PNG\r\n\x1a\n" and data[12:16] == b"IHDR":
        w, h = struct.unpack(">II", data[16:24])
        return int(w), int(h)
    return int(fallback_w), int(fallback_h)


def _cmd_ping(_params):
    scene = bpy.context.scene
    return {
        "blenderVersion": _blender_version_str(),
        "sceneName": scene.name,
        "engine": str(scene.render.engine),
        "frameCurrent": int(scene.frame_current),
        "objectCount": int(len(scene.objects)),
    }


def _cmd_scene_info(_params):
    return _collect_scene_summary()


def _cmd_execute(params):
    code = params.get("code")
    if not isinstance(code, str) or not code.strip():
        raise ValueError("Parameter 'code' must be a non-empty string")
    push_undo = params.get("pushUndo", True)
    if not isinstance(push_undo, bool):
        push_undo = bool(push_undo)

    stdout_buf = io.StringIO()
    stderr_buf = io.StringIO()
    exec_globals = {
        "__name__": "__main__",
        "bpy": bpy,
        "math": math,
    }
    if mathutils is not None:
        exec_globals["mathutils"] = mathutils

    compiled = compile(code, "<dsh_bridge_execute>", "exec")
    with contextlib.redirect_stdout(stdout_buf), contextlib.redirect_stderr(stderr_buf):
        exec(compiled, exec_globals, exec_globals)

    try:
        bpy.context.view_layer.update()
    except Exception:
        pass

    if push_undo:
        _safe_undo_push("DSH Bridge Execute")

    return {
        "stdout": stdout_buf.getvalue(),
        "stderr": stderr_buf.getvalue(),
        "sceneSummary": _collect_scene_summary(),
    }


def _cmd_load_script(params):
    code = params.get("code")
    if not isinstance(code, str) or not code.strip():
        raise ValueError("Parameter 'code' must be a non-empty string")
    clear_scene = params.get("clearScene", True)
    if not isinstance(clear_scene, bool):
        clear_scene = bool(clear_scene)
    project_title = params.get("projectTitle")
    if not isinstance(project_title, str):
        project_title = "DSH Project"

    if clear_scene:
        _clear_current_scene()

    stdout_buf = io.StringIO()
    stderr_buf = io.StringIO()
    exec_globals = {
        "__name__": "__main__",
        "__DSH_PROJECT_TITLE__": project_title,
        "bpy": bpy,
        "math": math,
    }
    if mathutils is not None:
        exec_globals["mathutils"] = mathutils

    compiled = compile(code, "<dsh_bridge_load_script>", "exec")
    with contextlib.redirect_stdout(stdout_buf), contextlib.redirect_stderr(stderr_buf):
        exec(compiled, exec_globals, exec_globals)

    try:
        bpy.context.view_layer.update()
    except Exception:
        pass

    _safe_undo_push("DSH Load: " + project_title[:48])

    return {
        "stdout": stdout_buf.getvalue(),
        "stderr": stderr_buf.getvalue(),
        "sceneSummary": _collect_scene_summary(),
    }


def _cmd_viewport_capture(params):
    raw_width = params.get("width", 960)
    raw_height = params.get("height", 540)
    try:
        width = max(64, min(3840, int(raw_width)))
        height = max(64, min(2160, int(raw_height)))
    except (TypeError, ValueError):
        raise ValueError("Parameters 'width' and 'height' must be valid integers")

    scene = bpy.context.scene
    render = scene.render
    img_settings = render.image_settings

    # Save current render configuration
    prev_filepath = render.filepath
    prev_res_x = render.resolution_x
    prev_res_y = render.resolution_y
    prev_res_pct = render.resolution_percentage
    prev_format = img_settings.file_format
    prev_color_mode = img_settings.color_mode
    prev_engine = render.engine
    prev_camera = scene.camera
    temp_cam_obj = None
    temp_cam_data = None

    tmp = tempfile.NamedTemporaryFile(prefix="dsh_vp_", suffix=".png", delete=False)
    tmp_path = tmp.name
    tmp.close()

    try:
        render.filepath = tmp_path
        render.resolution_x = width
        render.resolution_y = height
        render.resolution_percentage = 100
        img_settings.file_format = "PNG"
        img_settings.color_mode = "RGBA"

        captured = False
        override = _find_view3d_override()
        if override is not None:
            try:
                if hasattr(bpy.context, "temp_override"):
                    with bpy.context.temp_override(**override):
                        bpy.ops.render.opengl(write_still=True, view_context=True)
                else:
                    bpy.ops.render.opengl(override, write_still=True, view_context=True)
                if os.path.exists(tmp_path) and os.path.getsize(tmp_path) > 0:
                    captured = True
            except Exception:
                captured = False

        if not captured:
            # Fallback to fast camera render (Workbench / EEVEE)
            if scene.camera is None:
                temp_cam_data = bpy.data.cameras.new("_DSH_Bridge_TempCam")
                temp_cam_obj = bpy.data.objects.new("_DSH_Bridge_TempCam", temp_cam_data)
                scene.collection.objects.link(temp_cam_obj)
                temp_cam_obj.location = (5.0, -5.0, 3.6)
                if mathutils is not None:
                    direction = mathutils.Vector((0.0, 0.0, 0.6)) - temp_cam_obj.location
                    temp_cam_obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
                else:
                    temp_cam_obj.rotation_euler = (math.radians(63.0), 0.0, math.radians(45.0))
                scene.camera = temp_cam_obj

            try:
                render.engine = "BLENDER_WORKBENCH"
            except Exception:
                try:
                    render.engine = _resolve_eevee_engine()
                except Exception:
                    pass

            bpy.ops.render.render(write_still=True)

        if not os.path.exists(tmp_path) or os.path.getsize(tmp_path) == 0:
            raise RuntimeError("Viewport capture produced an empty image")

        with open(tmp_path, "rb") as fh:
            png_bytes = fh.read()

        actual_w, actual_h = _read_png_dimensions(png_bytes, width, height)
        return {
            "mime": "image/png",
            "base64": base64.b64encode(png_bytes).decode("ascii"),
            "width": actual_w,
            "height": actual_h,
        }
    finally:
        render.filepath = prev_filepath
        render.resolution_x = prev_res_x
        render.resolution_y = prev_res_y
        render.resolution_percentage = prev_res_pct
        img_settings.file_format = prev_format
        img_settings.color_mode = prev_color_mode
        try:
            render.engine = prev_engine
        except Exception:
            pass
        scene.camera = prev_camera
        if temp_cam_obj is not None:
            try:
                bpy.data.objects.remove(temp_cam_obj, do_unlink=True)
            except Exception:
                pass
        if temp_cam_data is not None:
            try:
                bpy.data.cameras.remove(temp_cam_data)
            except Exception:
                pass
        try:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
        except Exception:
            pass


COMMAND_HANDLERS = {
    "ping": _cmd_ping,
    "scene_info": _cmd_scene_info,
    "execute": _cmd_execute,
    "viewport_capture": _cmd_viewport_capture,
    "load_script": _cmd_load_script,
}


class _BridgeTask:
    __slots__ = ("command", "params", "event", "response", "timed_out")

    def __init__(self, command, params):
        self.command = command
        self.params = params
        self.event = threading.Event()
        self.response = None
        self.timed_out = False


class DSHBridgeServer:
    """Loopback-only TCP newline-delimited JSON-RPC bridge dispatching onto Blender's main thread."""

    def __init__(self):
        self._lock = threading.Lock()
        self._running = False
        self._port = DEFAULT_PORT
        self._token = ""
        self._sock = None
        self._accept_thread = None
        self._stop_event = threading.Event()
        self._queue = queue.Queue()
        self._client_semaphore = threading.Semaphore(MAX_CONCURRENT_CLIENTS)
        self._request_count = 0
        self._last_command = ""
        self._last_error = ""
        self._timer_registered = False
        self._timer_cb = self._process_queue

    @property
    def running(self):
        return self._running

    @property
    def port(self):
        return self._port

    @property
    def request_count(self):
        return self._request_count

    @property
    def last_command(self):
        return self._last_command

    @property
    def last_error(self):
        return self._last_error

    def start(self, port=DEFAULT_PORT, token=""):
        with self._lock:
            if self._running:
                return
            port_int = int(port)
            if port_int < 1024 or port_int > 65535:
                raise ValueError("Bridge port must be between 1024 and 65535")

            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            sock.bind((BRIDGE_HOST, port_int))
            sock.listen(MAX_CONCURRENT_CLIENTS)
            sock.settimeout(0.5)

            self._port = port_int
            self._token = token or ""
            self._sock = sock
            self._stop_event.clear()
            self._running = True
            self._last_error = ""

            # Drain stale queue items if any
            while True:
                try:
                    self._queue.get_nowait()
                except queue.Empty:
                    break

            if not bpy.app.timers.is_registered(self._timer_cb):
                bpy.app.timers.register(
                    self._timer_cb,
                    first_interval=TIMER_INTERVAL_SECONDS,
                    persistent=True,
                )
            self._timer_registered = True

            self._accept_thread = threading.Thread(
                target=self._accept_loop,
                name="DSHBridgeAccept",
                daemon=True,
            )
            self._accept_thread.start()

    def stop(self):
        with self._lock:
            if not self._running and self._sock is None:
                return
            self._running = False
            self._stop_event.set()
            sock = self._sock
            self._sock = None
            thread = self._accept_thread
            self._accept_thread = None

        if sock is not None:
            try:
                sock.close()
            except Exception:
                pass

        if self._timer_registered:
            try:
                if bpy.app.timers.is_registered(self._timer_cb):
                    bpy.app.timers.unregister(self._timer_cb)
            except Exception:
                pass
            self._timer_registered = False

        # Wake any waiting tasks so client threads exit promptly
        while True:
            try:
                task = self._queue.get_nowait()
                task.response = {
                    "ok": False,
                    "error": {
                        "code": "BRIDGE_UNREACHABLE",
                        "message": "DSH Bridge server stopped",
                    },
                }
                task.event.set()
            except queue.Empty:
                break

        if thread is not None and thread.is_alive() and thread is not threading.current_thread():
            thread.join(timeout=1.5)

    def _accept_loop(self):
        while not self._stop_event.is_set():
            sock = self._sock
            if sock is None:
                break
            try:
                conn, _addr = sock.accept()
            except socket.timeout:
                continue
            except OSError:
                break

            if not self._client_semaphore.acquire(blocking=False):
                try:
                    self._send_frame(
                        conn,
                        {
                            "id": None,
                            "ok": False,
                            "result": None,
                            "error": {
                                "code": "BRIDGE_UNREACHABLE",
                                "message": "Too many concurrent bridge clients",
                            },
                        },
                    )
                except Exception:
                    pass
                try:
                    conn.close()
                except Exception:
                    pass
                continue

            client_thread = threading.Thread(
                target=self._handle_client,
                args=(conn,),
                name="DSHBridgeClient",
                daemon=True,
            )
            client_thread.start()

    def _send_frame(self, conn, payload):
        encoded = (json.dumps(payload, ensure_ascii=False) + "\n").encode("utf-8")
        if len(encoded) > MAX_FRAME_BYTES:
            fallback = {
                "id": payload.get("id"),
                "ok": False,
                "result": None,
                "error": {
                    "code": "BRIDGE_PROTOCOL_ERROR",
                    "message": "Response exceeds 8 MB frame limit",
                },
            }
            encoded = (json.dumps(fallback, ensure_ascii=False) + "\n").encode("utf-8")
        conn.sendall(encoded)

    def _handle_client(self, conn):
        try:
            conn.settimeout(5.0)
            buf = bytearray()
            while not self._stop_event.is_set():
                try:
                    chunk = conn.recv(65536)
                except socket.timeout:
                    continue
                except OSError:
                    break

                if not chunk:
                    # Handle trailing request without final newline if present
                    if buf:
                        response = self._handle_raw_line(bytes(buf))
                        self._send_frame(conn, response)
                    break

                buf.extend(chunk)
                if len(buf) > MAX_FRAME_BYTES:
                    self._send_frame(
                        conn,
                        {
                            "id": None,
                            "ok": False,
                            "result": None,
                            "error": {
                                "code": "BRIDGE_PROTOCOL_ERROR",
                                "message": "Request frame exceeds 8 MB limit",
                            },
                        },
                    )
                    break

                while True:
                    nl_idx = buf.find(b"\n")
                    if nl_idx == -1:
                        break
                    raw_line = bytes(buf[:nl_idx])
                    del buf[: nl_idx + 1]
                    if not raw_line.strip():
                        continue
                    response = self._handle_raw_line(raw_line)
                    self._send_frame(conn, response)
        except Exception:
            pass
        finally:
            try:
                conn.close()
            except Exception:
                pass
            self._client_semaphore.release()

    def _handle_raw_line(self, raw_bytes):
        try:
            text = raw_bytes.decode("utf-8")
            req = json.loads(text)
        except Exception as exc:
            return {
                "id": None,
                "ok": False,
                "result": None,
                "error": {
                    "code": "BRIDGE_PROTOCOL_ERROR",
                    "message": "Invalid JSON frame: " + str(exc),
                },
            }

        if not isinstance(req, dict):
            return {
                "id": None,
                "ok": False,
                "result": None,
                "error": {
                    "code": "BRIDGE_PROTOCOL_ERROR",
                    "message": "Request frame must be a JSON object",
                },
            }

        req_id = req.get("id")
        if req_id is not None and not isinstance(req_id, str):
            req_id = str(req_id)

        # Verify shared secret token if configured
        expected_token = self._token
        if expected_token:
            provided_token = req.get("token")
            if not isinstance(provided_token, str) or not hmac.compare_digest(
                provided_token, expected_token
            ):
                return {
                    "id": req_id,
                    "ok": False,
                    "result": None,
                    "error": {
                        "code": "BRIDGE_AUTH_FAILED",
                        "message": "Bridge authentication token is missing or invalid",
                    },
                }

        command = req.get("command")
        if not isinstance(command, str) or command not in COMMAND_HANDLERS:
            return {
                "id": req_id,
                "ok": False,
                "result": None,
                "error": {
                    "code": "BRIDGE_PROTOCOL_ERROR",
                    "message": "Unknown bridge command: " + str(command),
                },
            }

        params = req.get("params")
        if params is None:
            params = {}
        elif not isinstance(params, dict):
            return {
                "id": req_id,
                "ok": False,
                "result": None,
                "error": {
                    "code": "BRIDGE_PROTOCOL_ERROR",
                    "message": "Field 'params' must be an object",
                },
            }

        timeout_sec = DEFAULT_COMMAND_TIMEOUT_SECONDS
        raw_timeout_ms = params.get("timeoutMs")
        if isinstance(raw_timeout_ms, (int, float)) and raw_timeout_ms > 0:
            timeout_sec = max(1.0, min(MAX_COMMAND_TIMEOUT_SECONDS, float(raw_timeout_ms) / 1000.0))

        task = _BridgeTask(command, params)
        self._queue.put(task)

        finished = task.event.wait(timeout=timeout_sec)
        if not finished:
            task.timed_out = True
            return {
                "id": req_id,
                "ok": False,
                "result": None,
                "error": {
                    "code": "BRIDGE_TIMEOUT",
                    "message": "Blender main-thread execution timed out after {:.1f}s".format(timeout_sec),
                },
            }

        res = task.response or {
            "ok": False,
            "error": {"code": "BRIDGE_PROTOCOL_ERROR", "message": "Empty response from main thread"},
        }
        if res.get("ok"):
            return {
                "id": req_id,
                "ok": True,
                "result": res.get("result"),
                "error": None,
            }
        return {
            "id": req_id,
            "ok": False,
            "result": None,
            "error": res.get("error") or {"code": "BRIDGE_PROTOCOL_ERROR", "message": "Command failed"},
        }

    def _process_queue(self):
        if not self._running:
            return None

        processed = 0
        while processed < 16:
            try:
                task = self._queue.get_nowait()
            except queue.Empty:
                break

            processed += 1
            if task.timed_out:
                continue

            handler = COMMAND_HANDLERS.get(task.command)
            self._last_command = task.command
            try:
                result = handler(task.params)
                self._request_count += 1
                self._last_error = ""
                task.response = {"ok": True, "result": result}
            except Exception as exc:
                tb = traceback.format_exc()
                self._last_error = str(exc)
                task.response = {
                    "ok": False,
                    "error": {
                        "code": "BRIDGE_EXECUTION_ERROR",
                        "message": str(exc),
                        "traceback": tb[-2000:],
                    },
                }
            finally:
                task.event.set()

        return TIMER_INTERVAL_SECONDS if self._running else None


_SERVER = DSHBridgeServer()


class DSHBridgeProperties(bpy.types.PropertyGroup):
    port: bpy.props.IntProperty(
        name="Port",
        description="Local loopback TCP port for DeepSeek Harness Bridge (127.0.0.1 only)",
        default=DEFAULT_PORT,
        min=1024,
        max=65535,
    )
    token: bpy.props.StringProperty(
        name="Token",
        description="Optional shared secret token required by clients",
        default="",
        subtype="PASSWORD",
    )


class DSHBRIDGE_OT_start(bpy.types.Operator):
    bl_idname = "dsh_bridge.start_server"
    bl_label = "Start DSH Bridge"
    bl_description = "Start the loopback-only TCP JSON-RPC server on 127.0.0.1"

    def execute(self, context):
        props = context.window_manager.dsh_bridge
        try:
            _SERVER.start(port=props.port, token=props.token)
            self.report({"INFO"}, "DSH Bridge listening on {}:{}".format(BRIDGE_HOST, props.port))
            return {"FINISHED"}
        except Exception as exc:
            self.report({"ERROR"}, "Failed to start DSH Bridge: {}".format(exc))
            return {"CANCELLED"}


class DSHBRIDGE_OT_stop(bpy.types.Operator):
    bl_idname = "dsh_bridge.stop_server"
    bl_label = "Stop DSH Bridge"
    bl_description = "Stop the running DSH Bridge TCP server"

    def execute(self, context):
        _SERVER.stop()
        self.report({"INFO"}, "DSH Bridge stopped")
        return {"FINISHED"}


class DSHBRIDGE_PT_panel(bpy.types.Panel):
    bl_label = "DSH Blender Bridge"
    bl_idname = "DSHBRIDGE_PT_panel"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "DSH Bridge"

    def draw(self, context):
        layout = self.layout
        props = context.window_manager.dsh_bridge

        status_box = layout.box()
        status_row = status_box.row()
        if _SERVER.running:
            status_row.label(
                text="Status: Running ({}:{})".format(BRIDGE_HOST, _SERVER.port),
                icon="CHECKMARK",
            )
        else:
            status_row.label(text="Status: Stopped", icon="X")

        status_box.label(text="Blender: {}".format(_blender_version_str()))
        status_box.label(text="Requests Handled: {}".format(_SERVER.request_count))
        if _SERVER.last_command:
            status_box.label(text="Last Command: {}".format(_SERVER.last_command))
        if _SERVER.last_error:
            err_row = status_box.row()
            err_row.alert = True
            err_row.label(text="Last Error: {}".format(_SERVER.last_error[:64]))

        cfg_box = layout.box()
        cfg_box.label(text="Connection (Loopback Only)")
        host_row = cfg_box.row()
        host_row.enabled = False
        host_row.label(text="Host: {}".format(BRIDGE_HOST))

        port_row = cfg_box.row()
        port_row.enabled = not _SERVER.running
        port_row.prop(props, "port")

        token_row = cfg_box.row()
        token_row.enabled = not _SERVER.running
        token_row.prop(props, "token")

        btn_row = layout.row(align=True)
        btn_row.scale_y = 1.3
        if _SERVER.running:
            btn_row.operator("dsh_bridge.stop_server", icon="PAUSE")
        else:
            btn_row.operator("dsh_bridge.start_server", icon="PLAY")


_CLASSES = (
    DSHBridgeProperties,
    DSHBRIDGE_OT_start,
    DSHBRIDGE_OT_stop,
    DSHBRIDGE_PT_panel,
)


def _atexit_cleanup():
    try:
        _SERVER.stop()
    except Exception:
        pass


def register():
    for cls in _CLASSES:
        bpy.utils.register_class(cls)
    bpy.types.WindowManager.dsh_bridge = bpy.props.PointerProperty(type=DSHBridgeProperties)
    atexit.register(_atexit_cleanup)


def unregister():
    _SERVER.stop()
    try:
        atexit.unregister(_atexit_cleanup)
    except Exception:
        pass
    if hasattr(bpy.types.WindowManager, "dsh_bridge"):
        del bpy.types.WindowManager.dsh_bridge
    for cls in reversed(_CLASSES):
        bpy.utils.unregister_class(cls)


if __name__ == "__main__":
    register()
