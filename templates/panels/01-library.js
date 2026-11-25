// 01-library.js — Active & archived 3D project library with search, template filter, sort & scene metrics.
const blenderLibraryPrefs = new Map();

function BlenderLibraryPanel({
  scope = 'projects',
  items = [],
  templates = FALLBACK_TEMPLATES,
  exemplars = FALLBACK_EXEMPLARS,
  running,
  busy,
  dirty,
  activeJob,
  lang = 'zh',
  t,
  onOpen,
  onCreate,
  onCreateFromExemplar,
  onDuplicate,
  onArchiveRequest,
  onRestore,
  onTrashRequest,
  onClearArchivedRequest,
}) {
  const saved = blenderLibraryPrefs.get(scope);
  const [query, setQuery] = useState(saved?.query || '');
  const [templateFilter, setTemplateFilter] = useState(saved?.templateFilter || 'all');
  const [order, setOrder] = useState(saved?.order || 'updated');
  const [exemplarsExpanded, setExemplarsExpanded] = useState(true);
  const controlId = typeof React.useId === 'function' ? React.useId() : 'bl-lib';
  const useMemoHook = typeof React.useMemo === 'function' ? React.useMemo : fn => fn();

  function exemplarCategoryLabel(cat) {
    if (cat === 'aerospace') return t('航空航天', 'Aerospace');
    if (cat === 'vehicle') return t('工业载具', 'Vehicle');
    if (cat === 'robotics') return t('工业机械臂', 'Robotics');
    if (cat === 'architecture') return t('建筑空间', 'Architecture');
    return String(cat || '3D');
  }

  function renderExemplarsStrip() {
    const list = Array.isArray(exemplars) && exemplars.length ? exemplars : FALLBACK_EXEMPLARS;
    if (!list.length) return null;
    return h(
      'section',
      {
        className: 'bl-exemplars-strip',
        'data-exemplars-strip': 'true',
        'data-dsh-card': '',
        'aria-label': t('高阶工程范本库', 'Pro Engineering Exemplars'),
      },
      h(
        'div',
        { className: 'bl-exemplars-head' },
        h(
          'div',
          { className: 'bl-exemplars-title-wrap' },
          h('strong', { 'data-dsh-serif': '' }, t('高阶工程范本', 'Pro Exemplars')),
          h('span', { className: 'w-tag bl-exemplars-badge' }, list.length + ' · QC-3D 100/A'),
          h(
            'span',
            { className: 'w-muted bl-exemplars-sub' },
            t('一键生成完整工程级复杂 bpy 脚本与 Cycles 精渲配置，开箱即用。', 'One-click production bpy assemblies ready for Cycles lookdev & inspection.'),
          ),
        ),
        h(
          W.Button,
          {
            size: 'sm',
            variant: 'ghost',
            icon: exemplarsExpanded ? 'up' : 'down',
            'aria-expanded': exemplarsExpanded,
            'data-action': 'toggle-exemplars',
            onClick: () => setExemplarsExpanded(v => !v),
          },
          exemplarsExpanded ? t('收起', 'Collapse') : t('展开', 'Expand'),
        ),
      ),
      exemplarsExpanded
        ? h(
            'div',
            { className: 'bl-exemplars-grid' },
            list.map(ex =>
              h(
                'article',
                {
                  key: ex.id,
                  className: 'bl-exemplar-card',
                  'data-exemplar-card': ex.id,
                },
                h(
                  'div',
                  { className: 'bl-exemplar-tags' },
                  h('span', { className: 'w-tag bl-exemplar-cat', 'data-cat': ex.category || 'engineering' }, exemplarCategoryLabel(ex.category)),
                  h('span', { className: 'w-tag bl-metric-tag' }, (ex.engine || 'CYCLES') + (ex.estimatedPolys ? ' · ' + ex.estimatedPolys : '')),
                ),
                h('strong', { className: 'bl-exemplar-title', 'data-dsh-serif': '' }, lang === 'en' ? ex.titleEn || ex.id : ex.titleZh || ex.id),
                h('p', { className: 'w-muted bl-exemplar-desc' }, lang === 'en' ? ex.summaryEn || '' : ex.summaryZh || ''),
                h(
                  'div',
                  { className: 'bl-exemplar-foot' },
                  h(
                    W.Button,
                    {
                      variant: 'primary',
                      size: 'sm',
                      icon: 'sparkles',
                      'data-action': 'create-exemplar',
                      'data-exemplar-id': ex.id,
                      disabled: running || busy || dirty || activeJob,
                      onClick: () => onCreateFromExemplar?.(ex),
                    },
                    t('从此范本创建', 'Use Exemplar'),
                  ),
                ),
              ),
            ),
          )
        : null,
    );
  }

  const tplMap = useMemoHook(() => {
    const map = new Map();
    for (const tpl of templates || FALLBACK_TEMPLATES) map.set(tpl.id, tpl);
    return map;
  }, [templates]);

  const collator = useMemoHook(
    () => new Intl.Collator(lang === 'en' ? 'en' : 'zh', { numeric: true, sensitivity: 'base' }),
    [lang],
  );

  function updatePrefs(nextQuery, nextTpl, nextOrder) {
    blenderLibraryPrefs.set(scope, { query: nextQuery, templateFilter: nextTpl, order: nextOrder });
    setQuery(nextQuery);
    setTemplateFilter(nextTpl);
    setOrder(nextOrder);
  }

  const visible = useMemoHook(() => {
    const norm = text => String(text ?? '').normalize('NFKC').toLocaleLowerCase(lang === 'en' ? 'en' : 'zh');
    const words = norm(query).trim().split(/\s+/).filter(Boolean);
    const ts = row => {
      const value = Date.parse(row.updated || row.created || '');
      return Number.isFinite(value) ? value : 0;
    };
    return (items || [])
      .filter(row => {
        if (templateFilter !== 'all' && row.template !== templateFilter) return false;
        if (!words.length) return true;
        const tpl = tplMap.get(row.template);
        const hay = norm(
          [row.title, row.description, row.headline, row.template, row.engine, tpl?.zh, tpl?.en].join(' '),
        );
        return words.every(word => hay.includes(word));
      })
      .sort((a, b) => {
        const tie = collator.compare(String(a.title || ''), String(b.title || '')) || String(a.id).localeCompare(String(b.id));
        if (order === 'title') return tie;
        if (order === 'oldest') return (ts(a) - ts(b)) || tie;
        if (order === 'artifacts') return ((b.artifacts?.length || 0) - (a.artifacts?.length || 0)) || (ts(b) - ts(a)) || tie;
        return (ts(b) - ts(a)) || tie;
      });
  }, [items, query, templateFilter, order, lang, collator, tplMap]);

  if (scope === 'archives' && !items.length) {
    return h(
      W.Empty,
      { title: t('没有已归档的 3D 工程', 'No archived 3D projects'), icon: 'folder' },
      t(
        '归档工程会完整保留资产与渲染成品，不占用 30 个活跃工程槽位。',
        'Archived projects preserve all assets and rendered artifacts without using active project slots.',
      ),
    );
  }

  if (scope === 'projects' && !items.length) {
    return h(
      'section',
      { className: 'bl-library-empty-wrap', 'data-tour': 'blender-projects' },
      renderExemplarsStrip(),
      h(
        W.Empty,
        {
          title: t('还没有 3D 工程', 'No 3D projects yet'),
          icon: 'cube',
          action: h(
            W.Button,
            { variant: 'primary', icon: 'plus', disabled: running, onClick: () => onCreate?.() },
            t('新建 3D 工程', 'New 3D Scene'),
          ),
        },
        t(
          '点击「新建 3D 工程」或从下方 8 套跨版本 Blender 模板快速起步，实时在浏览器 3D 舞台中调光构图。',
          'Click New Scene or pick one of the 8 cross-version Blender templates below to stage and render right away.',
        ),
      ),
      h(
        'div',
        { className: 'bl-template-quickstart' },
        (templates || FALLBACK_TEMPLATES).map(tpl =>
          h(
            'button',
            {
              key: tpl.id,
              type: 'button',
              className: 'bl-quickstart-card',
              'data-dsh-card': '',
              disabled: running,
              onClick: () => onCreate?.(tpl.id),
            },
            h(
              'div',
              { className: 'bl-quickstart-head' },
              h('strong', { 'data-dsh-serif': '' }, lang === 'en' ? tpl.en : tpl.zh),
              h('span', { className: 'w-tag' }, tpl.recommendedEngine || 'EEVEE'),
            ),
            h('p', { className: 'w-muted' }, lang === 'en' ? tpl.descriptionEn : tpl.description),
          ),
        ),
      ),
    );
  }

  return h(
    'section',
    {
      className: 'bl-library',
      'data-tour': scope === 'projects' ? 'blender-projects' : undefined,
      'aria-label': t('3D 工程库', '3D project library'),
    },
    scope === 'projects' ? renderExemplarsStrip() : null,
    scope === 'archives'
      ? h(
          'div',
          { className: 'bl-archive-header' },
          h(
            'p',
            { className: 'w-muted bl-archive-hint' },
            t(
              '归档工程保留全部素材、脚本与渲染成品，不占用 30 个活跃工程名额；恢复后可继续编辑。',
              'Archived projects retain assets, scripts, and renders without counting toward the 30 active slots.',
            ),
          ),
          h(
            W.Button,
            {
              variant: 'danger',
              icon: 'trash',
              disabled: busy || dirty || activeJob,
              onClick: () => onClearArchivedRequest?.(),
            },
            t('清空已归档（全部移入回收站）', 'Clear archived (Recycle Bin)'),
          ),
        )
      : null,
    h(
      'div',
      { role: 'search', className: 'bl-library-controls' },
      h(
        'label',
        { htmlFor: controlId + '-q' },
        t('搜索 3D 工程', 'Search 3D scenes'),
        h(W.Input, {
          id: controlId + '-q',
          icon: 'search',
          type: 'search',
          value: query,
          placeholder: t('搜索标题、模板、引擎或描述…', 'Search titles, templates, engines…'),
          maxLength: 200,
          autoCorrect: 'off',
          autoCapitalize: 'none',
          spellCheck: false,
          onChange: e => updatePrefs(e.target.value, templateFilter, order),
          onKeyDown: e => {
            if (e.key === 'Escape' && query) {
              e.preventDefault();
              e.stopPropagation();
              updatePrefs('', templateFilter, order);
            }
          },
        }),
      ),
      h(
        'label',
        { htmlFor: controlId + '-tpl' },
        t('场景模板', 'Template'),
        h(
          'select',
          {
            id: controlId + '-tpl',
            value: templateFilter,
            onChange: e => updatePrefs(query, e.target.value, order),
          },
          h('option', { value: 'all' }, t('全部模板', 'All templates')),
          (templates || FALLBACK_TEMPLATES).map(tpl =>
            h('option', { key: tpl.id, value: tpl.id }, lang === 'en' ? tpl.en : tpl.zh),
          ),
        ),
      ),
      h(
        'label',
        { htmlFor: controlId + '-order' },
        t('排序', 'Sort by'),
        h(
          'select',
          {
            id: controlId + '-order',
            value: order,
            onChange: e => updatePrefs(query, templateFilter, e.target.value),
          },
          h('option', { value: 'updated' }, t('最近更新', 'Recently updated')),
          h('option', { value: 'oldest' }, t('最早更新', 'Oldest updated')),
          h('option', { value: 'title' }, t('按标题', 'Title')),
          h('option', { value: 'artifacts' }, t('成品数量', 'Most artifacts')),
        ),
      ),
      query || templateFilter !== 'all'
        ? h(
            W.Button,
            {
              variant: 'ghost',
              icon: 'close',
              onClick: () => updatePrefs('', 'all', order),
            },
            t('重置筛选', 'Clear filters'),
          )
        : null,
    ),
    h(
      'p',
      { className: 'w-muted bl-library-count', role: 'status', 'aria-live': 'polite' },
      t('显示 ', 'Showing ') + visible.length + ' / ' + items.length + t(' 个 3D 工程', ' 3D projects'),
    ),
    visible.length
      ? h(
          'div',
          { className: 'bl-project-list' },
          visible.map(item => {
            const tpl = tplMap.get(item.template);
            const tplLabel = tpl ? (lang === 'en' ? tpl.en : tpl.zh) : item.template;
            const objCount = item.sceneSummary?.objectCount;
            const artCount = Array.isArray(item.artifacts) ? item.artifacts.length : 0;
            const assetCount = Array.isArray(item.assets) ? item.assets.length : 0;
            const badgeItems = [
              tplLabel,
              item.engine || 'EEVEE',
              (item.samples || 32) + ' spp',
              objCount !== undefined ? objCount + t(' 对象', ' obj') : null,
              artCount + t(' 成品', ' outputs'),
              assetCount > 0 ? assetCount + t(' 素材', ' assets') : null,
              'R' + (item.revision || 1),
            ].filter(Boolean);

            if (scope === 'archives') {
              return h(
                'div',
                {
                  key: item.id,
                  className: 'bl-project-card dsh-row',
                  'data-dsh-row': '',
                  'data-dsh-card': '',
                },
                h(
                  'div',
                  { className: 'bl-project-card-main' },
                  h(
                    'div',
                    { className: 'bl-project-title-row' },
                    h('span', {
                      className: 'bl-accent-dot',
                      'aria-hidden': 'true',
                      style: { background: item.accentColor || '#3B82F6' },
                    }),
                    h('strong', { 'data-dsh-serif': '' }, item.title),
                  ),
                  h(
                    'div',
                    { className: 'bl-metric-badges' },
                    badgeItems.map((b, i) => h('span', { key: i, className: 'w-tag bl-metric-tag' }, b)),
                  ),
                ),
                h(
                  'div',
                  { className: 'dsh-row-actions', 'data-always-visible': 'true', 'data-window-drag-exclude': '' },
                  h(
                    W.Button,
                    {
                      size: 'sm',
                      icon: 'reply',
                      disabled: busy || dirty || activeJob,
                      onClick: () => onRestore?.(item),
                    },
                    t('恢复工程', 'Restore'),
                  ),
                  h(
                    W.Button,
                    {
                      size: 'sm',
                      variant: 'danger',
                      icon: 'trash',
                      disabled: busy || dirty || activeJob,
                      onClick: () => onTrashRequest?.(item, true),
                    },
                    t('移入回收站', 'Recycle Bin'),
                  ),
                ),
              );
            }

            return h(W.Row, {
              key: item.id,
              className: 'bl-project-row',
              title: item.title,
              disabled: running,
              status: item.engine || 'EEVEE',
              meta: badgeItems.join(' · '),
              description:
                item.description?.trim() ||
                (item.headline ? t('场景标题：', 'Headline: ') + item.headline : tpl ? (lang === 'en' ? tpl.descriptionEn : tpl.description) : ''),
              onClick: () => onOpen?.(item.id),
              actions: h(
                React.Fragment,
                null,
                h(
                  W.Button,
                  {
                    size: 'sm',
                    icon: 'cube',
                    disabled: running,
                    onClick: () => onOpen?.(item.id),
                  },
                  t('进入工作室', 'Open'),
                ),
                h(
                  W.Button,
                  {
                    size: 'sm',
                    variant: 'ghost',
                    icon: 'copy',
                    'data-action': 'duplicate',
                    disabled: busy || dirty || activeJob,
                    onClick: () => onDuplicate?.(item),
                  },
                  t('复制', 'Duplicate'),
                ),
                h(
                  W.Button,
                  {
                    size: 'sm',
                    variant: 'ghost',
                    icon: 'folder',
                    disabled: busy || dirty || activeJob,
                    onClick: () => onArchiveRequest?.(item),
                  },
                  t('归档', 'Archive'),
                ),
                h(
                  W.Button,
                  {
                    size: 'sm',
                    variant: 'ghost',
                    icon: 'trash',
                    disabled: busy || dirty || activeJob,
                    onClick: () => onTrashRequest?.(item, false),
                  },
                  t('移入回收站', 'Trash'),
                ),
              ),
            });
          }),
        )
      : h(
          W.Empty,
          { title: t('没有匹配的 3D 工程', 'No matching 3D projects'), icon: 'search' },
          t('换个关键词或切换模板筛选试试。', 'Try another keyword or clear the template filter.'),
        ),
  );
}

