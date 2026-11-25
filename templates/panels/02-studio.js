// 02-studio.js — OP-DSH 3D Studio Console, self-contained HTML5 Canvas 3D software renderer,
// multi-view artifact switcher (Stage / Still / 4-View QC / Animation), Outliner, bpy Script Editor & Form mode.

const CAMERA_PRESET_ANGLES = {
  three_quarter: { yaw: 0.68, pitch: 0.44, zoom: 1.0, ortho: false },
  front: { yaw: 0.0, pitch: 0.12, zoom: 1.05, ortho: false },
  isometric: { yaw: 0.785, pitch: 0.615, zoom: 1.02, ortho: true },
  top: { yaw: 0.0, pitch: 1.38, zoom: 0.96, ortho: false },
  closeup: { yaw: 0.46, pitch: 0.30, zoom: 1.48, ortho: false },
  turntable: { yaw: 0.62, pitch: 0.38, zoom: 1.0, ortho: false },
};

const LIGHTING_PALETTES = {
  studio_3point: { bgTop: '#2b3240', bgBot: '#1d222c', key: '#fff7e6', fill: '#93c5fd', rim: '#f8fafc', ambient: 0.34, keyDir: [0.65, -0.55, 0.78] },
  soft_daylight: { bgTop: '#334155', bgBot: '#232c3a', key: '#ffffff', fill: '#bae6fd', rim: '#fef3c7', ambient: 0.48, keyDir: [0.45, -0.35, 0.90] },
  dramatic_rim: { bgTop: '#232634', bgBot: '#171a24', key: '#fdba74', fill: '#475569', rim: '#38bdf8', ambient: 0.20, keyDir: [0.85, -0.25, 0.55] },
  neon_cyber: { bgTop: '#24223b', bgBot: '#181c2b', key: '#f472b6', fill: '#38bdf8', rim: '#a78bfa', ambient: 0.28, keyDir: [0.72, -0.60, 0.58] },
  clay_overcast: { bgTop: '#363c48', bgBot: '#272c36', key: '#f1f5f9', fill: '#cbd5e1', rim: '#e2e8f0', ambient: 0.52, keyDir: [0.25, -0.25, 0.94] },
};

function parseHexRgb(hex) {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(hex || '').trim());
  if (!m) return [59, 130, 246];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function shadeFaceColor(baseRgb, intensity, materialPreset, rimFactor) {
  let factor = Math.max(0.14, Math.min(1.55, intensity));
  let alpha = 0.96;
  let specBoost = 0;
  if (materialPreset === 'toon_cel') {
    factor = factor > 0.85 ? 1.15 : factor > 0.5 ? 0.82 : 0.46;
  } else if (materialPreset === 'brushed_metal') {
    specBoost = Math.pow(Math.max(0, intensity - 0.52), 2) * 115 + rimFactor * 36;
    factor = 0.38 + factor * 0.72;
  } else if (materialPreset === 'ceramic_gloss') {
    specBoost = Math.pow(Math.max(0, intensity - 0.68), 3) * 145 + rimFactor * 24;
  } else if (materialPreset === 'frosted_glass') {
    alpha = 0.62;
    specBoost = 32 + rimFactor * 48;
  } else if (materialPreset === 'clay_matte') {
    factor = 0.42 + factor * 0.58;
  }
  const r = Math.max(0, Math.min(255, Math.round(baseRgb[0] * factor + specBoost)));
  const g = Math.max(0, Math.min(255, Math.round(baseRgb[1] * factor + specBoost)));
  const b = Math.max(0, Math.min(255, Math.round(baseRgb[2] * factor + specBoost)));
  return `rgba(${r},${g},${b},${alpha})`;
}

function makeBoxFaces(cx, cy, cz, sx, sy, sz, rgb, wireColor, layer = 2) {
  const hx = sx / 2;
  const hy = sy / 2;
  const hz = sz / 2;
  const v = [
    [cx - hx, cy - hy, cz - hz],
    [cx + hx, cy - hy, cz - hz],
    [cx + hx, cy + hy, cz - hz],
    [cx - hx, cy + hy, cz - hz],
    [cx - hx, cy - hy, cz + hz],
    [cx + hx, cy - hy, cz + hz],
    [cx + hx, cy + hy, cz + hz],
    [cx - hx, cy + hy, cz + hz],
  ];
  const quads = [
    [4, 5, 6, 7], // top +Z
    [0, 3, 2, 1], // bottom -Z
    [0, 1, 5, 4], // front -Y
    [2, 3, 7, 6], // back +Y
    [1, 2, 6, 5], // right +X
    [3, 0, 4, 7], // left -X
  ];
  return quads.map(idx => ({ pts: idx.map(i => v[i]), rgb, wire: wireColor, layer }));
}

function makeRotatedBoxFaces(cx, cy, cz, sx, sy, sz, rotZ, rotX, rgb, wireColor, layer = 2, rotY = 0) {
  const hx = sx / 2;
  const hy = sy / 2;
  const hz = sz / 2;
  const cX = Math.cos(rotX || 0);
  const sX = Math.sin(rotX || 0);
  const cY = Math.cos(rotY || 0);
  const sY = Math.sin(rotY || 0);
  const cZ = Math.cos(rotZ || 0);
  const sZ = Math.sin(rotZ || 0);
  const local = [
    [-hx, -hy, -hz],
    [hx, -hy, -hz],
    [hx, hy, -hz],
    [-hx, hy, -hz],
    [-hx, -hy, hz],
    [hx, -hy, hz],
    [hx, hy, hz],
    [-hx, hy, hz],
  ];
  const v = local.map(([lx, ly, lz]) => {
    const y1 = ly * cX - lz * sX;
    const z1 = ly * sX + lz * cX;
    const x2 = lx * cY + z1 * sY;
    const z2 = -lx * sY + z1 * cY;
    const x3 = x2 * cZ - y1 * sZ;
    const y3 = x2 * sZ + y1 * cZ;
    return [cx + x3, cy + y3, cz + z2];
  });
  const quads = [
    [4, 5, 6, 7],
    [0, 3, 2, 1],
    [0, 1, 5, 4],
    [2, 3, 7, 6],
    [1, 2, 6, 5],
    [3, 0, 4, 7],
  ];
  return quads.map(idx => ({ pts: idx.map(i => v[i]), rgb, wire: wireColor, layer }));
}

function makeCylinderFaces(cx, cy, cz, rTop, rBot, hVal, segs, rgb, wireColor, layer = 2) {
  const faces = [];
  const z0 = cz - hVal / 2;
  const z1 = cz + hVal / 2;
  const topRing = [];
  const botRing = [];
  for (let i = 0; i < segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    topRing.push([cx + ca * rTop, cy + sa * rTop, z1]);
    botRing.push([cx + ca * rBot, cy + sa * rBot, z0]);
  }
  for (let i = 0; i < segs; i++) {
    const n = (i + 1) % segs;
    faces.push({ pts: [botRing[i], botRing[n], topRing[n], topRing[i]], rgb, wire: wireColor, layer });
  }
  faces.push({ pts: topRing.slice(), rgb, wire: wireColor, layer });
  faces.push({ pts: botRing.slice().reverse(), rgb, wire: wireColor, layer });
  return faces;
}

function makeUvSphereFaces(cx, cy, cz, radius, rings, segs, rgb, wireColor, layer = 2) {
  const faces = [];
  const pt = (lat, lon) => [
    cx + radius * Math.cos(lat) * Math.cos(lon),
    cy + radius * Math.cos(lat) * Math.sin(lon),
    cz + radius * Math.sin(lat),
  ];
  for (let r = 0; r < rings; r++) {
    const lat0 = -Math.PI / 2 + (r / rings) * Math.PI;
    const lat1 = -Math.PI / 2 + ((r + 1) / rings) * Math.PI;
    for (let s = 0; s < segs; s++) {
      const lon0 = (s / segs) * Math.PI * 2;
      const lon1 = ((s + 1) / segs) * Math.PI * 2;
      faces.push({
        pts: [pt(lat0, lon0), pt(lat0, lon1), pt(lat1, lon1), pt(lat1, lon0)],
        rgb,
        wire: wireColor,
        layer,
      });
    }
  }
  return faces;
}

function buildTemplateGeometry(template, accentRgb, phase) {
  const neutralLight = [212, 220, 232];
  const neutralMid = [148, 163, 184];
  const neutralDark = [82, 95, 115];
  const warmWood = [194, 152, 114];
  const mintLeaf = [74, 222, 128];
  const wire = 'rgba(248,250,252,0.16)';
  const faces = [];

  if (template === 'product-studio') {
    faces.push(...makeCylinderFaces(0, 0, 0.14, 1.55, 1.68, 0.28, 18, neutralMid, wire, 0));
    faces.push(...makeCylinderFaces(0, 0, 0.36, 1.15, 1.24, 0.18, 18, neutralLight, wire, 1));
    faces.push(...makeCylinderFaces(0, 0, 1.05, 0.56, 0.62, 1.22, 16, accentRgb, wire, 2));
    faces.push(...makeUvSphereFaces(0, 0, 1.82 + Math.sin(phase * Math.PI * 2) * 0.06, 0.44, 7, 12, neutralLight, wire, 3));
    const orbAngle = phase * Math.PI * 2;
    faces.push(...makeUvSphereFaces(Math.cos(orbAngle) * 1.18, Math.sin(orbAngle) * 1.18, 1.25, 0.17, 5, 8, accentRgb, wire, 3));
  } else if (template === 'logo-3d') {
    faces.push(...makeBoxFaces(0, 0, 0.14, 3.1, 1.35, 0.28, neutralDark, wire, 0));
    faces.push(...makeBoxFaces(-0.92, 0, 1.02, 0.62, 0.44, 1.48, accentRgb, wire, 2));
    faces.push(...makeBoxFaces(0, 0, 1.16, 0.72, 0.48, 1.76, neutralLight, wire, 2));
    faces.push(...makeBoxFaces(0.92, 0, 0.94, 0.62, 0.44, 1.32, accentRgb, wire, 2));
    faces.push(...makeBoxFaces(0, -0.34, 0.46, 2.55, 0.18, 0.26, accentRgb, wire, 3));
  } else if (template === 'isometric-room') {
    faces.push(...makeBoxFaces(0, 0, 0.07, 3.0, 3.0, 0.14, neutralMid, wire, 0));
    faces.push(...makeBoxFaces(-1.43, 0, 1.12, 0.14, 3.0, 2.0, neutralLight, wire, 0));
    faces.push(...makeBoxFaces(0, 1.43, 1.12, 3.0, 0.14, 2.0, [196, 206, 220], wire, 0));
    // Desk & monitor
    faces.push(...makeBoxFaces(-0.55, 0.72, 0.74, 1.4, 0.72, 0.1, warmWood, wire, 2));
    faces.push(...makeBoxFaces(-1.15, 0.45, 0.42, 0.1, 0.1, 0.62, neutralDark, wire, 1));
    faces.push(...makeBoxFaces(0.05, 0.45, 0.42, 0.1, 0.1, 0.62, neutralDark, wire, 1));
    faces.push(...makeBoxFaces(-0.55, 0.88, 1.14, 0.78, 0.08, 0.48, accentRgb, wire, 3));
    // Chair / ottoman
    faces.push(...makeBoxFaces(-0.45, -0.25, 0.36, 0.56, 0.56, 0.44, accentRgb, wire, 2));
    // Planter + foliage
    faces.push(...makeBoxFaces(0.92, 0.88, 0.34, 0.52, 0.52, 0.46, warmWood, wire, 2));
    faces.push(...makeUvSphereFaces(0.92, 0.88, 0.84, 0.38, 6, 10, mintLeaf, wire, 3));
    // Wall shelf
    faces.push(...makeBoxFaces(-1.2, -0.3, 1.56, 0.32, 1.1, 0.08, warmWood, wire, 2));
  } else if (template === 'motion-data') {
    faces.push(...makeBoxFaces(0, 0, 0.07, 3.3, 2.5, 0.14, neutralDark, wire, 0));
    const baseHeights = [
      [0.55, 1.15, 0.88, 1.55],
      [0.95, 1.85, 1.42, 1.12],
      [0.68, 1.28, 1.98, 0.86],
    ];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        const wave = 1 + 0.18 * Math.sin(phase * Math.PI * 2 + c * 0.75 + r * 0.9);
        const hBar = baseHeights[r][c] * wave;
        const x = (c - 1.5) * 0.72;
        const y = (r - 1.0) * 0.72;
        const mix = (c + r) % 2 === 0 ? accentRgb : [
          Math.min(255, Math.round(accentRgb[0] * 0.7 + 75)),
          Math.min(255, Math.round(accentRgb[1] * 0.7 + 80)),
          Math.min(255, Math.round(accentRgb[2] * 0.7 + 90)),
        ];
        faces.push(...makeBoxFaces(x, y, 0.14 + hBar / 2, 0.44, 0.44, hBar, mix, wire, 2));
      }
    }
  } else if (template === 'grease-pencil-2d') {
    const layers = [
      { y: 0.9, w: 2.8, h: 1.7, z: 1.0, rgb: neutralMid, layer: 1 },
      { y: 0.0, w: 2.35, h: 1.45, z: 1.05, rgb: accentRgb, layer: 2 },
      { y: -0.82, w: 1.75, h: 1.12, z: 0.92, rgb: neutralLight, layer: 3 },
    ];
    for (const layer of layers) {
      faces.push(...makeBoxFaces(0, layer.y, layer.z, layer.w, 0.05, layer.h, layer.rgb, 'rgba(15,23,42,0.55)', layer.layer));
    }
    faces.push(...makeBoxFaces(0, 0.04, 0.06, 3.0, 2.1, 0.12, neutralDark, wire, 0));
  } else if (template === 'architectural-pavilion') {
    const poolCyan = [72, 148, 186];
    const concreteWarm = [204, 198, 188];
    // Stepped stone terrace & reflective pool
    faces.push(...makeBoxFaces(0, 0, 0.08, 3.35, 2.75, 0.16, neutralMid, wire, 0));
    faces.push(...makeBoxFaces(0.42, -0.78, 0.175, 2.18, 0.86, 0.03, poolCyan, 'rgba(224,242,254,0.32)', 1));
    faces.push(...makeBoxFaces(-0.18, 0.24, 0.21, 2.48, 1.56, 0.10, concreteWarm, wire, 1));
    // Warm architectural interior volume + glass core
    faces.push(...makeBoxFaces(-0.22, 0.42, 0.78, 1.48, 0.88, 1.04, accentRgb, 'rgba(255,255,255,0.22)', 2));
    // Six colonnade pillars
    const colXs = [-1.14, 0.0, 1.14];
    const colYs = [-0.32, 0.86];
    for (const cx of colXs) {
      for (const cy of colYs) {
        faces.push(...makeCylinderFaces(cx, cy, 0.84, 0.085, 0.095, 1.18, 8, neutralLight, wire, 2));
      }
    }
    // Curved vaulted canopy built from 7 flush sloped roof panels + timber ribs spanning Y cleanly
    const archSegs = 7;
    for (let i = 0; i < archSegs; i++) {
      const u = ((i + 0.5) / archSegs) * 2 - 1; // -1..1
      const rx = u * 1.26;
      const rz = 1.44 + Math.cos(u * Math.PI * 0.5) * 0.42;
      const slope = -Math.sin(u * Math.PI * 0.5) * 0.42 * (Math.PI * 0.5) / 1.26;
      const tiltY = -Math.atan(slope);
      const ribColor = i % 2 === 0 ? concreteWarm : warmWood;
      faces.push(...makeRotatedBoxFaces(rx, 0.26, rz, 0.40, 1.88, 0.085, 0, 0, ribColor, wire, 3, tiltY));
    }
    // Cantilever eaves & warm entry plinth
    faces.push(...makeBoxFaces(-1.26, -0.78, 0.24, 0.72, 0.72, 0.14, warmWood, wire, 2));
  } else if (template === 'procedural-abstract') {
    const silverTint = [218, 226, 238];
    // Stepped gallery plinth
    faces.push(...makeCylinderFaces(0, 0, 0.10, 1.52, 1.64, 0.20, 20, neutralDark, wire, 0));
    faces.push(...makeCylinderFaces(0, 0, 0.26, 1.14, 1.22, 0.12, 20, neutralMid, wire, 1));
    // Kinetic twisted torus-ribbon sculpture
    const segCount = 20;
    const phaseAngle = phase * Math.PI * 2;
    for (let i = 0; i < segCount; i++) {
      const theta = (i / segCount) * Math.PI * 2 + phaseAngle * 0.35;
      const rMajor = 0.88 + 0.10 * Math.cos(theta * 3);
      const px = Math.cos(theta) * rMajor;
      const py = Math.sin(theta) * rMajor;
      const pz = 1.26 + Math.sin(theta * 2) * 0.34;
      const mixRgb = i % 2 === 0 ? accentRgb : silverTint;
      faces.push(...makeRotatedBoxFaces(px, py, pz, 0.34, 0.16, 0.15, theta + Math.PI / 2, theta * 1.5, mixRgb, 'rgba(255,255,255,0.22)', 2));
    }
    // Tilted metallic orbital halo segments
    const haloCount = 10;
    for (let j = 0; j < haloCount; j++) {
      const a = (j / haloCount) * Math.PI * 2 - phaseAngle * 0.5;
      const hx = Math.cos(a) * 1.28;
      const hy = Math.sin(a) * 1.28 * Math.cos(0.55);
      const hz = 1.26 + Math.sin(a) * 1.28 * Math.sin(0.55);
      faces.push(...makeRotatedBoxFaces(hx, hy, hz, 0.28, 0.08, 0.08, a + Math.PI / 2, 0.55, neutralLight, wire, 3));
    }
    // Levitating parametric core
    faces.push(...makeUvSphereFaces(0, 0, 1.24 + Math.sin(phaseAngle) * 0.07, 0.35, 7, 12, accentRgb, 'rgba(255,255,255,0.28)', 3));
  } else {
    faces.push(...makeBoxFaces(0, 0.15, 0.04, 3.2, 2.8, 0.08, neutralDark, wire, 0));
    faces.push(...makeBoxFaces(0, 1.5, 1.08, 3.2, 0.08, 2.0, neutralMid, wire, 0));
    faces.push(...makeBoxFaces(0, 0, 0.68, 1.05, 1.05, 1.05, accentRgb, 'rgba(255,255,255,0.28)', 2));
  }

  return faces;
}

function mat4Identity() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

