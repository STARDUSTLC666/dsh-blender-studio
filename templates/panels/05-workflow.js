// 05-workflow.js — 3D Production Workflow Recorder, Reusable Recipe Library, JSON Import/Export & Replay.

const BLENDER_WORKFLOW_CSS = `
.dbw .dbw-wf-grid { display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(0, 1fr); gap: 16px; align-items: start; }
@media (max-width: 960px) { .dbw .dbw-wf-grid { grid-template-columns: minmax(0, 1fr); } }
.dbw .dbw-wf-card {
  background: var(--dsw-alias-settings-card-fill, var(--w-canvas));
  border: var(--dsh-control-border-width, 1px) solid var(--w-border);
  border-radius: var(--dsw-radius-md, 12px);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}
.dbw .dbw-wf-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.dbw .dbw-wf-head h3 { margin: 0; font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 8px; color: var(--w-text); }
.dbw .dbw-wf-rec-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; background: var(--w-muted); flex: none; }
.dbw .dbw-wf-rec-dot[data-active="true"] { background: #ef4444; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.24); }
.dbw .dbw-wf-list { display: flex; flex-direction: column; gap: 8px; max-height: 440px; overflow-y: auto; padding-right: 2px; }
.dbw .dbw-wf-event {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 9px 11px;
  border-radius: var(--dsw-radius-sm, 9px);
  border: var(--dsh-control-border-width, 1px) solid var(--w-border);
  background: var(--w-bg);
  font-size: 12.5px;
  color: var(--w-text);
}
.dbw .dbw-wf-event input[type="checkbox"] { margin-top: 3px; flex: none; width: 14px; height: 14px; }
.dbw .dbw-wf-event-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.dbw .dbw-wf-event-title { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-weight: 500; }
.dbw .dbw-wf-event-meta { font-size: 11.5px; color: var(--w-muted); display: flex; gap: 8px; flex-wrap: wrap; }
.dbw .dbw-wf-recipe {
  border: var(--dsh-control-border-width, 1px) solid var(--w-border);
  border-radius: var(--dsw-radius-sm, 10px);
  padding: 12px;
  background: var(--w-bg);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dbw .dbw-wf-recipe-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.dbw .dbw-wf-recipe-title { font-weight: 600; font-size: 13.5px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; color: var(--w-text); }
.dbw .dbw-wf-recipe-desc { font-size: 12px; color: var(--w-muted); margin: 0; line-height: 1.48; }
.dbw .dbw-wf-steps-chain { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; font-size: 11px; color: var(--w-muted); }
.dbw .dbw-wf-chip {
  padding: 2px 8px;
  border-radius: 999px;
  border: var(--dsh-control-border-width, 1px) solid var(--w-border);
  background: var(--dsw-alias-bg-base, var(--w-canvas));
  color: var(--w-text);
  font-family: var(--dsh-font-mono, ui-monospace, monospace);
  font-size: 11px;
  line-height: 1.45;
}
.dbw .dbw-wf-chip[data-status="done"] {
  border-color: color-mix(in oklab, var(--dsw-alias-state-success-primary, #10b981) 46%, var(--w-border));
  background: color-mix(in oklab, var(--dsw-alias-state-success-primary, #10b981) 12%, var(--dsw-alias-bg-base, var(--w-canvas)));
  color: var(--dsw-alias-state-success-primary, #059669);
}
.dbw .dbw-wf-chip[data-status="failed"] {
  border-color: color-mix(in oklab, var(--dsw-alias-state-error-primary, #ef4444) 50%, var(--w-border));
  background: color-mix(in oklab, var(--dsw-alias-state-error-primary, #ef4444) 12%, var(--dsw-alias-bg-base, var(--w-canvas)));
  color: var(--dsw-alias-state-error-primary, #dc2626);
}
.dbw .dbw-wf-chip[data-status="skipped"] { opacity: 0.78; }
.dbw .dbw-wf-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: var(--dsw-radius-sm, 10px);
  border: 1px dashed var(--w-border);
  background: var(--w-bg);
}
.dbw .dbw-wf-overrides-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  padding: 8px 10px;
  border-radius: var(--dsw-radius-sm, 8px);
  border: var(--dsh-control-border-width, 1px) solid var(--w-border);
  background: var(--w-bg);
}
.dbw .dbw-wf-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.dbw .dbw-wf-input {
  width: auto;
  flex: 1 1 180px;
  min-width: 150px;
  border: var(--dsh-control-border-width, 1px) solid var(--w-border);
  border-radius: var(--dsw-radius-sm, 8px);
  background: var(--dsw-alias-bg-base, var(--w-canvas));
  color: var(--w-text);
  padding: 6px 10px;
  font-size: 12.5px;
  font-family: inherit;
}
.dbw .dbw-wf-input-full { width: 100%; flex: 1 1 100%; }
.dbw .dbw-wf-select {
  width: auto;
  flex: 1 1 165px;
  min-width: 150px;
  border: var(--dsh-control-border-width, 1px) solid var(--w-border);
  border-radius: var(--dsw-radius-sm, 8px);
  background: var(--dsw-alias-bg-base, var(--w-canvas));
  color: var(--w-text);
  padding: 5px 9px;
  font-size: 12px;
  font-family: inherit;
}
.dbw .dbw-wf-textarea {
  width: 100%;
  min-height: 92px;
  border: var(--dsh-control-border-width, 1px) solid var(--w-border);
  border-radius: var(--dsw-radius-sm, 8px);
  background: var(--dsw-alias-bg-base, var(--w-canvas));
  color: var(--w-text);
  padding: 8px 10px;
  font-family: var(--dsh-font-mono, ui-monospace, monospace);
  font-size: 11.5px;
  resize: vertical;
  box-sizing: border-box;
}
.dbw .dbw-wf-check { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: var(--w-muted); cursor: pointer; user-select: none; }
.dbw .dbw-wf-err { color: var(--dsw-alias-state-error-primary, #dc2626); }
`;

