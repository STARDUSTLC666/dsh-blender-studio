// 04-bridge-env.js — Live Socket Bridge control center + Blender environment detection & settings.

function BlenderBridgeEnvPanel({
  project,
  dirty,
  environment,
  running,
  busy,
  perform,
  refresh,
  setNotice,
  setError,
  lang = 'zh',
  t,
}) {
  const [blenderPath, setBlenderPath] = useState(environment?.configuredPath || environment?.active?.path || '');
  const [bridgeHost, setBridgeHost] = useState(environment?.bridge?.host || '127.0.0.1');
  const [bridgePort, setBridgePort] = useState(String(environment?.bridge?.port || 9876));
  const [bridgeToken, setBridgeToken] = useState('');
  const [showToken, setShowToken] = useState(false);

  const [liveScene, setLiveScene] = useState(null);
  const [viewportShot, setViewportShot] = useState(null);
  const [liveCode, setLiveCode] = useState('import bpy\nprint("Active scene:", bpy.context.scene.name, "Objects:", len(bpy.data.objects))');
  const [liveExecResult, setLiveExecResult] = useState(null);
  const [bridgeWorking, setBridgeWorking] = useState(false);

  const controlId = typeof React.useId === 'function' ? React.useId() : 'bl-be';

  useEffect(() => {
    if (environment) {
      setBlenderPath(environment.configuredPath || environment.active?.path || '');
      if (environment.bridge?.host) setBridgeHost(environment.bridge.host);
      if (environment.bridge?.port) setBridgePort(String(environment.bridge.port));
    }
  }, [environment?.configuredPath, environment?.active?.path, environment?.bridge?.host, environment?.bridge?.port]);

  const bridge = environment?.bridge || { host: '127.0.0.1', port: 9876, hasToken: false, connected: false };
  const detected = Array.isArray(environment?.detected) ? environment.detected : [];
  const activeBlender = environment?.active;

  async function saveBridgeConfig(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const portNum = Number(bridgePort);
    if (!Number.isInteger(portNum) || portNum < 1024 || portNum > 65535) {
      setError(t('端口需为 1024–65535 之间的整数。', 'Port must be an integer between 1024 and 65535.'));
      return;
    }
    await perform(async () => {
      const payload = {
        action: 'configure',
        bridgeHost: bridgeHost.trim() || '127.0.0.1',
        bridgePort: portNum,
      };
      if (bridgeToken !== '') payload.bridgeToken = bridgeToken;
      await api(payload);
      await refresh();
      setNotice(t('Live Bridge 连接配置已保存。', 'Live Bridge configuration saved.'));
    });
  }

  async function runBridgeAction(fn) {
    if (bridgeWorking || running) return;
    setBridgeWorking(true);
    setError('');
    try {
      await fn();
    } catch (err) {
      setError(err);
    } finally {
      setBridgeWorking(false);
    }
  }

  return h(
    'div',
    { className: 'bl-be-root' },

    // 1. Live Socket Bridge Control Center
    h(
      'section',
      { className: 'bl-be-card', 'data-dsh-card': '', 'aria-label': t('Live Socket Bridge 实时桥接', 'Live Socket Bridge control center') },
      h(
        'div',
        { className: 'bl-be-head' },
        h(
          'div',
          null,
          h(
            'div',
            { className: 'bl-be-title-row' },
            h('h3', { 'data-dsh-serif': '' }, t('Live Socket Bridge 实时桥接', 'Live Socket Bridge')),
            h(
              'span',
              { className: 'bl-conn-badge', 'data-connected': bridge.connected ? 'true' : 'false' },
              h('span', { className: 'bl-conn-dot', 'aria-hidden': 'true' }),
              bridge.connected
                ? t('已连接', 'Connected') + (bridge.blenderVersion ? ' · Blender ' + bridge.blenderVersion : '')
                : t('未连接', 'Disconnected'),
            ),
          ),
          h(
            'p',
            { className: 'w-muted bl-be-sub' },
            bridge.connected && bridge.activeScene
              ? t('当前打开场景：', 'Active Blender scene: ') + bridge.activeScene
              : t(
                  '可选增强：在桌面 Blender 安装单文件零依赖插件 dsh_blender_bridge.py（仅限 127.0.0.1 本地回环），即可实时拉取场景树、抓拍视口并一键同步工程。',
                  'Optional live link: install single-file zero-dependency dsh_blender_bridge.py in Blender (strictly loopback 127.0.0.1) to inspect scenes, capture viewports, and sync projects.',
                ),
          ),
          bridge.error && !bridge.connected
            ? h('p', { className: 'bl-bridge-err' }, t('上次探测反馈：', 'Last check: ') + bridge.error)
            : null,
        ),
        h(
          'a',
          {
            className: 'w-button w-primary',
            href: addonUrl(),
            download: 'dsh_blender_bridge.py',
          },
          h(W.Icon, { name: 'download', size: 15 }),
          t('下载 dsh_blender_bridge.py', 'Download dsh_blender_bridge.py'),
        ),
      ),

      // Connection Form
      h(
        'form',
        { className: 'bl-bridge-form', onSubmit: saveBridgeConfig },
        h(
          'div',
          { className: 'bl-field' },
          h('label', { htmlFor: controlId + '-bhost' }, t('回环主机 (Loopback Only)', 'Loopback Host')),
          h('input', {
            id: controlId + '-bhost',
            type: 'text',
            value: bridgeHost,
            autoCorrect: 'off',
            autoCapitalize: 'none',
            spellCheck: false,
            placeholder: '127.0.0.1',
            onChange: e => setBridgeHost(e.target.value),
          }),
        ),
        h(
          'div',
          { className: 'bl-field' },
          h('label', { htmlFor: controlId + '-bport' }, t('端口 (Port)', 'Port')),
          h('input', {
            id: controlId + '-bport',
            type: 'number',
            min: 1024,
            max: 65535,
            value: bridgePort,
            onChange: e => setBridgePort(e.target.value),
          }),
        ),
        h(
          'div',
          { className: 'bl-field' },
          h('label', { htmlFor: controlId + '-btoken' }, t('访问令牌 (可选)', 'Auth Token (optional)')),
          h(
            'div',
            { className: 'bl-token-wrap' },
            h('input', {
              id: controlId + '-btoken',
              type: showToken ? 'text' : 'password',
              value: bridgeToken,
              autoComplete: 'off',
              placeholder: bridge.hasToken ? t('已配置（留空保持不变）', 'Configured (leave blank to keep)') : t('可选共享密钥', 'Optional shared secret'),
              onChange: e => setBridgeToken(e.target.value),
            }),
            h(
              W.Button,
              {
                size: 'sm',
                variant: 'ghost',
                'aria-pressed': showToken,
                'aria-label': showToken ? t('隐藏令牌', 'Hide token') : t('显示令牌', 'Show token'),
                onClick: () => setShowToken(v => !v),
              },
              showToken ? t('隐藏', 'Hide') : t('显示', 'Show'),
            ),
          ),
        ),
        h(
          'div',
          { className: 'bl-bridge-form-actions' },
          h(W.Button, { type: 'submit', size: 'sm', icon: 'check', disabled: running }, t('保存配置', 'Save')),
          h(
            W.Button,
            {
              size: 'sm',
              variant: 'primary',
              icon: 'plug',
              disabled: running || bridgeWorking,
              onClick: () =>
                runBridgeAction(async () => {
                  const res = await api({ action: 'bridge_status' });
                  await refresh();
                  if (res?.connected) {
                    setNotice(t('Live Bridge 连接成功！Blender ', 'Live Bridge connected! Blender ') + (res.blenderVersion || ''));
                  } else {
                    setNotice(t('已检测 Live Bridge：当前未连接，请确认 Blender 侧已启动服务。', 'Bridge checked: not connected yet. Start the server inside Blender.'));
                  }
                }),
            },
            t('测试连接', 'Test Connection'),
          ),
        ),
      ),

      // Collapsible Add-on installation walkthrough
      h(
        'details',
        { className: 'bl-guide-details' },
        h('summary', null, t('展开 Blender 插件安装与启动步骤（30 秒完成）', 'Show Blender Add-on Installation Walkthrough (30s)')),
        h(
          'ol',
          { className: 'bl-guide-steps' },
          h('li', null, t('点击右上角「下载 dsh_blender_bridge.py」保存单文件插件（兼容 Blender 3.6 / 4.x / 5.x，零外部依赖）。', 'Download dsh_blender_bridge.py above (single file, zero dependencies, compatible with Blender 3.6–5.x).')),
          h('li', null, t('打开桌面 Blender → Edit（编辑）→ Preferences（偏好设置）→ Add-ons（插件）→ 点击右上角下拉或 Install from Disk，选择该 .py 文件并勾选启用「DSH Blender Live Bridge」。', 'Open Blender → Edit → Preferences → Add-ons → Install from Disk → select dsh_blender_bridge.py and enable "DSH Blender Live Bridge".')),
          h('li', null, t('在 3D 视口按快捷键 N 打开右侧栏，切换至「DSH」标签页，核对端口（默认 9876）与可选 Token 后点击「Start Bridge Server」。', 'Press N in the 3D Viewport, switch to the "DSH" tab, verify port 9876 (and optional token), then click "Start Bridge Server".')),
          h('li', null, t('回到此处点击「测试连接」，即可实时拉取场景、抓取视口截图并同步 DSH 工程！', 'Return here and click "Test Connection" to inspect live scenes, grab viewport screenshots, and sync projects.')),
        ),
      ),

      // Live Bridge Operations Toolbar
      h(
        'div',
        { className: 'bl-bridge-ops' },
        h(
          W.Button,
          {
            size: 'sm',
            icon: 'eye',
            disabled: running || bridgeWorking,
            onClick: () =>
              runBridgeAction(async () => {
                const summary = await api({ action: 'bridge_scene' });
                setLiveScene(summary);
                setNotice(t('已拉取实时 Blender 场景大纲。', 'Fetched live Blender scene summary.'));
              }),
          },
          t('拉取实时场景', 'Pull Live Scene'),
        ),
        h(
          W.Button,
          {
            size: 'sm',
            icon: 'camera',
            disabled: running || bridgeWorking,
            onClick: () =>
              runBridgeAction(async () => {
                const shot = await api({ action: 'bridge_viewport', width: 960, height: 540 });
                setViewportShot(shot);
                setNotice(t('已抓取 Blender 实时视口截图。', 'Captured live Blender viewport screenshot.'));
              }),
          },
          t('抓取 Blender 视口截图', 'Capture Viewport'),
        ),
        h(
          W.Button,
          {
            size: 'sm',
            variant: 'primary',
            icon: 'send',
            disabled: !project || dirty || running || bridgeWorking,
            title: !project ? t('请先打开并保存一个 3D 工程。', 'Open a saved 3D project first.') : dirty ? t('请先保存工程修改。', 'Save project changes first.') : undefined,
            onClick: () =>
              runBridgeAction(async () => {
                const res = await api({ action: 'bridge_sync', id: project.id });
                if (res?.sceneSummary) setLiveScene(res.sceneSummary);
                setNotice(t('已将当前 DSH 工程一键同步至打开的 Blender 窗口！', 'Synced current DSH project into your live Blender window!'));
              }),
          },
          t('同步当前工程到 Blender', 'Sync Project to Blender'),
        ),
      ),

      // Live Viewport Screenshot Preview
      viewportShot?.base64
        ? h(
            'div',
            { className: 'bl-live-shot-card' },
            h(
              'div',
              { className: 'bl-live-shot-head' },
              h('strong', null, t('Blender 实时视口快照', 'Live Blender Viewport Capture')),
              h('span', { className: 'bl-stage-readout' }, (viewportShot.width || 960) + '×' + (viewportShot.height || 540)),
            ),
            h('img', {
              src: 'data:' + (viewportShot.mime || 'image/png') + ';base64,' + viewportShot.base64,
              alt: t('Blender 视口截图', 'Blender viewport screenshot'),
            }),
          )
        : null,

      // Live Scene Summary Preview
      liveScene
        ? h(
            'div',
            { className: 'bl-live-scene-box' },
            renderQcReportCard(liveScene.qc, t),
            h(
              'div',
              { className: 'bl-stat-grid' },
              [
                { k: t('对象', 'Objects'), v: liveScene.objectCount },
                { k: t('网格', 'Meshes'), v: liveScene.meshCount },
                { k: t('灯光', 'Lights'), v: liveScene.lightCount },
                { k: t('相机', 'Cameras'), v: liveScene.cameraCount },
                { k: t('总面数', 'Polys'), v: liveScene.totalPolygons },
              ].map((s, idx) =>
                h(
                  'div',
                  { key: idx, className: 'bl-stat-box' },
                  h('span', { className: 'bl-stat-val' }, s.v ?? 0),
                  h('span', { className: 'bl-stat-lbl' }, s.k),
                ),
              ),
            ),
            Array.isArray(liveScene.objects) && liveScene.objects.length > 0
              ? h(
                  'ul',
                  { className: 'bl-object-list' },
                  liveScene.objects.slice(0, 20).map((obj, idx) =>
                    h(
                      'li',
                      { key: obj.name + '-' + idx, className: 'bl-object-row' },
                      h('span', { className: 'bl-obj-type' }, obj.type),
                      h('strong', { className: 'bl-obj-name' }, obj.name),
                      Array.isArray(obj.location)
                        ? h('span', { className: 'bl-obj-loc' }, '[' + obj.location.map(n => Number(n).toFixed(1)).join(', ') + ']')
                        : null,
                    ),
                  ),
                )
              : null,
          )
        : null,

      // Live bpy quick execution console
      h(
        'details',
        { className: 'bl-guide-details' },
        h('summary', null, t('在实时 Blender 窗口执行 bpy 代码片段（含自动 Undo 快照）', 'Run Quick bpy Snippet in Live Blender (with Undo Push)')),
        h('textarea', {
          className: 'bl-code-editor bl-live-code',
          rows: 4,
          spellCheck: false,
          autoCorrect: 'off',
          autoCapitalize: 'none',
          value: liveCode,
          onChange: e => setLiveCode(e.target.value),
        }),
        h(
          'div',
          { className: 'w-toolbar' },
          h(
            W.Button,
            {
              size: 'sm',
              variant: 'primary',
              icon: 'terminal',
              disabled: running || bridgeWorking || !liveCode.trim(),
              onClick: () =>
                runBridgeAction(async () => {
                  const res = await api({ action: 'bridge_execute', code: liveCode });
                  setLiveExecResult(res);
                  if (res?.sceneSummary) setLiveScene(res.sceneSummary);
                  setNotice(t('实时 bpy 代码已执行。', 'Live bpy snippet executed.'));
                }),
            },
            t('发送到 Blender 执行', 'Execute in Blender'),
          ),
        ),
        liveExecResult
          ? h('pre', null, [liveExecResult.stdout, liveExecResult.stderr].filter(Boolean).join('\n') || t('（无标准输出）', '(no output)'))
          : null,
      ),
    ),

    // 2. Local Blender Environment Panel
    h(
      'section',
      { className: 'bl-be-card', 'data-dsh-card': '', 'aria-label': t('本机 Blender 渲染环境', 'Local Blender environment') },
      h(
        'div',
        { className: 'bl-be-head' },
        h(
          'div',
          null,
          h(
            'div',
            { className: 'bl-be-title-row' },
            h('h3', { 'data-dsh-serif': '' }, t('本机 Blender 环境', 'Local Blender Environment')),
            h(
              'span',
              { className: 'bl-conn-badge', 'data-connected': environment?.ready ? 'true' : 'false' },
              h('span', { className: 'bl-conn-dot', 'aria-hidden': 'true' }),
              environment?.ready ? t('已就绪', 'Ready') : t('未探测到', 'Not Found'),
            ),
          ),
          h(
            'p',
            { className: 'w-muted bl-be-sub' },
            environment?.hint ||
              t(
                'Headless CLI 模式无需打开 Blender GUI 即可渲染静帧、四视角图、动画与导出 3D 模型；支持 Blender 3.6 LTS / 4.x / 5.x。',
                'Headless CLI renders stills, 4-view QC, animations, and exports without opening Blender GUI. Supports Blender 3.6–5.x.',
              ),
          ),
        ),
        h(
          W.Button,
          {
            size: 'sm',
            icon: 'refresh',
            'aria-busy': busy ? 'true' : undefined,
            disabled: running,
            onClick: () =>
              perform(async () => {
                await api({ action: 'detect_blender' });
                await refresh();
                setNotice(t('已重新扫描本机 Blender 安装路径。', 'Re-scanned local Blender installations.'));
              }),
          },
          t('重新探测', 'Re-detect'),
        ),
      ),

      // Active executable capability chips
      activeBlender
        ? h(
            'div',
            { className: 'bl-active-env-box' },
            h('code', { className: 'bl-env-path' }, activeBlender.path),
            h(
              'div',
              { className: 'bl-cap-chips' },
              h('span', { className: 'w-tag' }, 'Blender ' + activeBlender.version),
              h('span', { className: 'w-tag' }, activeBlender.major >= 5 ? 'EEVEE (5.x)' : activeBlender.eeveeEngine === 'BLENDER_EEVEE_NEXT' ? 'EEVEE Next (4.2+)' : 'EEVEE Legacy'),
              h('span', { className: 'w-tag' }, activeBlender.greasePencilApi === 'gpv3' ? 'Grease Pencil v3 (4.3+)' : 'Grease Pencil v2'),
              h('span', { className: 'w-tag' }, t('来源：', 'Source: ') + activeBlender.source),
            ),
          )
        : null,

      // Auto-detected installations list
      detected.length > 0
        ? h(
            'div',
            { className: 'bl-detected-wrap' },
            h('span', { className: 'bl-label' }, t('自动探测到的 Blender 安装', 'Auto-detected Blender installations') + ' (' + detected.length + ')'),
            h(
              'ul',
              { className: 'bl-detected-list' },
              detected.map((item, idx) => {
                const isActive = activeBlender && activeBlender.path === item.path;
                return h(
                  'li',
                  { key: item.path + '-' + idx, className: 'bl-detected-row dsh-row', 'data-dsh-row': '', 'data-active': isActive ? 'true' : 'false' },
                  h(
                    'div',
                    { className: 'bl-detected-info' },
                    h('strong', null, 'Blender ' + item.version),
                    h('code', { className: 'bl-env-path' }, item.path),
                  ),
                  h(
                    'div',
                    { className: 'bl-detected-actions' },
                    isActive
                      ? h('span', { className: 'w-tag bl-tag-fresh' }, t('当前使用', 'Active'))
                      : h(
                          W.Button,
                          {
                            size: 'sm',
                            variant: 'outline',
                            icon: 'check',
                            disabled: running,
                            onClick: () =>
                              perform(async () => {
                                await api({ action: 'configure', blenderPath: item.path });
                                await refresh();
                                setNotice(t('已切换至 Blender ', 'Switched to Blender ') + item.version);
                              }),
                          },
                          t('选用此版本', 'Select'),
                        ),
                  ),
                );
              }),
            ),
          )
        : null,

      // Custom executable path input
      h(
        'form',
        {
          className: 'bl-path-form',
          onSubmit: e => {
            e.preventDefault();
            perform(async () => {
              await api({ action: 'configure', blenderPath: blenderPath.trim() });
              await refresh();
              setNotice(t('自定义 Blender 可执行路径已保存并验证。', 'Custom Blender executable path saved and verified.'));
            });
          },
        },
        h(
          'div',
          { className: 'bl-field bl-path-field' },
          h('label', { htmlFor: controlId + '-bpath' }, t('自定义 Blender 可执行路径（留空则自动探测）', 'Custom Blender executable path (blank for auto-detect)')),
          h('input', {
            id: controlId + '-bpath',
            type: 'text',
            value: blenderPath,
            autoCorrect: 'off',
            autoCapitalize: 'none',
            spellCheck: false,
            placeholder: t('例如 C:\\Program Files\\Blender Foundation\\Blender 4.3\\blender.exe', 'e.g. /Applications/Blender.app/Contents/MacOS/Blender'),
            onChange: e => setBlenderPath(e.target.value),
          }),
        ),
        h(
          W.Button,
          { type: 'submit', size: 'sm', variant: 'primary', icon: 'check', disabled: running },
          t('保存并验证路径', 'Save & Verify'),
        ),
      ),

      // Poly Haven Opt-In Setting
      h(
        'div',
        { className: 'bl-policy-box' },
        h(
          'div',
          null,
          h('strong', null, t('Poly Haven CC0 在线资产检索', 'Poly Haven CC0 Online Assets')),
          h(
            'p',
            { className: 'w-muted bl-be-sub' },
            t('启用后允许向固定白名单域名 api.polyhaven.com / dl.polyhaven.org 发起检索与下载。', 'Allows read-only search & download strictly from api.polyhaven.com and dl.polyhaven.org.'),
          ),
        ),
        h(W.Switch, {
          label: t('启用 Poly Haven', 'Enable Poly Haven'),
          checked: Boolean(environment?.polyHavenEnabled),
          disabled: running,
          onChange: enabled =>
            perform(async () => {
              await api({ action: 'configure', polyHavenEnabled: enabled });
              await refresh();
              setNotice(enabled ? t('已启用 Poly Haven CC0 资产检索。', 'Poly Haven CC0 enabled.') : t('已关闭 Poly Haven 在线检索。', 'Poly Haven disabled.'));
            }),
        }),
      ),
    ),
  );
}