function mat4Multiply(a, b) {
  const out = new Array(16);
  for (let col = 0; col < 4; col++) {
    const b0 = b[col * 4];
    const b1 = b[col * 4 + 1];
    const b2 = b[col * 4 + 2];
    const b3 = b[col * 4 + 3];
    out[col * 4] = a[0] * b0 + a[4] * b1 + a[8] * b2 + a[12] * b3;
    out[col * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9] * b2 + a[13] * b3;
    out[col * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
    out[col * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
  }
  return out;
}

function mat4FromNode(node) {
  if (Array.isArray(node?.matrix) && node.matrix.length === 16) {
    return node.matrix.slice();
  }
  const t = Array.isArray(node?.translation) ? node.translation : [0, 0, 0];
  const q = Array.isArray(node?.rotation) ? node.rotation : [0, 0, 0, 1];
  const s = Array.isArray(node?.scale) ? node.scale : [1, 1, 1];
  const x = q[0] || 0;
  const y = q[1] || 0;
  const z = q[2] || 0;
  const w = q[3] === undefined ? 1 : q[3];
  const x2 = x + x;
  const y2 = y + y;
  const z2 = z + z;
  const xx = x * x2;
  const xy = x * y2;
  const xz = x * z2;
  const yy = y * y2;
  const yz = y * z2;
  const zz = z * z2;
  const wx = w * x2;
  const wy = w * y2;
  const wz = w * z2;
  const sx = s[0] === undefined ? 1 : s[0];
  const sy = s[1] === undefined ? 1 : s[1];
  const sz = s[2] === undefined ? 1 : s[2];
  return [
    (1 - (yy + zz)) * sx,
    (xy + wz) * sx,
    (xz - wy) * sx,
    0,
    (xy - wz) * sy,
    (1 - (xx + zz)) * sy,
    (yz + wx) * sy,
    0,
    (xz + wy) * sz,
    (yz - wx) * sz,
    (1 - (xx + yy)) * sz,
    0,
    t[0] || 0,
    t[1] || 0,
    t[2] || 0,
    1,
  ];
}

function transformPointGltfToBlenderZUp(m, x, y, z) {
  const gx = m[0] * x + m[4] * y + m[8] * z + m[12];
  const gy = m[1] * x + m[5] * y + m[9] * z + m[13];
  const gz = m[2] * x + m[6] * y + m[10] * z + m[14];
  // Blender's glTF 2.0 exporter maps Blender (X, Y, Z) -> glTF (X, Z, -Y).
  // Inverse right-handed mapping restores upright Z-up Blender stage coordinates:
  return [gx, -gz, gy];
}

function transformNormalGltfToBlenderZUp(m, nx, ny, nz) {
  const gx = m[0] * nx + m[4] * ny + m[8] * nz;
  const gy = m[1] * nx + m[5] * ny + m[9] * nz;
  const gz = m[2] * nx + m[6] * ny + m[10] * nz;
  const bx = gx;
  const by = -gz;
  const bz = gy;
  const len = Math.hypot(bx, by, bz) || 1;
  return [bx / len, by / len, bz / len];
}

function decodeUtf8Bytes(bytes) {
  if (typeof TextDecoder === 'function') {
    return new TextDecoder('utf-8').decode(bytes);
  }
  let out = '';
  for (let i = 0; i < bytes.length; i++) out += String.fromCharCode(bytes[i]);
  return out;
}

function parseGlbMesh(input, options = {}) {
  const maxTriangles = Math.max(100, Math.min(14000, Number(options.maxTriangles) || 6500));
  const isArrayBuffer =
    input instanceof ArrayBuffer || Object.prototype.toString.call(input) === '[object ArrayBuffer]';
  const bytes = isArrayBuffer
    ? new Uint8Array(input)
    : ArrayBuffer.isView(input)
    ? new Uint8Array(input.buffer, input.byteOffset, input.byteLength)
    : null;
  if (!bytes || bytes.byteLength < 20) {
    throw new Error('GLB buffer too small');
  }
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const magic = dv.getUint32(0, true);
  const version = dv.getUint32(4, true);
  const declaredLen = dv.getUint32(8, true);
  if (magic !== 0x46546c67) throw new Error('Invalid GLB magic header');
  if (version !== 2) throw new Error('Unsupported glTF version: ' + version);

  const totalLen = Math.min(bytes.byteLength, declaredLen || bytes.byteLength);
  let json = null;
  let binBytes = null;
  let offset = 12;
  while (offset + 8 <= totalLen) {
    const chunkLen = dv.getUint32(offset, true);
    const chunkType = dv.getUint32(offset + 4, true);
    const dataStart = offset + 8;
    const dataEnd = Math.min(totalLen, dataStart + chunkLen);
    if (chunkType === 0x4e4f534a) {
      json = JSON.parse(decodeUtf8Bytes(bytes.subarray(dataStart, dataEnd)));
    } else if (chunkType === 0x004e4942) {
      binBytes = bytes.subarray(dataStart, dataEnd);
    }
    offset = dataStart + chunkLen;
  }
  if (!json || typeof json !== 'object') throw new Error('Missing GLB JSON chunk');

  const binDv = binBytes ? new DataView(binBytes.buffer, binBytes.byteOffset, binBytes.byteLength) : null;
  const accessors = Array.isArray(json.accessors) ? json.accessors : [];
  const bufferViews = Array.isArray(json.bufferViews) ? json.bufferViews : [];
  const meshes = Array.isArray(json.meshes) ? json.meshes : [];
  const nodes = Array.isArray(json.nodes) ? json.nodes : [];
  const materials = Array.isArray(json.materials) ? json.materials : [];

  function readVec3(accIdx) {
    const acc = accessors[accIdx];
    if (!acc || acc.bufferView === undefined || !binDv) return null;
    const bv = bufferViews[acc.bufferView];
    if (!bv || acc.componentType !== 5126) return null;
    const count = Number(acc.count) || 0;
    const stride = Number(bv.byteStride) || 12;
    const base = (Number(bv.byteOffset) || 0) + (Number(acc.byteOffset) || 0);
    const out = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const off = base + i * stride;
      if (off + 12 > binBytes.byteLength) break;
      out[i * 3] = binDv.getFloat32(off, true);
      out[i * 3 + 1] = binDv.getFloat32(off + 4, true);
      out[i * 3 + 2] = binDv.getFloat32(off + 8, true);
    }
    return out;
  }

  function readIndices(accIdx) {
    const acc = accessors[accIdx];
    if (!acc || acc.bufferView === undefined || !binDv) return null;
    const bv = bufferViews[acc.bufferView];
    if (!bv) return null;
    const count = Number(acc.count) || 0;
    const compSize = acc.componentType === 5121 ? 1 : acc.componentType === 5123 ? 2 : acc.componentType === 5125 ? 4 : 0;
    if (!compSize) return null;
    const stride = Number(bv.byteStride) || compSize;
    const base = (Number(bv.byteOffset) || 0) + (Number(acc.byteOffset) || 0);
    const out = new Uint32Array(count);
    for (let i = 0; i < count; i++) {
      const off = base + i * stride;
      if (off + compSize > binBytes.byteLength) break;
      out[i] =
        compSize === 1 ? binDv.getUint8(off) : compSize === 2 ? binDv.getUint16(off, true) : binDv.getUint32(off, true);
    }
    return out;
  }

  function materialRgb(matIdx) {
    const mat = matIdx !== undefined ? materials[matIdx] : null;
    const factor = mat?.pbrMetallicRoughness?.baseColorFactor;
    if (Array.isArray(factor) && factor.length >= 3) {
      const toSrgb = c => Math.max(24, Math.min(248, Math.round(Math.pow(Math.max(0, Math.min(1, Number(c) || 0)), 1 / 2.2) * 255)));
      return [toSrgb(factor[0]), toSrgb(factor[1]), toSrgb(factor[2])];
    }
    return [192, 204, 220];
  }

  // Collect (meshIndex, worldMatrix) from active scene node graph
  const meshInstances = [];
  const visited = new Set();
  function walkNode(nodeIdx, parentMat) {
    if (visited.has(nodeIdx)) return;
    const node = nodes[nodeIdx];
    if (!node) return;
    visited.add(nodeIdx);
    const worldMat = mat4Multiply(parentMat, mat4FromNode(node));
    if (typeof node.mesh === 'number' && meshes[node.mesh]) {
      meshInstances.push({
        meshIndex: node.mesh,
        matrix: worldMat,
        name: String(node.name || meshes[node.mesh]?.name || ''),
      });
    }
    if (Array.isArray(node.children)) {
      for (const childIdx of node.children) walkNode(childIdx, worldMat);
    }
  }

  const activeScene = Array.isArray(json.scenes) ? json.scenes[json.scene || 0] || json.scenes[0] : null;
  if (activeScene && Array.isArray(activeScene.nodes) && activeScene.nodes.length > 0) {
    for (const rootIdx of activeScene.nodes) walkNode(rootIdx, mat4Identity());
  } else if (nodes.length > 0) {
    const childSet = new Set();
    for (const n of nodes) {
      if (Array.isArray(n.children)) for (const c of n.children) childSet.add(c);
    }
    for (let i = 0; i < nodes.length; i++) {
      if (!childSet.has(i)) walkNode(i, mat4Identity());
    }
  }
  if (meshInstances.length === 0 && meshes.length > 0) {
    for (let i = 0; i < meshes.length; i++) {
      meshInstances.push({ meshIndex: i, matrix: mat4Identity(), name: String(meshes[i]?.name || '') });
    }
  }

  const backdropRe = /^(?:Studio_|Backdrop_|Stage_Floor|Softbox_|Cyclorama|Ground_Plane|Abstract_Floor|Logo_Floor|GP_Paper_Card)/i;
  const heroInstances = meshInstances.filter(inst => !backdropRe.test(inst.name || ''));
  const activeInstances = heroInstances.length > 0 ? heroInstances : meshInstances;

  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  let vertexCount = 0;
  let totalTriangles = 0;

  // Pass 1: gather world-transformed triangles and exact bounding box
  const rawTris = [];
  for (const inst of activeInstances) {
    const mesh = meshes[inst.meshIndex];
    if (!mesh || !Array.isArray(mesh.primitives)) continue;
    for (const prim of mesh.primitives) {
      if (prim.mode !== undefined && prim.mode !== 4) continue;
      const posIdx = prim.attributes?.POSITION;
      if (posIdx === undefined) continue;
      const posArr = readVec3(posIdx);
      if (!posArr || posArr.length < 9) continue;
      const vCount = Math.floor(posArr.length / 3);
      vertexCount += vCount;
      const normArr = prim.attributes?.NORMAL !== undefined ? readVec3(prim.attributes.NORMAL) : null;
      const idxArr = prim.indices !== undefined ? readIndices(prim.indices) : null;
      const rgb = materialRgb(prim.material);

      const transformedPts = new Array(vCount);
      for (let i = 0; i < vCount; i++) {
        const pt = transformPointGltfToBlenderZUp(inst.matrix, posArr[i * 3], posArr[i * 3 + 1], posArr[i * 3 + 2]);
        transformedPts[i] = pt;
        if (pt[0] < minX) minX = pt[0];
        if (pt[0] > maxX) maxX = pt[0];
        if (pt[1] < minY) minY = pt[1];
        if (pt[1] > maxY) maxY = pt[1];
        if (pt[2] < minZ) minZ = pt[2];
        if (pt[2] > maxZ) maxZ = pt[2];
      }

      const triCount = idxArr ? Math.floor(idxArr.length / 3) : Math.floor(vCount / 3);
      totalTriangles += triCount;

      for (let t = 0; t < triCount; t++) {
        const i0 = idxArr ? idxArr[t * 3] : t * 3;
        const i1 = idxArr ? idxArr[t * 3 + 1] : t * 3 + 1;
        const i2 = idxArr ? idxArr[t * 3 + 2] : t * 3 + 2;
        const p0 = transformedPts[i0];
        const p1 = transformedPts[i1];
        const p2 = transformedPts[i2];
        if (!p0 || !p1 || !p2) continue;

        let normal;
        if (normArr && i0 * 3 + 2 < normArr.length && i1 * 3 + 2 < normArr.length && i2 * 3 + 2 < normArr.length) {
          const anx = (normArr[i0 * 3] + normArr[i1 * 3] + normArr[i2 * 3]) / 3;
          const any = (normArr[i0 * 3 + 1] + normArr[i1 * 3 + 1] + normArr[i2 * 3 + 1]) / 3;
          const anz = (normArr[i0 * 3 + 2] + normArr[i1 * 3 + 2] + normArr[i2 * 3 + 2]) / 3;
          normal = transformNormalGltfToBlenderZUp(inst.matrix, anx, any, anz);
        } else {
          const ux = p1[0] - p0[0];
          const uy = p1[1] - p0[1];
          const uz = p1[2] - p0[2];
          const vx = p2[0] - p0[0];
          const vy = p2[1] - p0[1];
          const vz = p2[2] - p0[2];
          const nx = uy * vz - uz * vy;
          const ny = uz * vx - ux * vz;
          const nz = ux * vy - uy * vx;
          const nLen = Math.hypot(nx, ny, nz) || 1;
          normal = [nx / nLen, ny / nLen, nz / nLen];
        }
        rawTris.push({ p0, p1, p2, normal, rgb });
      }
    }
  }

  if (rawTris.length === 0 || !Number.isFinite(minX)) {
    return {
      triangles: [],
      vertexCount: 0,
      triangleCount: 0,
      renderedTriangles: 0,
      meshCount: activeInstances.length,
      dimensions: [0, 0, 0],
      bounds: { min: [0, 0, 0], max: [0, 0, 0] },
      targetZ: 0.8,
      unitScale: 1,
    };
  }

  const dx = Math.max(0, maxX - minX);
  const dy = Math.max(0, maxY - minY);
  const dz = Math.max(0, maxZ - minZ);
  const maxSpan = Math.max(dx, dy, dz, 0.0001);
  const unitScale = 3.45 / maxSpan;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const baseZ = minZ;
  const normPt = p => [(p[0] - cx) * unitScale, (p[1] - cy) * unitScale, (p[2] - baseZ) * unitScale];

  let triangles;
  if (rawTris.length <= maxTriangles) {
    triangles = rawTris.map(tri => ({
      pts: [normPt(tri.p0), normPt(tri.p1), normPt(tri.p2)],
      normal: tri.normal,
      rgb: tri.rgb,
      layer: 2,
    }));
  } else {
    // Rossignac-Borrel spatial vertex-clustering decimation: keeps surfaces solid & watertight with zero speckle holes!
    const clusterAt = gridRes => {
      const cellSize = 3.45 / gridRes;
      const accum = new Map();
      const keyOf = np => {
        const ix = Math.round(np[0] / cellSize);
        const iy = Math.round(np[1] / cellSize);
        const iz = Math.round(np[2] / cellSize);
        return ix + ',' + iy + ',' + iz;
      };
      const mapped = new Array(rawTris.length);
      for (let i = 0; i < rawTris.length; i++) {
        const tri = rawTris[i];
        const a = normPt(tri.p0);
        const b = normPt(tri.p1);
        const c = normPt(tri.p2);
        const ka = keyOf(a);
        const kb = keyOf(b);
        const kc = keyOf(c);
        const addPt = (k, pt) => {
          let cell = accum.get(k);
          if (!cell) {
            cell = [0, 0, 0, 0];
            accum.set(k, cell);
          }
          cell[0] += pt[0];
          cell[1] += pt[1];
          cell[2] += pt[2];
          cell[3] += 1;
        };
        addPt(ka, a);
        addPt(kb, b);
        addPt(kc, c);
        if (ka !== kb && kb !== kc && kc !== ka) {
          mapped[i] = { ka, kb, kc, rgb: tri.rgb, normal: tri.normal };
        }
      }
      const centroid = new Map();
      for (const [k, cell] of accum.entries()) {
        centroid.set(k, [cell[0] / cell[3], cell[1] / cell[3], cell[2] / cell[3]]);
      }
      const seen = new Set();
      const out = [];
      for (let i = 0; i < mapped.length; i++) {
        const m = mapped[i];
        if (!m) continue;
        const sorted = [m.ka, m.kb, m.kc].sort();
        const dedupeKey = sorted[0] + '|' + sorted[1] + '|' + sorted[2];
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);
        const p0 = centroid.get(m.ka);
        const p1 = centroid.get(m.kb);
        const p2 = centroid.get(m.kc);
        const ux = p1[0] - p0[0];
        const uy = p1[1] - p0[1];
        const uz = p1[2] - p0[2];
        const vx = p2[0] - p0[0];
        const vy = p2[1] - p0[1];
        const vz = p2[2] - p0[2];
        const nx = uy * vz - uz * vy;
        const ny = uz * vx - ux * vz;
        const nz = ux * vy - uy * vx;
        const area2 = Math.hypot(nx, ny, nz);
        if (area2 < 1e-6) continue;
        out.push({
          pts: [p0, p1, p2],
          normal: [nx / area2, ny / area2, nz / area2],
          rgb: m.rgb,
          area: area2,
          layer: 2,
        });
      }
      return out;
    };

    let clustered = clusterAt(44);
    if (clustered.length > maxTriangles * 1.4) clustered = clusterAt(32);
    if (clustered.length > maxTriangles * 1.4) clustered = clusterAt(24);
    if (clustered.length > maxTriangles) {
      clustered.sort((a, b) => b.area - a.area);
      clustered = clustered.slice(0, maxTriangles);
    }
    triangles = clustered.map(t => ({ pts: t.pts, normal: t.normal, rgb: t.rgb, layer: 2 }));
  }

  return {
    triangles,
    vertexCount,
    triangleCount: totalTriangles,
    renderedTriangles: triangles.length,
    meshCount: activeInstances.length,
    dimensions: [Number(dx.toFixed(2)), Number(dy.toFixed(2)), Number(dz.toFixed(2))],
    bounds: {
      min: [Number(minX.toFixed(3)), Number(minY.toFixed(3)), Number(minZ.toFixed(3))],
      max: [Number(maxX.toFixed(3)), Number(maxY.toFixed(3)), Number(maxZ.toFixed(3))],
    },
    targetZ: Math.max(0.35, (dz * unitScale) * 0.48),
    unitScale,
  };
}