const WORKFLOW_REPLAYABLE_KINDS = new Set([
  'lookdev_update',
  'script_patch',
  'checkpoint_save',
  'inspect_scene',
  'preview_still',
  'contact_sheet',
  'render_shots',
  'render_animation',
  'export_model',
  'pipeline',
  'bridge_sync',
  'bridge_set_camera',
  'bridge_transform_object',
  'bridge_set_material',
]);

const WORKFLOW_LOOKDEV_KEYS = new Set([
  'engine', 'samples', 'aspect', 'resolutionScale', 'fps', 'frameStart', 'frameEnd',
  'cameraPreset', 'lightingPreset', 'materialPreset', 'accentColor', 'transparentBg',
  'lensMm', 'exposure', 'clayMode',
]);

const BUILTIN_WORKFLOW_EN = {
  'aaa-product-lookdev-pack': {
    name: 'AAA Product Studio Lookdev Pack',
    description: 'Standard 4-stage commercial studio workflow: QC-3D audit → Draft 4-view check → Studio 4-angle multi-shot pack → Cycles Beauty still + GLB export.',
  },
  'clay-silhouette-audit': {
    name: 'Clay Silhouette & 4-View Audit',
    description: 'Non-destructively enables matte clay override to audit silhouette, proportions, and bevels via QC-3D, 4-view sheet, and 3-angle shots without modifying saved PBR materials.',
  },
  'rapid-eevee-delivery': {
    name: 'Rapid EEVEE Preview + GLB/.blend Delivery',
    description: 'Fast design review loop: QC-3D check, Studio EEVEE hero still, clean backdrop-stripped GLB model, and packed editable .blend archive.',
  },
  'cycles-hero-delivery': {
    name: 'Cycles Hero Beauty Delivery',
    description: 'Final delivery workflow: save a pre-delivery script checkpoint, run Cycles OIDN Beauty pipeline (4-view + hero still + GLB), and export a packed .blend archive.',
  },
};

const WORKFLOW_CJK_RE = /[\u3400-\u9fff]/;

function isWorkflowEventReplayableUi(ev) {
  if (!ev || !WORKFLOW_REPLAYABLE_KINDS.has(ev.kind)) return false;
  const params = ev.params && typeof ev.params === 'object' ? ev.params : {};
  if (ev.kind === 'script_patch') {
    const hasEdits = Array.isArray(params.edits) && params.edits.length > 0;
    const hasFind = typeof params.find === 'string' && params.find.length > 0 && typeof params.replace === 'string';
    return hasEdits || hasFind;
  }
  if (ev.kind === 'lookdev_update') {
    const fields = params.fields && typeof params.fields === 'object' ? params.fields : params;
    return Object.keys(fields).some(k => WORKFLOW_LOOKDEV_KEYS.has(k));
  }
  return true;
}