const BLENDER_LIBRARY_CSS = `
.bl-library{max-width:1040px;padding:6px 0 24px;min-width:0}
.bl-exemplars-strip{display:flex;flex-direction:column;gap:10px;padding:12px 14px;margin:4px 0 12px;border:var(--dsh-control-border-width,1px) solid var(--w-border);border-radius:var(--dsw-radius-md,12px);background:var(--dsw-alias-settings-card-fill,var(--w-canvas))}
.bl-exemplars-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.bl-exemplars-title-wrap{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}
.bl-exemplars-badge{font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:10.5px;font-weight:700;background:color-mix(in oklab,#10b981 14%,var(--w-bg));border-color:color-mix(in oklab,#10b981 36%,var(--w-border));color:#047857}
[data-theme="dark"] .bl-exemplars-badge{color:#6ee7b7}
.bl-exemplars-sub{font-size:12px}
.bl-exemplars-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
.bl-exemplar-card{display:flex;flex-direction:column;gap:6px;padding:12px 13px;border-radius:var(--dsw-radius-sm,10px);border:var(--dsh-control-border-width,1px) solid var(--w-border);background:var(--w-bg);min-width:0}
.bl-exemplar-tags{display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap}
.bl-exemplar-cat{font-size:10.5px;font-weight:700}
.bl-exemplar-title{font-size:13px;line-height:1.35;color:var(--w-text)}
.bl-exemplar-desc{margin:0;font-size:11.5px;line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;flex:1}
.bl-exemplar-foot{display:flex;justify-content:flex-end;padding-top:4px}
.bl-archive-header{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:6px 0 4px}
.bl-archive-hint{margin:0}
.bl-library-controls{display:flex;gap:12px;align-items:end;flex-wrap:wrap;padding:10px 0}
.bl-library-controls>label{display:grid;gap:5px;margin:0;min-width:0;color:var(--w-muted);font-size:12px}
.bl-library-controls>label:first-child{flex:1 1 240px}
.bl-library-controls>label:nth-child(2),.bl-library-controls>label:nth-child(3){flex:0 1 175px}
.bl-library-controls select{min-height:34px}
.bl-library-count{margin:2px 0 10px;font-size:12px}
.bl-project-list{display:flex;flex-direction:column;gap:8px}
.bl-project-card{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px 16px;border:var(--dsh-control-border-width,1px) solid var(--w-border);border-radius:var(--dsw-radius-md,10px);background:var(--dsw-alias-settings-card-fill,var(--w-canvas))}
.bl-project-card-main{display:flex;flex-direction:column;gap:6px;min-width:0;flex:1 1 260px}
.bl-project-title-row{display:flex;align-items:center;gap:8px;min-width:0}
.bl-accent-dot{width:10px;height:10px;border-radius:50%;flex:none;border:1px solid rgba(15,23,42,0.18)}
.bl-metric-badges{display:flex;flex-wrap:wrap;gap:5px}
.bl-metric-tag{font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:11px}
.bl-library-empty-wrap{max-width:1040px;padding:6px 0 24px}
.bl-template-quickstart{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;margin-top:16px}
.bl-quickstart-card{display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding:14px 16px;text-align:left;cursor:pointer;border:var(--dsh-control-border-width,1px) solid var(--w-border);border-radius:var(--dsw-radius-md,12px);background:var(--dsw-alias-settings-card-fill,var(--w-canvas));color:var(--w-text);box-shadow:var(--dsh-card-shadow,none)}
.bl-quickstart-card:hover:not(:disabled){border-color:var(--w-accent);box-shadow:var(--dsh-card-hover-shadow,0 6px 18px rgba(15,23,42,0.08))}
.bl-quickstart-head{width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px}
.bl-quickstart-card p{margin:0;font-size:12px;line-height:1.45}
@media(max-width:560px){.bl-library-controls>label:first-child{flex-basis:100%}.bl-library-controls>label:nth-child(2),.bl-library-controls>label:nth-child(3){flex:1 1 140px}}
`;