function BlenderStageCanvas({
  fields,
  orbit,
  setOrbit,
  framePhase,
  glbMesh = null,
  glbShading = 'shaded',
  canvasRefExternal = null,
  onResetOrbit = null,
  t,
}) {
  const internalCanvasRef = useRef(null);
  const canvasRef = canvasRefExternal || internalCanvasRef;
  const dragRef = useRef(null);
  const ratioCss = fields.aspect === 'portrait' ? '9 / 16' : fields.aspect === 'square' ? '1 / 1' : '16 / 9';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof canvas.getContext !== 'function') return undefined;
    if (String(canvas.getContext).includes('notImplemented')) return undefined;
    let ctx = null;
    try {
      ctx = canvas.getContext('2d');
    } catch {
      return undefined;
    }
    if (!ctx) return undefined;

    const rect = typeof canvas.getBoundingClientRect === 'function' ? canvas.getBoundingClientRect() : null;
    const cssW = Math.max(240, Math.round(rect?.width || 560));
    const cssH = Math.max(180, Math.round(rect?.height || 315));
    const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
    if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = cssW;
    const hVal = cssH;
    const cx = w / 2 + (Number(orbit.panX) || 0);
    const cy = hVal * 0.56 + (Number(orbit.panY) || 0);
    const palette = LIGHTING_PALETTES[fields.lightingPreset] || LIGHTING_PALETTES.studio_3point;

    // 1. Backdrop (soft studio slate gradient or alpha checkerboard)
    if (fields.transparentBg) {
      const tile = 14;
      for (let y = 0; y < hVal; y += tile) {
        for (let x = 0; x < w; x += tile) {
          ctx.fillStyle = ((x / tile + y / tile) & 1) === 0 ? '#272d38' : '#202530';
          ctx.fillRect(x, y, tile, tile);
        }
      }
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, hVal);
      grad.addColorStop(0, palette.bgTop);
      grad.addColorStop(1, palette.bgBot);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, hVal);
    }

    // Camera math (Z-up Blender right-handed space: camera looks from -Y toward +Y; +X right, +Z up)
    const yaw = orbit.yaw;
    const pitch = orbit.pitch;
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);
    const targetZ = glbMesh?.targetZ || 0.82;
    const camDist = 6.2 / Math.max(0.45, Math.min(2.6, orbit.zoom));
    const scaleBase = Math.min(w, hVal) * (orbit.ortho ? 0.22 * orbit.zoom : 0.98);

    function toCamera(p) {
      const x = p[0];
      const y = p[1];
      const z = p[2] - targetZ;
      // Rotate world around Z so positive yaw orbits camera toward (+X, -Y)
      const rx = x * cosY + y * sinY;
      const ry = -x * sinY + y * cosY;
      // Camera elevation above XY plane looking toward origin
      const sx = rx;
      const sy = ry * sinP + z * cosP;
      const depth = camDist + ry * cosP - z * sinP;
      return [sx, sy, depth];
    }

    function project(p) {
      const [sx, sy, depth] = toCamera(p);
      if (orbit.ortho) {
        return { x: cx + sx * scaleBase, y: cy - sy * scaleBase, depth, visible: true };
      }
      if (depth <= 0.35) return { x: cx, y: cy, depth, visible: false };
      const f = scaleBase / depth;
      return { x: cx + sx * f, y: cy - sy * f, depth, visible: true };
    }

    // 2. Ground coordinate grid & Blender X/Y/Z axes
    ctx.lineWidth = 1;
    const gridN = 5;
    for (let i = -gridN; i <= gridN; i++) {
      const a = project([i * 0.75, -gridN * 0.75, 0]);
      const b = project([i * 0.75, gridN * 0.75, 0]);
      if (a.visible && b.visible) {
        ctx.strokeStyle = i === 0 ? 'rgba(74,222,128,0.52)' : 'rgba(148,163,184,0.14)';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      const c = project([-gridN * 0.75, i * 0.75, 0]);
      const d = project([gridN * 0.75, i * 0.75, 0]);
      if (c.visible && d.visible) {
        ctx.strokeStyle = i === 0 ? 'rgba(248,113,113,0.52)' : 'rgba(148,163,184,0.14)';
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(d.x, d.y);
        ctx.stroke();
      }
    }
    const z0 = project([0, 0, 0]);
    const z1 = project([0, 0, 2.35]);
    if (z0.visible && z1.visible) {
      ctx.strokeStyle = 'rgba(96,165,250,0.45)';
      ctx.beginPath();
      ctx.moveTo(z0.x, z0.y);
      ctx.lineTo(z1.x, z1.y);
      ctx.stroke();
    }

    // 3. Build & Z-sort 3D faces (either real parsed GLB mesh or procedural template geometry)
    const accentRgb = parseHexRgb(fields.accentColor);
    const rawFaces = glbMesh ? glbMesh.triangles || [] : buildTemplateGeometry(fields.template, accentRgb, framePhase);
    const kDir = palette.keyDir;
    const kLen = Math.hypot(kDir[0], kDir[1], kDir[2]) || 1;
    const lx = kDir[0] / kLen;
    const ly = kDir[1] / kLen;
    const lz = kDir[2] / kLen;
    const flLen = Math.hypot(-0.65, -0.35, 0.45);
    const flx = -0.65 / flLen;
    const fly = -0.35 / flLen;
    const flz = 0.45 / flLen;
    const rlLen = Math.hypot(-0.25, 0.85, 0.55);
    const rlx = -0.25 / rlLen;
    const rly = 0.85 / rlLen;
    const rlz = 0.55 / rlLen;
    // Camera view direction (surface -> camera) in Blender Z-up world coordinates
    const vx = sinY * cosP;
    const vy = -cosY * cosP;
    const vz = sinP;
    const hkx = lx + vx;
    const hky = ly + vy;
    const hkz = lz + vz;
    const hkLen = Math.hypot(hkx, hky, hkz) || 1;
    const clayRgb = [214, 219, 228];

    const projectedFaces = [];
    for (const face of rawFaces) {
      const pts = face.pts;
      if (pts.length < 3) continue;
      let nx;
      let ny;
      let nz;
      if (Array.isArray(face.normal) && face.normal.length === 3) {
        nx = face.normal[0];
        ny = face.normal[1];
        nz = face.normal[2];
      } else {
        const u = [pts[1][0] - pts[0][0], pts[1][1] - pts[0][1], pts[1][2] - pts[0][2]];
        const v = [pts[2][0] - pts[0][0], pts[2][1] - pts[0][1], pts[2][2] - pts[0][2]];
        nx = u[1] * v[2] - u[2] * v[1];
        ny = u[2] * v[0] - u[0] * v[2];
        nz = u[0] * v[1] - u[1] * v[0];
        const nLen = Math.hypot(nx, ny, nz) || 1;
        nx /= nLen;
        ny /= nLen;
        nz /= nLen;
      }

      const screenPts = [];
      let avgDepth = 0;
      let allVisible = true;
      for (const pt of pts) {
        const pr = project(pt);
        if (!pr.visible) {
          allVisible = false;
          break;
        }
        screenPts.push(pr);
        avgDepth += pr.depth;
      }
      if (!allVisible) continue;
      avgDepth /= screenPts.length;

      let fill;
      let wire;
      if (glbMesh) {
        // Two-sided normal flip toward camera for crisp 3-light studio Phong shading
        const ndotvRaw = nx * vx + ny * vy + nz * vz;
        const fnx = ndotvRaw < 0 ? -nx : nx;
        const fny = ndotvRaw < 0 ? -ny : ny;
        const fnz = ndotvRaw < 0 ? -nz : nz;
        const ndotv = Math.abs(ndotvRaw);
        const keyDiff = Math.max(0, fnx * lx + fny * ly + fnz * lz);
        const fillDiff = Math.max(0, fnx * flx + fny * fly + fnz * flz);
        const rimDiff = Math.max(0, fnx * rlx + fny * rly + fnz * rlz);
        const fresnel = Math.pow(Math.max(0, 1 - ndotv), 2.2);
        const spec = Math.pow(Math.max(0, (fnx * hkx + fny * hky + fnz * hkz) / hkLen), 24);
        const baseColor = glbShading === 'clay' ? clayRgb : face.rgb || clayRgb;

        if (glbShading === 'wireframe') {
          fill = 'rgba(24,32,48,0.22)';
          wire = 'rgba(96,165,250,0.75)';
        } else if (glbShading === 'clay') {
          const clayFactor = Math.min(1.38, palette.ambient + 0.14 + keyDiff * 0.72 + fillDiff * 0.30 + rimDiff * 0.22);
          const cr = Math.min(255, Math.round(clayRgb[0] * clayFactor + fresnel * 14));
          const cg = Math.min(255, Math.round(clayRgb[1] * clayFactor + fresnel * 16));
          const cb = Math.min(255, Math.round(clayRgb[2] * clayFactor + fresnel * 20));
          fill = `rgba(${cr},${cg},${cb},0.98)`;
          wire = 'rgba(15,23,42,0.10)';
        } else {
          // 3-Light Studio Key + Cool Fill + Warm/Crisp Rim + Blinn-Phong Specular
          const diff = Math.min(1.42, palette.ambient + 0.12 + keyDiff * 0.76 + fillDiff * 0.32 + rimDiff * 0.26);
          const specBoost = spec * 92 + fresnel * 34;
          const r = Math.max(0, Math.min(255, Math.round(baseColor[0] * diff + specBoost * 1.0 + fillDiff * 8)));
          const g = Math.max(0, Math.min(255, Math.round(baseColor[1] * diff + specBoost * 0.98 + fillDiff * 14)));
          const b = Math.max(0, Math.min(255, Math.round(baseColor[2] * diff + specBoost * 1.05 + fillDiff * 24 + rimDiff * 14)));
          fill = `rgba(${r},${g},${b},0.98)`;
          wire = glbShading === 'wire-overlay' ? 'rgba(15,23,42,0.34)' : fill;
        }
      } else {
        const ndotl = Math.abs(nx * lx + ny * ly + nz * lz);
        const fillLight = Math.max(0, -nx * 0.45 + ny * 0.35 + nz * 0.35) * 0.28;
        const rim = Math.max(0, 1 - Math.abs(nz));
        const intensity = palette.ambient + ndotl * 0.78 + fillLight;
        fill = shadeFaceColor(fields.clayMode ? clayRgb : face.rgb, intensity, fields.clayMode ? 'clay_matte' : fields.materialPreset, rim);
        wire = !fields.clayMode && fields.materialPreset === 'toon_cel' ? 'rgba(15,23,42,0.72)' : face.wire;
      }
      projectedFaces.push({
        screenPts,
        depth: avgDepth,
        layer: face.layer ?? 2,
        fill,
        wire,
      });
    }

    projectedFaces.sort((a, b) => (a.layer - b.layer) || (b.depth - a.depth));
    for (const poly of projectedFaces) {
      ctx.beginPath();
      ctx.moveTo(poly.screenPts[0].x, poly.screenPts[0].y);
      for (let i = 1; i < poly.screenPts.length; i++) {
        ctx.lineTo(poly.screenPts[i].x, poly.screenPts[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = poly.fill;
      ctx.fill();
      if (poly.wire) {
        ctx.strokeStyle = poly.wire;
        ctx.lineWidth = glbMesh
          ? glbShading === 'wireframe'
            ? 0.75
            : glbShading === 'wire-overlay'
            ? 0.65
            : 0.45
          : fields.materialPreset === 'toon_cel'
          ? 1.35
          : 0.75;
        ctx.stroke();
      }
    }

    // 4. Template overlay accents (3D headline for logo-3d, Grease Pencil strokes)
    if (!glbMesh && fields.template === 'logo-3d' && fields.headline?.trim()) {
      const anchor = project([0, -0.58, 1.32]);
      if (anchor.visible) {
        ctx.save();
        ctx.font = '700 ' + Math.max(13, Math.round(Math.min(w, hVal) * 0.068)) + 'px "Cascadia Code", "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(15,23,42,0.58)';
        ctx.fillText(fields.headline.trim(), anchor.x + 2, anchor.y + 3);
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(fields.headline.trim(), anchor.x, anchor.y);
        ctx.restore();
      }
    } else if (!glbMesh && fields.template === 'grease-pencil-2d') {
      const p1 = project([-0.68, -0.86, 0.92]);
      const p2 = project([0, -0.86, 1.18 + Math.sin(framePhase * Math.PI * 2) * 0.12]);
      const p3 = project([0.68, -0.86, 0.88]);
      if (p1.visible && p2.visible && p3.visible) {
        ctx.save();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(p2.x, p2.y, p3.x, p3.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 5. Three-Point Light Rig Markers (shown in procedural 3D Stage mode; hidden in GLB Mesh inspection)
    const lights = glbMesh
      ? []
      : [
          { pos: [2.2, -1.9, 2.45], color: palette.key, label: 'KEY' },
          { pos: [-2.1, -1.4, 1.65], color: palette.fill, label: 'FILL' },
          { pos: [0.4, 2.35, 2.15], color: palette.rim, label: 'RIM' },
        ];
    ctx.font = '600 9.5px ui-monospace, monospace';
    ctx.textAlign = 'center';
    for (const lt of lights) {
      const lp = project(lt.pos);
      if (!lp.visible) continue;
      ctx.save();
      ctx.strokeStyle = 'rgba(226,232,240,0.34)';
      ctx.setLineDash([2, 3]);
      const base = project([lt.pos[0], lt.pos[1], 0]);
      if (base.visible) {
        ctx.beginPath();
        ctx.moveTo(lp.x, lp.y);
        ctx.lineTo(base.x, base.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.fillStyle = lt.color;
      ctx.beginPath();
      ctx.arc(lp.x, lp.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(15,23,42,0.7)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = 'rgba(226,232,240,0.82)';
      ctx.fillText(lt.label, lp.x, lp.y - 9);
      ctx.restore();
    }

    // 6. Camera viewfinder safe-frame brackets
    const padX = Math.round(w * 0.06);
    const padY = Math.round(hVal * 0.08);
    const arm = 14;
    ctx.strokeStyle = 'rgba(232,93,42,0.58)';
    ctx.lineWidth = 1.4;
    const corners = [
      [padX, padY, 1, 1],
      [w - padX, padY, -1, 1],
      [padX, hVal - padY, 1, -1],
      [w - padX, hVal - padY, -1, -1],
    ];
    for (const [x, y, dx, dy] of corners) {
      ctx.beginPath();
      ctx.moveTo(x + dx * arm, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + dy * arm);
      ctx.stroke();
    }

    // 7. Interactive XYZ Orientation Gizmo (bottom-right)
    const gx = w - 38;
    const gy = hVal - 36;
    const gLen = 18;
    const axes = [
      { vec: [1, 0, 0], color: '#f87171', name: 'X' },
      { vec: [0, 1, 0], color: '#4ade80', name: 'Y' },
      { vec: [0, 0, 1], color: '#60a5fa', name: 'Z' },
    ].map(ax => {
      const rx = ax.vec[0] * cosY + ax.vec[1] * sinY;
      const ry = -ax.vec[0] * sinY + ax.vec[1] * cosY;
      const sy = ry * sinP + ax.vec[2] * cosP;
      const depth = ry * cosP - ax.vec[2] * sinP;
      return { ...ax, x: gx + rx * gLen, y: gy - sy * gLen, depth };
    });
    axes.sort((a, b) => b.depth - a.depth);
    ctx.fillStyle = 'rgba(15,23,42,0.42)';
    ctx.beginPath();
    ctx.arc(gx, gy, 24, 0, Math.PI * 2);
    ctx.fill();
    for (const ax of axes) {
      ctx.strokeStyle = ax.color;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(ax.x, ax.y);
      ctx.stroke();
      ctx.fillStyle = ax.color;
      ctx.beginPath();
      ctx.arc(ax.x, ax.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = '700 8px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ax.name, ax.x, ax.y + 0.5);
    }

    // 8. GLB Mesh real-world dimensions & poly readout (bottom-left)
    if (glbMesh && Array.isArray(glbMesh.dimensions)) {
      const dimTxt =
        glbMesh.dimensions.map(d => Number(d).toFixed(2)).join('×') +
        ' m · ' +
        (glbMesh.vertexCount || 0) +
        ' v · ' +
        (glbMesh.triangleCount || 0) +
        ' tris' +
        (glbMesh.renderedTriangles < glbMesh.triangleCount ? ' (LOD ' + glbMesh.renderedTriangles + ')' : '');
      ctx.save();
      ctx.font = '600 10.5px ui-monospace, monospace';
      const tw = ctx.measureText(dimTxt).width;
      ctx.fillStyle = 'rgba(15,23,42,0.72)';
      ctx.fillRect(12, hVal - 30, tw + 16, 20);
      ctx.fillStyle = '#e2e8f0';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(dimTxt, 20, hVal - 20);
      ctx.restore();
    }

    return undefined;
  }, [fields.template, fields.accentColor, fields.lightingPreset, fields.materialPreset, fields.transparentBg, fields.clayMode, fields.headline, fields.aspect, orbit.yaw, orbit.pitch, orbit.zoom, orbit.ortho, orbit.panX, orbit.panY, framePhase, glbMesh, glbShading]);

  function onPointerDown(event) {
    const isPan = event.button === 2 || Boolean(event.shiftKey);
    if (!isPan && event.button !== undefined && event.button !== 0) return;
    dragRef.current = {
      mode: isPan ? 'pan' : 'orbit',
      x: event.clientX,
      y: event.clientY,
      yaw: orbit.yaw,
      pitch: orbit.pitch,
      panX: Number(orbit.panX) || 0,
      panY: Number(orbit.panY) || 0,
    };
    try { event.currentTarget.setPointerCapture?.(event.pointerId); } catch { /* ignore */ }
  }

  function onPointerMove(event) {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (drag.mode === 'pan') {
      const nextPanX = Math.max(-320, Math.min(320, Math.round(drag.panX + dx)));
      const nextPanY = Math.max(-240, Math.min(240, Math.round(drag.panY + dy)));
      setOrbit(prev => ({ ...prev, panX: nextPanX, panY: nextPanY }));
      return;
    }
    const nextYaw = drag.yaw + dx * 0.011;
    const nextPitch = Math.max(-0.12, Math.min(1.48, drag.pitch + dy * 0.011));
    setOrbit(prev => ({ ...prev, yaw: nextYaw, pitch: nextPitch }));
  }

  function onPointerUp(event) {
    if (!dragRef.current) return;
    dragRef.current = null;
    try { event.currentTarget.releasePointerCapture?.(event.pointerId); } catch { /* ignore */ }
  }

  function onDoubleClick() {
    if (typeof onResetOrbit === 'function') onResetOrbit();
    else setOrbit({ ...(CAMERA_PRESET_ANGLES[fields.cameraPreset] || CAMERA_PRESET_ANGLES.three_quarter), panX: 0, panY: 0 });
  }

  function onContextMenu(event) {
    event.preventDefault();
  }

  function onWheel(event) {
    event.preventDefault();
    const factor = event.deltaY > 0 ? 0.92 : 1.08;
    setOrbit(prev => ({ ...prev, zoom: Math.max(0.55, Math.min(2.3, Number((prev.zoom * factor).toFixed(3)))) }));
  }

  function onKeyDown(event) {
    if (event.key === 'ArrowLeft') { event.preventDefault(); setOrbit(p => ({ ...p, yaw: p.yaw - 0.16 })); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); setOrbit(p => ({ ...p, yaw: p.yaw + 0.16 })); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setOrbit(p => ({ ...p, pitch: Math.min(1.48, p.pitch + 0.12) })); }
    else if (event.key === 'ArrowDown') { event.preventDefault(); setOrbit(p => ({ ...p, pitch: Math.max(-0.12, p.pitch - 0.12) })); }
    else if (event.key === '+' || event.key === '=') { event.preventDefault(); setOrbit(p => ({ ...p, zoom: Math.min(2.3, p.zoom * 1.12) })); }
    else if (event.key === '-') { event.preventDefault(); setOrbit(p => ({ ...p, zoom: Math.max(0.55, p.zoom * 0.88) })); }
  }

  return h(
    'div',
    {
      className: 'bl-canvas-frame',
      'data-aspect': fields.aspect,
      style: { aspectRatio: ratioCss },
    },
    h('canvas', {
      ref: canvasRef,
      className: 'bl-stage-canvas',
      'data-stage-canvas': 'true',
      'data-window-drag-exclude': '',
      tabIndex: 0,
      role: 'img',
      'aria-label': t(
        '交互式 3D 视口：拖拽旋转，Shift+拖拽或右键平移，滚轮缩放，双击重置',
        'Interactive 3D Viewport: drag to orbit, Shift+drag or right-click to pan, scroll to zoom, double-click to reset',
      ),
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onDoubleClick,
      onContextMenu,
      onWheel,
      onKeyDown,
    }),
  );
}

const QUALITY_PRESETS = [
  { id: 'draft', zh: '草稿 Draft', en: 'Draft', spec: '16 spp · 50%', patch: { engine: 'EEVEE', samples: 16, resolutionScale: 50 } },
  { id: 'studio', zh: '标准 Studio', en: 'Studio', spec: '32 spp · 100%', patch: { engine: 'EEVEE', samples: 32, resolutionScale: 100 } },
  { id: 'cycles', zh: '电影 Cycles', en: 'Cycles', spec: '128 spp · 100%', patch: { engine: 'CYCLES', samples: 128, resolutionScale: 100 } },
];

const PIPELINE_TIERS = [
  { id: 'draft', zh: '草稿 Draft', en: 'Draft' },
  { id: 'studio', zh: '标准 Studio', en: 'Studio' },
  { id: 'beauty', zh: '电影精渲 Beauty Cycles', en: 'Beauty Cycles' },
];

const DSH_KIT_SNIPPETS = [
  {
    id: 'car_paint',
    zh: '车漆 PBR',
    en: 'Car Paint',
    code: 'mat_paint = dsh_mat_car_paint("Hero_CarPaint", (0.82, 0.08, 0.06), metallic=0.82, clearcoat=1.0)',
  },
  {
    id: 'carbon_fiber',
    zh: '碳纤维',
    en: 'Carbon Fiber',
    code: 'mat_carbon = dsh_mat_carbon_fiber("Hero_Carbon")',
  },
  {
    id: 'brushed_metal',
    zh: '拉丝金属',
    en: 'Brushed Metal',
    code: 'mat_metal = dsh_mat_brushed_metal("Hero_Alloy", color=(0.74, 0.77, 0.82), roughness=0.25)',
  },
  {
    id: 'tinted_glass',
    zh: '玻璃罩',
    en: 'Tinted Glass',
    code: 'mat_glass = dsh_mat_tinted_glass("Hero_Glass", color=(0.12, 0.18, 0.24), roughness=0.04)',
  },
  {
    id: 'radial_array',
    zh: '环形阵列',
    en: 'Radial Array',
    code: 'dsh_array_radial(bpy.context.active_object, count=12, axis="Z", center=(0, 0, 0))',
  },
  {
    id: 'hero_studio',
    zh: '棚拍环境',
    en: 'Hero Studio',
    code: 'dsh_setup_hero_studio(style="dark_cyclorama", accent_color="#4176e6")',
  },
  {
    id: 'compositor',
    zh: '后期泛光',
    en: 'Compositor Glare',
    code: 'dsh_setup_compositor(glare=True, glare_threshold=1.15)',
  },
  {
    id: 'loft_profile',
    zh: '放样壳体',
    en: 'Loft Profile',
    code: 'hull = dsh_loft_profile("Hero_Hull", [[(-0.5,0,0),(0.5,0,0),(0.4,0,0.4),(-0.4,0,0.4)],[(-0.4,1.2,0.05),(0.4,1.2,0.05),(0.3,1.2,0.45),(-0.3,1.2,0.45)]], closed=True)',
  },
  {
    id: 'bolt_ring',
    zh: '螺栓环',
    en: 'Bolt Ring',
    code: 'bolts = dsh_bolt_ring("Flange_Bolts", radius=0.45, count=12, bolt_radius=0.018, bolt_height=0.024, axis="Z", center=(0, 0, 0.2))',
  },
  {
    id: 'wheel_assembly',
    zh: '轮毂总成',
    en: 'Wheel Assembly',
    code: 'wheel = dsh_wheel_assembly("Wheel_FL", radius=0.35, width=0.28, spokes=10, caliper_color="#f59e0b", location=(-0.9, 1.3, 0.35))',
  },
  {
    id: 'heat_blued_titanium',
    zh: '热蓝钛金属',
    en: 'Heat-Blued Ti',
    code: 'mat_ti = dsh_mat_heat_blued_titanium("Turbine_HeatBluedTi")',
  },
  {
    id: 'anodized_metal',
    zh: '阳极氧化铝',
    en: 'Anodized Metal',
    code: 'mat_anod = dsh_mat_anodized_metal("Aero_AnodizedBlue", color="#1d4ed8", roughness=0.22)',
  },
  {
    id: 'clay_override',
    zh: '白模体检',
    en: 'Clay Override',
    code: 'dsh_render_clay_override(enable=True, color=(0.76, 0.77, 0.79, 1.0))',
  },
];

const SHOT_PRESET_LABELS = {
  hero_3q: { zh: '主 3/4 · 58mm', en: 'Hero 3/4 · 58mm' },
  low_dramatic: { zh: '低角度 · 35mm', en: 'Low Angle · 35mm' },
  macro_dof: { zh: '微距景深 · 85mm', en: 'Macro DoF · 85mm' },
  side_profile: { zh: '正侧面 · 50mm', en: 'Side Profile · 50mm' },
  top_plan: { zh: '俯视工程图', en: 'Top Plan' },
};

function formatShotLabel(art, lang) {
  if (!art) return '';
  if (art.shotId && SHOT_PRESET_LABELS[art.shotId]) {
    return lang === 'en' ? SHOT_PRESET_LABELS[art.shotId].en : SHOT_PRESET_LABELS[art.shotId].zh;
  }
  if (art.label && !(lang === 'en' && /[\u3400-\u9fff]/.test(String(art.label)))) {
    return String(art.label);
  }
  return art.shotId ? String(art.shotId) : lang === 'en' ? 'Shot' : '分镜';
}

function BlenderCompareViewer({ project, imageArtifacts, initialPair = null, lang = 'zh', t }) {
  const [leftId, setLeftId] = useState(() => initialPair?.leftId || imageArtifacts[1]?.id || imageArtifacts[0]?.id || '');
  const [rightId, setRightId] = useState(() => initialPair?.rightId || imageArtifacts[0]?.id || '');
  const [splitPct, setSplitPct] = useState(50);
  const stageRef = useRef(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    if (initialPair?.leftId) setLeftId(initialPair.leftId);
    if (initialPair?.rightId) setRightId(initialPair.rightId);
  }, [initialPair?.nonce, initialPair?.leftId, initialPair?.rightId]);

  useEffect(() => {
    const ids = new Set(imageArtifacts.map(a => a.id));
    if (!ids.has(rightId)) setRightId(imageArtifacts[0]?.id || '');
    if (!ids.has(leftId)) setLeftId(imageArtifacts[1]?.id || imageArtifacts[0]?.id || '');
  }, [imageArtifacts, leftId, rightId]);

  const leftArt = imageArtifacts.find(a => a.id === leftId) || imageArtifacts[1] || imageArtifacts[0];
  const rightArt = imageArtifacts.find(a => a.id === rightId) || imageArtifacts[0];
  if (!leftArt || !rightArt) return null;

  function artLabel(a) {
    const kindName =
      a.kind === 'contact_sheet'
        ? t('四视角', '4-View')
        : a.kind === 'shot'
        ? formatShotLabel(a, lang)
        : t('静帧', 'Still');
    return 'R' + a.revision + ' · ' + a.engine + ' ' + a.samples + 'spp · ' + kindName;
  }

  function updateFromClientX(clientX) {
    const rect = stageRef.current?.getBoundingClientRect?.();
    if (!rect || rect.width <= 0) return;
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSplitPct(Math.round(pct * 10) / 10);
  }

  function onSliderPointerDown(e) {
    draggingRef.current = true;
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch {}
    updateFromClientX(e.clientX);
  }

  function onSliderPointerMove(e) {
    if (!draggingRef.current) return;
    updateFromClientX(e.clientX);
  }

  function onSliderPointerUp(e) {
    draggingRef.current = false;
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch {}
  }

  function onSliderKeyDown(e) {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSplitPct(p => Math.max(0, Math.round((p - step) * 10) / 10));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSplitPct(p => Math.min(100, Math.round((p + step) * 10) / 10));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSplitPct(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSplitPct(100);
    }
  }

  return h(
    'div',
    { className: 'bl-compare-root', 'data-compare-root': 'true', 'data-window-drag-exclude': '' },
    h(
      'div',
      { className: 'bl-compare-pickers' },
      h(
        'label',
        { className: 'bl-compare-picker' },
        h('span', { className: 'bl-compare-side-tag' }, 'A'),
        h(
          'select',
          {
            'data-compare-select': 'a',
            'aria-label': t('选择左侧对比图 A', 'Select left compare image A'),
            value: leftArt.id,
            onChange: e => setLeftId(e.target.value),
          },
          imageArtifacts.map(a => h('option', { key: a.id, value: a.id }, artLabel(a))),
        ),
      ),
      h(
        'label',
        { className: 'bl-compare-picker' },
        h('span', { className: 'bl-compare-side-tag bl-compare-side-b' }, 'B'),
        h(
          'select',
          {
            'data-compare-select': 'b',
            'aria-label': t('选择右侧对比图 B', 'Select right compare image B'),
            value: rightArt.id,
            onChange: e => setRightId(e.target.value),
          },
          imageArtifacts.map(a => h('option', { key: a.id, value: a.id }, artLabel(a))),
        ),
      ),
    ),
    h(
      'div',
      {
        ref: stageRef,
        className: 'bl-compare-stage',
        'data-compare-stage': 'true',
        onPointerDown: e => {
          if (e.target === stageRef.current || e.target.tagName === 'IMG') updateFromClientX(e.clientX);
        },
      },
      h('img', {
        className: 'bl-compare-img',
        src: urlFor(project, 'artifact', { artifact: rightArt.id }),
        alt: 'B: ' + artLabel(rightArt),
        draggable: false,
      }),
      h(
        'div',
        {
          className: 'bl-compare-overlay-a',
          style: { clipPath: 'inset(0 ' + (100 - splitPct) + '% 0 0)' },
        },
        h('img', {
          className: 'bl-compare-img',
          src: urlFor(project, 'artifact', { artifact: leftArt.id }),
          alt: 'A: ' + artLabel(leftArt),
          draggable: false,
        }),
      ),
      h('span', { className: 'bl-compare-badge bl-compare-badge-a' }, 'A · ' + artLabel(leftArt)),
      h('span', { className: 'bl-compare-badge bl-compare-badge-b' }, 'B · ' + artLabel(rightArt)),
      h(
        'div',
        {
          className: 'bl-compare-divider',
          role: 'slider',
          tabIndex: 0,
          'data-compare-slider': 'true',
          'aria-label': t('拖动或按左右方向键调整 A/B 对比分割线', 'Drag or use Left/Right arrow keys to adjust A/B compare split'),
          'aria-valuemin': 0,
          'aria-valuemax': 100,
          'aria-valuenow': Math.round(splitPct),
          style: { left: splitPct + '%' },
          onPointerDown: onSliderPointerDown,
          onPointerMove: onSliderPointerMove,
          onPointerUp: onSliderPointerUp,
          onPointerCancel: onSliderPointerUp,
          onKeyDown: onSliderKeyDown,
        },
        h('span', { className: 'bl-compare-knob', 'aria-hidden': 'true' }, '◂▸'),
      ),
    ),
  );
}

function renderQcReportCard(qc, t) {
  if (!qc || typeof qc !== 'object') return null;
  const rawScore = Number(qc.score);
  const score = Number.isFinite(rawScore) ? Math.max(0, Math.min(100, Math.round(rawScore))) : 0;
  const grade = String(qc.grade || (score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : 'D'));
  const tone = score >= 85 ? 'good' : score >= 65 ? 'warn' : 'bad';
  const issues = Array.isArray(qc.issues) ? qc.issues : [];
  return h(
    'div',
    {
      className: 'bl-qc-card',
      'data-qc-card': 'true',
      'data-qc-tone': tone,
      'data-qc-score': String(score),
      'data-qc-grade': grade,
    },
    h(
      'div',
      { className: 'bl-qc-head' },
      h(
        'span',
        { className: 'bl-qc-badge', 'data-qc-badge': 'true', 'data-qc-tone': tone },
        'QC-3D · ' + score + '/100 · ' + grade,
      ),
      h(
        'span',
        { className: 'bl-qc-summary' },
        issues.length === 0
          ? t('场景质检通过 · 零异常', 'Scene audit passed · 0 issues')
          : t('检测到 ' + issues.length + ' 项诊断建议', issues.length + ' diagnostic ' + (issues.length === 1 ? 'item' : 'items')),
      ),
    ),
    issues.length > 0
      ? h(
          'ul',
          { className: 'bl-qc-issues' },
          issues.map((issue, idx) => {
            const sev = issue?.severity === 'error' || issue?.severity === 'warn' ? issue.severity : 'info';
            return h(
              'li',
              { key: (issue?.code || 'qc') + '-' + idx, className: 'bl-qc-issue', 'data-severity': sev },
              h('span', { className: 'bl-qc-sev' }, sev.toUpperCase()),
              h(
                'div',
                { className: 'bl-qc-issue-body' },
                issue?.code || issue?.object
                  ? h(
                      'div',
                      { className: 'bl-qc-issue-meta' },
                      issue?.code ? h('code', { className: 'bl-qc-code' }, issue.code) : null,
                      issue?.object ? h('span', { className: 'bl-qc-obj' }, issue.object) : null,
                    )
                  : null,
                h('span', { className: 'bl-qc-msg' }, issue?.message || ''),
              ),
            );
          }),
        )
      : null,
  );
}

function scanScriptQuickWarnings(code) {
  const patterns = [
    { re: /\bos\.system\s*\(/, label: 'os.system()' },
    { re: /\bsubprocess\b/, label: 'subprocess' },
    { re: /\bshutil\.rmtree\b/, label: 'shutil.rmtree' },
    { re: /\b(urllib|requests|http\.client)\b|\b(?:import|from)\s+socket\b|\bsocket\.(?:socket|create_connection|gethost|AF_|SOCK_|bind|connect|listen|inet_)/, label: 'network/socket' },
    { re: /\b(eval|exec|__import__)\s*\(/, label: 'dynamic exec/eval' },
  ];
  const found = [];
  for (const p of patterns) {
    if (p.re.test(String(code || ''))) found.push(p.label);
  }
  return found;
}

function BlenderStudioPanel({
  project,
  fields,
  setFields,
  dirty,
  setDirty,
  canSave,
  onSave,
  onSaveCheckpoint,
  onRestoreCheckpoint,
  setError,
  setNotice,
  syncFields,
  fieldsOf,
  templates = FALLBACK_TEMPLATES,
  environment,
  editorMode,
  setEditorMode,
  stageView,
  setStageView,
  job,
  running,
  busy,
  titleValid,
  titleTouched,
  setTitleTouched,
  samplesValid,
  framesValid,
  colorValid,
  lensValid = true,
  exposureValid = true,
  scriptBytes,
  scriptValid,
  startJob,
  openInBlenderGui,
  onOpenExport,
  setEditorTab,
  perform,
  controlId,
  lang,
  t,
}) {
  const [inspectorTab, setInspectorTab] = useState('params');
  const [orbit, setOrbit] = useState(() => ({ ...(CAMERA_PRESET_ANGLES[fields.cameraPreset] || CAMERA_PRESET_ANGLES.three_quarter), panX: 0, panY: 0 }));
  const [turntablePlaying, setTurntablePlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(fields.frameStart || 1);
  const [generatedPreview, setGeneratedPreview] = useState('');
  const [loadingScript, setLoadingScript] = useState(false);
  const [allowUnsafe, setAllowUnsafe] = useState(false);
  const [pipelineTier, setPipelineTier] = useState('studio');
  const [checkpointNote, setCheckpointNote] = useState('');
  const [glbShading, setGlbShading] = useState('shaded');
  const [selectedGlbKey, setSelectedGlbKey] = useState('');
  const [selectedShotId, setSelectedShotId] = useState('');
  const [comparePair, setComparePair] = useState(null);
  const [glbState, setGlbState] = useState({ key: '', loading: false, error: '', mesh: null });
  const glbCacheRef = useRef(new Map());
  const stageCanvasRef = useRef(null);
  const scriptAreaRef = useRef(null);
  const studioRootRef = useRef(null);
  const formSplit = W.useResizableSplit({ key: 'dsh-blender-studio:form-split', initial: 430, min: 300, max: 620 });

  const frameStart = Number.isInteger(fields.frameStart) && fields.frameStart >= 1 ? fields.frameStart : 1;
  const frameEnd = Number.isInteger(fields.frameEnd) && fields.frameEnd >= frameStart ? fields.frameEnd : Math.max(frameStart, 48);
  const frameSpan = Math.max(1, frameEnd - frameStart);
  const framePhase = Math.max(0, Math.min(1, (currentFrame - frameStart) / frameSpan));

  const shotArtifacts = Array.isArray(project?.artifacts)
    ? project.artifacts
        .filter(a => a.kind === 'shot')
        .slice()
        .sort((a, b) => Date.parse(a.created || 0) - Date.parse(b.created || 0))
    : [];

  const imageArtifacts = Array.isArray(project?.artifacts)
    ? project.artifacts
        .filter(a => a.kind === 'still' || a.kind === 'contact_sheet' || a.kind === 'shot')
        .slice()
        .sort((a, b) => Date.parse(b.created || 0) - Date.parse(a.created || 0))
    : [];

  useEffect(() => {
    if (shotArtifacts.length > 0 && !shotArtifacts.some(s => s.id === selectedShotId)) {
      setSelectedShotId(shotArtifacts[0].id);
    }
  }, [shotArtifacts, selectedShotId]);

  useEffect(() => {
    const preset = CAMERA_PRESET_ANGLES[fields.cameraPreset];
    if (preset) setOrbit({ ...preset, panX: 0, panY: 0 });
  }, [fields.cameraPreset]);

  useEffect(() => {
    setCurrentFrame(prev => Math.max(frameStart, Math.min(frameEnd, prev)));
  }, [frameStart, frameEnd]);

  useEffect(() => {
    if (!turntablePlaying) return undefined;
    let rafId = null;
    let timerId = null;
    let last = Date.now();
    const tick = () => {
      const now = Date.now();
      const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
      last = now;
      setOrbit(prev => ({ ...prev, yaw: (prev.yaw + dt * 0.95) % (Math.PI * 2) }));
      setCurrentFrame(prev => {
        const next = prev + dt * (fields.fps || 24) * 0.5;
        return next > frameEnd ? frameStart : next;
      });
      if (typeof requestAnimationFrame === 'function') rafId = requestAnimationFrame(tick);
    };
    if (typeof requestAnimationFrame === 'function') rafId = requestAnimationFrame(tick);
    else timerId = setInterval(tick, 50);
    return () => {
      if (rafId !== null && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(rafId);
      if (timerId !== null) clearInterval(timerId);
    };
  }, [turntablePlaying, fields.fps, frameStart, frameEnd]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onKeyDown = event => {
      if (event.defaultPrevented || event.isComposing) return;
      const hasBlockingModal =
        typeof document !== 'undefined' &&
        Array.from(
          document.querySelectorAll('[role="dialog"]:not([aria-modal="false"]):not([data-tour-card]), [role="alertdialog"], dialog[open]'),
        ).some(el => !studioRootRef.current || !el.contains(studioRootRef.current));
      if (hasBlockingModal) return;
      const key = String(event.key || '');
      if ((event.ctrlKey || event.metaKey) && !event.altKey && key.toLowerCase() === 's') {
        event.preventDefault();
        if (dirty && canSave && !running && typeof onSave === 'function') onSave();
        return;
      }
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target;
      const tag = target && typeof target.tagName === 'string' ? target.tagName.toUpperCase() : '';
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        tag === 'BUTTON' ||
        (target && target.isContentEditable) ||
        (target && typeof target.closest === 'function' && target.closest('input, textarea, select, button, a[href], [contenteditable="true"], [role="textbox"]'))
      ) {
        return;
      }
      if (key === ' ') {
        event.preventDefault();
        setTurntablePlaying(prev => !prev);
      } else if (key === '1') {
        setStageView('stage');
      } else if (key === '2') {
        setStageView('still');
      } else if (key === '3') {
        setStageView('contact_sheet');
      } else if (key === '4') {
        setStageView('animation');
      } else if (key === '5') {
        setStageView('mesh');
      } else if (key === '6' && imageArtifacts.length >= 2) {
        setStageView('compare');
      } else if (key === 'r' || key === 'R') {
        setTurntablePlaying(false);
        setOrbit({ ...(CAMERA_PRESET_ANGLES[fields.cameraPreset] || CAMERA_PRESET_ANGLES.three_quarter), panX: 0, panY: 0 });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dirty, canSave, running, onSave, fields.cameraPreset, setStageView, imageArtifacts.length]);

  function patchFields(patch) {
    setFields(prev => ({ ...prev, ...patch }));
    setDirty(true);
  }

  function applyTemplate(tplId) {
    const tpl = (templates || FALLBACK_TEMPLATES).find(item => item.id === tplId);
    const next = { template: tplId };
    if (tpl && !project) {
      next.engine = tpl.recommendedEngine || fields.engine;
      next.cameraPreset = tpl.defaultCamera || fields.cameraPreset;
      next.lightingPreset = tpl.defaultLighting || fields.lightingPreset;
      next.materialPreset = tpl.defaultMaterial || fields.materialPreset;
      next.frameEnd = tpl.defaultFrames || fields.frameEnd;
    }
    patchFields(next);
  }

  async function fetchGeneratedScript() {
    if (!project) {
      setError(t('请先保存工程，再预览后端生成的 bpy 脚本。', 'Save your project before fetching the generated bpy script.'));
      return;
    }
    setLoadingScript(true);
    try {
      const res = await api({ action: 'generatedScript', id: project.id });
      setGeneratedPreview(typeof res === 'string' ? res : res?.script || '');
    } catch (e) {
      setError(e);
    } finally {
      setLoadingScript(false);
    }
  }

  const stillArtifact = latestArtifactOf(project, 'still');
  const qcArtifact = latestArtifactOf(project, 'contact_sheet');
  const animArtifact = latestArtifactOf(project, 'animation');
  const activeShotArtifact = shotArtifacts.find(s => s.id === selectedShotId) || shotArtifacts[0] || null;
  const glbSources = [];
  if (project) {
    const exportedGlbs = Array.isArray(project.artifacts)
      ? project.artifacts
          .filter(a => a.kind === 'glb')
          .slice()
          .sort((a, b) => Date.parse(b.created || 0) - Date.parse(a.created || 0))
      : [];
    for (const art of exportedGlbs) {
      glbSources.push({
        key: 'art:' + project.id + ':' + art.id,
        sourceKind: 'artifact',
        label: (art.file || 'model.glb') + ' (R' + (art.revision || 1) + ')',
        size: art.size,
        url: urlFor(project, 'artifact', { artifact: art.id }),
        downloadUrl: urlFor(project, 'artifact', { artifact: art.id, download: '1' }),
      });
    }
    const uploadedGlbs = Array.isArray(project.assets)
      ? project.assets.filter(
          a => String(a.ext || '').replace(/^\./, '').toLowerCase() === 'glb' || String(a.file || '').toLowerCase().endsWith('.glb'),
        )
      : [];
    for (const asset of uploadedGlbs) {
      glbSources.push({
        key: 'asset:' + project.id + ':' + asset.id,
        sourceKind: 'asset',
        label: t('上传资产: ', 'Asset: ') + (asset.name || asset.file || 'asset.glb'),
        size: asset.size,
        url: urlFor(project, 'asset', { asset: asset.id }),
        downloadUrl: urlFor(project, 'asset', { asset: asset.id, download: '1' }),
      });
    }
  }
  const glbSource = glbSources.find(s => s.key === selectedGlbKey) || glbSources[0] || null;

  function captureViewportSnapshot() {
    const canvas = stageCanvasRef.current;
    if (!canvas || typeof canvas.toDataURL !== 'function') return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = (project?.id ? 'dsh-' + project.id.slice(0, 8) : 'dsh-viewport') + '-snapshot.png';
      document.body?.appendChild?.(link);
      if (typeof navigator === 'undefined' || !/jsdom/i.test(String(navigator.userAgent || ''))) {
        link.click?.();
      }
      link.remove?.();
      setNotice(t('已保存 3D 视口快照 PNG。', 'Saved 3D viewport snapshot PNG.'));
    } catch (err) {
      setError(err);
    }
  }

  useEffect(() => {
    if (stageView !== 'mesh' || !glbSource) return undefined;
    const cached = glbCacheRef.current.get(glbSource.key);
    if (cached) {
      setGlbState({ key: glbSource.key, loading: false, error: '', mesh: cached });
      return undefined;
    }
    let alive = true;
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    setGlbState({ key: glbSource.key, loading: true, error: '', mesh: null });
    fetch(glbSource.url, { credentials: 'same-origin', ...(controller ? { signal: controller.signal } : {}) })
      .then(res => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.arrayBuffer();
      })
      .then(buf => {
        if (!alive) return;
        const parsed = parseGlbMesh(buf);
        glbCacheRef.current.set(glbSource.key, parsed);
        setGlbState({ key: glbSource.key, loading: false, error: '', mesh: parsed });
      })
      .catch(err => {
        if (!alive || err?.name === 'AbortError') return;
        setGlbState({ key: glbSource.key, loading: false, error: err?.message || 'GLB parse error', mesh: null });
      });
    return () => {
      alive = false;
      controller?.abort?.();
    };
  }, [stageView, glbSource?.key, glbSource?.url]);

  const activeArtifact =
    stageView === 'still'
      ? stillArtifact
      : stageView === 'contact_sheet'
      ? qcArtifact
      : stageView === 'animation'
      ? animArtifact
      : stageView === 'shot'
      ? activeShotArtifact
      : null;
  const activeStale = Boolean(activeArtifact && project && (dirty || activeArtifact.revision !== project.revision));

  const quickWarnings = fields.scriptMode === 'custom' ? scanScriptQuickWarnings(fields.customScript) : [];
  const bridgeConnected = Boolean(environment?.bridge?.connected);
  const activeBlender = environment?.active;
  const [baseW, baseH] = fields.aspect === 'portrait' ? [720, 1280] : fields.aspect === 'square' ? [1024, 1024] : [1280, 720];
  const scaleFactor = (Number(fields.resolutionScale) || 100) / 100;
  const outW = Math.round((baseW * scaleFactor) / 2) * 2;
  const outH = Math.round((baseH * scaleFactor) / 2) * 2;

  const sceneSummary = project?.sceneSummary || job?.sceneSummary || null;

  function renderStageCard() {
    return h(
      'section',
      {
        className: 'bl-stage-monitor',
        'data-tour': 'blender-stage',
        'aria-label': t('OP-DSH 3D 渲染监看舞台', 'OP-DSH 3D Stage & Render Viewport'),
      },
      // Monitor HUD
      h(
        'div',
        { className: 'bl-stage-hud' },
        h(
          'div',
          { className: 'bl-stage-meta-group' },
          h('span', { className: 'bl-stage-dot', 'data-live': turntablePlaying || job?.state === 'running' ? 'true' : 'false', 'aria-hidden': 'true' }),
          h('span', { className: 'bl-stage-readout' }, outW + '×' + outH + ' · ' + fields.engine + ' · ' + fields.samples + ' spp'),
          activeStale
            ? h('span', { className: 'bl-stale-pill' }, t('旧修订 R' + activeArtifact.revision + ' · 需重渲', 'Stale R' + activeArtifact.revision))
            : null,
        ),
        h(
          'div',
          { className: 'bl-stage-view-tabs', role: 'tablist', 'aria-label': t('视口显示模式', 'Viewport display mode') },
          [
            { id: 'stage', label: t('实时草图', '3D Stage') },
            { id: 'still', label: t('最新静帧', 'Still'), has: !!stillArtifact },
            ...(shotArtifacts.length > 0 ? [{ id: 'shot', label: t('分镜', 'Shots'), has: true }] : []),
            { id: 'contact_sheet', label: t('四视角质检', '4-View QC'), has: !!qcArtifact },
            { id: 'animation', label: t('动画回放', 'Animation'), has: !!animArtifact },
            { id: 'mesh', label: t('3D 网格', '3D Mesh'), has: !!glbSource },
            {
              id: 'compare',
              label: t('A/B 对比', 'A/B Compare'),
              has: imageArtifacts.length >= 2,
              disabled: imageArtifacts.length < 2,
              title: imageArtifacts.length < 2 ? t('需要至少 2 张静帧、分镜或四视角图即可进行 A/B 对比', 'Render at least 2 still, shot, or QC images to enable A/B compare') : undefined,
            },
          ].map(tab =>
            h(
              'button',
              {
                key: tab.id,
                type: 'button',
                role: 'tab',
                className: 'bl-stage-view-btn',
                'data-stage-view': tab.id,
                'aria-selected': stageView === tab.id,
                'data-has-artifact': tab.has ? 'true' : undefined,
                disabled: Boolean(tab.disabled),
                title: tab.title,
                onClick: () => setStageView(tab.id),
              },
              tab.label,
              tab.has ? h('span', { className: 'bl-artifact-dot', 'aria-hidden': 'true' }) : null,
            ),
          ),
        ),
      ),

      // Recessed Slate Monitor Bezel
      h(
        'div',
        { className: 'bl-stage-bezel' },
        stageView === 'stage'
          ? h(BlenderStageCanvas, {
              fields,
              orbit,
              setOrbit,
              framePhase,
              canvasRefExternal: stageCanvasRef,
              onResetOrbit: () => {
                setTurntablePlaying(false);
                setOrbit({ ...(CAMERA_PRESET_ANGLES[fields.cameraPreset] || CAMERA_PRESET_ANGLES.three_quarter), panX: 0, panY: 0 });
              },
              t,
            })
          : stageView === 'mesh'
          ? glbSource
            ? h(
                'div',
                { className: 'bl-mesh-viewer', 'data-glb-viewer': 'true' },
                glbState.loading
                  ? h('div', { className: 'bl-artifact-empty' }, h('p', null, t('正在解析二进制 GLB 网格…', 'Parsing binary GLB mesh…')))
                  : glbState.error
                  ? h('div', { className: 'bl-artifact-empty' }, h('p', null, t('GLB 解析失败：', 'GLB parse failed: ') + glbState.error))
                  : glbState.mesh
                  ? h(BlenderStageCanvas, {
                      fields,
                      orbit,
                      setOrbit,
                      framePhase,
                      glbMesh: glbState.mesh,
                      glbShading,
                      canvasRefExternal: stageCanvasRef,
                      onResetOrbit: () => {
                        setTurntablePlaying(false);
                        setOrbit({ ...(CAMERA_PRESET_ANGLES[fields.cameraPreset] || CAMERA_PRESET_ANGLES.three_quarter), panX: 0, panY: 0 });
                      },
                      t,
                    })
                  : null,
                h(
                  'div',
                  { className: 'bl-mesh-bar', 'data-window-drag-exclude': '' },
                  h(
                    'div',
                    { className: 'bl-mesh-shading', role: 'group', 'aria-label': t('3D 网格着色模式', '3D mesh shading mode') },
                    [
                      { id: 'shaded', zh: '着色 Shaded', en: 'Shaded' },
                      { id: 'wire-overlay', zh: '线框叠加', en: 'Shaded + Wire' },
                      { id: 'clay', zh: '白模 Clay', en: 'Clay' },
                      { id: 'wireframe', zh: '线框 Wire', en: 'Wireframe' },
                    ].map(mode =>
                      h(
                        'button',
                        {
                          key: mode.id,
                          type: 'button',
                          className: 'bl-cam-mini-btn',
                          'data-glb-shading': mode.id,
                          'aria-pressed': glbShading === mode.id,
                          onClick: () => setGlbShading(mode.id),
                        },
                        lang === 'en' ? mode.en : mode.zh,
                      ),
                    ),
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'bl-cam-mini-btn',
                        'data-action': 'glb-snapshot',
                        onClick: captureViewportSnapshot,
                      },
                      t('视口快照', 'Snapshot PNG'),
                    ),
                  ),
                  h(
                    'div',
                    { className: 'bl-mesh-meta' },
                    glbSources.length > 1
                      ? h(
                          'select',
                          {
                            className: 'bl-glb-src-select',
                            'data-glb-source-select': 'true',
                            'aria-label': t('切换 GLB 模型来源', 'Select GLB mesh source'),
                            value: glbSource.key,
                            onChange: e => setSelectedGlbKey(e.target.value),
                          },
                          glbSources.map(s => h('option', { key: s.key, value: s.key }, s.label)),
                        )
                      : h('span', null, glbSource.label + (glbSource.size ? ' · ' + formatBytes(glbSource.size) : '')),
                    glbState.mesh
                      ? h(
                          'span',
                          { 'data-glb-stats': 'true' },
                          glbState.mesh.dimensions.join('×') + 'm · ' + glbState.mesh.triangleCount + ' tris',
                        )
                      : null,
                    h(
                      'a',
                      { className: 'bl-stage-dl-link', href: glbSource.downloadUrl, download: '' },
                      h(W.Icon, { name: 'download', size: 13 }),
                      t('下载 GLB', 'Download GLB'),
                    ),
                  ),
                ),
              )
            : h(
                'div',
                { className: 'bl-artifact-empty', 'data-glb-empty': 'true' },
                h(W.Icon, { name: 'cube', size: 28 }),
                h(
                  'p',
                  null,
                  t('当前工程尚无已导出的 .glb 模型或上传的 .glb 资产，导出后即可直接在工作台内 360° 交互检视真实 3D 网格。', 'No exported or uploaded .glb mesh yet. Export a GLB model to inspect the real 3D mesh interactively right here.'),
                ),
                h(
                  W.Button,
                  {
                    variant: 'primary',
                    size: 'sm',
                    icon: 'download',
                    'data-action': 'export-glb-cta',
                    disabled: !project || running || dirty || !environment?.ready,
                    onClick: () => startJob('export_model', { format: 'glb' }),
                  },
                  t('先导出 GLB 模型', 'Export GLB Model'),
                ),
              )
          : stageView === 'compare'
          ? imageArtifacts.length >= 2
            ? h(BlenderCompareViewer, { project, imageArtifacts, initialPair: comparePair, lang, t })
            : h(
                'div',
                { className: 'bl-artifact-empty' },
                h(W.Icon, { name: 'sliders', size: 28 }),
                h('p', null, t('至少需要 2 张已渲染的静帧、分镜或四视角图即可开启左右滑动 A/B 对比。', 'Render at least 2 stills, shots, or 4-view sheets to enable A/B split comparison.')),
              )
          : activeArtifact
          ? h(
              'div',
              { className: 'bl-artifact-viewer' },
              stageView === 'animation' && String(activeArtifact.mime || '').startsWith('video/')
                ? h('video', {
                    key: activeArtifact.id,
                    controls: true,
                    preload: 'metadata',
                    src: urlFor(project, 'artifact', { artifact: activeArtifact.id }),
                    'aria-label': t('已渲染 3D 动画', 'Rendered 3D animation'),
                  })
                : h('img', {
                    key: activeArtifact.id,
                    src: urlFor(project, 'artifact', { artifact: activeArtifact.id }),
                    alt: stageView === 'contact_sheet' ? t('四视角质检拼图', '4-View QC contact sheet') : t('Blender 渲染静帧', 'Blender still render'),
                  }),
              h(
                'div',
                { className: 'bl-artifact-caption' },
                h(
                  'span',
                  null,
                  (activeArtifact.kind === 'shot' ? formatShotLabel(activeArtifact, lang) + ' · ' : '') +
                    'R' + activeArtifact.revision + ' · ' + activeArtifact.engine + ' · ' + activeArtifact.samples + ' spp · ' + formatBytes(activeArtifact.size),
                ),
                h(
                  'a',
                  {
                    className: 'bl-stage-dl-link',
                    href: urlFor(project, 'artifact', { artifact: activeArtifact.id, download: '1' }),
                    download: '',
                  },
                  h(W.Icon, { name: 'download', size: 13 }),
                  t('下载成品', 'Download'),
                ),
              ),
            )
          : h(
              'div',
              { className: 'bl-artifact-empty' },
              h(W.Icon, { name: stageView === 'contact_sheet' ? 'grid' : stageView === 'animation' ? 'play' : 'camera', size: 28 }),
              h(
                'p',
                null,
                stageView === 'contact_sheet'
                  ? t('尚未生成 2×2 四视角质检拼图（正视 / 3/4 / 俯视 / 主镜头）。', 'No 2×2 4-View QC contact sheet rendered yet.')
                  : stageView === 'animation'
                  ? t('尚未渲染 Turntable / 关键帧动画。', 'No animation rendered yet.')
                  : t('尚未渲染单帧静帧预览图。', 'No still preview rendered yet.'),
              ),
              h(
                W.Button,
                {
                  variant: 'primary',
                  size: 'sm',
                  icon: stageView === 'contact_sheet' ? 'grid' : stageView === 'animation' ? 'play' : 'camera',
                  disabled: !project || running || dirty || !environment?.ready,
                  onClick: () =>
                    startJob(
                      stageView === 'contact_sheet'
                        ? 'contact_sheet'
                        : stageView === 'animation'
                        ? 'render_animation'
                        : 'preview_still',
                    ),
                },
                stageView === 'contact_sheet'
                  ? t('立即渲染四视角质检', 'Render 4-View QC')
                  : stageView === 'animation'
                  ? t('立即渲染动画', 'Render Animation')
                  : t('立即渲染静帧', 'Render Still'),
              ),
            ),
      ),

      // Interactive Orbit + Turntable Deck (shown in 3D Stage and 3D GLB Mesh modes)
      stageView === 'stage' || (stageView === 'mesh' && Boolean(glbSource))
        ? h(
            'div',
            { className: 'bl-orbit-deck', 'data-window-drag-exclude': '' },
            h(
              'div',
              { className: 'bl-orbit-controls' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'bl-turntable-btn',
                  'data-playing': turntablePlaying ? 'true' : 'false',
                  onClick: () => setTurntablePlaying(p => !p),
                },
                turntablePlaying ? t('❚❚ 暂停转台', '❚❚ Pause') : t('▶ 转台预览', '▶ Turntable'),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'bl-cam-mini-btn',
                  'aria-pressed': Boolean(orbit.ortho),
                  onClick: () => setOrbit(p => ({ ...p, ortho: !p.ortho })),
                },
                orbit.ortho ? t('正交', 'Ortho') : t('透视', 'Persp'),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'bl-cam-mini-btn',
                  'aria-label': t('放大视口', 'Zoom in'),
                  onClick: () => setOrbit(p => ({ ...p, zoom: Math.min(2.3, Number((p.zoom * 1.15).toFixed(2))) })),
                },
                '+',
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'bl-cam-mini-btn',
                  'aria-label': t('缩小视口', 'Zoom out'),
                  onClick: () => setOrbit(p => ({ ...p, zoom: Math.max(0.55, Number((p.zoom * 0.87).toFixed(2))) })),
                },
                '−',
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'bl-cam-mini-btn',
                  onClick: () => {
                    setTurntablePlaying(false);
                    setOrbit({ ...(CAMERA_PRESET_ANGLES[fields.cameraPreset] || CAMERA_PRESET_ANGLES.three_quarter), panX: 0, panY: 0 });
                  },
                },
                t('重置视角', 'Reset'),
              ),
            ),
            h(
              'div',
              { className: 'bl-frame-scrubber' },
              h('span', { className: 'bl-frame-readout' }, 'F ' + Math.round(currentFrame) + ' / ' + frameEnd),
              h('input', {
                type: 'range',
                min: frameStart,
                max: frameEnd,
                step: 1,
                value: Math.round(currentFrame),
                'aria-label': t('时间帧滑杆', 'Animation frame scrubber'),
                onChange: e => {
                  setTurntablePlaying(false);
                  setCurrentFrame(Number(e.target.value));
                },
              }),
            ),
          )
        : null,

      // Shot Filmstrip (shown whenever project has multi-shot lookdev renders)
      shotArtifacts.length > 0
        ? h(
            'div',
            { className: 'bl-shot-filmstrip', 'data-shot-filmstrip': 'true', 'data-window-drag-exclude': '' },
            h(
              'div',
              { className: 'bl-filmstrip-head' },
              h('span', { className: 'bl-filmstrip-title' }, t('分镜胶片条', 'Shot Filmstrip') + ' (' + shotArtifacts.length + ')'),
              shotArtifacts.length >= 2
                ? h(
                    'button',
                    {
                      type: 'button',
                      className: 'bl-cam-mini-btn',
                      'data-action': 'compare-shots',
                      onClick: () => {
                        const first = activeShotArtifact || shotArtifacts[0];
                        const second = shotArtifacts.find(s => s.id !== first.id) || shotArtifacts[1];
                        setComparePair({ leftId: first.id, rightId: second.id, nonce: Date.now() });
                        setStageView('compare');
                      },
                    },
                    t('对比两镜', 'Compare'),
                  )
                : null,
            ),
            h(
              'div',
              { className: 'bl-filmstrip-rail', role: 'list', 'aria-label': t('多机位分镜缩略图', 'Multi-shot thumbnails') },
              shotArtifacts.map(art => {
                const isSel = stageView === 'shot' && activeShotArtifact?.id === art.id;
                return h(
                  'button',
                  {
                    key: art.id,
                    type: 'button',
                    role: 'listitem',
                    className: 'bl-shot-thumb',
                    'data-shot-id': art.shotId || art.id,
                    'aria-pressed': isSel,
                    onClick: () => {
                      setSelectedShotId(art.id);
                      setStageView('shot');
                    },
                  },
                  h('img', {
                    src: urlFor(project, 'artifact', { artifact: art.id }),
                    alt: formatShotLabel(art, lang),
                    loading: 'lazy',
                  }),
                  h('span', { className: 'bl-shot-label' }, formatShotLabel(art, lang)),
                );
              }),
            ),
          )
        : null,

      // Quick Action Strip
      h(
        'div',
        { className: 'bl-stage-actions', 'data-window-drag-exclude': '' },
        h(
          W.Button,
          {
            variant: 'primary',
            size: 'sm',
            icon: 'camera',
            disabled: !project || running || dirty || !environment?.ready,
            title: !environment?.ready ? t('请先在「桥接与环境」配置 Blender', 'Configure Blender first') : dirty ? t('请先保存工程', 'Save changes first') : undefined,
            onClick: () => startJob('preview_still'),
          },
          t('预览静帧', 'Preview'),
        ),
        h(
          W.Button,
          {
            size: 'sm',
            icon: 'grid',
            disabled: !project || running || dirty || !environment?.ready,
            onClick: () => startJob('contact_sheet'),
          },
          t('四视角自检', '4-View QC'),
        ),
        h(
          W.Button,
          {
            size: 'sm',
            icon: 'layers',
            'data-action': 'render-shots',
            disabled: !project || running || dirty || !environment?.ready,
            title: t('单次启动 Blender 连续渲染 4 个机位分镜（3/4 主视角 / 低角度 / 微距景深 / 俯视图）', 'Single-launch batch render of 4 lookdev camera shots (Hero 3/4, Low Angle, Macro DoF, Top Plan)'),
            onClick: () =>
              startJob('render_shots', {
                shots: ['hero_3q', 'low_dramatic', 'macro_dof', 'top_plan'],
                qualityTier: pipelineTier,
              }),
          },
          t('多机位分镜', 'Multi-Shot'),
        ),
        h(
          W.Button,
          {
            size: 'sm',
            icon: 'play',
            disabled: !project || running || dirty || !environment?.ready,
            onClick: () => startJob('render_animation'),
          },
          t('渲染动画', 'Animation'),
        ),
        h(
          W.Button,
          {
            size: 'sm',
            icon: 'download',
            disabled: !project || running || dirty || !environment?.ready,
            onClick: onOpenExport,
          },
          t('导出模型', 'Export 3D'),
        ),
        h(
          W.Button,
          {
            size: 'sm',
            variant: 'ghost',
            icon: 'external',
            disabled: !project || running || dirty || !environment?.ready,
            onClick: openInBlenderGui,
          },
          t('在 Blender 打开', 'Open GUI'),
        ),
      ),

      h(
        'div',
        { className: 'bl-pipeline-bar', 'data-pipeline-bar': 'true', 'data-window-drag-exclude': '' },
        h(
          'div',
          { className: 'bl-pipeline-left' },
          h('span', { className: 'bl-pipeline-tag' }, t('全流程', 'PIPELINE')),
          h(
            'div',
            {
              className: 'bl-pipeline-tiers',
              role: 'group',
              'data-pipeline-tiers': 'true',
              'aria-label': t('全流程渲染档位', 'Pipeline quality tier'),
            },
            PIPELINE_TIERS.map(tier =>
              h(
                'button',
                {
                  key: tier.id,
                  type: 'button',
                  className: 'bl-tier-chip',
                  'data-pipeline-tier': tier.id,
                  'aria-pressed': pipelineTier === tier.id,
                  disabled: running,
                  onClick: () => setPipelineTier(tier.id),
                },
                lang === 'en' ? tier.en : tier.zh,
              ),
            ),
          ),
        ),
        h(
          W.Button,
          {
            variant: 'primary',
            size: 'sm',
            icon: 'sparkles',
            'data-action': 'pipeline',
            disabled: !project || running || dirty || !environment?.ready,
            title: !environment?.ready
              ? t('请先在「桥接与环境」配置 Blender', 'Configure Blender first')
              : dirty
              ? t('请先保存工程', 'Save changes first')
              : t('自动串行：QC-3D 体检 → 四视角质检 → 渲染 → 导出 GLB', 'Chained QC-3D audit → 4-View QC → Render → GLB export'),
            onClick: () =>
              startJob('pipeline', {
                includeContactSheet: true,
                renderKind: 'still',
                exportFormat: 'glb',
                qualityTier: pipelineTier,
                abortOnQcError: false,
              }),
          },
          t('一键全流程', 'Run Pipeline'),
        ),
      ),

      h(
        'div',
        { className: 'bl-shortcut-bar', 'data-shortcut-bar': 'true' },
        h('span', { className: 'bl-kbd-item' }, h('kbd', null, 'Space'), ' ', t('转台', 'Turntable')),
        h('span', { className: 'bl-kbd-sep', 'aria-hidden': 'true' }, '·'),
        h('span', { className: 'bl-kbd-item' }, h('kbd', null, '1–5'), ' ', t('切换视图', 'Views')),
        h('span', { className: 'bl-kbd-sep', 'aria-hidden': 'true' }, '·'),
        h('span', { className: 'bl-kbd-item' }, h('kbd', null, 'R'), ' ', t('重置视角', 'Reset Cam')),
        h('span', { className: 'bl-kbd-sep', 'aria-hidden': 'true' }, '·'),
        h('span', { className: 'bl-kbd-item' }, h('kbd', null, 'Ctrl+S'), ' ', t('保存', 'Save')),
      ),
    );
  }

  function renderParamsFields(compact) {
    return h(
      'div',
      { className: 'bl-params-body' },
      h(
        'div',
        { className: 'bl-field' },
        h('label', { htmlFor: controlId + '-title' }, t('工程标题（必填）', 'Project title (required)')),
        h(W.Input, {
          id: controlId + '-title',
          value: fields.title,
          disabled: running,
          maxLength: 72,
          placeholder: t('例如：陶瓷智能耳机棚拍展台', 'e.g. Ceramic Earbuds Studio'),
          'aria-invalid': titleTouched && !titleValid ? 'true' : 'false',
          onBlur: () => setTitleTouched(true),
          onChange: e => patchFields({ title: e.target.value }),
        }),
        titleTouched && !titleValid
          ? h('span', { className: 'bl-field-error' }, t('请输入 1–72 个字符的工程标题。', 'Enter 1–72 characters.'))
          : null,
      ),

      !compact
        ? h(
            'div',
            { className: 'bl-field' },
            h('label', { htmlFor: controlId + '-desc' }, t('场景描述 / 制作备忘', 'Scene description / notes')),
            h('textarea', {
              id: controlId + '-desc',
              rows: 2,
              maxLength: 600,
              disabled: running,
              value: fields.description,
              placeholder: t('记录镜头构图、灯光氛围或客户需求…', 'Notes on framing, mood, or deliverables…'),
              onChange: e => patchFields({ description: e.target.value }),
            }),
          )
        : null,

      h(
        'div',
        { className: 'bl-field' },
        h('label', { htmlFor: controlId + '-headline' }, t('3D 主标题文本（Logo / 标牌）', '3D Headline text')),
        h(W.Input, {
          id: controlId + '-headline',
          value: fields.headline,
          disabled: running,
          maxLength: 48,
          placeholder: 'DSH 3D',
          onChange: e => patchFields({ headline: e.target.value }),
        }),
      ),

      h(
        'div',
        { className: 'bl-field' },
        h('span', { className: 'bl-label' }, t('3D 场景模板', '3D Template')),
        h(
          'div',
          { className: 'bl-pill-grid', role: 'group', 'aria-label': t('场景模板选择', 'Template selection') },
          (templates || FALLBACK_TEMPLATES).map(tpl =>
            h(
              'button',
              {
                key: tpl.id,
                type: 'button',
                className: 'bl-tpl-pill',
                'aria-pressed': fields.template === tpl.id,
                disabled: running,
                onClick: () => applyTemplate(tpl.id),
              },
              lang === 'en' ? tpl.en : tpl.zh,
            ),
          ),
        ),
      ),

      h(
        'div',
        { className: 'bl-field' },
        h('span', { className: 'bl-label' }, t('画幅比例 & 分辨率倍率', 'Aspect & Resolution Scale')),
        h(
          'div',
          { className: 'bl-keycap-row', role: 'group', 'aria-label': t('画幅切换', 'Aspect ratio') },
          [
            { id: 'landscape', label: '16:9' },
            { id: 'portrait', label: '9:16' },
            { id: 'square', label: '1:1' },
          ].map(opt =>
            h(
              'button',
              {
                key: opt.id,
                type: 'button',
                className: 'bl-mech-key',
                'aria-pressed': fields.aspect === opt.id,
                disabled: running,
                onClick: () => patchFields({ aspect: opt.id }),
              },
              h('span', { className: 'bl-mech-led', 'aria-hidden': 'true' }),
              opt.label,
            ),
          ),
        ),
        h(
          'div',
          { className: 'bl-scale-row', role: 'group', 'aria-label': t('分辨率倍率', 'Resolution scale') },
          [50, 100, 150, 200].map(sc =>
            h(
              'button',
              {
                key: sc,
                type: 'button',
                className: 'bl-mini-chip',
                'aria-pressed': Number(fields.resolutionScale) === sc,
                disabled: running,
                onClick: () => patchFields({ resolutionScale: sc }),
              },
              sc + '%',
            ),
          ),
        ),
      ),

      h(
        'div',
        { className: 'bl-field' },
        h('span', { className: 'bl-label' }, t('一键渲染预设', 'Quality Preset')),
        h(
          'div',
          {
            className: 'bl-quality-row',
            role: 'group',
            'data-quality-presets': 'true',
            'aria-label': t('一键渲染质量预设', 'One-click quality presets'),
          },
          QUALITY_PRESETS.map(preset => {
            const active =
              fields.engine === preset.patch.engine &&
              Number(fields.samples) === preset.patch.samples &&
              Number(fields.resolutionScale) === preset.patch.resolutionScale;
            return h(
              'button',
              {
                key: preset.id,
                type: 'button',
                className: 'bl-quality-btn',
                'data-quality-preset': preset.id,
                'aria-pressed': active,
                disabled: running,
                onClick: () => patchFields(preset.patch),
              },
              h(
                'span',
                { className: 'bl-quality-title' },
                h('span', { className: 'bl-mech-led', 'aria-hidden': 'true' }),
                lang === 'en' ? preset.en : preset.zh,
              ),
              h('span', { className: 'bl-quality-spec' }, preset.spec),
            );
          }),
        ),
      ),

      h(
        'div',
        { className: 'bl-field' },
        h('span', { className: 'bl-label' }, t('渲染引擎 & 采样数', 'Render Engine & Samples')),
        h(
          'div',
          { className: 'bl-keycap-row', role: 'group', 'aria-label': t('渲染引擎', 'Render engine') },
          ['EEVEE', 'CYCLES', 'WORKBENCH'].map(eng =>
            h(
              'button',
              {
                key: eng,
                type: 'button',
                className: 'bl-mech-key',
                'aria-pressed': fields.engine === eng,
                disabled: running,
                onClick: () =>
                  patchFields({
                    engine: eng,
                    samples: eng === 'CYCLES' ? Math.max(fields.samples, 64) : eng === 'WORKBENCH' ? 16 : 32,
                  }),
              },
              h('span', { className: 'bl-mech-led', 'aria-hidden': 'true' }),
              eng,
            ),
          ),
        ),
        h(
          'div',
          { className: 'bl-slider-row' },
          h('input', {
            type: 'range',
            className: 'bl-tactile-slider',
            min: 4,
            max: 256,
            step: 4,
            disabled: running,
            value: Math.min(256, Math.max(4, Number(fields.samples) || 32)),
            'aria-label': t('渲染采样滑杆', 'Render samples slider'),
            onChange: e => patchFields({ samples: Number(e.target.value) }),
          }),
          h('input', {
            id: controlId + '-samples',
            type: 'number',
            className: 'bl-num-compact',
            min: 4,
            max: 1024,
            step: 1,
            disabled: running,
            value: fields.samples,
            'aria-label': t('采样数', 'Samples'),
            'aria-invalid': !samplesValid ? 'true' : 'false',
            onChange: e => patchFields({ samples: Number(e.target.value) }),
          }),
        ),
      ),

      h(
        'div',
        { className: 'bl-field' },
        h('span', { className: 'bl-label' }, t('相机机位预设', 'Camera Preset')),
        h(
          'div',
          { className: 'bl-pill-grid', role: 'group', 'aria-label': t('相机预设', 'Camera preset') },
          CAMERA_PRESETS.map(cam =>
            h(
              'button',
              {
                key: cam.id,
                type: 'button',
                className: 'bl-tpl-pill',
                'aria-pressed': fields.cameraPreset === cam.id,
                disabled: running,
                onClick: () => patchFields({ cameraPreset: cam.id }),
              },
              lang === 'en' ? cam.en : cam.zh,
            ),
          ),
        ),
      ),

      h(
        'div',
        { className: 'bl-field-grid-2' },
        h(
          'div',
          { className: 'bl-field' },
          h('label', { htmlFor: controlId + '-lighting' }, t('布光预设', 'Lighting')),
          h(
            'select',
            {
              id: controlId + '-lighting',
              value: fields.lightingPreset,
              disabled: running,
              onChange: e => patchFields({ lightingPreset: e.target.value }),
            },
            LIGHTING_PRESETS.map(opt => h('option', { key: opt.id, value: opt.id }, lang === 'en' ? opt.en : opt.zh)),
          ),
        ),
        h(
          'div',
          { className: 'bl-field' },
          h('label', { htmlFor: controlId + '-material' }, t('主材质预设', 'Material')),
          h(
            'select',
            {
              id: controlId + '-material',
              value: fields.materialPreset,
              disabled: running,
              onChange: e => patchFields({ materialPreset: e.target.value }),
            },
            MATERIAL_PRESETS.map(opt => h('option', { key: opt.id, value: opt.id }, lang === 'en' ? opt.en : opt.zh)),
          ),
        ),
      ),

      h(
        'div',
        { className: 'bl-field-grid-2' },
        h(
          'div',
          { className: 'bl-field' },
          h('label', { htmlFor: controlId + '-accent' }, t('主题强调色', 'Accent Color')),
          h(
            'div',
            { className: 'bl-color-row' },
            h('input', {
              type: 'color',
              className: 'bl-color-swatch',
              disabled: running,
              value: colorValid ? fields.accentColor : '#3B82F6',
              'aria-label': t('取色器', 'Color picker'),
              onChange: e => patchFields({ accentColor: e.target.value.toUpperCase() }),
            }),
            h('input', {
              id: controlId + '-accent',
              type: 'text',
              maxLength: 7,
              disabled: running,
              value: fields.accentColor,
              'aria-invalid': !colorValid ? 'true' : 'false',
              autoCorrect: 'off',
              autoCapitalize: 'characters',
              spellCheck: false,
              onChange: e => patchFields({ accentColor: e.target.value.toUpperCase() }),
            }),
          ),
        ),
        h(
          'div',
          { className: 'bl-field bl-switch-wrap' },
          h(W.Switch, {
            label: t('透明背景 (Alpha)', 'Transparent BG'),
            checked: Boolean(fields.transparentBg),
            disabled: running,
            onChange: checked => patchFields({ transparentBg: checked }),
          }),
        ),
      ),

      // Live Lookdev Overrides (Focal Length, Exposure EV, Clay Inspection Override)
      h(
        'div',
        { className: 'bl-lookdev-box', 'data-lookdev-controls': 'true' },
        h(
          'div',
          { className: 'bl-lookdev-head' },
          h('span', { className: 'bl-label' }, t('实时 Lookdev 覆写（焦段 / 曝光 / 白模）', 'Live Lookdev Overrides')),
          h(W.Switch, {
            label: t('白模体检 (Clay)', 'Clay Mode'),
            checked: Boolean(fields.clayMode),
            disabled: running,
            'data-lookdev-clay': 'true',
            onChange: checked => patchFields({ clayMode: checked }),
          }),
        ),
        h(
          'div',
          { className: 'bl-field' },
          h('label', { htmlFor: controlId + '-lens' }, t('镜头焦段 (18–135 mm)', 'Camera Focal Length (18–135 mm)')),
          h(
            'div',
            { className: 'bl-slider-row' },
            h('input', {
              type: 'range',
              className: 'bl-tactile-slider',
              min: 18,
              max: 135,
              step: 1,
              disabled: running,
              value: Math.min(135, Math.max(18, Number(fields.lensMm) || 50)),
              'aria-label': t('镜头焦段滑杆', 'Focal length slider'),
              onChange: e => patchFields({ lensMm: Number(e.target.value) }),
            }),
            h('input', {
              id: controlId + '-lens',
              type: 'number',
              className: 'bl-num-compact',
              'data-lookdev-lens': 'true',
              min: 18,
              max: 135,
              step: 1,
              disabled: running,
              value: fields.lensMm ?? 50,
              'aria-label': t('焦段毫米数', 'Focal length mm'),
              'aria-invalid': !lensValid ? 'true' : 'false',
              onChange: e => patchFields({ lensMm: Number(e.target.value) }),
            }),
          ),
        ),
        h(
          'div',
          { className: 'bl-field' },
          h('label', { htmlFor: controlId + '-exposure' }, t('曝光补偿 (-3 至 +3 EV)', 'Exposure (-3 to +3 EV)')),
          h(
            'div',
            { className: 'bl-slider-row' },
            h('input', {
              type: 'range',
              className: 'bl-tactile-slider',
              min: -3,
              max: 3,
              step: 0.1,
              disabled: running,
              value: Math.min(3, Math.max(-3, Number(fields.exposure) || 0)),
              'aria-label': t('曝光补偿滑杆', 'Exposure slider'),
              onChange: e => patchFields({ exposure: Number(e.target.value) }),
            }),
            h('input', {
              id: controlId + '-exposure',
              type: 'number',
              className: 'bl-num-compact',
              'data-lookdev-exposure': 'true',
              min: -3,
              max: 3,
              step: 0.1,
              disabled: running,
              value: fields.exposure ?? 0,
              'aria-label': t('曝光值 EV', 'Exposure EV'),
              'aria-invalid': !exposureValid ? 'true' : 'false',
              onChange: e => patchFields({ exposure: Number(e.target.value) }),
            }),
          ),
        ),
      ),

      h(
        'div',
        { className: 'bl-field-grid-3' },
        h(
          'div',
          { className: 'bl-field' },
          h('label', { htmlFor: controlId + '-fstart' }, t('起始帧', 'Start')),
          h('input', {
            id: controlId + '-fstart',
            type: 'number',
            min: 1,
            max: 100000,
            disabled: running,
            value: fields.frameStart,
            'aria-invalid': !framesValid ? 'true' : 'false',
            onChange: e => patchFields({ frameStart: Number(e.target.value) }),
          }),
        ),
        h(
          'div',
          { className: 'bl-field' },
          h('label', { htmlFor: controlId + '-fend' }, t('结束帧', 'End')),
          h('input', {
            id: controlId + '-fend',
            type: 'number',
            min: 1,
            max: 100600,
            disabled: running,
            value: fields.frameEnd,
            'aria-invalid': !framesValid ? 'true' : 'false',
            onChange: e => patchFields({ frameEnd: Number(e.target.value) }),
          }),
        ),
        h(
          'div',
          { className: 'bl-field' },
          h('label', { htmlFor: controlId + '-fps' }, 'FPS'),
          h(
            'select',
            {
              id: controlId + '-fps',
              value: fields.fps,
              disabled: running,
              onChange: e => patchFields({ fps: Number(e.target.value) }),
            },
            [24, 30, 60].map(v => h('option', { key: v, value: v }, v + ' fps')),
          ),
        ),
      ),

      project && dirty
        ? h(
            W.Button,
            {
              variant: 'ghost',
              size: 'sm',
              icon: 'close',
              disabled: running,
              onClick: () => {
                syncFields(fieldsOf(project));
                setDirty(false);
                setError('');
              },
            },
            t('放弃未保存修改', 'Discard changes'),
          )
        : null,
    );
  }

  function renderOutlinerTab() {
    return h(
      'div',
      { className: 'bl-outliner-body' },
      h(
        'div',
        { className: 'bl-outliner-head' },
        h('span', { className: 'w-muted' }, sceneSummary ? t('采集于 ', 'Captured ') + new Date(sceneSummary.capturedAt).toLocaleTimeString() : t('尚未采集真实场景树', 'No scene snapshot yet')),
        h(
          W.Button,
          {
            size: 'sm',
            variant: 'primary',
            icon: 'eye',
            disabled: !project || running || dirty || !environment?.ready,
            onClick: () => startJob('inspect_scene'),
          },
          t('检查场景', 'Inspect Scene'),
        ),
      ),
      sceneSummary
        ? h(
            React.Fragment,
            null,
            renderQcReportCard(sceneSummary.qc, t),
            h(
              'div',
              { className: 'bl-stat-grid' },
              [
                { k: t('对象', 'Objects'), v: sceneSummary.objectCount },
                { k: t('网格', 'Meshes'), v: sceneSummary.meshCount },
                { k: t('灯光', 'Lights'), v: sceneSummary.lightCount },
                { k: t('相机', 'Cameras'), v: sceneSummary.cameraCount },
                { k: t('总面数', 'Polys'), v: sceneSummary.totalPolygons },
              ].map((s, idx) =>
                h(
                  'div',
                  { key: idx, className: 'bl-stat-box' },
                  h('span', { className: 'bl-stat-val' }, s.v ?? 0),
                  h('span', { className: 'bl-stat-lbl' }, s.k),
                ),
              ),
            ),
            sceneSummary.activeCamera
              ? h('p', { className: 'w-muted bl-outliner-meta' }, t('当前主相机：', 'Active camera: ') + sceneSummary.activeCamera + ' · Blender ' + (sceneSummary.blenderVersion || ''))
              : null,
            Array.isArray(sceneSummary.materials) && sceneSummary.materials.length > 0
              ? h(
                  'div',
                  { className: 'bl-tag-wrap' },
                  sceneSummary.materials.map((m, i) => h('span', { key: i, className: 'w-tag' }, m)),
                )
              : null,
            h(
              'ul',
              { className: 'bl-object-list' },
              (sceneSummary.objects || []).map((obj, idx) =>
                h(
                  'li',
                  { key: obj.name + '-' + idx, className: 'bl-object-row' },
                  h('span', { className: 'bl-obj-type' }, obj.type),
                  h('strong', { className: 'bl-obj-name' }, obj.name),
                  Array.isArray(obj.location)
                    ? h(
                        'span',
                        { className: 'bl-obj-loc' },
                        '[' + obj.location.map(n => Number(n).toFixed(1)).join(', ') + ']',
                      )
                    : null,
                  obj.polygons !== undefined ? h('span', { className: 'bl-obj-poly' }, obj.polygons + 'p') : null,
                ),
              ),
            ),
          )
        : h(
            W.Empty,
            { title: t('尚未检查场景对象', 'Scene not inspected yet'), icon: 'eye' },
            t('点击上方「检查场景」，通过无头 Blender 解析所有网格、灯光、相机与多边形数量。', 'Click Inspect Scene above to extract real meshes, lights, cameras, and polygon counts.'),
          ),
    );
  }

  function insertKitSnippet(snippet) {
    if (!snippet || running) return;
    const current = String(fields.customScript || '');
    const ta = scriptAreaRef.current;
    let nextCode = '';
    if (ta && typeof ta.selectionStart === 'number' && typeof ta.selectionEnd === 'number' && ta.selectionStart !== current.length) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const before = current.slice(0, start);
      const after = current.slice(end);
      const prefix = before && !before.endsWith('\n') ? '\n' : '';
      const suffix = after && !after.startsWith('\n') ? '\n' : '';
      nextCode = before + prefix + snippet.code + suffix + after;
    } else {
      nextCode = current.trim() ? current.replace(/\s*$/, '') + '\n' + snippet.code + '\n' : snippet.code + '\n';
    }
    patchFields({ customScript: nextCode, scriptMode: 'custom' });
    setNotice(t('已插入 DSH_KIT 代码片段：', 'Inserted DSH_KIT snippet: ') + (lang === 'en' ? snippet.en : snippet.zh));
  }

  function renderScriptTab() {
    const checkpoints = Array.isArray(project?.checkpoints) ? project.checkpoints : [];
    return h(
      'div',
      { className: 'bl-script-body' },
      h(
        'div',
        { className: 'bl-script-mode-row', role: 'group', 'aria-label': t('脚本驱动模式', 'Script mode') },
        h(
          'button',
          {
            type: 'button',
            className: 'bl-mech-key',
            'aria-pressed': fields.scriptMode === 'template',
            disabled: running,
            onClick: () => patchFields({ scriptMode: 'template' }),
          },
          h('span', { className: 'bl-mech-led', 'aria-hidden': 'true' }),
          t('模板自动生成', 'Template'),
        ),
        h(
          'button',
          {
            type: 'button',
            className: 'bl-mech-key',
            'aria-pressed': fields.scriptMode === 'custom',
            disabled: running,
            onClick: () => patchFields({ scriptMode: 'custom' }),
          },
          h('span', { className: 'bl-mech-led', 'aria-hidden': 'true' }),
          t('自定义 bpy 脚本', 'Custom bpy'),
        ),
      ),

      h(
        'div',
        { className: 'bl-script-toolbar' },
        h(
          W.Button,
          {
            size: 'sm',
            icon: 'code',
            disabled: !project || loadingScript,
            onClick: fetchGeneratedScript,
          },
          loadingScript ? t('拉取中…', 'Loading…') : t('查看模板生成脚本', 'View generated script'),
        ),
        generatedPreview
          ? h(
              W.Button,
              {
                size: 'sm',
                variant: 'ghost',
                icon: 'copy',
                disabled: running,
                onClick: () => {
                  patchFields({ scriptMode: 'custom', customScript: generatedPreview });
                  setNotice(t('已载入至自定义 bpy 编辑区。', 'Copied generated script to custom editor.'));
                },
              },
              t('复制为自定义脚本', 'Clone to custom'),
            )
          : null,
      ),

      generatedPreview && fields.scriptMode === 'template'
        ? h('pre', { className: 'bl-script-readonly' }, generatedPreview)
        : null,

      h(
        'div',
        { className: 'bl-kit-bar', 'data-dsh-kit-bar': 'true' },
        h('span', { className: 'bl-kit-label' }, t('DSH_KIT 快捷插入', 'DSH_KIT Quick-Insert')),
        h(
          'div',
          { className: 'bl-kit-chips', role: 'group', 'aria-label': t('DSH_KIT 快捷代码片段', 'DSH_KIT quick-insert snippets') },
          DSH_KIT_SNIPPETS.map(sn =>
            h(
              'button',
              {
                key: sn.id,
                type: 'button',
                className: 'bl-kit-chip',
                'data-kit-snippet': sn.id,
                disabled: running,
                title: sn.code,
                onClick: () => insertKitSnippet(sn),
              },
              '+ ' + (lang === 'en' ? sn.en : sn.zh),
            ),
          ),
        ),
      ),

      h(
        'div',
        { className: 'bl-field' },
        h(
          'div',
          { className: 'bl-script-head-meta' },
          h('label', { htmlFor: controlId + '-custom-script' }, t('自定义 bpy Python 脚本', 'Custom bpy Python script')),
          h('span', { className: 'w-muted' }, formatBytes(scriptBytes) + ' / 256 KB'),
        ),
        h('textarea', {
          ref: scriptAreaRef,
          id: controlId + '-custom-script',
          className: 'bl-code-editor',
          rows: 11,
          disabled: running,
          spellCheck: false,
          autoCorrect: 'off',
          autoCapitalize: 'none',
          'aria-invalid': !scriptValid ? 'true' : 'false',
          placeholder: t('# 在此编写 Blender bpy 建模/材质脚本…\nimport bpy\nbpy.ops.mesh.primitive_monkey_add(location=(0, 0, 1.2))', '# Write Blender bpy scene script here…\nimport bpy\nbpy.ops.mesh.primitive_monkey_add(location=(0, 0, 1.2))'),
          value: fields.customScript,
          onChange: e => patchFields({ customScript: e.target.value, scriptMode: 'custom' }),
        }),
      ),

      quickWarnings.length > 0
        ? h(
            W.Status,
            { tone: 'warn' },
            t('静态安全提醒：检测到潜在高危调用 ', 'Safety alert: detected restricted calls ') + '(' + quickWarnings.join(', ') + ').',
          )
        : null,

      h(
        'div',
        { className: 'bl-script-run-row' },
        h(W.Checkbox, {
          checked: allowUnsafe,
          disabled: running,
          label: t('显式放行高危系统调用 (allowUnsafe)', 'Allow restricted calls (allowUnsafe)'),
          onChange: setAllowUnsafe,
        }),
        h(
          W.Button,
          {
            variant: 'primary',
            size: 'sm',
            icon: 'terminal',
            disabled: !project || running || !environment?.ready || !scriptValid,
            onClick: () =>
              startJob('run_script', {
                code: fields.scriptMode === 'custom' && fields.customScript.trim() ? fields.customScript : undefined,
                allowUnsafe,
              }),
          },
          t('安全检查并执行脚本', 'Validate & Run Script'),
        ),
      ),

      h(
        'div',
        { className: 'bl-cp-card', 'data-checkpoints': 'true' },
        h(
          'div',
          { className: 'bl-cp-head' },
          h('strong', null, t('版本快照 (Checkpoints)', 'Script Checkpoints')),
          h('span', { className: 'w-muted bl-cp-count' }, checkpoints.length + ' / 10'),
        ),
        h(
          'div',
          { className: 'bl-cp-save-row' },
          h('input', {
            type: 'text',
            className: 'bl-cp-note',
            maxLength: 120,
            disabled: !project || running,
            value: checkpointNote,
            placeholder: t('快照备注（可选，如：精修车漆与倒角）', 'Optional note (e.g. beveled canopy & paint)'),
            'aria-label': t('版本快照备注', 'Checkpoint note'),
            onChange: e => setCheckpointNote(e.target.value),
          }),
          h(
            W.Button,
            {
              size: 'sm',
              icon: 'bookmark',
              'data-action': 'save-checkpoint',
              disabled: !project || running,
              onClick: async () => {
                if (typeof onSaveCheckpoint !== 'function') return;
                const saved = await onSaveCheckpoint(checkpointNote);
                if (saved) setCheckpointNote('');
              },
            },
            t('保存快照', 'Save Snapshot'),
          ),
        ),
        checkpoints.length > 0
          ? h(
              'ul',
              { className: 'bl-cp-list' },
              checkpoints.slice().reverse().map(cp =>
                h(
                  'li',
                  { key: cp.id, className: 'bl-cp-item', 'data-checkpoint-id': cp.id },
                  h(
                    'div',
                    { className: 'bl-cp-meta' },
                    h(
                      'div',
                      { className: 'bl-cp-top' },
                      h('span', { className: 'bl-cp-rev' }, 'r' + (cp.revision ?? 0)),
                      cp.qcScore !== undefined && cp.qcScore !== null
                        ? h(
                            'span',
                            {
                              className: 'bl-cp-qc',
                              'data-qc-tone': cp.qcScore >= 85 ? 'good' : cp.qcScore >= 65 ? 'warn' : 'bad',
                            },
                            'QC-3D ' + cp.qcScore,
                          )
                        : null,
                      h('span', { className: 'bl-cp-time' }, cp.created ? new Date(cp.created).toLocaleTimeString() : ''),
                      h('span', { className: 'bl-cp-size' }, formatBytes(cp.scriptLength || 0)),
                    ),
                    cp.note ? h('span', { className: 'bl-cp-desc' }, cp.note) : null,
                  ),
                  h(
                    W.Button,
                    {
                      size: 'sm',
                      variant: 'ghost',
                      icon: 'rotate',
                      'data-action': 'restore-checkpoint',
                      'data-checkpoint-id': cp.id,
                      disabled: running,
                      onClick: () => typeof onRestoreCheckpoint === 'function' && onRestoreCheckpoint(cp.id),
                    },
                    t('恢复', 'Restore'),
                  ),
                ),
              ),
            )
          : h(
              'p',
              { className: 'w-muted bl-cp-empty' },
              t('暂无快照。修改脚本保存时自动留档，也可随时点击「保存快照」手动打点。', 'No checkpoints yet. Edits auto-snapshot on save, or click Save Snapshot anytime.'),
            ),
      ),
    );
  }

  function renderInspectorCard() {
    return h(
      'aside',
      {
        className: 'bl-inspector-card',
        'data-tour': 'blender-inspector',
        'data-dsh-card': '',
        'aria-label': t('3D 参数与检视面板', '3D Inspector panel'),
      },
      h(
        'div',
        { className: 'bl-inspector-tabs', role: 'tablist', 'aria-label': t('检视器切换', 'Inspector tabs') },
        [
          { id: 'params', icon: 'sliders', label: t('参数', 'Params') },
          { id: 'outliner', icon: 'eye', label: t('大纲', 'Outliner') },
          { id: 'script', icon: 'code', label: t('bpy 脚本', 'Script') },
        ].map(tab =>
          h(
            'button',
            {
              key: tab.id,
              type: 'button',
              role: 'tab',
              className: 'bl-inspector-tab',
              'aria-selected': inspectorTab === tab.id,
              onClick: () => setInspectorTab(tab.id),
            },
            h(W.Icon, { name: tab.icon, size: 13 }),
            h('span', null, tab.label),
          ),
        ),
      ),
      h(
        'div',
        { className: 'bl-inspector-content', role: 'tabpanel' },
        inspectorTab === 'outliner'
          ? renderOutlinerTab()
          : inspectorTab === 'script'
          ? renderScriptTab()
          : renderParamsFields(true),
      ),
    );
  }

  return h(
    'div',
    { ref: studioRootRef, className: 'bl-studio-root', 'data-editor-mode': editorMode },
    // Top OP-DSH Console Strip
    h(
      'div',
      { className: 'bl-console-bar' },
      h(
        'div',
        { className: 'bl-console-id' },
        h('span', { className: 'bl-console-chip' }, 'OP-DSH · BLENDER'),
        h(
          'span',
          {
            className: 'bl-exec-chip',
            'data-status': bridgeConnected ? 'bridge' : environment?.ready ? 'cli' : 'missing',
            onClick: () => setEditorTab('bridge-env'),
            role: 'button',
            tabIndex: 0,
            onKeyDown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setEditorTab('bridge-env'); } },
          },
          h('span', { className: 'bl-exec-dot', 'aria-hidden': 'true' }),
          bridgeConnected
            ? t('Live Bridge 已连接', 'Live Bridge Online')
            : environment?.ready
            ? t('CLI 离线渲染', 'Headless CLI Ready')
            : t('未配置 Blender', 'Blender Not Found'),
        ),
        activeBlender
          ? h(
              'span',
              { className: 'w-tag bl-ver-badge' },
              'v' +
                activeBlender.version +
                ' · ' +
                (activeBlender.major >= 5
                  ? 'EEVEE (5.x)'
                  : activeBlender.eeveeEngine === 'BLENDER_EEVEE_NEXT'
                  ? 'EEVEE Next'
                  : 'EEVEE'),
            )
          : null,
      ),
      h(
        'div',
        { className: 'bl-mode-switch', 'data-tour': 'blender-mode', role: 'group', 'aria-label': t('工作室与表单模式切换', 'Studio / Form switch') },
        h(
          'button',
          {
            type: 'button',
            className: 'bl-mode-btn',
            'data-studio-mode': 'studio',
            'aria-pressed': editorMode === 'studio',
            onClick: () => setEditorMode('studio'),
          },
          t('3D 工作室', 'Studio'),
        ),
        h(
          'button',
          {
            type: 'button',
            className: 'bl-mode-btn',
            'data-studio-mode': 'form',
            'aria-pressed': editorMode === 'form',
            onClick: () => setEditorMode('form'),
          },
          t('表单', 'Form'),
        ),
      ),
    ),

    editorMode === 'studio'
      ? h('div', { className: 'bl-studio-grid', 'data-studio-console': 'true' }, renderStageCard(), renderInspectorCard())
      : h(
          'div',
          { className: 'bl-form-split dsh-split-pane', style: formSplit.paneStyle },
          h(
            'section',
            { className: 'bl-form-pane dsh-split-leading', 'data-dsh-card': '' },
            h('h3', { 'data-dsh-serif': '' }, t('3D 场景参数表单', '3D Scene Form')),
            renderParamsFields(false),
            h('hr', { className: 'bl-form-divider' }),
            h('h3', { 'data-dsh-serif': '' }, t('bpy 脚本与大纲', 'bpy Script & Outliner')),
            renderScriptTab(),
          ),
          h(W.SplitResizer, { ...formSplit.resizerProps, label: t('调整表单与预览宽度', 'Resize form and stage panes') }),
          h('div', { className: 'bl-form-stage dsh-split-trailing' }, renderStageCard(), h('div', { className: 'bl-form-outliner', 'data-dsh-card': '' }, h('h3', { 'data-dsh-serif': '' }, t('场景大纲', 'Scene Outliner')), renderOutlinerTab())),
        ),
  );
}