function BlenderWorkflowPanel({
  project,
  workflows,
  recordingEnabled,
  job,
  running,
  busy,
  dirty,
  environment,
  setProject,
  setJob,
  setNotice,
  setError,
  perform,
  refresh,
  refreshWorkflows,
  lang = 'zh',
  t,
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [recipeName, setRecipeName] = useState('');
  const [recipeDesc, setRecipeDesc] = useState('');
  const [includePatches, setIncludePatches] = useState(true);
  const [coalesceLookdev, setCoalesceLookdev] = useState(true);
  const [overrideTier, setOverrideTier] = useState('');
  const [overrideExport, setOverrideExport] = useState('');
  const [overrideClay, setOverrideClay] = useState(false);
  const [exportedJson, setExportedJson] = useState('');
  const [exportedName, setExportedName] = useState('');
  const [importText, setImportText] = useState('');
  const [dryRunResult, setDryRunResult] = useState(null);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState('');

  // Reset project-scoped transient UI state whenever the active project changes
  useEffect(() => {
    setSelectedIds([]);
    setDryRunResult(null);
    setClearConfirm(false);
    setDeleteConfirmId('');
  }, [project?.id]);

  // Refresh latest project history & recipes when opening the Workflow panel (captures background Agent / Bridge events)
  useEffect(() => {
    if (!dirty) {
      refresh().catch(() => {});
    } else {
      refreshWorkflows().catch(() => {});
    }
  }, [project?.id]);

  const history = Array.isArray(project?.workflowHistory) ? project.workflowHistory : [];
  const replayableHistory = history.filter(isWorkflowEventReplayableUi);
  const replayableMap = new Map(replayableHistory.map(ev => [ev.id, ev]));
  const validSelectedIds = selectedIds.filter(id => replayableMap.has(id));
  const defaultEligibleHistory = replayableHistory.filter(
    ev => ev.status === 'ok' && (includePatches || ev.kind !== 'script_patch'),
  );
  const selectedEligibleCount = validSelectedIds.filter(id => {
    const ev = replayableMap.get(id);
    return Boolean(ev && (includePatches || ev.kind !== 'script_patch'));
  }).length;
  const effectiveSaveCount = validSelectedIds.length > 0 ? selectedEligibleCount : defaultEligibleHistory.length;
  const recipes = Array.isArray(workflows) ? workflows : [];

  function recipeTitle(wf) {
    if (!wf) return '';
    if (lang === 'en') {
      return wf.nameEn || BUILTIN_WORKFLOW_EN[wf.id]?.name || wf.name || wf.id;
    }
    return wf.name || wf.id;
  }

  function recipeDescText(wf) {
    if (!wf) return '';
    if (lang === 'en') {
      const en = wf.descriptionEn || BUILTIN_WORKFLOW_EN[wf.id]?.description;
      if (en) return en;
      return WORKFLOW_CJK_RE.test(String(wf.description || '')) ? '' : String(wf.description || '');
    }
    return wf.description || '';
  }

  function replayWorkflowTitle(rep) {
    if (!rep) return '';
    if (lang === 'en') {
      const matched = recipes.find(r => r.id === rep.workflowId);
      const en = matched?.nameEn || BUILTIN_WORKFLOW_EN[rep.workflowId]?.name;
      if (en) return en;
      if (WORKFLOW_CJK_RE.test(String(rep.workflowName || ''))) return rep.workflowId || 'Workflow';
    }
    return rep.workflowName || rep.workflowId || '';
  }

  function localizeStepText(kind, text) {
    const raw = String(text || '');
    if (lang !== 'en' || !WORKFLOW_CJK_RE.test(raw)) return raw;
    return stepKindBadge(kind);
  }

  function localizeStepSummary(st) {
    const raw = String(st?.summary || '');
    if (!raw || lang !== 'en' || !WORKFLOW_CJK_RE.test(raw)) return raw;
    const parenMatch = /\(([^()]+)\)/.exec(raw);
    if (raw.startsWith('预演')) {
      return 'Dry-run: ' + st.kind + (parenMatch ? ' (' + parenMatch[1] + ')' : '');
    }
    if (st.status === 'skipped') return 'Skipped (Live Bridge offline)';
    if (st.status === 'done') return 'Done';
    return '';
  }

  function toggleEventSelection(id) {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    if (validSelectedIds.length === replayableHistory.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(replayableHistory.map(ev => ev.id));
    }
  }

  async function toggleRecording() {
    await perform(async () => {
      const next = !recordingEnabled;
      await api({ action: 'workflow_toggle_recording', enabled: next });
      await refreshWorkflows();
      setNotice(
        next
          ? t('已开启实时工作流录制（● REC）。', 'Live workflow recording enabled (● REC).')
          : t('已暂停实时工作流录制。', 'Live workflow recording paused.'),
      );
    });
  }

  async function saveFromHistory(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (!project) return;
    await perform(async () => {
      const finalName = recipeName.trim() || (project.title.slice(0, 64) + t(' 工作流', ' Workflow')).slice(0, 72);
      const res = await api({
        action: 'workflow_save_from_history',
        id: project.id,
        name: finalName,
        description: recipeDesc.trim() || undefined,
        ...(validSelectedIds.length > 0 ? { eventIds: validSelectedIds } : {}),
        includeScriptPatches: includePatches,
        coalesceLookdev,
      });
      setRecipeName('');
      setRecipeDesc('');
      setSelectedIds([]);
      await refreshWorkflows();
      setNotice(t('已保存可复用工作流配方：', 'Saved reusable workflow recipe: ') + (res?.recipe?.name || finalName));
    });
  }

  async function clearHistory() {
    if (!project) return;
    await perform(async () => {
      const updated = await api({
        action: 'workflow_clear_history',
        id: project.id,
        revision: project.revision,
        confirmed: true,
      });
      if (updated && updated.id) setProject(updated);
      setSelectedIds([]);
      setClearConfirm(false);
      setNotice(t('已清空当前工程的工作流录制历史。', 'Cleared workflow history for this project.'));
    });
  }

  async function replayRecipe(wf, dryRun) {
    if (!project) {
      setError(t('请先打开并保存一个目标 3D 工程，再重放工作流。', 'Open and save a target 3D project before replaying a workflow.'));
      return;
    }
    await perform(async () => {
      const overrides = {};
      if (overrideTier) overrides.qualityTier = overrideTier;
      if (overrideExport) overrides.exportFormat = overrideExport;
      if (overrideClay) overrides.clayMode = true;
      const res = await api({
        action: 'workflow_replay',
        workflowId: wf.id,
        id: project.id,
        revision: project.revision,
        dryRun: Boolean(dryRun),
        ...(Object.keys(overrides).length > 0 ? { overrides } : {}),
      });
      if (dryRun && res?.workflowReplay) {
        setDryRunResult(res.workflowReplay);
        setNotice(t('已生成工作流预演计划（未修改工程）。', 'Workflow dry-run plan ready (no changes applied).'));
      } else if (res?.id) {
        setDryRunResult(null);
        setJob(res);
        setNotice(t('已启动工作流重放：', 'Started workflow replay: ') + recipeTitle(wf));
      }
    });
  }

  async function exportRecipe(wf) {
    await perform(async () => {
      const res = await api({ action: 'workflow_export', workflowId: wf.id });
      setExportedJson(res?.json || JSON.stringify(res?.recipe || {}, null, 2));
      setExportedName(recipeTitle(wf) || wf.id);
      setNotice(t('已导出工作流 JSON，可复制分享或下载备份。', 'Exported portable workflow JSON.'));
    });
  }

  async function copyExportedJson() {
    if (!exportedJson) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(exportedJson);
      }
      setNotice(t('已复制工作流 JSON 到剪贴板。', 'Copied workflow JSON to clipboard.'));
    } catch {
      setError(t('无法访问剪贴板，请手动全选下方文本框复制。', 'Clipboard unavailable; copy manually from the text box.'));
    }
  }

  function downloadExportedJson() {
    if (!exportedJson || typeof Blob === 'undefined' || typeof URL === 'undefined' || typeof document === 'undefined') return;
    const slug = String(exportedName || 'blender-workflow')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5_-]+/gi, '-')
      .replace(/^-+|-+$/g, '') || 'blender-workflow';
    const blob = new Blob([exportedJson], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = slug + '.workflow.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function deleteRecipe(wf) {
    await perform(async () => {
      await api({ action: 'workflow_delete', workflowId: wf.id, confirmed: true });
      setDeleteConfirmId('');
      await refreshWorkflows();
      setNotice(t('已删除工作流配方：', 'Deleted workflow recipe: ') + wf.name);
    });
  }

  async function importRecipe(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (!importText.trim()) {
      setError(t('请先粘贴工作流配方 JSON。', 'Paste workflow recipe JSON first.'));
      return;
    }
    await perform(async () => {
      const res = await api({ action: 'workflow_import', recipe: importText.trim() });
      setImportText('');
      await refreshWorkflows();
      setNotice(t('已导入工作流配方：', 'Imported workflow recipe: ') + (res?.recipe?.name || 'OK'));
    });
  }

  function stepKindBadge(kind) {
    const map = {
      project_init: t('初始化', 'Init'),
      lookdev_update: t('Lookdev', 'Lookdev'),
      script_update: t('重写脚本', 'Script'),
      script_patch: t('脚本补丁', 'Patch'),
      checkpoint_save: t('存快照', 'Checkpoint'),
      checkpoint_restore: t('恢复快照', 'Restore'),
      inspect_scene: 'QC-3D',
      preview_still: t('静帧', 'Still'),
      contact_sheet: t('四视角', '4-View'),
      render_shots: t('多机位', 'Shots'),
      render_animation: t('动画', 'Anim'),
      export_model: t('导出', 'Export'),
      pipeline: t('全流程', 'Pipeline'),
      bridge_sync: t('桥接同步', 'Bridge Sync'),
      bridge_set_camera: t('桥接相机', 'Bridge Cam'),
      bridge_transform_object: t('桥接变换', 'Bridge Xform'),
      bridge_set_material: t('桥接材质', 'Bridge Mat'),
      workflow_replay: t('重放', 'Replay'),
    };
    return map[kind] || kind;
  }

  // Dry-run results take priority until a new live replay starts; live replay summaries are scoped to the active project.
  const projectJobReplay =
    job?.workflowReplay && (!project?.id || !job.projectId || job.projectId === project.id)
      ? job.workflowReplay
      : null;
  const activeReplay = dryRunResult || projectJobReplay;

  return h(
    'div',
    { className: 'dbw-wf-grid', 'data-workflow-panel': 'true' },

    // Left Column: Recording Bar + Project Timeline + Save as Recipe
    h(
      'section',
      { className: 'dbw-wf-card', 'data-dsh-card': '' },
      h(
        'div',
        { className: 'dbw-wf-head' },
        h(
          'h3',
          null,
          h('span', { className: 'dbw-wf-rec-dot', 'data-active': String(Boolean(recordingEnabled)), 'aria-hidden': 'true' }),
          t('工作流实时录制时间线', 'Live Workflow Recording Timeline'),
          h('span', { className: 'w-tag' }, String(history.length)),
        ),
        h(
          'div',
          { className: 'dbw-wf-row' },
          h(
            W.Button,
            {
              size: 'sm',
              variant: recordingEnabled ? 'default' : 'primary',
              disabled: busy,
              onClick: toggleRecording,
            },
            recordingEnabled ? t('暂停录制', 'Pause REC') : t('恢复录制', 'Resume REC'),
          ),
          project && replayableHistory.length > 0
            ? h(
                W.Button,
                { size: 'sm', variant: 'ghost', disabled: busy, onClick: toggleSelectAll },
                validSelectedIds.length === replayableHistory.length
                  ? t('取消全选', 'Deselect All')
                  : t('全选可重放', 'Select All'),
              )
            : null,
          project && history.length > 0 && !clearConfirm
            ? h(
                W.Button,
                { size: 'sm', variant: 'ghost', disabled: busy || running || dirty, onClick: () => setClearConfirm(true) },
                t('清空历史', 'Clear'),
              )
            : null,
          clearConfirm
            ? h(
                React.Fragment,
                null,
                h(
                  W.Button,
                  { size: 'sm', variant: 'danger', disabled: busy || running || dirty, onClick: clearHistory },
                  t('确认清空', 'Confirm Clear'),
                ),
                h(W.Button, { size: 'sm', variant: 'ghost', onClick: () => setClearConfirm(false) }, t('取消', 'Cancel')),
              )
            : null,
        ),
      ),

      !project
        ? h(
            W.Empty,
            { title: t('打开一个 3D 工程即可查看操作录制', 'Open a 3D project to inspect recorded steps'), icon: 'cube' },
            t(
              '每次在工作室或通过 DeepSeek Agent 调整 Lookdev、打脚本补丁、跑 QC-3D/四视角/多机位/导出与 Bridge 操控，都会自动记录到此时间线，并可一键存为可复用工作流配方。',
              'Every Lookdev edit, script patch, QC-3D check, render, export, and Live Bridge adjustment is automatically captured here and can be saved as a reusable workflow recipe.',
            ),
          )
        : h(
            React.Fragment,
            null,
            history.length === 0
              ? h(
                  'p',
                  { className: 'w-muted', style: { margin: 0, fontSize: '12.5px' } },
                  t(
                    '当前工程暂无录制记录。调整 Lookdev 参数、保存快照或运行渲染/导出后，步骤会自动出现在这里。',
                    'No recorded steps yet. Adjust Lookdev settings, patch scripts, or run renders/exports to record steps automatically.',
                  ),
                )
              : h(
                  'div',
                  { className: 'dbw-wf-list' },
                  history
                    .slice()
                    .reverse()
                    .map(ev => {
                      const replayable = isWorkflowEventReplayableUi(ev);
                      const checked = validSelectedIds.includes(ev.id);
                      return h(
                        'div',
                        { key: ev.id, className: 'dbw-wf-event' },
                        replayable
                          ? h('input', {
                              type: 'checkbox',
                              checked,
                              'aria-label': t('勾选以纳入配方：', 'Select step for recipe: ') + ev.label,
                              onChange: () => toggleEventSelection(ev.id),
                            })
                          : h('span', {
                              style: { width: '14px', display: 'inline-block', flex: 'none' },
                              title: t('非可重放步骤（或补丁超过 16KB 未内联）', 'Non-replayable step (or patch >16KB not inlined)'),
                            }),
                        h(
                          'div',
                          { className: 'dbw-wf-event-body' },
                          h(
                            'div',
                            { className: 'dbw-wf-event-title' },
                            h('span', { className: 'dbw-wf-chip', 'data-status': ev.status === 'ok' ? 'done' : ev.status }, stepKindBadge(ev.kind)),
                            h('span', null, localizeStepText(ev.kind, ev.label)),
                          ),
                          h(
                            'div',
                            { className: 'dbw-wf-event-meta' },
                            h('span', null, '#' + ev.seq),
                            ev.revision ? h('span', null, 'R' + ev.revision) : null,
                            h('span', null, ev.source === 'agent' ? 'DeepSeek Agent' : ev.source === 'replay' ? t('重放', 'Replay') : 'UI'),
                            typeof ev.durationMs === 'number' ? h('span', null, (ev.durationMs / 1000).toFixed(1) + 's') : null,
                            ev.summary && (lang !== 'en' || !WORKFLOW_CJK_RE.test(String(ev.summary))) ? h('span', null, ev.summary) : null,
                            ev.error ? h('span', { className: 'dbw-wf-err' }, ev.error) : null,
                          ),
                        ),
                      );
                    }),
                ),

            // Save recorded history as reusable recipe
            h(
              'form',
              { className: 'dbw-wf-form', onSubmit: saveFromHistory },
              h(
                'strong',
                { style: { fontSize: '12.5px' } },
                validSelectedIds.length > 0
                  ? t(`将已勾选的 ${selectedEligibleCount} 个步骤存为可复用工作流`, `Save ${selectedEligibleCount} selected step(s) as reusable recipe`)
                  : t(`将全部 ${defaultEligibleHistory.length} 个可重放成功步骤存为可复用工作流`, `Save all ${defaultEligibleHistory.length} replayable step(s) as recipe`),
              ),
              h(
                'div',
                { className: 'dbw-wf-row' },
                h('input', {
                  className: 'dbw-wf-input',
                  type: 'text',
                  value: recipeName,
                  maxLength: 72,
                  placeholder: t('输入工作流名称（如：暗调金属产品交付流）', 'Workflow name (e.g. Dark Metal Lookdev Pack)'),
                  onChange: e => setRecipeName(e.target.value),
                }),
                h(
                  W.Button,
                  {
                    type: 'submit',
                    variant: 'primary',
                    size: 'sm',
                    disabled: busy || effectiveSaveCount === 0,
                  },
                  t('保存为配方', 'Save Recipe'),
                ),
              ),
              h('input', {
                className: 'dbw-wf-input dbw-wf-input-full',
                type: 'text',
                value: recipeDesc,
                maxLength: 400,
                placeholder: t('可选描述（说明适用场景与产出）', 'Optional description'),
                onChange: e => setRecipeDesc(e.target.value),
              }),
              h(
                'div',
                { className: 'dbw-wf-row' },
                h(
                  'label',
                  { className: 'dbw-wf-check' },
                  h('input', { type: 'checkbox', checked: coalesceLookdev, onChange: e => setCoalesceLookdev(e.target.checked) }),
                  t('自动合并连续 Lookdev 调整', 'Coalesce consecutive Lookdev updates'),
                ),
                h(
                  'label',
                  { className: 'dbw-wf-check' },
                  h('input', { type: 'checkbox', checked: includePatches, onChange: e => setIncludePatches(e.target.checked) }),
                  t('包含局部脚本补丁', 'Include script patches'),
                ),
              ),
            ),
          ),
    ),

    // Right Column: Reusable Workflow Library + Replay Overrides + JSON Import/Export + Replay Results
    h(
      'section',
      { className: 'dbw-wf-card', 'data-dsh-card': '' },
      h(
        'div',
        { className: 'dbw-wf-head' },
        h(
          'h3',
          null,
          t('可复用工作流配方库', 'Reusable Workflow Recipes'),
          h('span', { className: 'w-tag' }, String(recipes.length)),
        ),
      ),

      h(
        'div',
        { className: 'dbw-wf-overrides-bar' },
        h(
          'select',
          {
            className: 'dbw-wf-select',
            'aria-label': t('重放质量档位覆盖', 'Replay quality tier override'),
            value: overrideTier,
            onChange: e => setOverrideTier(e.target.value),
          },
          h('option', { value: '' }, t('质量档位：按配方默认', 'Tier: Recipe default')),
          h('option', { value: 'draft' }, 'Draft (EEVEE 16spp 50%)'),
          h('option', { value: 'studio' }, 'Studio (EEVEE 32spp 100%)'),
          h('option', { value: 'beauty' }, 'Beauty (Cycles 64spp 100%)'),
        ),
        h(
          'select',
          {
            className: 'dbw-wf-select',
            'aria-label': t('重放导出格式覆盖', 'Replay export format override'),
            value: overrideExport,
            onChange: e => setOverrideExport(e.target.value),
          },
          h('option', { value: '' }, t('导出格式：按配方默认', 'Export: Recipe default')),
          h('option', { value: 'glb' }, 'GLB'),
          h('option', { value: 'fbx' }, 'FBX'),
          h('option', { value: 'obj' }, 'OBJ'),
          h('option', { value: 'stl' }, 'STL'),
          h('option', { value: 'blend' }, '.blend'),
        ),
        h(
          'label',
          { className: 'dbw-wf-check' },
          h('input', { type: 'checkbox', checked: overrideClay, onChange: e => setOverrideClay(e.target.checked) }),
          t('白模覆盖', 'Clay override'),
        ),
      ),

      h(
        'div',
        { className: 'dbw-wf-list' },
        recipes.map(wf =>
          h(
            'div',
            { key: wf.id, className: 'dbw-wf-recipe' },
            h(
              'div',
              { className: 'dbw-wf-recipe-top' },
              h(
                'div',
                { className: 'dbw-wf-recipe-title' },
                h('span', null, recipeTitle(wf)),
                h('span', { className: 'w-tag' }, wf.builtin ? t('内置 AAA', 'Built-in') : t('自定义', 'Custom')),
                h('span', { className: 'w-tag' }, t(`${wf.stepCount} 步`, `${wf.stepCount} steps`)),
              ),
              h(
                'div',
                { className: 'dbw-wf-row' },
                h(
                  W.Button,
                  {
                    size: 'sm',
                    variant: 'primary',
                    disabled: busy || running || !project || dirty,
                    title: !project
                      ? t('请先打开目标工程', 'Open a target project first')
                      : dirty
                      ? t('请先保存当前工程修改', 'Save unsaved changes first')
                      : t('在当前工程一键重放此工作流', 'Replay this workflow on current project'),
                    onClick: () => replayRecipe(wf, false),
                  },
                  t('一键重放', 'Replay'),
                ),
                h(
                  W.Button,
                  {
                    size: 'sm',
                    disabled: busy || !project,
                    onClick: () => replayRecipe(wf, true),
                  },
                  t('预演', 'Dry Run'),
                ),
                h(
                  W.Button,
                  { size: 'sm', variant: 'ghost', disabled: busy, onClick: () => exportRecipe(wf) },
                  t('导出', 'Export'),
                ),
                !wf.builtin && deleteConfirmId !== wf.id
                  ? h(
                      W.Button,
                      { size: 'sm', variant: 'ghost', disabled: busy, onClick: () => setDeleteConfirmId(wf.id) },
                      t('删除', 'Delete'),
                    )
                  : null,
                !wf.builtin && deleteConfirmId === wf.id
                  ? h(
                      React.Fragment,
                      null,
                      h(
                        W.Button,
                        { size: 'sm', variant: 'danger', disabled: busy, onClick: () => deleteRecipe(wf) },
                        t('确认删除', 'Confirm'),
                      ),
                      h(
                        W.Button,
                        { size: 'sm', variant: 'ghost', onClick: () => setDeleteConfirmId('') },
                        t('取消', 'Cancel'),
                      ),
                    )
                  : null,
              ),
            ),
            recipeDescText(wf) ? h('p', { className: 'dbw-wf-recipe-desc' }, recipeDescText(wf)) : null,
            h(
              'div',
              { className: 'dbw-wf-steps-chain' },
              (wf.stepKinds || []).map((k, idx) =>
                h(
                  React.Fragment,
                  { key: idx },
                  idx > 0 ? h('span', { 'aria-hidden': 'true' }, '→') : null,
                  h('span', { className: 'dbw-wf-chip' }, stepKindBadge(k)),
                ),
              ),
            ),
          ),
        ),
      ),

      // Replay / Dry-run Result Breakdown
      activeReplay
        ? h(
            'div',
            { className: 'dbw-wf-form', 'data-workflow-replay-summary': 'true' },
            h(
              'div',
              { className: 'dbw-wf-head' },
              h(
                'strong',
                { style: { fontSize: '12.5px' } },
                (activeReplay.dryRun ? t('预演计划：', 'Dry-Run Plan: ') : t('重放结果：', 'Replay Summary: ')) +
                  replayWorkflowTitle(activeReplay) +
                  ` (${activeReplay.completedSteps}/${activeReplay.totalSteps})`,
              ),
              activeReplay.dryRun
                ? h(W.Button, { size: 'sm', variant: 'ghost', onClick: () => setDryRunResult(null) }, t('关闭', 'Close'))
                : null,
            ),
            (activeReplay.steps || []).map(st => {
              const summaryText = localizeStepSummary(st);
              return h(
                'div',
                { key: st.stepId + '-' + st.index, className: 'dbw-wf-row', style: { fontSize: '12px' } },
                h('span', { className: 'dbw-wf-chip', 'data-status': st.status }, `${st.index}. ${st.status}`),
                h('span', null, localizeStepText(st.kind, st.label)),
                summaryText ? h('span', { className: 'w-muted' }, '— ' + summaryText) : null,
                st.error ? h('span', { className: 'dbw-wf-err' }, st.error) : null,
              );
            }),
          )
        : null,

      // Exported JSON Viewer
      exportedJson
        ? h(
            'div',
            { className: 'dbw-wf-form', 'data-workflow-exported': 'true' },
            h(
              'div',
              { className: 'dbw-wf-head' },
              h('strong', { style: { fontSize: '12.5px' } }, t('已导出 JSON：', 'Exported JSON: ') + exportedName),
              h(
                'div',
                { className: 'dbw-wf-row' },
                h(W.Button, { size: 'sm', variant: 'ghost', onClick: copyExportedJson }, t('复制 JSON', 'Copy')),
                h(W.Button, { size: 'sm', variant: 'ghost', onClick: downloadExportedJson }, t('下载 .json', 'Download')),
                h(W.Button, { size: 'sm', variant: 'ghost', onClick: () => setExportedJson('') }, t('关闭', 'Close')),
              ),
            ),
            h('textarea', { className: 'dbw-wf-textarea', readOnly: true, value: exportedJson }),
          )
        : null,

      // Import Portable Recipe JSON
      h(
        'form',
        { className: 'dbw-wf-form', onSubmit: importRecipe },
        h('strong', { style: { fontSize: '12.5px' } }, t('导入工作流配方 JSON', 'Import Workflow Recipe JSON')),
        h('textarea', {
          className: 'dbw-wf-textarea',
          value: importText,
          placeholder: t('粘贴 schemaVersion: 1 的工作流配方 JSON…', 'Paste schemaVersion: 1 workflow recipe JSON…'),
          onChange: e => setImportText(e.target.value),
        }),
        h(
          'div',
          { className: 'dbw-wf-row' },
          h(W.Button, { type: 'submit', size: 'sm', disabled: busy || !importText.trim() }, t('导入配方', 'Import Recipe')),
          h(W.Button, { type: 'button', size: 'sm', variant: 'ghost', disabled: busy, onClick: () => perform(refresh) }, t('刷新列表', 'Refresh')),
        ),
      ),
    ),
  );
}
