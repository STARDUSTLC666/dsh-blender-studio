// 03-assets-exports.js — Asset upload/delete, Poly Haven CC0 search & 1-click import, Exports & Artifacts gallery.

function BlenderAssetsExportsPanel({
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
  onTrashRequest,
  onExportFormat,
  refresh,
  lang = 'zh',
  t,
}) {
  const [removeTarget, setRemoveTarget] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [artifactFilter, setArtifactFilter] = useState('all');
  const [phQuery, setPhQuery] = useState('');
  const [phType, setPhType] = useState('hdris');
  const [phRes, setPhRes] = useState('1k');
  const [phResults, setPhResults] = useState([]);
  const [phSearched, setPhSearched] = useState(false);
  const [phSearching, setPhSearching] = useState(false);
  const [phImportingId, setPhImportingId] = useState('');
  const controlId = typeof React.useId === 'function' ? React.useId() : 'bl-ae';

  if (!project) {
    return h(
      W.Empty,
      { title: t('请先保存 3D 工程', 'Save your 3D project first'), icon: 'box' },
      t(
        '填写工程标题并点击顶栏「保存工程」后，即可上传 HDRI/贴图/模型素材、从 Poly Haven 导入 CC0 资产并管理导出成品。',
        'Enter a title and click Save above before uploading assets, importing Poly Haven CC0 items, or viewing exports.',
      ),
    );
  }

  const assets = Array.isArray(project.assets) ? project.assets : [];
  const artifacts = Array.isArray(project.artifacts) ? project.artifacts : [];
  const totalAssetBytes = assets.reduce((sum, a) => sum + Number(a.size || 0), 0);
  const polyHavenEnabled = Boolean(environment?.polyHavenEnabled);

  const filteredArtifacts = artifacts
    .filter(art => {
      if (artifactFilter === 'all') return true;
      if (artifactFilter === 'models') return ['glb', 'fbx', 'obj', 'stl', 'blend'].includes(art.kind);
      return art.kind === artifactFilter;
    })
    .slice()
    .sort((a, b) => Date.parse(b.created || 0) - Date.parse(a.created || 0));

  async function searchPolyHaven(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (phSearching) return;
    setPhSearching(true);
    try {
      const res = await api({ action: 'polyhaven_search', query: phQuery.trim(), type: phType, limit: 12 });
      const list = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : [];
      setPhResults(list);
      setPhSearched(true);
    } catch (err) {
      await perform(async () => { throw err; });
    } finally {
      setPhSearching(false);
    }
  }

  async function importPolyHaven(item) {
    setPhImportingId(item.id);
    try {
      await perform(async () => {
        const updated = await api({
          action: 'polyhaven_import',
          id: project.id,
          revision: project.revision,
          assetId: item.id,
          assetType: item.type || phType,
          resolution: phRes,
        });
        if (updated && updated.id) setProject(updated);
        else await refresh();
        setNotice(t('已从 Poly Haven 导入 CC0 资产：', 'Imported Poly Haven CC0 asset: ') + (item.name || item.id));
      });
    } finally {
      setPhImportingId('');
    }
  }

  function assetKindLabel(kind) {
    const map = {
      hdri: 'HDRI',
      texture: t('贴图', 'Texture'),
      model: t('3D 模型', '3D Model'),
      blend: '.blend',
      reference: t('参考图', 'Reference'),
    };
    return map[kind] || kind;
  }

  function artifactKindLabel(kind) {
    const map = {
      still: t('静帧 PNG', 'Still PNG'),
      contact_sheet: t('四视角质检', '4-View QC'),
      animation: t('动画 MP4', 'Animation MP4'),
      glb: 'GLB',
      fbx: 'FBX',
      obj: 'OBJ',
      stl: 'STL',
      blend: '.blend',
    };
    return map[kind] || String(kind || '').toUpperCase();
  }

  return h(
    'div',
    { className: 'bl-ae-root' },
    dirty
      ? h(
          W.Status,
          { tone: 'warn' },
          t(
            '当前工程有未保存修改；请先点击顶栏「保存工程」，再上传/删除素材或导入 Poly Haven 资产。',
            'You have unsaved edits. Save the project before uploading, deleting, or importing assets.',
          ),
        )
      : null,

    // 1. Project Assets
    h(
      'section',
      { className: 'bl-ae-card', 'data-dsh-card': '', 'aria-label': t('工程素材管理', 'Project assets') },
      h(
        'div',
        { className: 'bl-ae-head' },
        h(
          'div',
          null,
          h('h3', { 'data-dsh-serif': '' }, t('工程素材', 'Project Assets') + ' · ' + assets.length + ' / 24'),
          h(
            'p',
            { className: 'w-muted bl-ae-sub' },
            t(
              '支持 HDRI（.hdr / .exr）、贴图与参考图（.png / .jpg / .webp）、3D 模型（.glb / .gltf / .obj / .fbx / .stl）及 .blend；单文件 ≤ 50 MB，工程合计 ≤ 120 MB（已用 ',
              'Supports HDRI (.hdr/.exr), textures (.png/.jpg/.webp), 3D models (.glb/.gltf/.obj/.fbx/.stl) & .blend; ≤50 MB/file, ≤120 MB/project (used ',
            ) +
              formatBytes(totalAssetBytes) +
              ').',
          ),
        ),
        h(
          W.Button,
          {
            variant: 'primary',
            size: 'sm',
            icon: 'upload',
            disabled: running || dirty || assets.length >= 24,
            onClick: () => fileRef.current?.click(),
          },
          t('上传素材', 'Upload Asset'),
        ),
      ),
      h('input', {
        ref: fileRef,
        type: 'file',
        accept: '.hdr,.exr,.png,.jpg,.jpeg,.webp,.glb,.gltf,.obj,.fbx,.stl,.blend',
        disabled: running || dirty,
        onChange: uploadAsset,
        'aria-label': t('上传 3D 素材副本', 'Upload 3D asset copy'),
        style: { display: 'none' },
      }),
      h(
        'div',
        {
          className: 'bl-dropzone',
          'data-dropzone': 'true',
          'data-drag-active': dragOver ? 'true' : 'false',
          'data-disabled': running || dirty || assets.length >= 24 ? 'true' : 'false',
          'data-window-drag-exclude': '',
          role: 'button',
          tabIndex: running || dirty || assets.length >= 24 ? -1 : 0,
          'aria-label': t('拖拽或点击上传 HDRI、3D 模型或贴图', 'Drag and drop or click to upload HDRI, 3D model, or texture'),
          onClick: () => {
            if (!running && !dirty && assets.length < 24) fileRef.current?.click();
          },
          onKeyDown: e => {
            if ((e.key === 'Enter' || e.key === ' ') && !running && !dirty && assets.length < 24) {
              e.preventDefault();
              fileRef.current?.click();
            }
          },
          onDragEnter: e => {
            e.preventDefault();
            if (!running && !dirty && assets.length < 24) setDragOver(true);
          },
          onDragOver: e => {
            e.preventDefault();
            if (!running && !dirty && assets.length < 24) {
              if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
              if (!dragOver) setDragOver(true);
            }
          },
          onDragLeave: e => {
            e.preventDefault();
            if (!e.currentTarget?.contains?.(e.relatedTarget)) setDragOver(false);
          },
          onDrop: e => {
            e.preventDefault();
            setDragOver(false);
            if (running || dirty || assets.length >= 24) return;
            const dropped = e.dataTransfer?.files?.[0];
            if (dropped && typeof uploadFile === 'function') uploadFile(dropped);
          },
        },
        h('span', { className: 'bl-dropzone-icon', 'aria-hidden': 'true' }, h(W.Icon, { name: 'upload', size: 20 })),
        h(
          'div',
          { className: 'bl-dropzone-copy' },
          h(
            'strong',
            null,
            dragOver
              ? t('松开鼠标即可上传并自动装配到场景', 'Drop file to upload & auto-wire into scene')
              : t('拖拽文件到此处，或点击选择 HDRI / 3D 模型 / 贴图', 'Drag & drop files here, or click to browse HDRI / 3D Models / Textures'),
          ),
          h(
            'p',
            { className: 'w-muted' },
            t(
              '自动装配：上传 HDRI（.hdr/.exr）自动接管 World 环境光；上传 3D 模型（.glb/.obj/.fbx/.stl）自动归一化尺寸并稳固落位展台。',
              'Auto-wired: HDRI (.hdr/.exr) automatically lights the World environment; 3D models (.glb/.obj/.fbx/.stl) auto-scale and ground onto the stage pedestal.',
            ),
          ),
        ),
      ),
      assets.length > 0
        ? h(
            'ul',
            { className: 'bl-ae-list' },
            assets.map(asset => {
              const isImg = ['png', 'jpg', 'jpeg', 'webp'].includes(String(asset.ext || '').toLowerCase());
              return h(
                'li',
                { key: asset.id, className: 'bl-ae-row dsh-row', 'data-dsh-row': '' },
                isImg
                  ? h('img', {
                      className: 'bl-ae-thumb',
                      src: urlFor(project, 'asset', { asset: asset.id }),
                      alt: asset.name,
                      width: 64,
                      height: 48,
                      loading: 'lazy',
                    })
                  : h(
                      'span',
                      { className: 'bl-ae-icon-box', 'aria-hidden': 'true' },
                      h(W.Icon, { name: asset.kind === 'hdri' ? 'sun' : asset.kind === 'model' || asset.kind === 'blend' ? 'cube' : 'image', size: 22 }),
                    ),
                h(
                  'div',
                  { className: 'bl-ae-row-main' },
                  h('strong', { 'data-dsh-serif': '' }, asset.name),
                  h(
                    'div',
                    { className: 'bl-ae-tags' },
                    h('span', { className: 'w-tag' }, assetKindLabel(asset.kind)),
                    h('span', { className: 'w-tag' }, formatBytes(asset.size)),
                    asset.source === 'polyhaven' ? h('span', { className: 'w-tag' }, 'Poly Haven CC0') : null,
                  ),
                ),
                h(
                  'div',
                  { className: 'dsh-row-actions', 'data-always-visible': 'true', 'data-window-drag-exclude': '' },
                  h(
                    'a',
                    {
                      className: 'w-button',
                      href: urlFor(project, 'asset', { asset: asset.id, download: '1' }),
                      download: '',
                    },
                    h(W.Icon, { name: 'download', size: 14 }),
                    t('下载', 'Download'),
                  ),
                  h(
                    W.Button,
                    {
                      size: 'sm',
                      variant: 'danger',
                      icon: 'trash',
                      disabled: running || dirty,
                      onClick: () => setRemoveTarget(asset),
                    },
                    t('移除', 'Remove'),
                  ),
                ),
              );
            }),
          )
        : h(
            W.Empty,
            { title: t('尚未添加工程素材', 'No project assets yet'), icon: 'image' },
            t('可直接渲染内置模板，或上传自定义 HDRI 环境光、PBR 贴图与外部 3D 模型。', 'Built-in templates render out of the box, or upload custom HDRIs, textures, and 3D models.'),
          ),
    ),

    // 2. Poly Haven CC0 Search & 1-Click Import
    h(
      'section',
      { className: 'bl-ae-card', 'data-dsh-card': '', 'aria-label': t('Poly Haven CC0 资产检索', 'Poly Haven CC0 Browser') },
      h(
        'div',
        { className: 'bl-ae-head' },
        h(
          'div',
          null,
          h('h3', { 'data-dsh-serif': '' }, t('Poly Haven CC0 免费资产库', 'Poly Haven CC0 Assets')),
          h(
            'p',
            { className: 'w-muted bl-ae-sub' },
            t(
              '严格白名单直连官方 api.polyhaven.com / dl.polyhaven.org，支持一键导入免费 CC0 HDRI 环境贴图、PBR 材质与 3D 模型。',
              'Opt-in SSRF-safe allowlist client (api.polyhaven.com / dl.polyhaven.org) for 1-click CC0 HDRIs, textures, and models.',
            ),
          ),
        ),
        h(
          'span',
          { className: 'w-tag' },
          polyHavenEnabled ? t('已启用', 'Enabled') : t('默认关闭', 'Disabled'),
        ),
      ),
      !polyHavenEnabled
        ? h(
            'div',
            { className: 'bl-ph-disabled' },
            h(
              'p',
              { className: 'w-muted' },
              t(
                '出于网络与隐私最小化原则，Poly Haven 在线检索默认关闭。开启后仅在你点击搜索或导入时访问官方 CC0 接口。',
                'Poly Haven online search is disabled by default for minimal network access. Enable it to search and import CC0 assets.',
              ),
            ),
            h(
              'div',
              { className: 'w-toolbar' },
              h(
                W.Button,
                {
                  variant: 'primary',
                  size: 'sm',
                  icon: 'sparkles',
                  disabled: running,
                  onClick: () =>
                    perform(async () => {
                      await api({ action: 'configure', polyHavenEnabled: true });
                      await refresh();
                      setNotice(t('已启用 Poly Haven CC0 检索。', 'Poly Haven CC0 integration enabled.'));
                    }),
                },
                t('一键启用 Poly Haven', 'Enable Poly Haven'),
              ),
              h(
                W.Button,
                { size: 'sm', variant: 'ghost', icon: 'settings', onClick: () => setEditorTab('bridge-env') },
                t('前往环境设置', 'Open Bridge & Env'),
              ),
            ),
          )
        : h(
            React.Fragment,
            null,
            h(
              'form',
              { className: 'bl-ph-form', onSubmit: searchPolyHaven },
              h(W.Input, {
                id: controlId + '-ph-q',
                icon: 'search',
                type: 'search',
                value: phQuery,
                placeholder: t('搜索关键词，例如 studio, wood, ceramic, chair…', 'Search e.g. studio, wood, ceramic, chair…'),
                autoCorrect: 'off',
                autoCapitalize: 'none',
                spellCheck: false,
                onChange: e => setPhQuery(e.target.value),
              }),
              h(
                'select',
                {
                  value: phType,
                  'aria-label': t('资产类别', 'Asset type'),
                  onChange: e => setPhType(e.target.value),
                },
                h('option', { value: 'hdris' }, 'HDRIs'),
                h('option', { value: 'textures' }, t('材质贴图 (Textures)', 'Textures')),
                h('option', { value: 'models' }, t('3D 模型 (Models)', 'Models')),
              ),
              h(
                'select',
                {
                  value: phRes,
                  'aria-label': t('下载分辨率', 'Resolution'),
                  onChange: e => setPhRes(e.target.value),
                },
                h('option', { value: '1k' }, '1K'),
                h('option', { value: '2k' }, '2K'),
              ),
              h(
                W.Button,
                {
                  type: 'submit',
                  variant: 'primary',
                  size: 'sm',
                  icon: 'search',
                  disabled: phSearching,
                },
                phSearching ? t('检索中…', 'Searching…') : t('检索 CC0', 'Search'),
              ),
            ),
            phResults.length > 0
              ? h(
                  'div',
                  { className: 'bl-ph-grid' },
                  phResults.map(item =>
                    h(
                      'article',
                      { key: item.id, className: 'bl-ph-card', 'data-dsh-card': '' },
                      item.thumbnailUrl
                        ? h('img', {
                            src: item.thumbnailUrl,
                            alt: item.name || item.id,
                            loading: 'lazy',
                            className: 'bl-ph-thumb',
                          })
                        : h('div', { className: 'bl-ph-thumb bl-ph-thumb-empty' }, h(W.Icon, { name: 'cube', size: 22 })),
                      h('strong', { className: 'bl-ph-name' }, item.name || item.id),
                      h(
                        'span',
                        { className: 'w-muted bl-ph-meta' },
                        (item.categories?.slice(0, 2).join(', ') || item.type || phType) +
                          (item.downloadCount ? ' · ↓' + item.downloadCount : ''),
                      ),
                      h(
                        W.Button,
                        {
                          size: 'sm',
                          variant: 'outline',
                          icon: 'download',
                          disabled: running || dirty || Boolean(phImportingId),
                          onClick: () => importPolyHaven(item),
                        },
                        phImportingId === item.id ? t('导入中…', 'Importing…') : t('一键导入', 'Import') + ' (' + phRes.toUpperCase() + ')',
                      ),
                    ),
                  ),
                )
              : phSearched
              ? h('p', { className: 'w-muted' }, t('未找到匹配的 Poly Haven 资产，可换英文关键词重试。', 'No matching Poly Haven assets found. Try another English keyword.'))
              : null,
          ),
    ),

    // 3. Exports & Artifacts Gallery
    h(
      'section',
      { className: 'bl-ae-card', 'data-dsh-card': '', 'aria-label': t('渲染与导出成品', 'Exports and rendered artifacts') },
      h(
        'div',
        { className: 'bl-ae-head' },
        h(
          'div',
          null,
          h('h3', { 'data-dsh-serif': '' }, t('渲染与 3D 导出成品', 'Renders & 3D Exports') + ' · ' + artifacts.length),
          h(
            'p',
            { className: 'w-muted bl-ae-sub' },
            t('所有静帧、四视角质检拼图、MP4 动画与 GLB/FBX/OBJ/STL/.blend 均按修订留档，支持随时回看与下载。', 'All stills, 4-view QC sheets, MP4 animations, and 3D model exports are tracked by revision.'),
          ),
        ),
        h(
          'div',
          { className: 'bl-quick-export-bar' },
          EXPORT_FORMATS.map(fmt =>
            h(
              W.Button,
              {
                key: fmt.id,
                size: 'sm',
                variant: fmt.id === 'glb' ? 'primary' : 'outline',
                icon: 'download',
                disabled: running || dirty || !environment?.ready,
                onClick: () => onExportFormat?.(fmt.id),
              },
              fmt.label,
            ),
          ),
        ),
      ),
      h(
        'div',
        { className: 'bl-filter-pills', role: 'group', 'aria-label': t('筛选成品类型', 'Filter artifacts') },
        [
          { id: 'all', label: t('全部', 'All') },
          { id: 'still', label: t('静帧', 'Stills') },
          { id: 'contact_sheet', label: t('四视角', '4-View QC') },
          { id: 'animation', label: t('动画', 'Animation') },
          { id: 'models', label: t('3D 模型 / .blend', '3D Models') },
        ].map(f =>
          h(
            'button',
            {
              key: f.id,
              type: 'button',
              className: 'bl-tpl-pill',
              'aria-pressed': artifactFilter === f.id,
              onClick: () => setArtifactFilter(f.id),
            },
            f.label,
          ),
        ),
      ),
      filteredArtifacts.length > 0
        ? h(
            'ul',
            { className: 'bl-ae-list' },
            filteredArtifacts.map(art => {
              const isImage = art.kind === 'still' || art.kind === 'contact_sheet';
              const isVideo = art.kind === 'animation' && String(art.mime || '').startsWith('video/');
              const isLatestRev = art.revision === project.revision && !dirty;
              return h(
                'li',
                { key: art.id, className: 'bl-ae-row dsh-row', 'data-dsh-row': '' },
                isImage
                  ? h('img', {
                      className: 'bl-ae-thumb',
                      src: urlFor(project, 'artifact', { artifact: art.id }),
                      alt: art.file,
                      width: 80,
                      height: 54,
                      loading: 'lazy',
                    })
                  : h(
                      'span',
                      { className: 'bl-ae-icon-box', 'aria-hidden': 'true' },
                      h(W.Icon, { name: isVideo ? 'play' : 'cube', size: 22 }),
                    ),
                h(
                  'div',
                  { className: 'bl-ae-row-main' },
                  h(
                    'div',
                    { className: 'bl-ae-title-line' },
                    h('strong', { 'data-dsh-serif': '' }, artifactKindLabel(art.kind) + ' · ' + art.file),
                    isLatestRev
                      ? h('span', { className: 'w-tag bl-tag-fresh' }, t('当前修订', 'Current'))
                      : h('span', { className: 'w-tag' }, 'R' + art.revision),
                  ),
                  h(
                    'p',
                    { className: 'w-muted bl-ae-meta-line' },
                    [
                      art.engine,
                      art.samples ? art.samples + ' spp' : null,
                      art.width && art.height ? art.width + '×' + art.height : null,
                      formatBytes(art.size),
                      art.durationMs ? (art.durationMs / 1000).toFixed(1) + 's' : null,
                      art.created ? new Date(art.created).toLocaleString() : null,
                    ]
                      .filter(Boolean)
                      .join(' · '),
                  ),
                ),
                h(
                  'div',
                  { className: 'dsh-row-actions', 'data-always-visible': 'true', 'data-window-drag-exclude': '' },
                  isImage || isVideo
                    ? h(
                        W.Button,
                        {
                          size: 'sm',
                          variant: 'ghost',
                          icon: 'eye',
                          onClick: () => {
                            setStageView(art.kind === 'contact_sheet' ? 'contact_sheet' : art.kind === 'animation' ? 'animation' : 'still');
                            setEditorTab('studio');
                          },
                        },
                        t('在舞台查看', 'Inspect'),
                      )
                    : null,
                  h(
                    'a',
                    {
                      className: 'w-button',
                      href: urlFor(project, 'artifact', { artifact: art.id, download: '1' }),
                      download: '',
                    },
                    h(W.Icon, { name: 'download', size: 14 }),
                    t('下载', 'Download'),
                  ),
                ),
              );
            }),
          )
        : h(
            W.Empty,
            { title: t('暂无该类成品', 'No artifacts yet'), icon: 'cube' },
            t('在「3D 工作室」点击预览静帧、四视角自检、渲染动画或上方导出按钮生成成品。', 'Render stills, 4-view QC, animations, or export 3D models from 3D Studio.'),
          ),

      // Source Backup & Archive row
      h(
        'div',
        { className: 'bl-backup-row' },
        h(
          'a',
          {
            className: 'w-button',
            href: urlFor(project, 'source'),
            download: '',
          },
          h(W.Icon, { name: 'download', size: 15 }),
          t('下载可编辑工程源码备份 (.zip)', 'Download editable project backup (.zip)'),
        ),
        h(
          'div',
          { className: 'w-toolbar' },
          h(
            W.Button,
            {
              icon: 'folder',
              variant: 'ghost',
              disabled: busy || dirty || activeJob,
              onClick: () => setArchiveReview(true),
            },
            t('归档此工程', 'Archive project'),
          ),
          onTrashRequest
            ? h(
                W.Button,
                {
                  icon: 'trash',
                  variant: 'danger',
                  disabled: busy || dirty || activeJob,
                  onClick: () => onTrashRequest(project, false),
                },
                t('移入回收站', 'Move to Recycle Bin'),
              )
            : null,
        ),
      ),
    ),

    // Delete asset confirmation dialog
    removeTarget
      ? h(
          W.Dialog,
          {
            className: 'dbw blender-dialog',
            title: t('移除工程素材副本', 'Remove project asset copy'),
            closeLabel: t('取消', 'Cancel'),
            busy: running,
            onClose: () => setRemoveTarget(null),
          },
          h('p', null, removeTarget.name),
          h('p', { className: 'w-muted' }, t('仅移除本工程目录中的副本，你的原始本地文件不受影响。', 'Only removes the copy stored in this project; your original local file is unchanged.')),
          h(
            'div',
            { className: 'w-toolbar' },
            h(
              W.Button,
              {
                variant: 'danger',
                icon: 'trash',
                disabled: running || dirty,
                onClick: () =>
                  perform(async () => {
                    const updated = await api({
                      action: 'removeAsset',
                      id: project.id,
                      revision: project.revision,
                      asset: removeTarget.id,
                    });
                    if (updated && updated.id) setProject(updated);
                    setRemoveTarget(null);
                    setNotice(t('素材副本已移除。', 'Asset copy removed.'));
                  }),
              },
              t('确认移除', 'Confirm remove'),
            ),
            h(W.Button, { disabled: running, onClick: () => setRemoveTarget(null) }, t('取消', 'Cancel')),
          ),
        )
      : null,
  );
}