const BLENDER_STUDIO_CSS = `
.bl-studio-root{display:flex;flex-direction:column;gap:10px;min-width:0;padding-bottom:16px}
.bl-console-bar{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:2px 0}
.bl-console-id{display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}
.bl-console-chip{display:inline-flex;align-items:center;padding:2px 9px;border-radius:999px;border:var(--dsh-control-border-width,1px) solid var(--w-border);background:var(--w-bg);font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:11px;font-weight:700;letter-spacing:0.05em;color:var(--w-text)}
.bl-exec-chip{display:inline-flex;align-items:center;gap:6px;padding:2px 9px;border-radius:999px;border:var(--dsh-control-border-width,1px) solid var(--w-border);background:var(--dsw-alias-settings-card-fill,var(--w-canvas));font-size:11.5px;font-weight:600;color:var(--w-text);cursor:pointer}
.bl-exec-dot{width:7px;height:7px;border-radius:50%;flex:none;background:#94a3b8}
.bl-exec-chip[data-status="bridge"] .bl-exec-dot{background:#10b981;box-shadow:0 0 6px rgba(16,185,129,0.75)}
.bl-exec-chip[data-status="cli"] .bl-exec-dot{background:#3b82f6;box-shadow:0 0 5px rgba(59,130,246,0.55)}
.bl-exec-chip[data-status="missing"] .bl-exec-dot{background:#f59e0b}
.bl-ver-badge{font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:11px}
.bl-mode-switch{display:inline-flex;align-items:center;gap:3px;padding:3px;border-radius:var(--dsw-radius-md,10px);border:var(--dsh-control-border-width,1px) solid var(--w-border);background:var(--w-bg)}
.bl-mode-btn{border:0;border-radius:var(--dsw-radius-sm,7px);padding:4px 12px;font:inherit;font-size:12px;font-weight:600;background:transparent;color:var(--w-muted);cursor:pointer}
.bl-mode-btn[aria-pressed="true"]{background:var(--w-canvas);color:var(--w-text);box-shadow:0 1px 3px rgba(15,23,42,0.12)}

.bl-studio-grid{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(300px,375px);gap:12px;align-items:start;min-width:0}
.bl-stage-monitor{display:flex;flex-direction:column;gap:10px;padding:12px 14px;border-radius:var(--dsw-radius-lg,14px);background:#1f242d;color:#eef2f7;border:1px solid #343b49;box-shadow:inset 0 1px 0 rgba(255,255,255,0.06),0 8px 24px rgba(15,23,42,0.14);min-width:0}
.bl-stage-hud{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;min-width:0}
.bl-stage-meta-group{display:inline-flex;align-items:center;gap:7px;flex-wrap:wrap;min-width:0}
.bl-stage-dot{width:8px;height:8px;border-radius:50%;background:#64748b;flex:none}
.bl-stage-dot[data-live="true"]{background:#e85d2a;box-shadow:0 0 8px rgba(232,93,42,0.8)}
.bl-stage-readout{font-family:var(--dsh-font-mono,ui-monospace,monospace);font-variant-numeric:tabular-nums;font-size:11.5px;color:#cbd5e1}
.bl-stale-pill{padding:1px 7px;border-radius:999px;background:rgba(245,158,11,0.2);border:1px solid rgba(251,191,36,0.45);color:#fde68a;font-size:10.5px;font-weight:600}
.bl-stage-view-tabs{display:inline-flex;gap:4px;flex-wrap:wrap}
.bl-stage-view-btn{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;font:inherit;font-size:11.5px;font-weight:600;border-radius:6px;background:#2a313e;border:1px solid #3f4859;color:#cbd5e1;cursor:pointer}
.bl-stage-view-btn[aria-selected="true"]{background:#e85d2a;border-color:#e85d2a;color:#ffffff}
.bl-artifact-dot{width:6px;height:6px;border-radius:50%;background:#4ade80;display:inline-block}
.bl-stage-view-btn[aria-selected="true"] .bl-artifact-dot{background:#ffffff}

.bl-stage-bezel{display:flex;align-items:center;justify-content:center;padding:12px;border-radius:10px;background:#232833;border:1px solid #363e4d;min-height:410px;min-width:0;overflow:clip}
.bl-canvas-frame{position:relative;width:100%;max-width:760px;max-height:430px;margin:0 auto;border-radius:8px;overflow:clip;border:1px solid rgba(255,255,255,0.10);box-shadow:0 8px 22px rgba(15,23,42,0.32)}
.bl-canvas-frame[data-aspect="portrait"]{width:auto;height:400px;max-width:236px}
.bl-canvas-frame[data-aspect="square"]{width:auto;height:390px;max-width:390px}
.bl-stage-canvas{display:block;width:100%;height:100%;cursor:grab;touch-action:none;user-select:none}
.bl-stage-canvas:active{cursor:grabbing}

.bl-artifact-viewer{display:flex;flex-direction:column;align-items:center;gap:8px;width:100%}
.bl-artifact-viewer img,.bl-artifact-viewer video{max-width:100%;max-height:420px;border-radius:8px;object-fit:contain;background:#1b2029}
.bl-artifact-caption{width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px;font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:11px;color:#94a3b8;flex-wrap:wrap}
.dbw .bl-stage-dl-link{display:inline-flex;align-items:center;gap:4px;color:#ffb092;text-decoration:none;font-weight:600}
.dbw .bl-stage-dl-link:hover{color:#ffd2bf;text-decoration:underline}
.bl-artifact-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:32px 18px;text-align:center;color:#94a3b8;font-size:13px}
.bl-artifact-empty p{margin:0;max-width:42ch}
.bl-mesh-viewer{display:flex;flex-direction:column;gap:8px;width:100%}
.bl-mesh-bar{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;padding:6px 8px;border-radius:8px;background:#272d38;border:1px solid #353e4e}
.bl-mesh-shading{display:inline-flex;align-items:center;gap:4px;flex-wrap:wrap}
.bl-mesh-meta{display:inline-flex;align-items:center;gap:10px;flex-wrap:wrap;font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:11px;color:#cbd5e1}
.bl-glb-src-select{width:auto!important;max-width:200px;padding:3px 7px!important;font-size:11px!important;background:#303746!important;border-color:#414b5e!important;color:#eef2f7!important}
.bl-shot-filmstrip{display:flex;flex-direction:column;gap:6px;padding:8px 10px;border-radius:8px;background:#262c38;border:1px solid #364053}
.bl-filmstrip-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.bl-filmstrip-title{font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:11px;font-weight:700;color:#cbd5e1}
.bl-filmstrip-rail{display:grid;grid-template-columns:repeat(auto-fill,minmax(126px,1fr));gap:8px}
.bl-shot-thumb{display:flex;flex-direction:column;gap:4px;padding:4px;border-radius:7px;border:1px solid #3d475c;background:#1e232d;color:#e2e8f0;font:inherit;cursor:pointer;text-align:left;overflow:hidden}
.bl-shot-thumb:hover{border-color:#64748b}
.bl-shot-thumb[aria-pressed="true"]{border-color:#e85d2a;box-shadow:0 0 0 1px #e85d2a;background:#2a2526}
.bl-shot-thumb img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:4px;background:#161a22}
.bl-shot-label{font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:10px;font-weight:600;color:#cbd5e1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 2px}
.bl-lookdev-box{display:flex;flex-direction:column;gap:8px;padding:9px 10px;border-radius:var(--dsw-radius-sm,9px);background:var(--w-bg);border:var(--dsh-control-border-width,1px) solid var(--w-border)}
.bl-lookdev-head{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.bl-compare-root{display:flex;flex-direction:column;gap:8px;width:100%}
.bl-compare-pickers{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.bl-compare-picker{display:flex;align-items:center;gap:6px;margin:0;min-width:0}
.bl-compare-picker select{flex:1;min-width:0;padding:4px 8px!important;font-size:11.5px!important;background:#2a313e!important;border-color:#414b5e!important;color:#eef2f7!important}
.bl-compare-side-tag{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:5px;background:#e85d2a;color:#fff;font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:11px;font-weight:750;flex:none}
.bl-compare-side-b{background:#4176e6}
.bl-compare-stage{position:relative;width:100%;max-height:400px;aspect-ratio:16/9;margin:0 auto;border-radius:8px;overflow:hidden;background:#1b2029;border:1px solid rgba(255,255,255,0.10);user-select:none;touch-action:none}
.bl-compare-img{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none}
.bl-compare-overlay-a{position:absolute;inset:0;pointer-events:none}
.bl-compare-badge{position:absolute;top:8px;padding:2px 7px;border-radius:5px;background:rgba(15,23,42,0.74);border:1px solid rgba(255,255,255,0.16);color:#f8fafc;font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:10.5px;pointer-events:none;z-index:2}
.bl-compare-badge-a{left:8px}
.bl-compare-badge-b{right:8px}
.bl-compare-divider{position:absolute;top:0;bottom:0;width:2px;background:#ffffff;box-shadow:0 0 8px rgba(15,23,42,0.8);cursor:ew-resize;transform:translateX(-1px);z-index:3}
.bl-compare-divider:focus-visible{outline:2px solid #e85d2a;outline-offset:2px}
.bl-compare-knob{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#e85d2a;border:2px solid #ffffff;color:#ffffff;font-size:11px;font-weight:700;box-shadow:0 2px 8px rgba(15,23,42,0.45)}

.bl-orbit-deck{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:6px 8px;border-radius:8px;background:#272d38;border:1px solid #353e4e}
.bl-orbit-controls{display:inline-flex;align-items:center;gap:5px;flex-wrap:wrap}
.bl-turntable-btn{padding:4px 11px;border-radius:6px;border:1px solid #d65020;background:#e85d2a;color:#fff;font:inherit;font-size:11.5px;font-weight:700;cursor:pointer}
.bl-turntable-btn[data-playing="true"]{background:#c9491b}
.bl-cam-mini-btn{padding:3px 9px;border-radius:6px;border:1px solid #414b5e;background:#303746;color:#e2e8f0;font:inherit;font-size:11.5px;font-weight:600;cursor:pointer}
.bl-cam-mini-btn[aria-pressed="true"]{background:#4176e6;border-color:#5b8def;color:#fff}
.bl-frame-scrubber{display:inline-flex;align-items:center;gap:8px;flex:1 1 160px;min-width:140px;max-width:260px}
.bl-frame-readout{font-family:var(--dsh-font-mono,ui-monospace,monospace);font-variant-numeric:tabular-nums;font-size:11px;color:#cbd5e1;white-space:nowrap}
.bl-frame-scrubber input[type="range"]{flex:1;min-width:0;accent-color:#e85d2a;cursor:pointer}
.bl-stage-actions{display:flex;flex-wrap:wrap;gap:6px;padding-top:4px;border-top:1px solid #313847}
.bl-stage-actions .w-button{background:#2a313e;border-color:#424c60;color:#eef2f7}
.bl-stage-actions .w-button.w-primary{background:#e85d2a;border-color:#d65020;color:#ffffff}
.bl-pipeline-bar{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;padding:7px 9px;border-radius:8px;background:#262d3a;border:1px solid #384255}
.bl-pipeline-left{display:flex;align-items:center;gap:7px;flex-wrap:wrap;min-width:0}
.bl-pipeline-tag{font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:10px;font-weight:750;letter-spacing:0.06em;padding:2px 6px;border-radius:5px;background:rgba(232,93,42,0.18);border:1px solid rgba(232,93,42,0.45);color:#ffb092}
.bl-pipeline-tiers{display:inline-flex;align-items:center;gap:4px;flex-wrap:wrap}
.bl-tier-chip{padding:3px 8px;border-radius:6px;border:1px solid #414b5e;background:#2e3645;color:#cbd5e1;font:inherit;font-size:11px;font-weight:600;cursor:pointer}
.bl-tier-chip[aria-pressed="true"]{background:#4176e6;border-color:#5b8def;color:#ffffff}
.bl-pipeline-bar .w-button.w-primary{background:#059669;border-color:#047857;color:#ffffff}
.bl-shortcut-bar{display:flex;flex-wrap:wrap;align-items:center;gap:5px 8px;padding-top:2px;font-size:11px;color:#94a3b8}
.bl-kbd-item{display:inline-flex;align-items:center;gap:4px;white-space:nowrap}
.bl-shortcut-bar kbd{display:inline-block;padding:1px 5px;border-radius:4px;background:#2a313e;border:1px solid #414b5e;color:#e2e8f0;font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:10px;font-weight:700;line-height:1.35}
.bl-kbd-sep{color:#556277}

.bl-inspector-card{display:flex;flex-direction:column;border:var(--dsh-control-border-width,1px) solid var(--w-border);border-radius:var(--dsw-radius-lg,14px);background:var(--dsw-alias-settings-card-fill,var(--w-canvas));overflow:clip;min-width:0}
.bl-inspector-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;padding:6px;background:var(--w-bg);border-bottom:var(--dsh-control-border-width,1px) solid var(--w-border)}
.bl-inspector-tab{display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:6px 8px;border:0;border-radius:var(--dsw-radius-sm,8px);background:transparent;color:var(--w-muted);font:inherit;font-size:12px;font-weight:600;cursor:pointer;position:relative}
.bl-inspector-tab[aria-selected="true"]{background:var(--w-canvas);color:var(--w-text);box-shadow:0 1px 3px rgba(15,23,42,0.08)}
.bl-inspector-tab[aria-selected="true"]::after{content:"";position:absolute;inset:auto 16% 0;border-block-end:2.5px solid var(--w-accent)}
.bl-inspector-content{padding:12px 14px 18px;display:flex;flex-direction:column;gap:10px;max-height:704px;overflow-y:auto;overscroll-behavior:contain;min-width:0}

.bl-params-body{display:flex;flex-direction:column;gap:10px;min-width:0}
.bl-field{display:flex;flex-direction:column;gap:5px;min-width:0}
.bl-field label,.bl-label{margin:0;font-size:11.5px;font-weight:600;color:var(--w-muted)}
.bl-field-error{font-size:11.5px;color:var(--dsw-alias-state-error-primary,#c83240)}
.bl-pill-grid{display:flex;flex-wrap:wrap;gap:5px}
.bl-tpl-pill{padding:4px 9px;font:inherit;font-size:11.5px;font-weight:600;border-radius:999px;background:var(--w-bg);border:var(--dsh-control-border-width,1px) solid var(--w-border);color:var(--w-text);cursor:pointer}
.bl-tpl-pill[aria-pressed="true"]{background:var(--w-primary);border-color:var(--w-primary);color:var(--w-on-primary)}
.bl-keycap-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.bl-mech-key{display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:6px 8px;font:inherit;font-size:11.5px;font-weight:650;border-radius:var(--dsw-radius-sm,8px);background:var(--w-bg);border:var(--dsh-control-border-width,1px) solid var(--w-border);color:var(--w-text);cursor:pointer;box-shadow:0 2px 0 var(--w-border)}
.bl-mech-key[aria-pressed="true"]{background:var(--w-selected);border-color:var(--w-accent);color:var(--w-accent);box-shadow:inset 0 1px 2px rgba(15,23,42,0.1)}
.bl-mech-led{width:6px;height:6px;border-radius:50%;background:var(--w-border);flex:none}
.bl-mech-key[aria-pressed="true"] .bl-mech-led,.bl-quality-btn[aria-pressed="true"] .bl-mech-led{background:#e85d2a;box-shadow:0 0 5px rgba(232,93,42,0.75)}
.bl-quality-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.bl-quality-btn{display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:6px 8px;border-radius:var(--dsw-radius-sm,8px);border:var(--dsh-control-border-width,1px) solid var(--w-border);background:var(--w-bg);color:var(--w-text);font:inherit;cursor:pointer;text-align:left;box-shadow:0 2px 0 var(--w-border)}
.bl-quality-btn:hover:not(:disabled){border-color:var(--w-accent)}
.bl-quality-btn[aria-pressed="true"]{background:var(--w-selected);border-color:var(--w-accent);color:var(--w-accent);box-shadow:inset 0 1px 2px rgba(15,23,42,0.1)}
.bl-quality-title{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;line-height:1.25;white-space:nowrap}
.bl-quality-spec{font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:9.5px;color:var(--w-muted);line-height:1.2;white-space:nowrap}
.bl-quality-btn[aria-pressed="true"] .bl-quality-spec{color:var(--w-accent);opacity:0.88}
.bl-scale-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;margin-top:4px}
.bl-mini-chip{padding:3px 6px;border-radius:6px;border:var(--dsh-control-border-width,1px) solid var(--w-border);background:var(--w-bg);color:var(--w-muted);font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:11px;font-weight:600;cursor:pointer}
.bl-mini-chip[aria-pressed="true"]{border-color:var(--w-accent);color:var(--w-accent);background:var(--w-selected)}
.bl-slider-row{display:flex;align-items:center;gap:8px}
.bl-tactile-slider{flex:1;min-width:0;accent-color:var(--w-accent);cursor:pointer}
.bl-num-compact{width:76px!important;flex:none;text-align:right;font-family:var(--dsh-font-mono,ui-monospace,monospace)}
.bl-field-grid-2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;align-items:end}
.bl-field-grid-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.bl-color-row{display:flex;align-items:center;gap:6px}
.bl-color-swatch{width:34px;height:34px;padding:2px;border:var(--dsh-control-border-width,1px) solid var(--w-border);border-radius:var(--dsw-radius-sm,8px);background:var(--w-bg);cursor:pointer;flex:none}
.bl-switch-wrap{justify-content:center;padding-bottom:4px}

.bl-outliner-body,.bl-script-body{display:flex;flex-direction:column;gap:10px;min-width:0}
.bl-outliner-head,.bl-script-head-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.bl-qc-card{display:flex;flex-direction:column;gap:7px;padding:9px 11px;border-radius:var(--dsw-radius-md,10px);border:1px solid var(--w-border);background:var(--w-bg)}
.bl-qc-card[data-qc-tone="good"]{border-color:color-mix(in oklab,#10b981 42%,var(--w-border));background:color-mix(in oklab,#10b981 7%,var(--w-bg))}
.bl-qc-card[data-qc-tone="warn"]{border-color:color-mix(in oklab,#f59e0b 45%,var(--w-border));background:color-mix(in oklab,#f59e0b 8%,var(--w-bg))}
.bl-qc-card[data-qc-tone="bad"]{border-color:color-mix(in oklab,#e11d48 45%,var(--w-border));background:color-mix(in oklab,#e11d48 8%,var(--w-bg))}
.bl-qc-head{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.bl-qc-badge{display:inline-flex;align-items:center;padding:2px 9px;border-radius:999px;font-family:var(--dsh-font-mono,ui-monospace,monospace);font-variant-numeric:tabular-nums;font-size:11px;font-weight:750;letter-spacing:0.02em}
.bl-qc-badge[data-qc-tone="good"]{background:#059669;color:#ffffff}
.bl-qc-badge[data-qc-tone="warn"]{background:#d97706;color:#ffffff}
.bl-qc-badge[data-qc-tone="bad"]{background:#e11d48;color:#ffffff}
.bl-qc-summary{font-size:11.5px;font-weight:600;color:var(--w-text)}
.bl-qc-issues{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:5px}
.bl-qc-issue{display:flex;align-items:flex-start;gap:7px;padding:5px 7px;border-radius:7px;background:var(--w-canvas);border:var(--dsh-control-border-width,1px) solid var(--w-border);font-size:11.5px}
.bl-qc-sev{flex:none;padding:1px 5px;border-radius:4px;font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:9.5px;font-weight:750}
.bl-qc-issue[data-severity="error"] .bl-qc-sev{background:color-mix(in oklab,#e11d48 18%,transparent);color:#be123c}
.bl-qc-issue[data-severity="warn"] .bl-qc-sev{background:color-mix(in oklab,#f59e0b 20%,transparent);color:#b45309}
.bl-qc-issue[data-severity="info"] .bl-qc-sev{background:color-mix(in oklab,#3b82f6 16%,transparent);color:#1d4ed8}
[data-theme="dark"] .bl-qc-issue[data-severity="error"] .bl-qc-sev{color:#fda4af}
[data-theme="dark"] .bl-qc-issue[data-severity="warn"] .bl-qc-sev{color:#fcd34d}
[data-theme="dark"] .bl-qc-issue[data-severity="info"] .bl-qc-sev{color:#93c5fd}
.bl-qc-issue-body{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
.bl-qc-issue-meta{display:flex;align-items:center;gap:5px;flex-wrap:wrap}
.bl-qc-code{font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:10px;color:var(--w-muted)}
.bl-qc-obj{font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:10px;padding:0 5px;border-radius:4px;background:var(--w-selected);color:var(--w-accent)}
.bl-qc-msg{color:var(--w-text);line-height:1.4}
.bl-stat-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px}
.bl-stat-box{display:flex;flex-direction:column;align-items:center;padding:6px 4px;border-radius:8px;background:var(--w-bg);border:var(--dsh-control-border-width,1px) solid var(--w-border)}
.bl-stat-val{font-family:var(--dsh-font-mono,ui-monospace,monospace);font-weight:700;font-size:13px}
.bl-stat-lbl{font-size:10px;color:var(--w-muted)}
.bl-outliner-meta{margin:0;font-size:11.5px}
.bl-tag-wrap{display:flex;flex-wrap:wrap;gap:4px}
.bl-object-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:4px}
.bl-object-row{display:flex;align-items:center;gap:7px;padding:6px 8px;border-radius:7px;background:var(--w-bg);border:var(--dsh-control-border-width,1px) solid var(--w-border);font-size:11.5px;min-width:0}
.bl-obj-type{font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:9.5px;font-weight:700;padding:1px 5px;border-radius:4px;background:var(--w-selected);color:var(--w-accent);flex:none}
.bl-obj-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bl-obj-loc,.bl-obj-poly{font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:10.5px;color:var(--w-muted);flex:none}

.bl-script-mode-row{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.bl-script-toolbar{display:flex;gap:6px;flex-wrap:wrap}
.bl-kit-bar{display:flex;flex-direction:column;gap:5px;padding:7px 9px;border-radius:8px;background:var(--w-bg);border:var(--dsh-control-border-width,1px) solid var(--w-border)}
.bl-kit-label{font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:10.5px;font-weight:700;color:var(--w-muted);letter-spacing:0.03em}
.bl-kit-chips{display:flex;flex-wrap:wrap;gap:5px}
.bl-kit-chip{padding:3px 8px;border-radius:999px;border:var(--dsh-control-border-width,1px) solid var(--w-border);background:var(--w-canvas);color:var(--w-text);font:inherit;font-size:11px;font-weight:600;cursor:pointer}
.bl-kit-chip:hover:not(:disabled){border-color:var(--w-accent);color:var(--w-accent);background:var(--w-selected)}
.bl-code-editor{font-family:var(--dsh-font-mono,ui-monospace,monospace)!important;font-size:12px!important;line-height:1.5;min-height:200px;resize:vertical}
.bl-script-readonly{max-height:170px}
.bl-script-run-row{display:flex;flex-direction:column;gap:8px}
.bl-cp-card{display:flex;flex-direction:column;gap:7px;padding:9px 10px;border-radius:var(--dsw-radius-md,10px);background:var(--w-bg);border:var(--dsh-control-border-width,1px) solid var(--w-border)}
.bl-cp-head{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px}
.bl-cp-count{font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:11px}
.bl-cp-save-row{display:flex;align-items:center;gap:6px}
.bl-cp-note{flex:1;min-width:0;font-size:12px!important;padding:5px 8px!important}
.bl-cp-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:5px}
.bl-cp-item{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 8px;border-radius:7px;background:var(--w-canvas);border:var(--dsh-control-border-width,1px) solid var(--w-border)}
.bl-cp-meta{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
.bl-cp-top{display:flex;align-items:center;gap:5px;flex-wrap:wrap;font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:10.5px}
.bl-cp-rev{font-weight:750;color:var(--w-text)}
.bl-cp-qc{padding:0 5px;border-radius:999px;font-weight:700;font-size:10px;color:#fff;background:#059669}
.bl-cp-qc[data-qc-tone="warn"]{background:#d97706}
.bl-cp-qc[data-qc-tone="bad"]{background:#e11d48}
.bl-cp-time,.bl-cp-size{color:var(--w-muted)}
.bl-cp-desc{font-size:11.5px;color:var(--w-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bl-cp-empty{margin:0;font-size:11.5px;line-height:1.45}

.bl-form-split{min-height:520px;align-items:start}
.bl-form-pane{padding:14px 16px;border:var(--dsh-control-border-width,1px) solid var(--w-border);border-radius:var(--dsw-radius-md,12px);background:var(--dsw-alias-settings-card-fill,var(--w-canvas))}
.bl-form-divider{border:0;border-top:var(--dsh-control-border-width,1px) solid var(--w-border);margin:14px 0}
.bl-form-stage{display:flex;flex-direction:column;gap:12px;min-width:0}
.bl-form-outliner{padding:14px 16px;border:var(--dsh-control-border-width,1px) solid var(--w-border);border-radius:var(--dsw-radius-md,12px);background:var(--dsw-alias-settings-card-fill,var(--w-canvas))}

@container dsh-workbench (max-width:940px){
  .bl-studio-grid{grid-template-columns:1fr}
  .bl-inspector-content{max-height:none}
}
@container dsh-workbench (max-width:760px){
  .bl-stage-bezel{min-height:280px;padding:8px}
  .bl-stat-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
  .bl-quality-row{grid-template-columns:1fr}
  .bl-field-grid-2,.bl-field-grid-3{grid-template-columns:1fr}
}
`;