const BLENDER_BRIDGE_CSS = `
.bl-be-root{display:flex;flex-direction:column;gap:14px;max-width:1040px;padding:8px 0 24px;min-width:0}
.bl-be-card{display:flex;flex-direction:column;gap:14px;padding:16px 18px;border:var(--dsh-control-border-width,1px) solid var(--w-border);border-radius:var(--dsw-radius-md,12px);background:var(--dsw-alias-settings-card-fill,var(--w-canvas));min-width:0}
.bl-be-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
.bl-be-title-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.bl-be-title-row h3{margin:0}
.bl-be-sub{margin:4px 0 0;font-size:12px;line-height:1.5;max-width:72ch}
.bl-conn-badge{display:inline-flex;align-items:center;gap:6px;padding:2px 9px;border-radius:999px;font-size:11.5px;font-weight:600;border:var(--dsh-control-border-width,1px) solid var(--w-border);background:var(--w-bg)}
.bl-conn-dot{width:7px;height:7px;border-radius:50%;background:#94a3b8}
.bl-conn-badge[data-connected="true"] .bl-conn-dot{background:#10b981;box-shadow:0 0 6px rgba(16,185,129,0.75)}
.bl-bridge-err{margin:4px 0 0;font-size:12px;color:var(--dsw-alias-state-error-primary,#c83240)}
.bl-bridge-form{display:grid;grid-template-columns:minmax(140px,1fr) 110px minmax(180px,1.3fr) auto;gap:10px;align-items:end}
.bl-token-wrap{display:flex;align-items:center;gap:6px}
.bl-bridge-form-actions{display:flex;gap:6px;flex-wrap:wrap}
.bl-guide-details{padding:10px 12px;border-radius:var(--dsw-radius-sm,9px);border:var(--dsh-control-border-width,1px) solid var(--w-border);background:var(--w-bg)}
.bl-guide-details summary{cursor:pointer;font-size:12.5px;font-weight:600;color:var(--w-text);user-select:none}
.bl-guide-steps{margin:10px 0 2px;padding-inline-start:20px;display:grid;gap:6px;font-size:12.5px;line-height:1.5;color:var(--w-muted)}
.bl-bridge-ops{display:flex;flex-wrap:wrap;gap:8px}
.bl-live-shot-card{display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:10px;background:#232833;border:1px solid #363e4d;color:#eef2f7}
.bl-live-shot-head{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px}
.bl-live-shot-card img{max-width:100%;max-height:360px;object-fit:contain;border-radius:6px;align-self:center}
.bl-live-scene-box{display:flex;flex-direction:column;gap:10px;padding:12px;border-radius:var(--dsw-radius-sm,9px);border:var(--dsh-control-border-width,1px) solid var(--w-border);background:var(--w-bg)}
.bl-live-code{min-height:90px!important;margin-top:8px}
.bl-active-env-box{display:flex;flex-direction:column;gap:8px;padding:12px 14px;border-radius:var(--dsw-radius-sm,9px);background:var(--w-bg);border:var(--dsh-control-border-width,1px) solid var(--w-border)}
.bl-env-path{font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:12px;overflow-wrap:anywhere;color:var(--w-text)}
.bl-cap-chips{display:flex;flex-wrap:wrap;gap:6px}
.bl-detected-wrap{display:flex;flex-direction:column;gap:6px}
.bl-detected-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px}
.bl-detected-row{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:10px 12px;border-radius:var(--dsw-radius-sm,8px);border:var(--dsh-control-border-width,1px) solid var(--w-border);background:var(--w-bg)}
.bl-detected-info{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1 1 240px}
.bl-detected-actions{flex:none}
.bl-path-form{display:flex;align-items:end;gap:10px;flex-wrap:wrap}
.bl-path-field{flex:1 1 280px}
.bl-policy-box{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding-top:12px;border-top:var(--dsh-control-border-width,1px) solid var(--w-border)}
@container dsh-workbench (max-width:860px){.bl-bridge-form{grid-template-columns:1fr 1fr}}
@container dsh-workbench (max-width:560px){.bl-bridge-form{grid-template-columns:1fr}}
`;
