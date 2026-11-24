// Editable browser entry for dsh-blender-studio. Build with:
//   node scripts/build-client.mjs && node scripts/build-updates.mjs
window.__ModuleLoader__.load({
  id: 'dsh-blender-studio',
  factory: require => {
    const React = require('react');
    const { useState, useEffect, useRef } = React;
    const h = React.createElement;
    const W = createWorkbenchUI(React, require);

    const ROUTE = 'api/dsh-blender-studio/workbench';
    const MAX_ASSET_BYTES = 50 * 1024 * 1024;
    const MAX_SCRIPT_BYTES = 256 * 1024;

    const FALLBACK_TEMPLATES = [
      {
        id: 'product-studio',
        zh: '产品棚拍展台',
        en: 'Product Studio',
        description: '圆台底座 + 主体产品 + 三点柔和棚拍光，适合硬件、包装与静物渲染。',
        descriptionEn: 'Pedestal hero showcase with 3-point studio lighting for product shots.',
        recommendedEngine: 'EEVEE',
        defaultCamera: 'three_quarter',
        defaultLighting: 'studio_3point',
        defaultMaterial: 'ceramic_gloss',
        defaultFrames: 48,
      },
      {
        id: 'logo-3d',
        zh: '3D 立体标题',
        en: '3D Logo & Title',
        description: '立体挤出文字/徽标与镜面地台，适合封面标题、品牌主视觉与片头。',
        descriptionEn: 'Extruded 3D typography and sculptural plinth for hero titles and branding.',
        recommendedEngine: 'EEVEE',
        defaultCamera: 'front',
        defaultLighting: 'dramatic_rim',
        defaultMaterial: 'brushed_metal',
        defaultFrames: 48,
      },
      {
        id: 'isometric-room',
        zh: '等距微缩房间',
        en: 'Isometric Room',
        description: '45° 等距剖面空间与家具陈设，适合概念设计、插画风空间展示。',
        descriptionEn: 'Cutaway isometric architectural miniature with desk, props, and soft light.',
        recommendedEngine: 'CYCLES',
        defaultCamera: 'isometric',
        defaultLighting: 'soft_daylight',
        defaultMaterial: 'clay_matte',
        defaultFrames: 48,
      },
      {
        id: 'motion-data',
        zh: '3D 动态数据柱阵',
        en: 'Motion Data Grid',
        description: '程序化 3D 柱状矩阵与起伏动画，适合数据可视化与科技发布演示。',
        descriptionEn: 'Procedural animated 3D bar matrix for data storytelling and motion graphics.',
        recommendedEngine: 'EEVEE',
        defaultCamera: 'three_quarter',
        defaultLighting: 'neon_cyber',
        defaultMaterial: 'frosted_glass',
        defaultFrames: 60,
      },
      {
        id: 'grease-pencil-2d',
        zh: '蜡笔 2D 视差舞台',
        en: 'Grease Pencil 2D',
        description: '多层 3D 空间 2D 蜡笔图层与手绘轮廓（兼容 GPv2 / Blender 4.3+ GPv3）。',
        descriptionEn: 'Multi-layer 2D Grease Pencil parallax planes with GPv2 & GPv3 compatibility.',
        recommendedEngine: 'EEVEE',
        defaultCamera: 'front',
        defaultLighting: 'clay_overcast',
        defaultMaterial: 'toon_cel',
        defaultFrames: 48,
      },
      {
        id: 'blank-stage',
        zh: '空白摄影棚',
        en: 'Blank Studio Stage',
        description: '洁净无影棚弧幕、标准相机与参考立方体，适合自定义 bpy 脚本自由建模。',
        descriptionEn: 'Clean cyclorama backdrop, calibrated camera, and reference stage for custom bpy.',
        recommendedEngine: 'EEVEE',
        defaultCamera: 'three_quarter',
        defaultLighting: 'studio_3point',
        defaultMaterial: 'clay_matte',
        defaultFrames: 48,
      },
      {
        id: 'architectural-pavilion',
        zh: '参数化建筑展馆',
        en: 'Architectural Pavilion',
        description: '弧形清水混凝土与木格栅展馆、镜面浅水池与暖光挑高空间，适合建筑与空间表现。',
        descriptionEn: 'Minimalist curved timber-and-concrete pavilion with skylight ribs, reflective pool, and warm glow.',
        recommendedEngine: 'CYCLES',
        defaultCamera: 'three_quarter',
        defaultLighting: 'soft_daylight',
        defaultMaterial: 'clay_matte',
        defaultFrames: 48,
      },
      {
        id: 'procedural-abstract',
        zh: '程序化几何雕塑',
        en: 'Procedural GeoNodes Art',
        description: '基于 Blender Geometry Nodes 的扭转参数化环带雕塑与炫彩金属材质，适合概念封面与动态艺术。',
        descriptionEn: 'Parametric twisted ribbon-and-ring Geometry Nodes sculpture with iridescent metal sheen and rim light.',
        recommendedEngine: 'EEVEE',
        defaultCamera: 'three_quarter',
        defaultLighting: 'dramatic_rim',
        defaultMaterial: 'brushed_metal',
        defaultFrames: 60,
      },
    ];

    const CAMERA_PRESETS = [
      { id: 'three_quarter', zh: '3/4 视角', en: '3/4 View' },
      { id: 'front', zh: '正视图', en: 'Front' },
      { id: 'isometric', zh: '等距正交', en: 'Isometric' },
      { id: 'top', zh: '俯视图', en: 'Top' },
      { id: 'closeup', zh: '微距特写', en: 'Close-Up' },
      { id: 'turntable', zh: '360° 转台', en: 'Turntable' },
    ];

    const LIGHTING_PRESETS = [
      { id: 'studio_3point', zh: '棚拍三点光', en: 'Studio 3-Point' },
      { id: 'soft_daylight', zh: '柔光晴昼', en: 'Soft Daylight' },
      { id: 'dramatic_rim', zh: '轮廓戏剧光', en: 'Dramatic Rim' },
      { id: 'neon_cyber', zh: '霓虹赛博', en: 'Neon Cyber' },
      { id: 'clay_overcast', zh: '白模漫射', en: 'Clay Overcast' },
    ];

    const MATERIAL_PRESETS = [
      { id: 'ceramic_gloss', zh: '釉面陶瓷', en: 'Ceramic Gloss' },
      { id: 'clay_matte', zh: '哑光黏土', en: 'Clay Matte' },
      { id: 'brushed_metal', zh: '拉丝金属', en: 'Brushed Metal' },
      { id: 'frosted_glass', zh: '磨砂玻璃', en: 'Frosted Glass' },
      { id: 'toon_cel', zh: '卡通赛璐璐', en: 'Toon Cel' },
    ];

    const EXPORT_FORMATS = [
      { id: 'glb', label: 'GLB', descZh: 'Web / AR / Three.js 推荐（含纹理 PBR）', descEn: 'Recommended for Web / AR / Three.js (packed PBR)' },
      { id: 'fbx', label: 'FBX', descZh: 'Unity / Unreal / DCC 通用交换格式', descEn: 'Interchange format for Unity / Unreal / DCC' },
      { id: 'obj', label: 'OBJ', descZh: '通用静态网格交换格式', descEn: 'Universal static mesh format' },
      { id: 'stl', label: 'STL', descZh: '3D 打印与 CAD 切片网格', descEn: '3D printing and CAD slicing mesh' },
      { id: 'blend', label: '.blend', descZh: 'Blender 完整原生工程文件', descEn: 'Native Blender project file' },
    ];

    function formatBytes(bytes) {
      const n = Number(bytes || 0);
      if (!Number.isFinite(n) || n <= 0) return '0 B';
      if (n < 1024) return n + ' B';
      if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
      return (n / (1024 * 1024)).toFixed(2) + ' MB';
    }

    function utf8ByteLength(text) {
      try {
        if (typeof TextEncoder === 'function') return new TextEncoder().encode(String(text || '')).length;
      } catch { /* fallback */ }
      return unescape(encodeURIComponent(String(text || ''))).length;
    }

    function blenderError(error, en) {
      const message = typeof error === 'string' ? error : error?.message || String(error || '');
      const code = typeof error === 'object' && error ? error.code : undefined;
      if (!en || (!code && !/[\u3400-\u9fff]/.test(message))) return message;
      if (error?.status === 401 && !code) return 'Your session expired. Reopen DSH and try again.';
      const byCode = {
        ID_INVALID: 'Invalid project, asset, or job ID.',
        BAD_REQUEST: 'Invalid request parameters. Check your inputs and retry.',
        BAD_ACTION: 'Unsupported workbench action.',
        TITLE_INVALID: 'Enter a project title between 1 and 72 characters.',
        DESCRIPTION_TOO_LONG: 'Description is limited to 600 characters.',
        HEADLINE_TOO_LONG: '3D headline text is limited to 48 characters.',
        SAMPLES_INVALID: 'Samples must be an integer between 4 and 1024.',
        FRAMES_INVALID: 'Frame range must start at ≥1 with end ≥ start and span ≤ 600 frames.',
        COLOR_INVALID: 'Accent color must be a #RRGGBB hex code.',
        SCRIPT_TOO_LARGE: 'Custom bpy script cannot exceed 256 KB.',
        SCRIPT_UNSAFE: 'Custom script contains blocked system/network calls. Review the script or enable unsafe override explicitly.',
        TEMPLATE_INVALID: 'Select a supported 3D template.',
        EXPORT_FORMAT_INVALID: 'Export format must be glb, fbx, obj, stl, or blend.',
        CONFLICT: 'This project changed elsewhere. Compare your preserved input and reload the latest revision.',
        JOB_CONFLICT: 'Another Blender job is already running for this project. Wait or cancel it first.',
        PROJECT_LIMIT: 'The 30 active 3D project slots are full. Archive another project first.',
        PROJECT_EXISTS: 'A project with this ID already exists.',
        PROJECT_NOT_FOUND: 'Project not found. Refresh the project library.',
        ASSET_NOT_FOUND: 'Asset not found in this project.',
        ASSET_CHANGED: 'Asset changed while processing. Refresh and retry.',
        ARTIFACT_NOT_FOUND: 'Rendered artifact was not found.',
        JOB_NOT_FOUND: 'Job record no longer exists.',
        JOB_LIMIT: 'Too many concurrent Blender jobs. Wait for active jobs to finish.',
        JOB_CANCELLED: 'Blender job was cancelled; your project is preserved.',
        ENV_NOT_READY: 'Blender executable is not configured or detected. Set your Blender path in Bridge & Env.',
        BLENDER_PATH_INVALID: 'The specified Blender executable path is invalid or inaccessible.',
        BLENDER_PROBE_FAILED: 'Failed to probe the Blender executable version. Verify Blender 3.6+ is installed.',
        BRIDGE_UNREACHABLE: 'Could not reach Blender Live Bridge on loopback TCP. Ensure the add-on server is started in Blender.',
        BRIDGE_AUTH_FAILED: 'Live Bridge token mismatch. Check the token configured in Blender and DSH.',
        BRIDGE_TIMEOUT: 'Blender Live Bridge timed out waiting for a response.',
        BRIDGE_PROTOCOL_ERROR: 'Unexpected response from Blender Live Bridge.',
        BRIDGE_HOST_FORBIDDEN: 'Live Bridge strictly allows loopback hosts only (127.0.0.1, localhost, ::1).',
        ASSET_REQUIRED: 'Select a file to upload.',
        ASSET_SIZE: 'Each asset must be between 1 byte and 50 MB.',
        ASSET_FORMAT: 'Unsupported file format or mismatched file contents. Use HDR/EXR/PNG/JPG/WebP/GLB/GLTF/OBJ/FBX/STL/BLEND.',
        ASSET_LIMIT: 'A project supports at most 24 assets and 120 MB total.',
        POLYHAVEN_DISABLED: 'Poly Haven CC0 integration is disabled. Enable it in Bridge & Env first.',
        POLYHAVEN_FAILED: 'Poly Haven request failed. Check your network connection and retry.',
        POLYHAVEN_NOT_FOUND: 'Requested Poly Haven asset or resolution was not found.',
        STORAGE_UNSAFE: 'Unsafe storage path rejected to protect your files.',
        PROJECT_CORRUPT: 'Project metadata could not be read safely.',
        CONFIRM_REQUIRED: 'Confirmation is required for this action.',
        JOB_TIMEOUT: 'Blender job timed out and was terminated safely. Your project is preserved.',
        LOCK_LOST: 'Storage lock was lost; retry after refreshing.',
        CLI_FAILED: 'Blender CLI execution failed. Expand the job log for full Python/Blender output.',
        OUTPUT_INVALID: 'Expected render or export output file was not produced.',
        OUTPUT_TOO_LARGE: 'Output artifact exceeds the 200 MB safety limit.',
        ORIGIN_FORBIDDEN: 'Request origin or CSRF header check failed.',
        DOWNLOAD_INVALID: 'Invalid download parameters.',
        CHECKPOINT_NOT_FOUND: 'Requested script checkpoint was not found.',
        PLUGIN_DISPOSED: 'Plugin is unloading. Wait for reload and retry.',
      };
      if (code && byCode[code]) return byCode[code];
      if (error?.status === 409) return byCode.CONFLICT;
      return 'The operation did not complete. Check the job log or Bridge & Env status and retry.';
    }

    function emptyFields() {
      return {
        template: 'product-studio',
        title: '',
        description: '',
        headline: 'DSH 3D',
        engine: 'EEVEE',
        samples: 32,
        aspect: 'landscape',
        resolutionScale: 100,
        fps: 24,
        frameStart: 1,
        frameEnd: 48,
        cameraPreset: 'three_quarter',
        lightingPreset: 'studio_3point',
        materialPreset: 'ceramic_gloss',
        accentColor: '#3B82F6',
        transparentBg: false,
        scriptMode: 'template',
        customScript: '',
      };
    }

    function fieldsOf(p) {
      const base = emptyFields();
      if (!p) return base;
      return {
        template: p.template ?? base.template,
        title: p.title ?? '',
        description: p.description ?? '',
        headline: p.headline ?? '',
        engine: p.engine ?? base.engine,
        samples: Number.isInteger(p.samples) ? p.samples : base.samples,
        aspect: p.aspect ?? base.aspect,
        resolutionScale: Number(p.resolutionScale) || base.resolutionScale,
        fps: Number(p.fps) || base.fps,
        frameStart: Number.isInteger(p.frameStart) ? p.frameStart : base.frameStart,
        frameEnd: Number.isInteger(p.frameEnd) ? p.frameEnd : base.frameEnd,
        cameraPreset: p.cameraPreset ?? base.cameraPreset,
        lightingPreset: p.lightingPreset ?? base.lightingPreset,
        materialPreset: p.materialPreset ?? base.materialPreset,
        accentColor: typeof p.accentColor === 'string' ? p.accentColor.toUpperCase() : base.accentColor,
        transparentBg: Boolean(p.transparentBg),
        scriptMode: p.scriptMode === 'custom' ? 'custom' : 'template',
        customScript: typeof p.customScript === 'string' ? p.customScript : '',
      };
    }

    let cache = { project: null, fields: null, dirty: false, job: null, creating: false };

    async function api(body) {
      const response = await fetch(new URL(ROUTE, document.baseURI), {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'content-type': 'application/json',
          'x-dsh-blender-studio': '1',
        },
        body: JSON.stringify(body),
      });
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('无法读取 dsh-blender-studio 插件响应，请确认插件已加载或重启 DSH。');
      }
      if (!response.ok || !data.ok) {
        const error = new Error(data.message || '操作未完成');
        error.status = response.status;
        if (data.code) error.code = data.code;
        throw error;
      }
      return data.value;
    }

    function urlFor(project, kind, extra = {}) {
      const url = new URL(ROUTE, document.baseURI);
      const params = { kind, ...extra };
      if (project && project.id) params.id = project.id;
      url.search = new URLSearchParams(params);
      return url.href;
    }

    function addonUrl() {
      const url = new URL(ROUTE, document.baseURI);
      url.search = new URLSearchParams({ kind: 'addon' });
      return url.href;
    }

    function isEnLocale(locale) {
      try {
        return String(locale?.getSnapshot?.().active || '').toLowerCase().startsWith('en');
      } catch {
        return false;
      }
    }

    function latestArtifactOf(project, kind) {
      if (!project || !Array.isArray(project.artifacts)) return null;
      const matches = project.artifacts.filter(art => art.kind === kind);
      if (!matches.length) return null;
      return matches.slice().sort((a, b) => Date.parse(b.created || 0) - Date.parse(a.created || 0))[0];
    }

    function formatElapsed(seconds) {
      const safe = Math.max(0, Math.floor(Number(seconds) || 0));
      const mins = Math.floor(safe / 60);
      const secs = safe % 60;
      return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
    }

    function jobKindLabel(kind, t) {
      const map = {
        preview_still: t('预览静帧', 'Preview Still'),
        contact_sheet: t('四视角质检', '4-View QC'),
        render_animation: t('渲染动画', 'Render Animation'),
        export_model: t('导出 3D 模型', 'Export 3D Model'),
        inspect_scene: t('场景大纲检查', 'Inspect Scene'),
        run_script: t('执行 bpy 脚本', 'Run bpy Script'),
        build_blend: t('生成 .blend 工程', 'Build .blend'),
        pipeline: t('一键全流程', 'Production Pipeline'),
      };
      return map[kind] || kind || t('Blender 任务', 'Blender Job');
    }

    function computePipelineStepIndex(job) {
      if (!job) return 0;
      if (job.pipeline?.stoppedEarly) return 0;
      const code = String(job.stageCode || '').toLowerCase();
      if (code.includes('export') || code.includes('glb') || job.pipeline?.modelArtifactId) return 3;
      if (code.includes('render') || code.includes('still') || code.includes('anim') || job.pipeline?.primaryRenderId) return 2;
      if (code.includes('contact') || code.includes('sheet') || code.includes('qc_sheet') || job.pipeline?.contactSheetId) return 1;
      if (code.includes('inspect') || code.includes('audit') || code.includes('qc')) return 0;
      const pct = Number(job.progress) || 0;
      if (pct >= 80) return 3;
      if (pct >= 52) return 2;
      if (pct >= 25) return 1;
      return 0;
    }

    function formatJobStage(job, lang, t) {
      if (!job) return '';
      if (job.kind === 'pipeline') {
        if (job.state === 'done') {
          const qcTag = job.pipeline?.qc ? ' · QC-3D ' + job.pipeline.qc.score + '/' + job.pipeline.qc.grade : '';
          if (job.pipeline?.stoppedEarly) {
            return t(
              '在 QC-3D 体检阶段提前中止' + qcTag,
              'Stopped early during QC-3D audit' + qcTag,
            );
          }
          const count = Array.isArray(job.pipeline?.artifactIds) ? job.pipeline.artifactIds.length : 0;
          return t(
            `全流程完成（生成 ${count} 项成品${qcTag}）`,
            `Completed (${count} ${count === 1 ? 'artifact' : 'artifacts'}${qcTag})`,
          );
        }
        if (lang === 'en' && /[\u3400-\u9fff]/.test(String(job.stage || ''))) {
          if (job.state === 'failed') return 'Failed — expand job log for details';
          if (job.state === 'cancelled') return 'Cancelled';
          const stepLabels = ['Running QC-3D scene audit…', 'Rendering 4-View QC sheet…', 'Rendering hero output…', 'Exporting 3D model…'];
          return stepLabels[computePipelineStepIndex(job)] || 'Running production pipeline…';
        }
      }
      const raw = String(job.stage || job.state || '');
      if (lang === 'en' && /[\u3400-\u9fff]/.test(raw)) {
        if (job.state === 'done') return 'Completed';
        if (job.state === 'failed') return 'Failed — expand job log for details';
        if (job.state === 'cancelled') return 'Cancelled';
        const code = String(job.stageCode || '').toLowerCase();
        if (code.includes('inspect')) return 'Inspecting scene…';
        if (code.includes('export')) return 'Exporting 3D model…';
        if (code.includes('render') || code.includes('contact')) return 'Rendering in Blender…';
        return 'Running Blender task…';
      }
      return raw;
    }

    const CLIENT_BASE_CSS = `
.dbw{color:var(--w-text);min-width:0}
.dbw *{box-sizing:border-box}
.dbw h2{margin:0;font-size:19px}
.dbw h3{font-size:15px;margin:0 0 8px}
.dbw .muted{color:var(--w-muted);font-size:12.5px}
.dbw input:not([type=file]):not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]),.dbw textarea,.dbw select{font:inherit;color:var(--w-text);width:100%;border:var(--dsh-control-border-width,1px) solid var(--w-border);border-radius:var(--dsw-radius-sm,8px);padding:6px 10px;background:var(--dsw-alias-bg-base,var(--w-canvas))}
.dbw .w-input>input{border:0!important;background:transparent!important;padding:5px 0!important}
.dbw pre{white-space:pre-wrap;overflow-wrap:anywhere;font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:12px;margin:8px 0;max-height:240px;overflow:auto;padding:10px 12px;border-radius:var(--dsw-radius-sm,8px);background:var(--w-bg);border:var(--dsh-control-border-width,1px) solid var(--w-border)}
.dbw [aria-invalid="true"]{border-color:var(--dsw-alias-state-error-primary,#c83240)!important}
.dbw .dbw-loading-skeleton{display:flex;flex-direction:column;gap:12px;max-width:920px;padding:18px 0}
.dbw .dbw-header-meta{font-variant-numeric:tabular-nums;font-weight:600}
.dbw .dbw-job-banner{border:var(--dsh-control-border-width,1px) solid var(--w-border);padding:10px 14px;margin:8px 0;border-radius:var(--dsw-radius-md,10px);background:var(--dsw-alias-settings-card-fill,var(--w-bg));font-size:13px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.dbw .dbw-job-banner[data-state="failed"]>strong{color:var(--dsw-alias-state-error-primary,#c83240)}
.dbw .dbw-job-banner[data-state="done"]>strong{color:var(--dsw-alias-state-success-primary,#24794a)}
.dbw .dbw-job-banner details{width:100%}
.dbw .dbw-job-banner summary{cursor:pointer;font-size:12px;color:var(--w-muted);user-select:none}
.dbw .dbw-job-progress{width:180px;flex:none}
.dbw .dbw-job-pct,.dbw .dbw-job-elapsed{font-family:var(--dsh-font-mono,ui-monospace,monospace);font-variant-numeric:tabular-nums;font-size:12px;color:var(--w-muted)}
.dbw .dbw-job-elapsed{padding:1px 7px;border-radius:999px;background:var(--w-bg);border:var(--dsh-control-border-width,1px) solid var(--w-border)}
.dbw .dbw-pipeline-steps{display:flex;align-items:center;gap:6px;flex-wrap:wrap;width:100%;padding-top:2px;font-size:11.5px}
.dbw .dbw-pipe-step{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;border:var(--dsh-control-border-width,1px) solid var(--w-border);background:var(--w-bg);color:var(--w-muted);font-weight:600}
.dbw .dbw-pipe-step[data-step-state="active"]{border-color:var(--w-accent);background:var(--w-selected);color:var(--w-accent)}
.dbw .dbw-pipe-step[data-step-state="done"]{border-color:color-mix(in oklab,#10b981 45%,var(--w-border));background:color-mix(in oklab,#10b981 10%,var(--w-bg));color:#047857}
[data-theme="dark"] .dbw .dbw-pipe-step[data-step-state="done"]{color:#6ee7b7}
.dbw .dbw-pipe-step[data-step-state="stopped"]{border-color:color-mix(in oklab,#e11d48 45%,var(--w-border));background:color-mix(in oklab,#e11d48 10%,var(--w-bg));color:#be123c}
.dbw .dbw-pipe-arrow{color:var(--w-muted);font-size:11px}
.dbw .dbw-pipe-result{margin-inline-start:auto;font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:11px;font-weight:700;color:var(--w-text)}
.dbw .dbw-export-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin:12px 0}
.dbw .dbw-export-choice{display:flex;flex-direction:column;align-items:flex-start;gap:3px;padding:10px 12px;border-radius:var(--dsw-radius-sm,8px);border:var(--dsh-control-border-width,1px) solid var(--w-border);background:var(--w-bg);color:var(--w-text);cursor:pointer;text-align:left}
.dbw .dbw-export-choice[aria-pressed="true"]{border-color:var(--w-accent);background:var(--w-selected);box-shadow:inset 0 0 0 1px var(--w-accent)}
.dbw .dbw-export-choice strong{font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:13px}
.dbw .dbw-export-choice span{font-size:11.5px;color:var(--w-muted);line-height:1.35}
.dbw .dbw-checks{list-style:none;padding:0;margin:10px 0;display:grid;gap:5px;font-size:12.5px;color:var(--w-muted)}
.dbw>.dsh-header .w-tabs>button{padding:4px 9px;flex:none}
.dbw>.dsh-header .w-header-actions{gap:5px}
.dbw>.dsh-header .w-header-actions .w-button{padding-inline:9px}
.dbw :focus-visible{outline:2px solid var(--w-accent);outline-offset:2px}
[role="dialog"]:has(.dbw.w-page){width:min(1180px,calc(100dvw - 40px))!important;max-width:1180px!important}
@container dsh-workbench (max-width:1060px){
  .dbw>.dsh-header{flex-wrap:wrap;height:auto;min-height:48px;padding-block:6px;row-gap:6px;column-gap:8px;overflow:visible}
  .dbw>.dsh-header>.dsh-header-leading{flex:0 1 auto;max-width:100%;overflow:visible;flex-wrap:wrap;gap:6px 8px}
  .dbw>.dsh-header .dsh-header-tabs{flex:0 1 auto;overflow:visible}
  .dbw>.dsh-header .w-tabs{flex-wrap:wrap;overflow:visible}
  .dbw>.dsh-header>.w-header-actions{margin-inline-start:auto;flex-wrap:wrap;gap:4px}
}
@container dsh-workbench (max-width:760px){
  .dbw>.dsh-header>.w-header-actions{margin-inline-start:0;width:100%;justify-content:flex-start}
  .dbw .dbw-job-progress{width:120px}
}
`;

    function Workbench({ locale, workbench = false } = {}) {
      const [lang, setLang] = useState(() => (isEnLocale(locale) ? 'en' : 'zh'));
      const [libraryTab, setLibraryTab] = useState('projects');
      const [editorTab, setEditorTab] = useState('studio');
      const [editorMode, setEditorMode] = useState('studio');
      const [stageView, setStageView] = useState('stage');

      const [projects, setProjects] = useState([]);
      const [archived, setArchived] = useState([]);
      const [corruptedCount, setCorruptedCount] = useState(0);
      const [environment, setEnvironment] = useState(null);
      const [templates, setTemplates] = useState(FALLBACK_TEMPLATES);

      const initialFields = cache.fields || emptyFields();
      const [project, setProject] = useState(cache.project);
      const [fields, setFields] = useState(initialFields);
      const [dirty, setDirty] = useState(cache.dirty);
      const [creating, setCreating] = useState(cache.creating);
      const [job, setJob] = useState(cache.job);
      const [busy, setBusy] = useState(false);
      const [error, setError] = useState('');
      const [notice, setNotice] = useState('');
      const [pending, setPending] = useState(null);
      const [conflict, setConflict] = useState(false);
      const [archiveReview, setArchiveReview] = useState(false);
      const [archiveTarget, setArchiveTarget] = useState(null);
      const [trashTarget, setTrashTarget] = useState(null);
      const [exportOpen, setExportOpen] = useState(false);
      const [exportFormat, setExportFormat] = useState('glb');
      const [titleTouched, setTitleTouched] = useState(false);
      const [, setElapsedTick] = useState(0);

      const busyRef = useRef(false);
      const fileRef = useRef(null);
      const latest = useRef({ project, fields, dirty });
      latest.current = { project, fields, dirty };
      const controlId = typeof React.useId === 'function' ? React.useId() : 'dsh-blender-studio-ctrl';

      const t = (zh, en) => (lang === 'en' ? en : zh);
      const activeJob = job?.state === 'running';
      const running = busy || activeJob;

      if (typeof __stardustUpdatesGuard === 'function') {
        __stardustUpdatesGuard(React, 'dsh-blender-studio', { dirty, busy: busy || activeJob, retainOnClose: true });
      }

      useEffect(() => {
        const update = () => setLang(isEnLocale(locale) ? 'en' : 'zh');
        update();
        return locale?.subscribe?.(update);
      }, [locale]);

      useEffect(() => {
        cache = { project, fields, dirty, job, creating };
      }, [project, fields, dirty, job, creating]);

      useEffect(() => {
        const exit = e => {
          if (latest.current.dirty) {
            e.preventDefault();
            e.returnValue = '';
          }
        };
        window.addEventListener('beforeunload', exit);
        return () => window.removeEventListener('beforeunload', exit);
      }, []);

      function syncFields(nextFields) {
        setFields(nextFields);
        setTitleTouched(false);
      }

      async function refresh() {
        const data = await api({ action: 'list' });
        const activeList = Array.isArray(data?.projects) ? data.projects : [];
        const archivedList = Array.isArray(data?.archivedProjects) ? data.archivedProjects : [];
        setProjects(activeList);
        setArchived(archivedList);
        setCorruptedCount(Number(data?.corruptedCount || 0));
        setEnvironment(data?.environment || {
          ready: false,
          detected: [],
          configuredPath: '',
          bridge: { host: '127.0.0.1', port: 9876, hasToken: false, connected: false },
          polyHavenEnabled: false,
          node: '',
          platform: '',
          hint: '',
        });
        if (Array.isArray(data?.templates) && data.templates.length) {
          setTemplates(data.templates);
        }
        const current = latest.current;
        if (!current.dirty && current.project?.id) {
          const updated = activeList.find(row => row.id === current.project.id);
          if (updated) {
            setProject(updated);
            syncFields(fieldsOf(updated));
          }
        }
        if (Array.isArray(data?.jobs)) {
          setJob(prev =>
            data.jobs.find(row => row.id === prev?.id) ||
            data.jobs.filter(row => row.state === 'running').at(-1) ||
            prev ||
            data.jobs.at(-1) ||
            null,
          );
        }
      }

      useEffect(() => {
        refresh().catch(e => setError(e));
      }, []);

      useEffect(() => {
        if (project || creating || archiveTarget || trashTarget) return undefined;
        let inflight = false;
        let cancelled = false;
        function syncLibrary() {
          if (cancelled || inflight || busyRef.current || (typeof document !== 'undefined' && document.visibilityState === 'hidden')) return;
          inflight = true;
          refresh().catch(() => { /* silent background sync */ }).finally(() => { inflight = false; });
        }
        const onFocus = () => syncLibrary();
        const onVisibility = () => {
          if (typeof document === 'undefined' || document.visibilityState !== 'hidden') syncLibrary();
        };
        if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('focus', onFocus);
        if (typeof document !== 'undefined' && document.addEventListener) document.addEventListener('visibilitychange', onVisibility);
        const timer = typeof setInterval === 'function' ? setInterval(syncLibrary, 8000) : null;
        timer?.unref?.();
        return () => {
          cancelled = true;
          if (timer != null && typeof clearInterval === 'function') clearInterval(timer);
          if (typeof window !== 'undefined' && window.removeEventListener) window.removeEventListener('focus', onFocus);
          if (typeof document !== 'undefined' && document.removeEventListener) document.removeEventListener('visibilitychange', onVisibility);
        };
      }, [!!project, creating, !!archiveTarget, !!trashTarget]);

      useEffect(() => {
        if (!job || job.state !== 'running') return undefined;
        const tick = setInterval(() => setElapsedTick(v => (v + 1) % 100000), 1000);
        return () => clearInterval(tick);
      }, [job?.id, job?.state]);

      useEffect(() => {
        if (!job || job.state !== 'running') return undefined;
        let live = true;
        let polling = false;
        let consecutiveFailures = 0;
        const timer = setInterval(async () => {
          if (polling) return;
          polling = true;
          try {
            const next = await api({ action: 'job', job: job.id, id: job.id });
            if (!live) return;
            consecutiveFailures = 0;
            setJob(next);
            if (next.state !== 'running') {
              await refresh();
              if (next.state === 'done') {
                if (next.kind === 'preview_still') setStageView('still');
                else if (next.kind === 'contact_sheet') setStageView('contact_sheet');
                else if (next.kind === 'render_animation') setStageView('animation');
                else if (next.kind === 'pipeline') {
                  if (next.pipeline?.stoppedEarly) {
                    const reasonText =
                      lang === 'en' && /[\u3400-\u9fff]/.test(String(next.pipeline.stopReason || ''))
                        ? 'critical scene error found'
                        : next.pipeline.stopReason || t('检测到严重场景错误', 'critical scene error found');
                    setNotice(
                      t('全流程在 QC-3D 体检阶段提前中止：', 'Pipeline stopped during QC-3D audit: ') + reasonText,
                    );
                  } else {
                    if (next.pipeline?.primaryRenderId) setStageView('still');
                    else if (next.pipeline?.contactSheetId) setStageView('contact_sheet');
                    const count = Array.isArray(next.pipeline?.artifactIds) ? next.pipeline.artifactIds.length : 0;
                    const qcTag = next.pipeline?.qc ? ' · QC-3D ' + next.pipeline.qc.score + '/' + next.pipeline.qc.grade : '';
                    setNotice(
                      t(
                        `一键全流程完成（生成 ${count} 项产物${qcTag}）。`,
                        `Production pipeline completed (${count} artifacts${qcTag}).`,
                      ),
                    );
                  }
                }
              }
            }
          } catch (e) {
            if (!live) return;
            consecutiveFailures += 1;
            const gone = e?.code === 'JOB_NOT_FOUND' || /不存在/.test(e?.message || '');
            // Tolerate up to 3 consecutive transient network hiccups before surfacing poll error.
            if (gone || consecutiveFailures > 3) {
              setError(e);
              setJob(null);
            }
          } finally {
            polling = false;
          }
        }, 900);
        return () => {
          live = false;
          clearInterval(timer);
        };
      }, [job?.id, job?.state]);

      async function perform(fn) {
        if (busyRef.current) return undefined;
        busyRef.current = true;
        setBusy(true);
        setError('');
        setNotice('');
        try {
          return await fn();
        } catch (e) {
          setError(e);
          if (e?.status === 409 || e?.code === 'CONFLICT') setConflict(true);
          return undefined;
        } finally {
          busyRef.current = false;
          setBusy(false);
        }
      }

      async function openProject(id) {
        try {
          const next = await api({ action: 'get', id });
          setProject(next);
          syncFields(fieldsOf(next));
          setCreating(false);
          setDirty(false);
          setConflict(false);
          setPending(null);
          setArchiveReview(false);
          setStageView('stage');
        } catch (e) {
          if (e?.status === 404 || e?.code === 'PROJECT_NOT_FOUND') {
            await refresh().catch(() => {});
            if (latest.current.project?.id === id) {
              setProject(null);
              setCreating(false);
              setDirty(false);
            }
          }
          throw e;
        }
      }

      function navigate(target) {
        if (dirty) {
          setPending(target);
          return;
        }
        perform(() => move(target));
      }

      async function move(target) {
        if (target === 'new' || (target && typeof target === 'object' && target.newTemplate)) {
          const next = emptyFields();
          if (target && typeof target === 'object' && target.newTemplate) {
            const tpl = templates.find(item => item.id === target.newTemplate);
            next.template = target.newTemplate;
            if (tpl) {
              next.engine = tpl.recommendedEngine || next.engine;
              next.cameraPreset = tpl.defaultCamera || next.cameraPreset;
              next.lightingPreset = tpl.defaultLighting || next.lightingPreset;
              next.materialPreset = tpl.defaultMaterial || next.materialPreset;
              next.frameEnd = tpl.defaultFrames || next.frameEnd;
              next.samples = next.engine === 'CYCLES' ? 64 : next.engine === 'WORKBENCH' ? 16 : 32;
            }
          }
          setProject(null);
          syncFields(next);
          setCreating(true);
          setEditorTab('studio');
          setStageView('stage');
        } else if (target === 'list') {
          setProject(null);
          setCreating(false);
          await refresh();
        } else {
          await openProject(target);
        }
        setDirty(false);
        setPending(null);
      }

      async function save() {
        const payload = project
          ? { action: 'update', id: project.id, revision: project.revision, fields }
          : { action: 'create', fields };
        const next = await api(payload);
        setProject(next);
        syncFields(fieldsOf(next));
        setCreating(false);
        setDirty(false);
        setConflict(false);
        setNotice(t('3D 工程已保存。', '3D project saved.'));
        await refresh();
        return next;
      }

      async function uploadFile(file) {
        if (!file) return;
        await perform(async () => {
          if (!project || dirty) {
            throw new Error(t('请先保存工程，再上传 3D 素材。', 'Save your project before uploading assets.'));
          }
          if (file.size > MAX_ASSET_BYTES) {
            throw new Error(t('单个素材不能超过 50 MB。', 'Each asset must be at most 50 MB.'));
          }
          const response = await fetch(new URL(ROUTE + '/upload', document.baseURI), {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
              'content-type': 'application/octet-stream',
              'x-dsh-blender-studio': '1',
              'x-project-id': project.id,
              'x-project-revision': String(project.revision),
              'x-file-name': encodeURIComponent(file.name),
            },
            body: file,
          });
          let result;
          try {
            result = await response.json();
          } catch {
            throw new Error(t('无法读取上传响应，请检查是否已重启 DSH。', 'Could not parse upload response.'));
          }
          if (!response.ok || !result.ok) {
            const e = new Error(result.message || t('上传未完成', 'Upload failed'));
            e.status = response.status;
            if (result.code) e.code = result.code;
            throw e;
          }
          setProject(result.value);
          setNotice(t('素材副本已保存至工程目录，原文件不受影响。', 'Asset copy saved to the project; original file unchanged.'));
        });
      }

      async function uploadAsset(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        await uploadFile(file);
        event.target.value = '';
      }

      async function duplicateProject(item) {
        if (!item) return;
        await perform(async () => {
          let cloned;
          try {
            cloned = await api({ action: 'duplicate', id: item.id });
          } catch (e) {
            if (e?.status === 404 || e?.code === 'PROJECT_NOT_FOUND') {
              await refresh().catch(() => {});
            }
            throw e;
          }
          await refresh();
          if (cloned?.id) {
            setProject(cloned);
            syncFields(fieldsOf(cloned));
            setCreating(false);
            setDirty(false);
            setConflict(false);
            setEditorTab('studio');
            setStageView('stage');
          }
          setNotice(t('已复制 3D 工程：', 'Duplicated 3D project: ') + (cloned?.title || item.title));
        });
      }

      async function startJob(action, extra = {}) {
        return perform(async () => {
          if (!project) {
            throw new Error(t('请先保存工程，再启动 Blender 任务。', 'Save your project before running Blender jobs.'));
          }
          if (dirty && action !== 'run_script') {
            throw new Error(t('当前有未保存修改，请先点击「保存工程」。', 'Save pending changes before running this job.'));
          }
          const nextJob = await api({ action, id: project.id, revision: project.revision, ...extra });
          if (nextJob && nextJob.id) {
            setJob(nextJob);
            if (nextJob.state !== 'running') {
              await refresh();
            }
          } else {
            await refresh();
          }
          return nextJob;
        });
      }

      async function openInBlenderGui() {
        return perform(async () => {
          if (!project || dirty) {
            throw new Error(t('请先保存工程再在桌面 Blender 中打开。', 'Save your project before opening it in Blender.'));
          }
          const res = await api({ action: 'open_gui', id: project.id, revision: project.revision });
          if (res?.job?.id) setJob(res.job);
          setNotice(t('已请求在本地 Blender 桌面端打开工程。', 'Requested launching this project in desktop Blender.'));
        });
      }

      async function saveCheckpoint(note = '') {
        return perform(async () => {
          if (!project) {
            throw new Error(t('请先保存工程，再创建脚本快照。', 'Save your project before creating a script checkpoint.'));
          }
          const cleaned = String(note || '').trim().slice(0, 120);
          const next = await api({
            action: 'save_checkpoint',
            id: project.id,
            revision: project.revision,
            ...(cleaned ? { note: cleaned } : {}),
          });
          if (next?.id) {
            setProject(next);
            if (!dirty) syncFields(fieldsOf(next));
          }
          await refresh();
          setNotice(t('已保存当前脚本版本快照。', 'Script checkpoint saved.'));
          return next;
        });
      }

      async function restoreCheckpoint(checkpointId) {
        return perform(async () => {
          if (!project || !checkpointId) return undefined;
          const next = await api({
            action: 'restore_checkpoint',
            id: project.id,
            revision: project.revision,
            checkpointId,
          });
          if (next?.id) {
            setProject(next);
            syncFields(fieldsOf(next));
            setDirty(false);
            setConflict(false);
          }
          await refresh();
          setNotice(t('已回滚至所选脚本版本快照。', 'Restored selected script checkpoint.'));
          return next;
        });
      }

      async function archiveProject(target = project) {
        if (!target) return;
        try {
          await api({ action: 'archive', id: target.id, revision: target.revision, confirmed: true });
        } catch (e) {
          if (e?.status === 404 || e?.code === 'PROJECT_NOT_FOUND') {
            setArchiveReview(false);
            setArchiveTarget(null);
            if (project?.id === target.id) {
              setProject(null);
              setCreating(false);
              setDirty(false);
            }
            await refresh().catch(() => {});
          }
          throw e;
        }
        setArchiveReview(false);
        setArchiveTarget(null);
        if (project?.id === target.id) {
          setProject(null);
          setCreating(false);
          setDirty(false);
        }
        await refresh();
        setNotice(t('工程已归档，素材与渲染成品全部保留。', 'Project archived. Assets and renders are preserved.'));
      }

      async function trashProject(target = trashTarget) {
        if (!target?.project) return;
        const row = target.project;
        let alreadyMissing = false;
        try {
          await api({
            action: 'trash',
            id: row.id,
            revision: row.revision,
            archived: Boolean(target.archived),
            confirmed: true,
          });
        } catch (e) {
          if (e?.status === 404 || e?.code === 'PROJECT_NOT_FOUND') {
            alreadyMissing = true;
          } else {
            throw e;
          }
        }
        setTrashTarget(null);
        setArchiveReview(false);
        setArchiveTarget(null);
        if (project?.id === row.id) {
          setProject(null);
          setCreating(false);
          setDirty(false);
        }
        await refresh().catch(() => {});
        setNotice(
          alreadyMissing
            ? t('原 3D 工程目录已不存在，已从列表清理。', '3D project folder was already missing on disk; removed the stale entry from the list.')
            : t('3D 工程已移入系统回收站，可在系统回收站还原。', '3D project moved to the system Recycle Bin. Restore it from your OS Recycle Bin if needed.'),
        );
      }

      async function copyTourPrompt(text) {
        try {
          if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            setNotice(t('已复制对话指令，可直接粘贴到聊天框发送。', 'Prompt copied. Paste it into chat to start creating.'));
            return true;
          }
        } catch { /* fallback */ }
        try {
          const ta = document.createElement('textarea');
          ta.value = String(text);
          ta.setAttribute('readonly', '');
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.append?.(ta);
          ta.select?.();
          const ok = typeof document.execCommand === 'function' ? document.execCommand('copy') : true;
          ta.remove?.();
          if (ok) setNotice(t('已复制对话指令，可直接粘贴到聊天框发送。', 'Prompt copied. Paste it into chat to start creating.'));
          return ok;
        } catch {
          return false;
        }
      }

      // Field validation
      const titleTrimmed = String(fields.title || '').trim();
      const titleValid = titleTrimmed.length >= 1 && titleTrimmed.length <= 72;
      const descValid = String(fields.description || '').length <= 600;
      const headlineValid = String(fields.headline || '').length <= 48;
      const samplesValid = Number.isInteger(fields.samples) && fields.samples >= 4 && fields.samples <= 1024;
      const framesValid =
        Number.isInteger(fields.frameStart) &&
        Number.isInteger(fields.frameEnd) &&
        fields.frameStart >= 1 &&
        fields.frameEnd >= fields.frameStart &&
        fields.frameEnd <= fields.frameStart + 600;
      const colorValid = /^#[0-9a-fA-F]{6}$/.test(String(fields.accentColor || '').trim());
      const scriptBytes = utf8ByteLength(fields.customScript || '');
      const scriptValid = scriptBytes <= MAX_SCRIPT_BYTES;
      const canSave = titleValid && descValid && headlineValid && samplesValid && framesValid && colorValid && scriptValid;
      const saveHint = !titleValid
        ? t('请填写 1–72 字符的工程标题。', 'Enter a title between 1 and 72 characters.')
        : !descValid
        ? t('描述最多 600 字符。', 'Description is limited to 600 characters.')
        : !headlineValid
        ? t('3D 主标题最多 48 字符。', '3D headline is limited to 48 characters.')
        : !samplesValid
        ? t('采样数需为 4–1024 的整数。', 'Samples must be an integer between 4 and 1024.')
        : !framesValid
        ? t('帧范围需满足起始 ≥1、结束 ≥起始且跨度 ≤600。', 'Frames must start at ≥1 with span ≤600.')
        : !colorValid
        ? t('主题色需为 #RRGGBB 格式。', 'Accent color must be #RRGGBB.')
        : !scriptValid
        ? t('自定义脚本超出 256 KB 上限。', 'Custom script exceeds 256 KB.')
        : project && !dirty
        ? t('当前没有未保存修改。', 'No unsaved changes.')
        : null;

      const tourStorageKey = 'dsh-blender-studio:tour.v1';
      const tourSteps = [
        {
          id: 'studio-entry',
          selector: project || creating ? '[data-tour="blender-mode"]' : '[data-tour="blender-create"]',
          fallback: '.w-header-actions',
          side: 'bottom',
          title: t('新建 3D 工程 · 工作室 / 表单双模式', 'New 3D Scene · Studio / Form Modes'),
          desc: t(
            '点击顶栏「新建 3D 工程」或打开现有工程，即可进入 OP-DSH 3D 工作室（随时一键切回表单模式），也可复制下方指令让 AI 自动建景并出图。',
            'Click New 3D Scene or open a project to enter the OP-DSH 3D Studio (toggle to Form anytime), or copy the prompt below into chat.',
          ),
          prompt: t(
            '帮我在 dsh-blender-studio 中创建一个釉面陶瓷质感智能耳机产品展台 3D 场景，配置三点棚拍布光并渲染一张四视角质检图',
            'Create a ceramic-gloss wireless headphones product studio 3D scene in dsh-blender-studio with 3-point lighting and render a 4-view QC sheet',
          ),
          promptLabel: t('复制 3D 建模指令', 'Copy 3D scene prompt'),
        },
        {
          id: 'viewport-stage',
          selector: '[data-tour="blender-stage"]',
          fallback: '[data-tour="blender-projects"], .w-empty',
          side: 'bottom',
          title: t('交互式 3D 草图舞台 & 四视角视觉质检', 'Interactive 3D Stage & 4-View Visual QC'),
          desc: t(
            '直接在画布拖拽旋转轨道视角、滚轮缩放、切换相机预设或开启 360° 转台；一键渲染静帧 PNG、2×2 四视角质检拼图与 MP4 动画，在同一视口无缝切换检视。',
            'Drag directly on the canvas to orbit, scroll to zoom, snap camera presets, or play Turntable. Render stills, 2×2 4-View QC contact sheets, and MP4 animations right in the monitor.',
          ),
        },
        {
          id: 'inspector-script',
          selector: project || creating ? '[data-tour="blender-inspector"]' : '.dsh-style-switcher',
          fallback: '.w-tabs',
          side: project || creating ? 'left' : 'bottom',
          title: t('机械参数台 · 场景大纲 · bpy 脚本检查器', 'Mechanical Inspector · Outliner · bpy Script'),
          desc: t(
            '右侧可调画幅、渲染引擎（EEVEE / Cycles / Workbench）、采样与布光材质，并可切换到「场景大纲」与「bpy 脚本」编辑器，支持安全校验与自定义 Python 建模。',
            'Tune aspect, engine (EEVEE / Cycles / Workbench), samples, lighting & materials on the right, or switch to Scene Outliner and custom bpy Script mode with safety validation.',
          ),
        },
        {
          id: 'bridge-env',
          selector: '[role="tab"][data-tab-id="bridge-env"]',
          fallback: '.w-header-actions',
          side: 'bottom',
          title: t('Headless CLI 无头渲染 + Live Bridge 实时联动', 'Headless CLI + Live Socket Bridge'),
          desc: t(
            '默认通过本机 Blender 无头 CLI 出图与导出 GLB/FBX/OBJ/STL；在「桥接与环境」下载安装单文件 Add-on 后，还可实时抓取 Blender 视口与同步场景。',
            'Render stills, animations, and GLB/FBX/OBJ/STL via headless Blender CLI out of the box, or install the single-file Live Bridge add-on in Bridge & Env for live viewport sync.',
          ),
          prompt: t(
            '检查 dsh-blender-studio 的本机 Blender 环境与 Live Bridge 连接状态，并告诉我当前可用的渲染引擎与版本',
            'Check dsh-blender-studio local Blender installation and Live Bridge status, and report available engines and version',
          ),
          promptLabel: t('复制环境自检指令', 'Copy health-check prompt'),
        },
      ];

      const activeViewTab = project || creating ? editorTab : libraryTab;
      const assetArtifactCount = (project?.assets?.length || 0) + (project?.artifacts?.length || 0);
      const headerTabsConfig = {
        label: t('Blender 3D 工作台视图', 'Blender 3D workbench views'),
        value: activeViewTab,
        onChange: project || creating ? setEditorTab : setLibraryTab,
        items: project || creating
          ? [
              { id: 'studio', icon: 'cube', 'data-tour': 'blender-tab-studio', label: t('3D 工作室', 'Studio') },
              { id: 'assets-exports', icon: 'box', label: t('素材与成品', 'Assets'), count: assetArtifactCount },
              { id: 'bridge-env', icon: 'plug', label: t('桥接与环境', 'Bridge & Env') },
            ]
          : [
              { id: 'projects', icon: 'cube', 'data-tour': 'blender-tab-projects', label: t('3D 工程', 'Projects'), count: projects.length },
              { id: 'archives', icon: 'folder', label: t('已归档', 'Archived'), count: archived.length },
              { id: 'bridge-env', icon: 'plug', label: t('桥接与环境', 'Bridge & Env') },
            ],
      };

      const headerMeta = project || creating
        ? h(
            'span',
            { className: 'w-tag dbw-header-meta' },
            project ? (dirty ? t('未保存', 'Unsaved') : 'R' + project.revision) : t('新建', 'New'),
          )
        : environment?.active
        ? h('span', { className: 'w-tag dbw-header-meta' }, 'Blender ' + environment.active.version)
        : null;

      const combinedCss = [
        CLIENT_BASE_CSS,
        typeof BLENDER_LIBRARY_CSS === 'string' ? BLENDER_LIBRARY_CSS : '',
        typeof BLENDER_STUDIO_CSS === 'string' ? BLENDER_STUDIO_CSS : '',
        typeof BLENDER_ASSETS_CSS === 'string' ? BLENDER_ASSETS_CSS : '',
        typeof BLENDER_BRIDGE_CSS === 'string' ? BLENDER_BRIDGE_CSS : '',
      ].join('\n');

      if (!environment) {
        return h(
          W.Page,
          {
            workbench,
            lang,
            icon: 'cube',
            tourSteps,
            tourStorageKey,
            onTourCopyPrompt: copyTourPrompt,
            title: t('Blender 3D 工作室', 'Blender Studio'),
            subtitle: t('交互式 3D 建模、四视角视觉质检、动画渲染与 Live Bridge 联动。', 'Interactive 3D staging, 4-view visual QC, animation rendering & Live Bridge.'),
            className: 'dbw blender-workbench',
            'aria-busy': busy ? 'true' : undefined,
          },
          h(W.Styles, { id: 'dsh-blender-studio-workbench-styles', cssText: combinedCss }),
          error
            ? h(
                W.Empty,
                {
                  title: t('暂时无法读取 3D 工程', '3D projects are unavailable'),
                  icon: 'cube',
                  action: h(
                    W.Button,
                    { icon: 'refresh', 'aria-busy': busy ? 'true' : undefined, disabled: busy, onClick: () => perform(refresh) },
                    t('重新加载', 'Reload'),
                  ),
                },
                blenderError(error, lang === 'en'),
              )
            : h(
                'div',
                { className: 'dbw-loading-skeleton' },
                h(W.Skeleton, { variant: 'card', label: t('正在读取 3D 工程与 Blender 环境…', 'Loading 3D projects and Blender environment…') }),
                h(W.Skeleton, { variant: 'row' }),
                h(W.Skeleton, { variant: 'row' }),
                h(W.Skeleton, { variant: 'row' }),
              ),
        );
      }

      const jobPct = Math.max(0, Math.min(100, Math.round(Number(job?.progress || 0))));
      const jobStartMs = job?.startedAt ? Date.parse(job.startedAt) : NaN;
      const jobEndMs = job?.finishedAt ? Date.parse(job.finishedAt) : Date.now();
      const jobElapsedSec = Number.isFinite(jobStartMs) ? Math.max(0, Math.floor(((Number.isFinite(jobEndMs) ? jobEndMs : Date.now()) - jobStartMs) / 1000)) : null;

      return h(
        W.Page,
        {
          workbench,
          lang,
          icon: 'cube',
          headerMeta,
          tabs: headerTabsConfig,
          tourSteps,
          tourStorageKey,
          onTourCopyPrompt: copyTourPrompt,
          title: t('Blender 3D 工作室', 'Blender Studio'),
          subtitle: t('交互式 3D 建模、四视角视觉质检、动画渲染与 Live Bridge 联动。', 'Interactive 3D staging, 4-view visual QC, animation rendering & Live Bridge.'),
          className: 'dbw blender-workbench',
          'aria-busy': running ? 'true' : undefined,
          actions: h(
            React.Fragment,
            null,
            project || creating
              ? h(
                  W.Button,
                  { icon: 'left', disabled: running, title: t('返回工程库', 'Back to projects'), onClick: () => navigate('list') },
                  t('返回', 'Back'),
                )
              : h(
                  W.Button,
                  {
                    icon: 'plus',
                    variant: 'primary',
                    'data-tour': 'blender-create',
                    disabled: running,
                    onClick: () => navigate('new'),
                  },
                  t('新建 3D 工程', 'New Scene'),
                ),
            project || creating
              ? h(
                  W.Button,
                  {
                    variant: 'primary',
                    icon: 'check',
                    disabled: running || !canSave || (!!project && !dirty),
                    title: saveHint || t('保存 3D 工程', 'Save 3D project'),
                    onClick: () => perform(save),
                  },
                  t('保存工程', 'Save'),
                )
              : h(W.IconButton, {
                  icon: 'refresh',
                  label: t('刷新工程库', 'Refresh projects'),
                  'aria-busy': busy ? 'true' : undefined,
                  disabled: running,
                  onClick: () => perform(refresh),
                }),
            project
              ? h(
                  W.Button,
                  {
                    icon: 'download',
                    disabled: running || dirty || !environment.ready,
                    title: !environment.ready
                      ? t('请先在「桥接与环境」配置本机 Blender。', 'Configure Blender in Bridge & Env first.')
                      : dirty
                      ? t('请先保存修改再导出 3D 模型。', 'Save changes before exporting 3D models.')
                      : t('导出 GLB / FBX / OBJ / STL / .blend', 'Export GLB / FBX / OBJ / STL / .blend'),
                    onClick: () => setExportOpen(true),
                  },
                  t('导出 3D', 'Export'),
                )
              : null,
          ),
        },
        h(W.Styles, { id: 'dsh-blender-studio-workbench-styles', cssText: combinedCss }),

        // Status alerts
        h(
          W.Status,
          { tone: 'error' },
          conflict
            ? t(
                '工程已在其他窗口或工具调用中更新，当前修改尚未保存。请先复制需要保留的内容，再重新载入最新修订。',
                'This project changed elsewhere and your edits are unsaved. Copy what you need, then reload the latest revision.',
              )
            : error && blenderError(error, lang === 'en'),
        ),
        h(W.Status, { tone: 'success' }, notice),
        corruptedCount > 0
          ? h(
              W.Status,
              { tone: 'warn' },
              t(
                `检测到 ${corruptedCount} 个损坏工程目录（原文件已隔离保留），其余工程不受影响。`,
                `Detected ${corruptedCount} damaged project folder(s) (original files preserved). Other projects remain unaffected.`,
              ),
            )
          : null,

        conflict && project
          ? h(
              'div',
              { className: 'w-toolbar' },
              h(
                W.Button,
                { icon: 'refresh', disabled: running, onClick: () => setPending(project.id) },
                t('重新载入最新修订（放弃当前输入）', 'Reload latest revision (discard my input)'),
              ),
              h(
                W.Button,
                { variant: 'ghost', disabled: running, onClick: () => setConflict(false) },
                t('暂留当前输入', 'Keep my input for now'),
              ),
            )
          : null,

        (project || creating) && !environment.ready
          ? h(
              W.Status,
              { tone: 'warn' },
              t(
                '尚未探测到本机 Blender 可执行程序；你仍可在实时 3D 舞台中设计参数并保存工程，需要出图或导出时请配置 Blender 路径。',
                'Local Blender executable not detected yet. You can still stage and save projects here; configure Blender in Bridge & Env to render or export.',
              ),
              ' ',
              h(
                W.Button,
                { variant: 'ghost', icon: 'right', onClick: () => setEditorTab('bridge-env') },
                t('前往配置', 'Configure Blender'),
              ),
            )
          : null,

        // Active / latest job banner
        job
          ? h(
              'div',
              {
                className: 'dbw-job-banner',
                'data-dsh-card': '',
                'data-state': job.state,
                role: job.state === 'failed' ? 'alert' : 'status',
                'aria-live': job.state === 'failed' ? 'assertive' : 'polite',
              },
              h('strong', null, jobKindLabel(job.kind, t) + ' · ' + formatJobStage(job, lang, t)),
              jobElapsedSec !== null
                ? h('span', { className: 'dbw-job-elapsed', 'data-job-elapsed': 'true', 'aria-label': t('任务已用时', 'Elapsed time') }, formatElapsed(jobElapsedSec))
                : null,
              job.state === 'running'
                ? h(
                    React.Fragment,
                    null,
                    h(
                      'div',
                      {
                        className: 'dsh-progress dbw-job-progress',
                        role: 'progressbar',
                        'aria-valuemin': 0,
                        'aria-valuemax': 100,
                        'aria-valuenow': jobPct,
                        'aria-label': t('Blender 任务进度', 'Blender job progress'),
                      },
                      h('div', { className: 'dsh-progress-bar', style: { '--dsh-progress-value': jobPct + '%' } }),
                    ),
                    h('span', { className: 'dbw-job-pct' }, jobPct + '%'),
                  )
                : null,
              job.state === 'running'
                ? h(
                    W.Button,
                    {
                      icon: 'close',
                      disabled: busy,
                      onClick: () =>
                        perform(async () => {
                          await api({ action: 'cancel', job: job.id, id: job.id });
                          setNotice(t('已发送取消请求，正在安全终止 Blender 进程。', 'Cancel requested; stopping Blender process safely.'));
                        }),
                    },
                    t('取消任务', 'Cancel job'),
                  )
                : null,
              job.state === 'failed' && project && !dirty
                ? h(
                    W.Button,
                    {
                      variant: 'primary',
                      icon: 'refresh',
                      disabled: running,
                      onClick: () => startJob(job.kind === 'export_model' ? 'export_model' : job.kind, job.kind === 'export_model' ? { format: exportFormat } : {}),
                    },
                    t('重试任务', 'Retry job'),
                  )
                : null,
              job.state !== 'running'
                ? h(
                    W.Button,
                    { variant: 'ghost', size: 'sm', icon: 'close', onClick: () => setJob(null) },
                    t('收起', 'Dismiss'),
                  )
                : null,
              job.kind === 'pipeline'
                ? (() => {
                    const stepIdx = computePipelineStepIndex(job);
                    const stopped = Boolean(job.pipeline?.stoppedEarly);
                    const doneAll = job.state === 'done' && !stopped;
                    const steps = [
                      t('体检', 'QC-3D'),
                      t('四视角', '4-View'),
                      t('渲染', 'Render'),
                      t('导出 GLB', 'GLB'),
                    ];
                    const items = [];
                    steps.forEach((label, idx) => {
                      if (idx > 0) items.push(h('span', { key: 'arr-' + idx, className: 'dbw-pipe-arrow', 'aria-hidden': 'true' }, '→'));
                      const st = stopped
                        ? idx === 0
                          ? 'stopped'
                          : 'pending'
                        : doneAll || idx < stepIdx
                        ? 'done'
                        : idx === stepIdx && job.state === 'running'
                        ? 'active'
                        : 'pending';
                      items.push(h('span', { key: 'st-' + idx, className: 'dbw-pipe-step', 'data-step-state': st }, label));
                    });
                    const summaryBits = [];
                    if (job.pipeline?.qc) summaryBits.push('QC-3D ' + job.pipeline.qc.score + '/' + job.pipeline.qc.grade);
                    if (Array.isArray(job.pipeline?.artifactIds) && job.pipeline.artifactIds.length > 0) {
                      summaryBits.push(t(job.pipeline.artifactIds.length + ' 项产物', job.pipeline.artifactIds.length + ' artifacts'));
                    }
                    if (stopped) summaryBits.push(t('已提前中止', 'Stopped early'));
                    if (summaryBits.length > 0) {
                      items.push(h('span', { key: 'res', className: 'dbw-pipe-result' }, summaryBits.join(' · ')));
                    }
                    return h('div', { className: 'dbw-pipeline-steps', 'data-pipeline-steps': 'true' }, ...items);
                  })()
                : null,
              (Array.isArray(job.lines) && job.lines.length > 0) || job.scriptOutput
                ? h(
                    'details',
                    null,
                    h('summary', null, t('查看 Blender 运行日志', 'Show Blender job log') + ' (' + (job.lines?.length || 0) + ')'),
                    job.scriptOutput ? h('pre', null, job.scriptOutput) : null,
                    job.lines?.length ? h('pre', null, job.lines.join('\n')) : null,
                  )
                : null,
            )
          : null,

        // Main tab panel
        h(
          'div',
          {
            key: (project || creating ? 'ed:' : 'lib:') + activeViewTab,
            className: 'w-tab-panel dsh-tab-panel',
            'data-dsh-tab-panel': '',
            role: 'tabpanel',
          },
          !project && !creating
            ? libraryTab === 'bridge-env'
              ? h(BlenderBridgeEnvPanel, {
                  project: null,
                  dirty: false,
                  environment,
                  running,
                  busy,
                  perform,
                  refresh,
                  setNotice,
                  setError,
                  lang,
                  t,
                })
              : h(BlenderLibraryPanel, {
                  scope: libraryTab === 'archives' ? 'archives' : 'projects',
                  items: libraryTab === 'archives' ? archived : projects,
                  templates,
                  running,
                  busy,
                  dirty,
                  activeJob,
                  lang,
                  t,
                  onOpen: id => {
                    setEditorTab('studio');
                    navigate(id);
                  },
                  onCreate: tplId => navigate(tplId ? { newTemplate: tplId } : 'new'),
                  onDuplicate: duplicateProject,
                  onArchiveRequest: item => setArchiveTarget(item),
                  onTrashRequest: (item, isArchived) => setTrashTarget({ project: item, archived: Boolean(isArchived) }),
                  onRestore: item =>
                    perform(async () => {
                      try {
                        await api({ action: 'restore', id: item.id, revision: item.revision, confirmed: true });
                      } catch (e) {
                        if (e?.status === 404 || e?.code === 'PROJECT_NOT_FOUND') await refresh().catch(() => {});
                        throw e;
                      }
                      await refresh();
                      setEditorTab('studio');
                      await openProject(item.id);
                      setNotice(t('3D 工程已恢复至活跃列表。', '3D project restored to active list.'));
                    }),
                })
            : editorTab === 'bridge-env'
            ? h(BlenderBridgeEnvPanel, {
                project,
                dirty,
                environment,
                running,
                busy,
                perform,
                refresh,
                setNotice,
                setError,
                lang,
                t,
              })
            : editorTab === 'assets-exports'
            ? h(BlenderAssetsExportsPanel, {
                project,
                dirty,
                running,
                busy,
                activeJob,
                environment,
                fileRef,
                uploadAsset,
                uploadFile,
                perform,
                setProject,
                setNotice,
                setEditorTab,
                setStageView,
                setArchiveReview,
                onTrashRequest: (item, isArchived) => setTrashTarget({ project: item, archived: Boolean(isArchived) }),
                onExportFormat: fmt => {
                  setExportFormat(fmt);
                  setExportOpen(true);
                },
                refresh,
                lang,
                t,
              })
            : h(BlenderStudioPanel, {
                project,
                fields,
                setFields,
                dirty,
                setDirty,
                setError,
                setNotice,
                syncFields,
                fieldsOf,
                templates,
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
                scriptBytes,
                scriptValid,
                canSave,
                onSave: () => perform(save),
                onSaveCheckpoint: saveCheckpoint,
                onRestoreCheckpoint: restoreCheckpoint,
                startJob,
                openInBlenderGui,
                onOpenExport: () => setExportOpen(true),
                setEditorTab,
                perform,
                controlId,
                lang,
                t,
              }),
        ),

        // Export 3D Model Dialog
        project && exportOpen
          ? h(
              W.Dialog,
              {
                className: 'dbw blender-dialog',
                title: t('导出 3D 模型与工程', 'Export 3D Model'),
                closeLabel: t('取消导出', 'Cancel export'),
                busy: running,
                onClose: () => setExportOpen(false),
              },
              h(
                'p',
                null,
                t(
                  '选择导出格式，通过本机 Blender Headless CLI 导出基于当前已保存修订的模型文件。',
                  'Select an output format to export the saved project revision via local Blender CLI.',
                ),
              ),
              h(
                'div',
                { className: 'dbw-export-grid', role: 'group', 'aria-label': t('选择导出格式', 'Select export format') },
                EXPORT_FORMATS.map(fmt =>
                  h(
                    'button',
                    {
                      key: fmt.id,
                      type: 'button',
                      className: 'dbw-export-choice',
                      'aria-pressed': exportFormat === fmt.id,
                      onClick: () => setExportFormat(fmt.id),
                    },
                    h('strong', null, fmt.label),
                    h('span', null, lang === 'en' ? fmt.descEn : fmt.descZh),
                  ),
                ),
              ),
              h(
                'ul',
                { className: 'dbw-checks' },
                h('li', null, t('工程：', 'Project: ') + project.title + ' (R' + project.revision + ')'),
                h('li', null, t('模板：', 'Template: ') + (templates.find(x => x.id === project.template)?.[lang === 'en' ? 'en' : 'zh'] || project.template)),
                h('li', null, t('引擎：', 'Engine: ') + project.engine + ' · ' + project.samples + ' samples'),
              ),
              h(
                'div',
                { className: 'w-toolbar' },
                h(
                  W.Button,
                  {
                    variant: 'primary',
                    icon: 'download',
                    disabled: running || dirty || !environment.ready,
                    onClick: () => {
                      setExportOpen(false);
                      startJob('export_model', { format: exportFormat });
                    },
                  },
                  t('开始导出 ', 'Export ') + exportFormat.toUpperCase(),
                ),
                h(W.Button, { disabled: running, onClick: () => setExportOpen(false) }, t('取消', 'Cancel')),
              ),
            )
          : null,

        // Unsaved changes navigation confirmation dialog
        pending
          ? h(
              W.Dialog,
              {
                className: 'dbw blender-dialog',
                title: t('有未保存的 3D 修改', 'Unsaved 3D changes'),
                closeLabel: t('留在当前', 'Stay here'),
                busy: running,
                onClose: () => setPending(null),
              },
              h('p', null, t('当前工程有尚未保存的修改，如何继续？', 'You have unsaved changes in this 3D project.')),
              conflict
                ? h(
                    W.Status,
                    { tone: 'error' },
                    t(
                      '此工程已在别处更新，直接保存会再次冲突。可放弃修改并载入最新修订，或留在当前复制代码。',
                      'This project changed elsewhere, so saving again would conflict. Discard and load latest, or stay to copy your edits.',
                    ),
                  )
                : null,
              h(
                'div',
                { className: 'w-toolbar' },
                h(
                  W.Button,
                  {
                    variant: 'primary',
                    icon: 'check',
                    disabled: running || conflict || !canSave,
                    onClick: () =>
                      perform(async () => {
                        await save();
                        await move(pending);
                      }),
                  },
                  t('保存后继续', 'Save and continue'),
                ),
                h(
                  W.Button,
                  { icon: 'close', disabled: running, onClick: () => perform(() => move(pending)) },
                  t('放弃修改并继续', 'Discard and continue'),
                ),
                h(W.Button, { variant: 'ghost', onClick: () => setPending(null) }, t('留在当前', 'Stay here')),
              ),
            )
          : null,

        // Archive confirmation dialog
        archiveTarget || (project && archiveReview)
          ? h(
              W.Dialog,
              {
                className: 'dbw blender-dialog',
                title: t('归档此 3D 工程', 'Archive this 3D project'),
                closeLabel: t('取消归档', 'Cancel archive'),
                busy: busy || activeJob,
                onClose: () => {
                  setArchiveReview(false);
                  setArchiveTarget(null);
                },
              },
              h(
                'p',
                null,
                t(
                  '归档后将从活跃列表移走，释放 30 个活跃槽位；工程配置、上传素材与所有渲染/导出成品全部保留，可随时在「已归档」恢复。',
                  'Archiving moves this project out of the 30 active slots while preserving all settings, uploaded assets, and rendered/exported artifacts.',
                ),
              ),
              h(
                'div',
                { className: 'w-toolbar' },
                h(
                  W.Button,
                  {
                    variant: 'primary',
                    icon: 'folder',
                    disabled: busy || dirty || activeJob,
                    onClick: () => perform(() => archiveProject(archiveTarget || project)),
                  },
                  t('确认归档', 'Confirm archive'),
                ),
                h(
                  W.Button,
                  {
                    disabled: busy,
                    onClick: () => {
                      setArchiveReview(false);
                      setArchiveTarget(null);
                    },
                  },
                  t('取消', 'Cancel'),
                ),
              ),
            )
          : null,

        // Move to OS Recycle Bin confirmation dialog
        trashTarget
          ? h(
              W.Dialog,
              {
                className: 'dbw blender-dialog',
                title: t('移入系统回收站', 'Move 3D project to Recycle Bin'),
                closeLabel: t('取消', 'Cancel'),
                busy: busy || activeJob,
                onClose: () => setTrashTarget(null),
              },
              h('p', null, h('strong', null, trashTarget.project.title)),
              h(
                'p',
                { className: 'w-muted' },
                t(
                  '将把该 3D 工程目录（含场景配置、上传素材副本与所有渲染/导出成品）移入系统回收站，可在系统回收站中还原。',
                  'Moves this 3D project folder (scene settings, uploaded asset copies, and rendered/exported artifacts) to your OS Recycle Bin / Trash where it can be restored.',
                ),
              ),
              h(
                'div',
                { className: 'w-toolbar' },
                h(
                  W.Button,
                  {
                    variant: 'danger',
                    icon: 'trash',
                    disabled: busy || dirty || activeJob,
                    onClick: () => perform(() => trashProject(trashTarget)),
                  },
                  t('确认移入回收站', 'Move to Recycle Bin'),
                ),
                h(W.Button, { disabled: busy, onClick: () => setTrashTarget(null) }, t('取消', 'Cancel')),
              ),
            )
          : null,
      );
    }

    function apply(ctx) {
      let locale;
      try {
        locale = ctx.get?.('locale') || ctx.locale;
      } catch { }
      const label = () => (isEnLocale(locale) ? 'Blender 3D' : 'Blender 3D 工作室');
      W.register(ctx, {
        id: 'dsh-blender-studio.workbench',
        label,
        icon: 'cube',
        component: Workbench,
        inject: () => ({ locale }),
        order: 67,
      });
      ctx.slots.inject('settings.section', () =>
        ctx.slots.register(
          { name: 'settings.section', id: 'dsh-blender-studio', order: 64, label, inject: () => ({ locale }) },
          Workbench,
        ),
      );
    }

    return { inject: ['slots', 'locale'], apply };
  },
});