const BLENDER_ASSETS_CSS = `
.bl-ae-root{display:flex;flex-direction:column;gap:14px;max-width:1040px;padding:8px 0 24px;min-width:0}
.bl-ae-card{display:flex;flex-direction:column;gap:12px;padding:16px 18px;border:var(--dsh-control-border-width,1px) solid var(--w-border);border-radius:var(--dsw-radius-md,12px);background:var(--dsw-alias-settings-card-fill,var(--w-canvas));min-width:0}
.bl-ae-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
.bl-ae-sub{margin:3px 0 0;font-size:12px;line-height:1.45;max-width:72ch}
.bl-dropzone{display:flex;align-items:center;gap:14px;padding:14px 16px;border:1.5px dashed var(--w-border);border-radius:var(--dsw-radius-md,10px);background:var(--w-bg);cursor:pointer;transition:border-color 140ms ease,background-color 140ms ease}
.bl-dropzone:hover:not([data-disabled="true"]){border-color:var(--w-accent);background:color-mix(in oklab,var(--w-accent) 6%,var(--w-bg))}
.bl-dropzone[data-drag-active="true"]{border-style:solid;border-color:var(--w-accent);background:color-mix(in oklab,var(--w-accent) 12%,var(--w-bg))}
.bl-dropzone[data-disabled="true"]{opacity:0.55;cursor:not-allowed}
.bl-dropzone-icon{width:40px;height:40px;border-radius:10px;display:inline-grid;place-items:center;flex:none;background:var(--w-canvas);border:var(--dsh-control-border-width,1px) solid var(--w-border);color:var(--w-accent)}
.bl-dropzone-copy{display:flex;flex-direction:column;gap:3px;min-width:0}
.bl-dropzone-copy strong{font-size:13px;color:var(--w-text)}
.bl-dropzone-copy p{margin:0;font-size:11.5px;line-height:1.45}
.bl-ae-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px}
.bl-ae-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:10px 14px;border:var(--dsh-control-border-width,1px) solid var(--w-border);border-radius:var(--dsw-radius-sm,10px);background:var(--w-bg);min-width:0}
.bl-ae-thumb{width:72px;height:52px;object-fit:cover;border-radius:6px;background:var(--w-soft);flex:none}
.bl-ae-icon-box{width:46px;height:46px;border-radius:8px;display:inline-grid;place-items:center;background:var(--w-canvas);border:var(--dsh-control-border-width,1px) solid var(--w-border);color:var(--w-accent);flex:none}
.bl-ae-row-main{flex:1 1 200px;min-width:0;display:flex;flex-direction:column;gap:4px;overflow-wrap:anywhere}
.bl-ae-title-line{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.bl-ae-tags{display:flex;flex-wrap:wrap;gap:5px}
.bl-ae-meta-line{margin:0;font-size:11.5px;font-family:var(--dsh-font-mono,ui-monospace,monospace)}
.bl-tag-fresh{color:var(--dsw-alias-state-success-primary,#24794a)}
.bl-ph-disabled{display:flex;flex-direction:column;gap:8px}
.bl-ph-disabled p{margin:0}
.bl-ph-form{display:grid;grid-template-columns:minmax(0,1fr) 150px 84px auto;gap:8px;align-items:center}
.bl-ph-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:10px}
.bl-ph-card{display:flex;flex-direction:column;gap:6px;padding:10px;border:var(--dsh-control-border-width,1px) solid var(--w-border);border-radius:var(--dsw-radius-sm,10px);background:var(--w-bg);min-width:0}
.bl-ph-thumb{width:100%;height:104px;object-fit:cover;border-radius:6px;background:var(--w-soft)}
.bl-ph-thumb-empty{display:grid;place-items:center;color:var(--w-muted)}
.bl-ph-name{font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bl-ph-meta{font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bl-quick-export-bar{display:flex;flex-wrap:wrap;gap:6px}
.bl-filter-pills{display:flex;flex-wrap:wrap;gap:6px}
.bl-backup-row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding-top:10px;border-top:var(--dsh-control-border-width,1px) solid var(--w-border)}
@container dsh-workbench (max-width:680px){.bl-ph-form{grid-template-columns:1fr 1fr}}
`;
