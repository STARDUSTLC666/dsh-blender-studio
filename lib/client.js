// Generated: shared optional update controls; edit the original client templates.
(function(){
/* DSH workbench UI v1. MIT. Canonical source: dsh-suite/ui/workbench-ui.js.
 * Vendored into each plugin: no Suite or extra runtime dependency is required.
 * Styles are scoped to .dshw and never replace the host chrome or theme.
 */
function createWorkbenchUI(React) {
  const h = React.createElement;
  const { useEffect, useId, useRef } = React;
  const cx = (...values) => values.filter(Boolean).join(' ');
  const paths = {
    book: ['M4 4h6a3 3 0 0 1 2 2v15a4 4 0 0 0-4-2H4z', 'M20 4h-6a3 3 0 0 0-2 2v15a4 4 0 0 1 4-2h4z'],
    calendar: ['M5 5h14a2 2 0 0 1 2 2v13H3V7a2 2 0 0 1 2-2Z', 'M7 3v4M17 3v4M3 10h18'],
    mail: ['M3 5h18v14H3z', 'm3 6 9 7 9-7'],
    rss: ['M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16', 'M4 19h.01'],
    slides: ['M3 4h18v13H3z', 'M12 17v4M8 21h8'],
    shield: ['m12 3 8 3v6c0 4-4 7-8 9-4-2-8-5-8-9V6z', 'm8 12 3 3 5-6'],
    layers: ['M5 3h16v16H5z', 'M2 7v15h15'],
    play: ['m9 6 9 6-9 6Z'],
    video: ['M3 5h12v14H3z', 'm15 10 6-4v12l-6-4'],
    search: ['M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z', 'm16 16 5 5'],
    plus: ['M12 5v14M5 12h14'],
    refresh: ['M20 7a9 9 0 1 0 1 8', 'M20 2v5h-5'],
    settings: ['m9 3-.7 2.4-2 .9L4 5.8 2.5 8.4l1.7 1.8v2.3L2.5 14 4 17l2.5-.4 1.9 1L9 20h3l.8-2.4 2-1 2.5.4 1.5-2.7-1.7-1.9v-2.2l1.7-1.8-1.5-2.6-2.5.4-2-1L12 3Z', 'M14 11.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z'],
    close: ['m6 6 12 12M18 6 6 18'],
    left: ['m14 5-7 7 7 7'],
    right: ['m10 5 7 7-7 7'],
    down: ['m5 9 7 7 7-7'],
    filter: ['M4 5h16M7 12h10M10 19h4'],
    download: ['M12 3v12m-5-5 5 5 5-5', 'M4 16v5h16v-5'],
    upload: ['M12 16V4m-5 5 5-5 5 5', 'M4 16v5h16v-5'],
    copy: ['M8 8h13v13H8z', 'M16 8V3H3v13h5'],
    external: ['M14 3h7v7m0-7L10 14', 'M10 3H3v18h18v-7'],
    file: ['M4 3h10l6 6v12H4z', 'M14 3v6h6M8 13h8M8 17h6'],
    folder: ['M3 5h7l2 3h9v12H3z'],
    edit: ['m15 4 5 5-10 10-6 1 1-6Z', 'm13 6 5 5'],
    trash: ['M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7'],
    more: ['M5 12h.01M12 12h.01M19 12h.01'],
    info: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 11v6M12 7h.01'],
    check: ['m5 12 4 4L19 6'],
    quote: ['M4 12h6v7H3v-7c0-4 2-6 5-7M15 12h6v7h-7v-7c0-4 2-6 5-7'],
    star: ['m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z'],
    reply: ['m9 5-7 7 7 7v-5h6c3 0 5 2 6 5 0-8-4-11-12-11Z'],
    link: ['m10 13 4-4M8 16l-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0', 'm14 8 2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0'],
  };
  function Icon({ name = 'file', size = 20, ...props }) {
    return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false, ...props },
      (paths[name] || paths.file).map((d, index) => h('path', { key: index, d })));
  }
  function Button({ children, icon, variant, className, ...props }) {
    return h('button', { type: 'button', ...props, className: cx('w-button', variant && 'w-' + variant, className) }, icon ? h(Icon, { name: icon, size: 18 }) : null, children);
  }
  function IconButton({ label, icon, ...props }) {
    return h(Button, { ...props, icon, className: cx('w-icon-button', props.className), 'aria-label': label, title: label });
  }
  function Page({ title, subtitle, actions, children, workbench = false, className, rootRef, ...props }) {
    return h('section', { ...props, ref: rootRef, className: cx('dshw', 'w-page', className), 'data-main': workbench ? 'true' : 'false' },
      h(Styles, { key: 'styles' }),
      h('header', { className: 'w-page-header' }, h('div', { className: 'w-heading' }, h('h1', null, title), subtitle ? h('p', { className: 'w-subtitle' }, subtitle) : null), actions ? h('div', { className: 'w-header-actions' }, actions) : null),
      h('div', { className: 'w-body' }, children));
  }
  function Tabs({ items, value, onChange, label, children }) {
    const id = useId();
    const active = items.some(item => item.id === value) ? value : items[0]?.id;
    function keys(event, index) {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
      const node = event.currentTarget.parentElement?.querySelectorAll('[role=tab]')[next];
      if (node) { onChange(items[next].id); node.focus(); }
    }
    return h('div', { className: 'w-tabs-layout' },
      h('div', { className: 'w-tabs', role: 'tablist', 'aria-label': label }, items.map((item, index) => h('button', {
        type: 'button', role: 'tab', key: item.id, id: id + '-' + item.id, 'aria-controls': id + '-panel', 'aria-selected': active === item.id, tabIndex: active === item.id ? 0 : -1,
        onClick: () => onChange(item.id), onKeyDown: event => keys(event, index),
      }, item.label, item.count !== undefined ? h('span', { className: 'w-count' }, item.count) : null))),
      h('div', { className: 'w-tab-panel', id: id + '-panel', role: 'tabpanel', 'aria-labelledby': id + '-' + active }, children));
  }
  function Status({ children, tone = 'info', className }) {
    if (!children) return null;
    return h('div', { className: cx('dshw', 'w-status', 'w-status-' + tone, className), role: tone === 'error' ? 'alert' : 'status', 'aria-live': tone === 'error' ? 'assertive' : 'polite' }, h(Icon, { name: tone === 'success' ? 'check' : 'info', size: 18 }), h('div', null, children));
  }
  function Empty({ title, children, action, icon = 'file' }) {
    return h('div', { className: 'dshw w-empty' }, h(Styles, { key: 'styles' }), h(Icon, { name: icon, size: 32 }), h('h2', null, title), children ? h('div', { className: 'w-muted' }, children) : null, action ? h('div', { className: 'w-toolbar' }, action) : null);
  }
  function Split({ list, detail, selected, onBack, backLabel, className, listWidth = 360 }) {
    const ref = useRef(null);
    useEffect(() => {
      if (!selected || !ref.current || ref.current.clientWidth > 760) return;
      const heading = ref.current.querySelector('.w-detail h2');
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    }, [selected]);
    return h('div', { ref, className: cx('w-split', className), 'data-selected': selected ? 'true' : 'false', style: { '--w-list-width': listWidth + 'px' } },
      h('div', { className: 'w-master' }, list),
      h('div', { className: 'w-detail' }, selected ? h(Button, { className: 'w-back', icon: 'left', variant: 'ghost', onClick: onBack }, backLabel) : null, detail));
  }
  function Row({ title, meta, description, active, onClick, children, status, className, disabled }) {
    return h('div', { className: cx('w-row', active && 'w-selected', className) },
      children ? h('div', { className: 'w-row-select' }, children) : null,
      h('button', { type: 'button', className: 'w-row-button', onClick, disabled, 'aria-pressed': !!active },
        h('span', { className: 'w-row-head' }, h('strong', null, title), status ? h('span', { className: 'w-tag' }, status) : null),
        meta ? h('span', { className: 'w-row-meta' }, meta) : null,
        description ? h('span', { className: 'w-row-description' }, description) : null));
  }
  function Search({ label, value, onChange, ...props }) {
    const id = useId();
    return h('div', { className: 'w-search' }, h(Icon, { name: 'search', size: 18 }), h('input', { type: 'search', id, 'aria-label': label, placeholder: label, value, onChange, ...props }));
  }
  function Switch({ label, checked, onChange, disabled }) {
    return h('label', { className: 'w-switch-label' }, h('span', null, label), h('input', { type: 'checkbox', role: 'switch', checked, disabled, onChange, 'aria-label': label }), h('span', { className: 'w-switch-track', 'aria-hidden': true }));
  }
  function Dialog({ title, children, onClose, closeLabel, className, busy = false }) {
    const id = useId(), panel = useRef(null);
    useEffect(() => {
      const previous = document.activeElement;
      panel.current?.querySelector('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')?.focus();
      return () => { if (previous?.isConnected) previous.focus({ preventScroll: true }); };
    }, []);
    function keydown(event) {
      if (event.key === 'Escape' && !event.isComposing) { event.preventDefault(); event.stopPropagation(); if (!busy) onClose(); return; }
      if (event.key !== 'Tab') return;
      const controls = [...panel.current.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]')].filter(node => node.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (!controls.length) { event.preventDefault(); panel.current.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    return h('div', { className: 'dshw w-overlay', onClick: event => { if (!busy && event.target === event.currentTarget) onClose(); } },
      h(Styles, { key: 'styles' }),
      h('section', { ref: panel, className: cx('w-dialog', className), role: 'dialog', 'aria-modal': true, 'aria-labelledby': id, tabIndex: -1, onKeyDown: keydown },
        h('header', { className: 'w-dialog-header' }, h('h2', { id }, title), h(IconButton, { icon: 'close', label: closeLabel, disabled: busy, onClick: onClose })), h('div', { className: 'w-dialog-body' }, children)));
  }
  function register(ctx, { id, label, icon, component, inject, order = 50 }) {
    // The two slots are optional. Existing settings and manual tools still load
    // in hosts without a workbench, while RC.3 owns navigation/pinning itself.
    ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: id, inject: () => ({ ...(inject?.() || {}), workbench: true }) }, component));
    ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id, order, label }, function WorkbenchIcon({ size }) { return h(Icon, { name: icon, size }); }));
  }
  const styles = `
.dshw{--w-bg:var(--dsw-alias-bg-layer-1,#fff);--w-soft:var(--dsw-alias-bg-layer-2,#f7f8fa);--w-text:var(--dsw-alias-label-primary,#18202c);--w-muted:var(--dsw-alias-label-secondary,#667085);--w-border:var(--dsw-alias-border-l3,#e7e9ef);--w-accent:var(--dsh-plugin-workbench-accent,#4f6bdb);--w-selected:color-mix(in srgb,var(--w-accent) 10%,var(--w-bg));--w-primary:var(--w-text);--w-on-primary:var(--w-bg);container-type:inline-size;container-name:dsh-workbench;color:var(--w-text);font:14px/1.65 var(--dsh-font-family-content,system-ui,-apple-system,"Segoe UI","Microsoft YaHei",sans-serif);min-width:0;max-width:100%;box-sizing:border-box;text-align:start;color-scheme:inherit}
.dshw *,.dshw *:before,.dshw *:after{box-sizing:border-box}.dshw h1,.dshw h2,.dshw h3,.dshw h4,.dshw p{margin:0}.dshw h1{font-size:30px;line-height:1.25;letter-spacing:-.025em;font-weight:650}.dshw h2{font-size:24px;line-height:1.35;font-weight:650;letter-spacing:-.015em;overflow-wrap:anywhere}.dshw h3,.dshw h4{font-size:16px;line-height:1.4;font-weight:600}.dshw a{color:var(--w-accent);text-underline-offset:3px;overflow-wrap:anywhere}.dshw button,.dshw input,.dshw select,.dshw textarea{font:inherit;color:inherit;max-width:100%}.dshw input:not([type=checkbox]):not([type=radio]):not([type=file]),.dshw select,.dshw textarea{background:var(--dsw-specific-input-major,var(--w-bg));border:1px solid var(--w-border);border-radius:8px;padding:8px 11px;min-width:0;line-height:1.5}.dshw input:not([type=checkbox]):not([type=radio]):not([type=file]),.dshw select{min-height:38px}.dshw textarea{resize:vertical}.dshw input[type=checkbox],.dshw input[type=radio]{width:16px;height:16px;flex-shrink:0;accent-color:var(--w-accent)}.dshw :focus-visible{outline:2px solid var(--w-accent);outline-offset:3px}.dshw button:disabled,.dshw input:disabled,.dshw select:disabled,.dshw textarea:disabled{opacity:.5;cursor:not-allowed}.dshw label{font-size:13px}.dshw fieldset{min-width:0;border:1px solid var(--w-border);border-radius:8px}.dshw summary{cursor:pointer;font-weight:550;list-style:none;display:flex;align-items:center;gap:8px}.dshw summary::-webkit-details-marker{display:none}.dshw summary:after{content:'';display:block;margin-inline-start:auto;width:7px;height:7px;border-inline-end:1.75px solid currentColor;border-bottom:1.75px solid currentColor;transform:rotate(45deg);flex-shrink:0}.dshw details[open]>summary:after{transform:rotate(225deg)}.dshw details>summary+*{margin-top:12px}.dshw pre{white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.7 ui-monospace,SFMono-Regular,Consolas,monospace;max-width:100%;background:var(--w-soft);border-radius:6px;padding:14px}.dshw img,.dshw video,.dshw iframe{max-width:100%}
.w-page{display:flex;flex-direction:column;position:relative;padding:0;min-height:540px;gap:0}.w-page[data-main=true]{height:100%;min-height:0;padding:calc(24px + var(--dsh-frame-top-clearance,0px)) 28px 0 max(28px,var(--dsh-frame-leading-clearance,0px));overflow:auto}.dshw[data-main=true]{background:var(--w-bg)}.dshw.w-page,.dshw .w-body,.dshw .w-tab-panel{overflow-x:clip}.w-page-header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;padding-bottom:22px;flex-shrink:0}.w-heading{min-width:0}.w-subtitle{margin-top:8px!important;font-size:14px;color:var(--w-muted);line-height:1.6}.w-header-actions,.w-toolbar,.w-actions{display:flex;align-items:center;flex-wrap:wrap;gap:8px;min-width:0}.w-header-actions{justify-content:flex-end}.w-body,.w-tabs-layout{display:flex;flex-direction:column;flex:1;min-height:0;min-width:0}.w-body{overflow:auto}.w-tab-panel{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;overflow:auto}.w-tabs{display:flex;align-items:stretch;gap:20px;border-bottom:1px solid var(--w-border);flex-shrink:0;overflow-x:auto;scrollbar-width:thin}.dshw .w-tabs>button{border:0;border-bottom:2px solid transparent;background:transparent;padding:11px 8px 13px;white-space:nowrap;font-size:14px;font-weight:550;cursor:pointer;color:var(--w-muted);display:flex;align-items:center;gap:7px}.dshw .w-tabs>button[aria-selected=true]{border-bottom-color:var(--w-accent);color:var(--w-accent)}.w-count,.w-tag{font-size:12px;line-height:1.5;display:inline-flex;align-items:center;flex-shrink:0;background:var(--w-soft);border-radius:5px;padding:1px 6px;color:var(--w-muted)}.w-tabs [aria-selected=true] .w-count,.w-selected .w-tag{color:var(--w-accent);background:var(--w-selected)}
.dshw .w-button{display:inline-flex;justify-content:center;align-items:center;gap:7px;background:var(--w-bg);border:1px solid var(--w-border);border-radius:8px;padding:8px 12px;min-height:36px;line-height:1.4;font-size:14px;font-weight:500;cursor:pointer;text-decoration:none;white-space:normal}.dshw .w-button:not(:disabled):hover{background:var(--w-soft)}.dshw .w-primary{background:var(--w-primary);border-color:var(--w-primary);color:var(--w-on-primary)}.dshw .w-primary:not(:disabled):hover{background:var(--w-primary);opacity:.9}.dshw .w-ghost{background:transparent;border-color:transparent}.dshw .w-danger{color:var(--dsw-alias-state-error-primary,#b43c3c)}.dshw .w-icon-button{width:36px;min-width:36px;padding:8px}.dshw .w-button svg{flex-shrink:0}.w-muted{color:var(--w-muted);font-size:12px;line-height:1.6}.w-section{padding:24px 0;border-bottom:1px solid var(--w-border);min-width:0}.w-section>h3{margin-bottom:12px}.w-section>p+p{margin-top:8px}.w-fields{display:grid;gap:16px;min-width:0}.w-field{display:grid;gap:6px;min-width:0}.w-field>input,.w-field>select,.w-field>textarea{width:100%}.w-status{display:flex;align-items:flex-start;gap:8px;padding:11px 13px;margin:12px 0;border:1px solid var(--w-border);border-radius:8px;background:var(--w-soft);font-size:13px;overflow-wrap:anywhere;flex-shrink:0}.w-status>svg{flex-shrink:0;margin-top:2px}.w-status-error{color:var(--dsw-alias-state-error-primary,#ad3636)}.w-status-success{color:var(--dsw-alias-state-success-primary,#24794a)}.w-status-warn{color:var(--dsw-alias-state-warning-primary,#8a5a00)}.w-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:14px;width:100%;max-width:580px;padding:48px 24px;margin:auto;min-height:280px;overflow-wrap:anywhere}.w-empty>svg{color:var(--w-muted)}.w-empty h2{font-size:20px}.w-empty .w-muted{font-size:14px}.w-empty .w-toolbar{justify-content:center}
.w-split{display:grid;grid-template-columns:minmax(240px,var(--w-list-width)) minmax(0,1fr);min-height:460px;flex:1;min-width:0}.w-master{min-width:0;border-inline-end:1px solid var(--w-border);overflow:auto;padding-bottom:24px}.w-detail{min-width:0;padding:26px 28px;overflow:auto;overflow-wrap:anywhere;display:flex;flex-direction:column}.w-master-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:20px 16px}.w-search{display:flex;align-items:center;gap:8px;border:1px solid var(--w-border);border-radius:8px;padding:0 10px;min-width:0;flex:1;background:var(--w-bg)}.w-search>svg{color:var(--w-muted);flex-shrink:0}.dshw .w-search>input{border:0!important;background:transparent!important;padding:8px 0!important;width:100%;outline-offset:0}.w-row{display:flex;gap:0;min-width:0;position:relative;border-bottom:1px solid var(--w-border);border-inline-start:3px solid transparent}.w-row-select{display:flex;align-items:flex-start;padding:21px 0 0 14px}.dshw .w-row-button{display:flex;flex-direction:column;align-items:stretch;gap:7px;text-align:start;width:100%;padding:18px 18px 18px 16px;border:0;background:transparent;color:inherit;min-width:0;cursor:pointer;line-height:1.5}.dshw .w-row-button:hover{background:var(--w-soft)}.w-row-head{display:flex;align-items:flex-start;gap:10px;justify-content:space-between;min-width:0}.w-row-head>strong{font-size:14px;line-height:1.5;font-weight:600;overflow-wrap:anywhere}.w-row-meta,.w-row-description{color:var(--w-muted);font-size:12px;line-height:1.6;overflow-wrap:anywhere}.w-row-description{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.w-selected{background:var(--w-selected);border-inline-start-color:var(--w-accent)}.w-back{display:none!important}.w-detail-title{margin-bottom:12px!important}.w-detail-meta{color:var(--w-muted);font-size:13px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}.w-detail-footer{padding:24px 0;display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:auto;border-top:1px solid var(--w-border)}.w-detail-footer .w-muted{flex:1;min-width:160px}.w-definition{display:grid;grid-template-columns:minmax(80px,120px) minmax(0,1fr);gap:8px 16px;font-size:14px;margin:20px 0}.w-definition dt{color:var(--w-muted)}.w-definition dd{margin:0;min-width:0;overflow-wrap:anywhere}
.w-switch-label{display:inline-flex;align-items:center;gap:8px;font-size:13px;position:relative;cursor:pointer}.w-switch-label>input{position:absolute;opacity:0;inset-inline-end:0;width:36px!important;height:22px!important;margin:0;cursor:pointer}.w-switch-track{width:36px;height:22px;border-radius:12px;display:block;background:var(--w-border);border:1px solid var(--w-border);pointer-events:none;padding:2px;transition:background .15s}.w-switch-track:before{content:'';display:block;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 2px #0002;transition:transform .15s}.w-switch-label>input:checked+.w-switch-track{background:var(--w-accent);border-color:var(--w-accent)}.w-switch-label>input:checked+.w-switch-track:before{transform:translateX(14px)}.w-switch-label>input:focus-visible+.w-switch-track{outline:2px solid var(--w-accent);outline-offset:3px}.w-switch-label:has(>input:disabled){opacity:.5;cursor:not-allowed}
.w-overlay{position:fixed;inset:0;background:#0005;display:flex;justify-content:flex-end;z-index:1000;padding:12px;overflow:auto}.w-dialog{width:min(620px,100%);max-height:100%;display:flex;flex-direction:column;min-height:0;background:var(--w-bg);color:var(--w-text);border:1px solid var(--w-border);border-radius:12px;box-shadow:0 18px 70px #0003}.w-dialog-header{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:20px 24px;border-bottom:1px solid var(--w-border);flex-shrink:0}.w-dialog-header>h2{font-size:20px}.w-dialog-body{overflow:auto;padding:20px 24px;min-height:0}.w-editor-grid{display:grid;grid-template-columns:210px minmax(0,1fr) 300px;min-height:500px;flex:1}.w-editor-list{padding:20px 12px;border-inline-end:1px solid var(--w-border);min-width:0}.w-editor-canvas{background:var(--w-soft);padding:20px;min-width:0;display:flex;flex-direction:column;gap:14px}.w-editor-inspector{padding:24px;border-inline-start:1px solid var(--w-border);min-width:0;overflow:auto}.w-editor-inspector h3{margin-bottom:18px}.w-preview-empty{display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:12px;aspect-ratio:16/9;min-height:180px;background:var(--w-soft);border:1px solid var(--w-border);border-radius:8px;padding:24px;color:var(--w-muted)}.w-content-pad{padding:24px 0}.w-stack{display:flex;flex-direction:column;gap:16px;min-width:0}.w-scroll-x{overflow:auto;max-width:100%}
@container dsh-workbench (max-width:1000px){.w-editor-grid{grid-template-columns:160px minmax(0,1fr)}.w-editor-inspector{grid-column:1/-1;border-inline-start:0;border-top:1px solid var(--w-border)}.w-header-actions{max-width:60%}.w-split{grid-template-columns:minmax(240px,32%) minmax(0,1fr)}}
@container dsh-workbench (max-width:760px){.w-page-header{gap:14px;flex-wrap:wrap;padding-bottom:18px}.w-heading{flex:1;min-width:170px}.dshw h1{font-size:24px}.w-header-actions{max-width:100%;justify-content:flex-start}.w-subtitle{font-size:13px}.w-tabs{gap:12px}.dshw .w-tabs>button{padding:10px 4px 12px}.w-split{display:block;min-height:360px}.w-split[data-selected=false]>.w-detail{display:none}.w-split[data-selected=true]>.w-master{display:none}.w-master{border-inline-end:0}.w-detail{padding:20px 0}.w-back{display:inline-flex!important;align-self:flex-start;margin:0 0 16px!important}.w-detail h2{font-size:22px}.w-master-toolbar{padding:16px 0}.dshw .w-row-button{padding:16px 10px}.w-detail-footer{position:static}.w-detail-footer .w-muted{flex-basis:100%}.w-editor-grid{display:flex;flex-direction:column}.w-editor-list{border-inline-end:0;border-bottom:1px solid var(--w-border);padding:16px 0}.w-editor-canvas{padding:16px 0;background:var(--w-bg)}.w-editor-inspector{padding:20px 0}.w-dialog-header,.w-dialog-body{padding:16px}.w-button{min-height:40px}.w-definition{grid-template-columns:80px minmax(0,1fr)}}
@media(max-width:700px){.w-page[data-main=true]{padding:calc(16px + var(--dsh-frame-top-clearance,0px)) 16px 0 max(16px,var(--dsh-frame-leading-clearance,0px))}.w-overlay{padding:8px}.w-dialog{width:100%}}
@media(prefers-reduced-motion:reduce){.dshw *,.dshw *:before{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
`;
  function Styles() { return h('style', null, styles); }
  return { Icon, Button, IconButton, Page, Tabs, Status, Empty, Split, Row, Search, Switch, Dialog, Styles, register, styles };
}

/* One update control per plugin. Only transport, idle guards and installation
 * coordination are shared; no global update page or update-all action exists. */
function __stardustUpdatesGuards() {
  const key = Symbol.for('stardustlc.plugin-updates.guards.v1');
  return globalThis[key] ||= { values: new Map(), listeners: new Set(), viewListeners: new Set(), clients: new Set() };
}
function __stardustUpdatesGuard(React, name, { dirty = false, busy = false, retainOnClose = false } = {}) {
  const token = React.useRef(null);
  if (!token.current) token.current = {};
  React.useLayoutEffect(() => {
    const pool = __stardustUpdatesGuards();
    if (!dirty && !busy) for (const [key, value] of pool.values) if (value.name === name && value.orphan) pool.values.delete(key);
    pool.values.set(token.current, { name, dirty: !!dirty, busy: !!busy, retainOnClose, orphan: false });
    for (const listener of pool.listeners) listener();
  }, [name, !!dirty, !!busy, retainOnClose]);
  React.useEffect(() => () => {
    const pool = __stardustUpdatesGuards(), value = pool.values.get(token.current);
    if (value?.retainOnClose && (value.dirty || value.busy)) value.orphan = true;
    else pool.values.delete(token.current);
    for (const listener of pool.listeners) listener();
  }, []);
}
function __StardustPluginUpdatesFooter({ React, name }) {
  const [, render] = React.useState(0), pool = __stardustUpdatesGuards();
  React.useEffect(() => { const fn = () => render(value => value + 1); pool.viewListeners.add(fn); return () => pool.viewListeners.delete(fn); }, []);
  const client = [...pool.clients].find(client => typeof client.Footer === 'function' && client.has(name));
  if (!client) return null;
  return React.createElement(client.Footer, { name });
}
function __stardustUpdatesFooter(React, name) {
  return React.createElement(__StardustPluginUpdatesFooter, { key: 'plugin-updates', React, name });
}
function __stardustUpdatesInlinePage(React, element, name) {
  return React.cloneElement(element, null, element.props.children, __stardustUpdatesFooter(React, name));
}
function __stardustUpdatesDetailName(subject, rows) {
  if (!subject || !['bundle', 'row'].includes(subject.kind)) return null;
  if (subject.kind === 'row' && subject.pkg?.name === '@stardustlc/dsh-suite') {
    const component = rows.find(row => row.bundledBy === subject.pkg.name && (subject.row?.moduleName === row.name || subject.row?.moduleName?.startsWith(row.name + '/')));
    if (component) return component.name;
  }
  return rows.some(row => row.name === subject.pkg?.name) ? subject.pkg.name : null;
}
function __stardustUpdatesNativeFormState(document) {
  let dirty = false, busy = false;
  for (const scope of document.querySelectorAll('[data-plugin-detail],[data-plugin-row-detail]')) for (const button of scope.querySelectorAll('button')) {
    if (!button.getClientRects().length || button.closest('.plugin-updates-footer')) continue;
    const label = (button.getAttribute('aria-label') || button.textContent || '').trim();
    if (/^(?:正在保存|保存中|Saving)(?:[.…\s]|$)/i.test(label) || button.getAttribute('aria-busy') === 'true') busy = true;
    if (!button.disabled && button.getAttribute('aria-disabled') !== 'true' && /^(?:保存(?:更改|设置|配置)?|Save(?: changes| settings| configuration)?)(?:\s+(?:Ctrl|⌘|Enter|↵).*)?$/i.test(label)) dirty = true;
  }
  return { dirty, busy };
}
function __stardustUpdatesDisplayRows(next, known) {
  for (const row of next.rows) known.set(row.name, row);
  if (!['verifying', 'installing', 'cancelling', 'unknown', 'restore-failed'].includes(next.job?.state)) return next;
  const rows = [...next.rows];
  for (const row of known.values()) if ((row.name === next.job.name || row.bundledBy === next.job.name) && !rows.some(item => item.name === row.name)) rows.push({ ...row, updating: true });
  return { ...next, rows };
}
function __stardustUpdatesSuiteRows(next, participants) {
  // The official manager lists top-level dependencies, not Suite's transitive
  // components. Project active, build-identified clients for display only.
  // Installation and preferences still use the real Suite row from the host.
  const suiteUpdating = next.job?.name === '@stardustlc/dsh-suite' && ['verifying', 'installing', 'cancelling', 'unknown', 'restore-failed'].includes(next.job?.state);
  const suite = next.rows.find(row => row.name === '@stardustlc/dsh-suite' && (row.enabled || suiteUpdating));
  if (!suite) return next;
  const rows = [...next.rows], names = new Set(rows.map(row => row.name));
  for (const item of participants) if (item.suiteComponent && item.packageVersion && item.label && !names.has(item.name)) {
    names.add(item.name);
    rows.push({ name: item.name, version: item.packageVersion, enabled: true, sourceKind: 'suite', loadError: false, label: item.label, labelEn: item.labelEn, bundledBy: suite.name });
  }
  return { ...next, rows };
}
function __stardustUpdatesWrap(definition, participant) {
  return { ...definition, factory(require) {
    const original = definition.factory(require);
    if (!original || typeof original !== 'object') return original;
    const React = require('react');
    return { ...original, apply(ctx, ...args) {
      const result = original.apply?.call(this, ctx, ...args);
      // The optional alpha.3 slot stays dormant in older hosts; its scoped
      // injection unregisters naturally when the plugin is unloaded.
      if (participant.iconData && participant.sectionIds?.length && typeof ctx.inject === 'function') ctx.inject(['slots'], host => {
        for (const id of new Set(participant.sectionIds)) host.slots.inject('settings.section.icon', () => host.slots.register({ name: 'settings.section.icon', id }, function PluginSettingsIcon({ size = 20 }) {
          return React.createElement('img', { src: participant.iconData, alt: '', 'aria-hidden': true, width: size, height: size, style: { objectFit: 'contain', display: 'block', flexShrink: 0 } });
        }));
      });
      if (typeof ctx.inject === 'function') ctx.inject(['slots', 'locale', 'remote', 'remote.pluginManager'], host => __stardustUpdatesJoin(host, React, require, participant));
      return result;
    } };
  } };
}
function __stardustUpdatesJoin(host, React, require, participant) {
  const key = Symbol.for('stardustlc.plugin-updates.client.v1'), pools = globalThis[key] ||= new WeakMap(), root = host.root || host;
  if (typeof root.plugin !== 'function') return;
  let record = pools.get(root);
  if (!record) {
    record = { refs: new Map(), timer: null, version: participant.version, alive: true, hold: false, uiRevision: 11, migration: Promise.resolve() };
    pools.set(root, record);
    __stardustUpdatesActivate(record, pools, root, React, require);
  } else if ((record.uiRevision || 0) < 11 && !record.upgrading) {
    // An earlier loaded participant may still own an older client revision. Keep
    // its references and draft guards, wait for any admitted install, then
    // replace that one client fiber instead of running two window heartbeats.
    const shared = record;
    const previousMigration = record.migration;
    record.upgrading = record.migration = Promise.resolve(previousMigration).then(async () => {
      while (shared.alive && shared.hold) await new Promise(resolve => setTimeout(resolve, 500));
      if (!shared.alive || !shared.refs.size) return;
      await shared.fiber?.dispose?.();
      if (!shared.refs.size) return;
      shared.alive = true; shared.uiRevision = 11; pools.set(root, shared);
      __stardustUpdatesActivate(shared, pools, root, React, require);
    }).catch(() => { /* The original page remains usable if host disposal fails. */ });
  }
  clearTimeout(record.timer);
  const ref = {}; record.refs.set(ref, participant);
  host.effect(() => () => {
    record.refs.delete(ref);
    const stop = () => {
      if (record.refs.size || !record.alive) return;
      if (record.hold) { record.timer = setTimeout(stop, 1000); return; }
      record.alive = false; Promise.resolve(record.fiber?.dispose?.()).catch(() => {});
    };
    if (!record.refs.size) record.timer = setTimeout(stop, 1000);
  });
}
function __stardustUpdatesActivate(shared, pools, root, React, require) {
  shared.fiber = root.plugin({ name: 'stardustlc-plugin-updates-client', inject: ['slots', 'locale', 'remote', 'remote.pluginManager'], apply(ctx) {
    const client = __stardustUpdatesClient(ctx, React, require, shared);
    ctx.effect(() => () => { shared.alive = false; client.dispose(); if (pools.get(root) === shared) pools.delete(root); });
  } });
  Promise.resolve(shared.fiber).catch(() => { shared.alive = false; if (pools.get(root) === shared) pools.delete(root); });
}
function __stardustUpdatesClient(ctx, React, require, shared) {
  const h = React.createElement, W = createWorkbenchUI(React), route = new URL('api/stardustlc/plugin-updates', document.baseURI);
  const { useState, useEffect, useRef } = React, id = crypto.randomUUID(), listeners = new Set(), pool = __stardustUpdatesGuards(), requests = new Set(), knownRows = new Map();
  let alive = true, registered = false, state = null, lastInteraction = Date.now(), inPoll = false, manualOperation = false;
  const language = () => String(ctx.locale?.getSnapshot?.().active || '').startsWith('en') ? 'en' : 'zh';
  const t = (zh, en) => language() === 'en' ? en : zh;
  const REPOS = { 'dsh-calendar': 'dsh-calendar', 'dsh-cite': 'dsh-cite', 'dsh-code-security': 'dsh-code-security', 'dsh-codex-port': 'dsh-codex-port', 'deepseek-computer-use': 'deepseek-computer-use', 'dsh-dingtalk': 'dsh-dingtalk', '@stardustlc/dsh-docker': 'dsh-docker', '@stardustlc/dsh-dream': 'dsh-dream', 'dsh-email': 'dsh-email', 'dsh-ffmpeg': 'dsh-ffmpeg', 'dsh-flakefinder': 'dsh-flakefinder', 'dsh-hyperframes': 'dsh-hyperframes', 'dsh-minimal-ptc': 'dsh-minimal-ptc', 'dsh-ppt': 'dsh-ppt', 'dsh-remotion': 'dsh-remotion', '@stardustlc/dsh-review': 'dsh-review', 'dsh-rss': 'dsh-rss', 'dsh-slack': 'dsh-slack', 'dsh-sql': 'dsh-sql', '@stardustlc/dsh-suite': 'dsh-suite', 'dsh-voice': 'dsh-voice' };
  const repoUrl = pkg => Object.hasOwn(REPOS, pkg) ? 'https://github.com/STARDUSTLC666/' + REPOS[pkg] : null;
  const preferences = name => state?.preferences.packages[name] || { checkEnabled: true, autoInstall: false, autoScope: 'compatible', deferredUntil: 0, ignoredVersion: null };
  const originalRow = name => state?.rows.find(row => row.name === name);
  const rowFor = name => { const row = originalRow(name); return row?.bundledBy ? originalRow(row.bundledBy) : row; };
  const activeJob = () => ['verifying', 'installing', 'cancelling'].includes(state?.job?.state);
  function notify() { shared.hold = manualOperation || activeJob(); for (const listener of listeners) listener(); for (const listener of pool.viewListeners) listener(); }
  async function api(body = { action: 'state' }) {
    const controller = new AbortController(); requests.add(controller);
    const timeout = setTimeout(() => controller.abort(), body.action === 'check' ? 95000 : 45000);
    try {
      const response = await fetch(route, { method: 'POST', credentials: 'same-origin', cache: 'no-store', signal: controller.signal, headers: { 'content-type': 'application/json', 'x-stardustlc-updates': '1' }, body: JSON.stringify(body) });
      let data; try { data = await response.json(); } catch { throw new Error('service-unavailable'); }
      if (!response.ok || !data.ok) throw new Error(response.status === 403 ? 'owner-required' : data.code || 'service-unavailable');
      return data.value;
    } catch (error) { if (error?.name === 'AbortError') throw new Error('service-unavailable'); throw error; }
    finally { clearTimeout(timeout); requests.delete(controller); }
  }
  function pageState(manual = manualOperation) {
    const values = [...pool.values.values()], nativeForm = __stardustUpdatesNativeFormState(document);
    const dialog = [...document.querySelectorAll('[role="dialog"],dialog[open]')].some(node => node.getClientRects().length && !(manual && (node.closest('.plugin-updates-footer') || node.querySelector('.plugin-updates-footer'))));
    return { action: 'heartbeat', id, dirty: nativeForm.dirty || values.some(value => value.dirty), busy: nativeForm.busy || values.some(value => value.busy) || dialog, idleForMs: Math.min(86400000, Math.max(0, Date.now() - lastInteraction)) };
  }
  const heartbeat = () => api(pageState());
  function interaction() { lastInteraction = Date.now(); if (registered && alive) void heartbeat().catch(() => {}); }
  const guardChanged = () => { if (registered && alive) void heartbeat().catch(() => {}); };
  for (const event of ['pointerdown', 'keydown', 'input']) document.addEventListener(event, interaction, { capture: true, passive: true });
  pool.listeners.add(guardChanged);
  const close = () => { void fetch(route, { method: 'POST', credentials: 'same-origin', keepalive: true, headers: { 'content-type': 'application/json', 'x-stardustlc-updates': '1' }, body: JSON.stringify({ action: 'client-close', id }) }).catch(() => {}); };
  window.addEventListener('pagehide', close);
  async function refresh() { const next = await api(); if (alive) { state = __stardustUpdatesDisplayRows(__stardustUpdatesSuiteRows(next, shared.refs.values()), knownRows); notify(); } return next; }
  const STALE_CHECK_MS = 30 * 60 * 1000, STALE_RETRY_MS = 5 * 60 * 1000, staleChecks = new Map(), staleInFlight = new Set();
  function refreshIfStale(row) {
    if (!alive || !row || row.sourceKind !== 'registry' || row.bundledBy || !row.available || row.updating) return;
    const now = Date.now();
    if (row.checkedAt && now - row.checkedAt <= STALE_CHECK_MS) return;
    if (staleInFlight.has(row.name) || now - (staleChecks.get(row.name) ?? -Infinity) < STALE_RETRY_MS) return;
    staleChecks.set(row.name, now);
    staleInFlight.add(row.name);
    void (async () => {
      try { await api({ action: 'check', name: row.name }); await refresh(); }
      catch { /* Offline or transient errors stay silent and throttled by staleChecks. */ }
      finally { staleInFlight.delete(row.name); }
    })();
  }
  function useSnapshot() {
    const [, render] = useState(0);
    useEffect(() => { const fn = () => render(value => value + 1); listeners.add(fn); const stop = ctx.locale?.subscribe?.(fn); return () => { listeners.delete(fn); stop?.(); }; }, []);
    return state;
  }
  function message(code) {
    return ({
      'page-dirty': t('有未保存的修改。请先保存或放弃修改，再更新。', 'Save or discard unsaved changes before updating.'),
      'page-busy': t('有页面操作或对话框尚未结束，请完成后再试。', 'Finish the active page operation or close its dialog, then retry.'),
      'page-not-ready': t('还有窗口状态未确认，或旧版插件尚未提供状态保护。请刷新相关窗口，必要时先手动更新旧版插件。', 'A window state is unknown or an older plugin lacks state protection. Refresh the affected windows and manually update legacy plugins if needed.'),
      busy: t('DSH 正在执行任务或安装，请等操作结束。', 'DSH is running a task or installation. Wait for it to finish.'),
      'activity-unknown': t('无法确认任务是否空闲，已暂停安装。', 'Installation paused because task activity is unknown.'),
      'restart-required': t('更新服务需要重启后继续。请在方便时手动重启 DSH。', 'The updater needs a restart. Restart DSH manually when convenient.'),
      'operation-unconfirmed': t('上次安装未确认或恢复失败。请在官方插件管理中检查并修复，之后手动重启 DSH。', 'The last installation is unconfirmed or recovery failed. Check and repair it in native plugin management, then restart DSH manually.'),
      'check-first': t('检查结果已过期，请重新检查。', 'This check expired. Check again.'),
      'release-changed': t('发现更新的发布版本（或发布信息已更新），已刷新至最新状态，请再次确认安装。', 'A newer release or updated metadata was found and refreshed; confirm again to install.'),
      'preferences-conflict': t('另一个窗口修改了偏好，已刷新，请重试。', 'Preferences changed in another window. They have been refreshed; retry.'),
      'preferences-unreadable': t('更新偏好文件无法读取，自动安装已关闭。请检查当前 profile 的 stardustlc-plugin-updates.json。', 'Preferences could not be read. Automatic installation is off. Check stardustlc-plugin-updates.json in this profile.'),
      'no-update': t('版本已变化或暂不兼容，请重新检查。', 'The version changed or is incompatible. Check again.'),
      'source-not-registry': t('本地源码、Git 等安装，请通过原安装方式更新。', 'Update local, Git and other external sources through their original installation method.'),
      'managed-by-suite': t('这个插件随 Suite 安装，通过 Suite 更新。', 'This plugin was installed through Suite and is updated through Suite.'),
      'owner-required': t('只有 profile 拥有者能管理更新。', 'Only the profile owner can manage updates.'),
      'version-mismatch': t('宿主装入的版本与目标不同。请重新检查版本和软件源策略。', 'The installed version differs from the target. Check the release and registry policy.'),
      'unexpected-package': t('宿主装入的包或版本与目标不同。请检查版本和软件源策略。', 'The installed package or version differed from the target. Check the release and registry policy.'),
      'version-unconfirmed': t('尚未确认新版已加载，请在插件详情中检查当前版本。', 'The new version could not be confirmed. Check the installed version in plugin details.'),
      'build-blocked': t('构建脚本等待批准。请查看原生插件管理中的安装提示。', 'Build scripts await approval. Review the install details in native plugin management.'),
      'bundle-in-use': t('宿主暂时无法热卸载旧版（通常因本轮刚更新过其他共用底层依赖的插件，内存路径待刷新；或同时启用了包含此组件的组合包）：直接手动重启一次 DSH 即可继续更新，无需逐个停用插件。', 'The host cannot hot-unload the previous version right now (usually because another plugin sharing dependencies was updated earlier in this session, or a bundle containing this component is also active): restart DSH once and retry without disabling plugins one by one.'),
      'already-installed': t('该包已在当前配置中，请刷新或重启 DSH 后查看当前版本。', 'This package is already present in the profile; refresh or restart DSH to inspect its version.'),
      'incompatible-version': t('目标版本与当前运行的 DSH 版本不兼容。', 'The target version is incompatible with the running DSH version.'),
      'stop-profile': t('当前配置未启用热重载，需关闭 DSH 后再通过命令行更新。', 'This profile runs without hot reload; stop DSH and update via CLI.'),
      'not-removable': t('此内置或受保护插件不支持在此处移除替换。', 'This built-in or protected bundle cannot be replaced here.'),
      'pkg-network': t('连接 npm 源时网络中断，请稍后重试。', 'Network error reaching the package registry. Retry shortly.'),
      'pkg-timeout': t('包管理器请求超时，请检查网络后重试。', 'Package manager request timed out. Check your connection and retry.'),
      'pkg-not-found': t('未找到目标版本或已被源撤回，请重新检查更新。', 'Target release was not found on the registry. Check again.'),
      'pkg-no-matching-version': t('没有匹配当前兼容性要求的已发布版本。', 'No published version matches the compatibility constraints.'),
      'pkg-integrity': t('下载包的完整性校验未通过，已放弃安装，请重试。', 'Package integrity verification failed. Installation aborted; retry.'),
      'pkg-disk-full': t('磁盘空间不足，请清理后重试。', 'Disk space is full. Free disk space and retry.'),
      'pkg-permission': t('无权写入当前 profile 目录，请检查文件权限。', 'Permission denied writing to this profile directory.'),
      'pkg-pnpm-missing': t('未检测到可用的 pnpm，请在环境或宿主插件设置中检查。', 'pnpm is unavailable to the host package manager.'),
      'operation-error': t('宿主包管理器未能完成操作，可在原生「插件」详情页点击更新查看完整日志。', 'Host package manager did not complete the operation. Retry from native plugin details to inspect logs.'),
    })[code] || t('操作未完成，请刷新后重试。DSH 不会因此自动重启。', 'The operation could not be completed. Refresh and retry. DSH will not restart automatically.');
  }
  function reasonOf(job) {
    if (!job) return null;
    if (job.reason) return job.reason;
    const res = job.outcome?.result;
    if (res?.pendingBuilds || res?.failureKind === 'build-blocked') return 'build-blocked';
    if (res?.failureKind && ['network', 'timeout', 'not-found', 'no-matching-version', 'integrity', 'pnpm-missing', 'disk-full', 'permission'].includes(res.failureKind)) return 'pkg-' + res.failureKind;
    return res?.error?.code || null;
  }
  // releaseOf() keeps the failing engine/peer range check as a stable code; say which
  // environment has to change instead of only reporting that the release is incompatible.
  function requirement(release) {
    return ({
      'dsh-version': t('需要换成与该版本匹配的 DSH 本体', 'it needs a different DSH version'),
      'node-version': t('需要换成与该版本匹配的 Node.js', 'it needs a different Node.js version'),
      deprecated: t('作者已把这个版本标记为弃用', 'the author marked this release as deprecated'),
      'not-bundle': t('这个版本不是可加载的 DSH 插件包', 'this release is not a loadable DSH plugin bundle'),
    })[release?.reason] || t('发布元数据的兼容范围与当前环境不符', 'its published compatibility range does not match this environment');
  }
  function jobLabel(job) {
    if (job.state === 'installing') {
      const phase = ({
        checking: t('宿主正在检查版本', 'Host checking release'),
        removing: t('正在卸载旧版', 'Unloading the previous version'),
        applying: t('正在加载新版', 'Loading the new version'),
        restoring: t('正在恢复旧版', 'Restoring the previous version'),
      })[job.phase];
      if (phase) return phase;
    }
    return ({ verifying: t('正在核对版本', 'Verifying release'), installing: t('正在安装', 'Installing'), cancelling: t('正在请求取消', 'Requesting cancellation'), complete: t('已更新', 'Updated'), 'restart-required': t('已安装，等待你手动重启', 'Installed; manual restart needed'), restored: t('更新未成功，已恢复原版本', 'Update failed; previous version restored'), 'restore-failed': t('恢复未成功，请检查官方插件管理', 'Recovery failed; check native plugin management'), unknown: t('结果未确认，请检查官方插件管理', 'Result unconfirmed; check native plugin management'), cancelled: t('已取消', 'Cancelled'), failed: t('更新未成功', 'Update failed') })[job.state] || job.state;
  }
  const FOOTER_CSS = '.plugin-updates-footer{box-sizing:border-box;flex-shrink:0;margin-top:16px;padding-top:14px;border-top:var(--dsh-control-border-width,0.5px) solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l3,#e5e7eb));min-width:0;max-width:100%;color:var(--dsw-alias-label-primary,#202124)}'
    + '.dshw.plugin-updates-footer.is-inline{display:block!important;width:100%!important;max-width:100%!important;margin-block:auto 0!important;margin-inline:0!important;padding:6px 14px!important;border-top:var(--dsh-control-border-width,0.5px) solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l3,#e5e7eb));background:var(--dsw-alias-bg-layer-1,var(--w-soft,#f7f8fa));font-size:12px;line-height:1.45}'
    + '.plugin-updates-footer .updates-bar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px 12px;min-block-size:28px;min-width:0}'
    + '.plugin-updates-footer .updates-bar-info,.plugin-updates-footer .updates-bar-actions,.plugin-updates-footer .updates-head-actions,.plugin-updates-footer .updates-title-row{display:flex;align-items:center;flex-wrap:wrap;gap:6px 8px;min-width:0}'
    + '.plugin-updates-footer .updates-head{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px 12px}'
    + '.plugin-updates-footer .updates-compact-bar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px 12px}'
    + '.plugin-updates-footer .updates-compact-bar>.updates-options{margin-top:0;min-width:0}'
    + '.plugin-updates-footer .updates-compact-bar>.updates-options[open]{flex:1 1 100%}'
    + '.plugin-updates-footer h2{font-size:13.5px;line-height:1.4;margin:0;font-weight:600}'
    + '.plugin-updates-footer .updates-pill{display:inline-flex;align-items:center;padding:1px 7px;border-radius:999px;font-size:11px;font-weight:600;line-height:1.5;background:var(--dsw-alias-bg-layer-2,var(--w-soft,#eef1f6));color:var(--dsw-alias-label-secondary,#657080)}'
    + '.plugin-updates-footer .updates-pill.is-accent{background:color-mix(in srgb,var(--w-accent,#4f6bdb) 14%,transparent);color:var(--w-accent,#4f6bdb)}'
    + '.plugin-updates-footer .updates-pill.is-error{background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#ad3636) 14%,transparent);color:var(--dsw-alias-state-error-primary,#ad3636)}'
    + '.plugin-updates-footer .updates-mono,.plugin-updates-footer .updates-subtitle,.plugin-updates-footer .updates-version{font:12px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace;overflow-wrap:anywhere;margin:0}'
    + '.plugin-updates-footer .updates-badge{padding:1px 6px;border-radius:5px;background:var(--dsw-alias-bg-layer-2,var(--w-soft,#eef1f6));color:var(--dsw-alias-label-secondary,#657080)}'
    + '.plugin-updates-footer .updates-meta-line,.plugin-updates-footer .updates-note{margin:3px 0 0;font-size:12px;line-height:1.55}'
    + '.plugin-updates-footer .updates-inline-msg.is-error{color:var(--dsw-alias-state-error-primary,#ad3636);font-size:12px}'
    + '.plugin-updates-footer .w-button.is-sm{min-block-size:26px;min-inline-size:26px;min-height:26px;padding:3px 9px;font-size:12px;gap:5px;border-radius:6px}'
    + '.plugin-updates-footer .updates-options{margin-top:8px}'
    + '.plugin-updates-footer .updates-options>summary{cursor:pointer;display:inline-flex;align-items:center;gap:0.55ch;min-block-size:24px;font-size:12px;line-height:1.5;font-weight:500;color:var(--dsw-alias-label-secondary,#657080);list-style:none}'
    + '.plugin-updates-footer .updates-options>summary:after{display:none}'
    + '.plugin-updates-footer .updates-options>summary::before{content:"";inline-size:6px;block-size:6px;flex-shrink:0;border-inline-end:1.5px solid currentColor;border-block-end:1.5px solid currentColor;rotate:-45deg}'
    + '.plugin-updates-footer .updates-options>summary:dir(rtl)::before{rotate:135deg}'
    + '.plugin-updates-footer .updates-options[open]>summary::before{rotate:45deg}'
    + '.plugin-updates-footer .updates-options>summary:focus-visible{outline:2px solid var(--dsw-focus-ring-color,#6b79df);outline-offset:3px;border-radius:4px}'
    + '.plugin-updates-footer details::details-content{interpolate-size:allow-keywords;overflow:clip;contain:layout}'
    + '.plugin-updates-footer details:not([open])::details-content{block-size:0}'
    + '.plugin-updates-footer .updates-settings{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:14px;padding:10px 0 2px}'
    + '.plugin-updates-footer>.w-section{margin:8px 0 0;padding:0;border:0}'
    + '.plugin-updates-footer .w-toolbar{margin-top:8px!important}'
    + '.plugin-updates-footer .w-switch-label{max-width:100%;gap:12px;align-items:flex-start}'
    + '.plugin-updates-footer .w-switch-track{flex-shrink:0}'
    + '.plugin-updates-footer .updates-notes{margin-top:8px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l3,#e5e7eb);border-radius:8px;background:var(--dsw-alias-bg-base,var(--w-bg,#fff))}'
    + '.plugin-updates-footer .updates-notes pre{white-space:pre-wrap;overflow-wrap:anywhere;max-height:220px;overflow:auto;margin:6px 0;padding:10px;font:12px/1.65 ui-monospace,monospace}'
    + '.plugin-updates-footer .updates-notes pre code{font:inherit;background:transparent;padding:0}'
    + '.plugin-updates-footer .updates-links{display:flex;flex-wrap:wrap;align-items:center;gap:4px 14px;margin-top:10px;padding-top:8px;border-top:1px dashed var(--dsw-alias-border-l3,#e5e7eb);font-size:12px;line-height:1.5;color:var(--dsw-alias-label-secondary,#657080)}'
    + '.plugin-updates-footer .updates-links a{color:inherit;text-decoration:none;display:inline-flex;align-items:center;min-block-size:24px;gap:4px}'
    + '.plugin-updates-footer .updates-links a:hover{color:var(--dsw-alias-label-primary,#202124);text-decoration:underline}'
    + '.plugin-updates-footer .updates-links a:focus-visible{outline:2px solid var(--dsw-focus-ring-color,#6b79df);outline-offset:3px;border-radius:4px}'
    + '.plugin-updates-footer .w-overlay{z-index:1002}'
    + '.plugin-updates-footer .updates-auto-nudge{display:flex;align-items:center;flex-wrap:wrap;gap:6px 10px;margin-top:6px;font-size:12px;color:var(--dsw-alias-label-secondary,#657080)}'
    + '@media(pointer:coarse){.plugin-updates-footer .w-button.is-sm{min-block-size:32px;min-height:32px;padding:5px 11px}}'
    + '@media(prefers-reduced-motion:no-preference){.plugin-updates-footer .updates-options>summary::before{transition:rotate .18s ease}.plugin-updates-footer details::details-content{transition:block-size .22s ease,content-visibility .22s ease allow-discrete}}'
    + '@media(max-width:600px){.plugin-updates-footer .updates-head{gap:8px}.plugin-updates-footer .w-toolbar{gap:6px;flex-wrap:wrap}.plugin-updates-footer .w-button{max-width:100%}}';
  function FooterFrame({ name, label, inline = false, supplement = false, head, children }) {
    return h('section', { className: 'dshw plugin-updates-footer' + (inline ? ' is-inline' : ''), 'data-plugin-update-footer': name, 'aria-label': label + (supplement ? t(' · 自动更新与反馈', ' · Auto-update and feedback') : t(' · 版本与更新', ' · Version and updates')) },
      h('style', null, W.styles),
      h('style', null, FOOTER_CSS),
      head, children);
  }
  function Panel({ name, inline = false }) {
    const snapshot = useSnapshot(), [error, setError] = useState(''), [working, setWorking] = useState(false), [checking, setChecking] = useState(false), [dialog, setDialog] = useState(null), [selectedVersion, setSelectedVersion] = useState(null), [notes, setNotes] = useState(null), [notesOpen, setNotesOpen] = useState(false), [loadingNotes, setLoadingNotes] = useState(false), [dismissedJobId, setDismissedJobId] = useState(null);
    const seenActiveJob = useRef ? useRef(null) : { current: null };
    const row = rowFor(name), original = originalRow(name), target = row?.name || name, prefs = preferences(target), job = snapshot?.job?.name === target ? snapshot.job : null;
    if (job && ['verifying', 'installing', 'cancelling'].includes(job.state)) seenActiveJob.current = job.id;
    const panelStaleTarget = !!snapshot && !!row && !!original && (!inline || (row.sourceKind === 'registry' && row.available && prefs.deferredUntil <= Date.now() && prefs.ignoredVersion !== row.release?.version));
    useEffect(() => { if (panelStaleTarget && !activeJob()) refreshIfStale(row); }, [panelStaleTarget, row?.name, row?.available, row?.checkedAt]);
    async function perform(callback) { setError(''); setWorking(true); try { await callback(); await refresh(); } catch (error) { setError(error.message); await refresh().catch(() => {}); } finally { setWorking(false); } }
    async function save(changes, consent) { await api({ action: 'preferences', name: target, revision: state.preferences.revision, changes, consent }); }
    async function check() { setError(''); setChecking(true); try { staleChecks.set(target, Date.now()); await api({ action: 'check', name: target }); await refresh(); } catch (error) { setError(error.message); } finally { setChecking(false); } }
    async function runOperation(request) {
      setDialog(null); manualOperation = true; notify();
      setError(''); setWorking(true);
      try {
        try {
          await heartbeat();
          const started = await api(request);
          seenActiveJob.current = started.id;
          while (alive) {
            await new Promise(resolve => setTimeout(resolve, 800)); await heartbeat(); await refresh();
            if (state.job?.id !== started.id) throw new Error('operation-unconfirmed');
            if (!activeJob()) break;
          }
          await refresh();
        } finally { manualOperation = false; notify(); }
      } catch (err) {
        setError(err.message);
        if (request.action === 'install' && ['check-first', 'release-changed'].includes(err?.message)) {
          staleChecks.set(target, Date.now());
          await api({ action: 'check', name: target }).catch(() => {});
        }
        await refresh().catch(() => {});
      } finally { setWorking(false); }
    }
    async function showNotes() {
      if (notesOpen) { setNotesOpen(false); return; }
      setNotesOpen(true); setNotes(null); setLoadingNotes(true); setError('');
      try { setNotes(await api({ action: 'notes', name: target, version: row.release.version })); } catch (error) { setError(error.message); } finally { setLoadingNotes(false); }
    }
    if (inline && (!snapshot || !row || !original)) return null;
    if (!snapshot) return h('p', { className: 'dshw w-muted' }, t('正在读取更新状态…', 'Loading update status…'));
    if (!row || !original) return h(W.Status, null, t('此插件尚未安装或已从当前 profile 移除。', 'This plugin is not installed in the current profile.'));
    const title = language() === 'en' ? original.labelEn : original.label;
    const ownPage = pageState(true), unconfirmed = ['unknown', 'restore-failed'].includes(snapshot.job?.state);
    const staleWindows = (snapshot.pages.clients || []).some(client => !client.fresh);
    const pageBusy = ownPage.busy || (snapshot.pages.clients || []).some(client => client.id !== id && client.busy);
    const installLocked = working || activeJob() || unconfirmed || snapshot.updaterRestart || snapshot.preferenceError || !snapshot.activity.known
      || snapshot.activity.busy || snapshot.pages.dirty || ownPage.dirty || pageBusy || !snapshot.pages.known;
    const checkingThis = checking || snapshot.checkingNames?.includes(target);
    const managed = row.sourceKind === 'registry';
    const showUpdate = managed && row.available;
    const deferred = prefs.deferredUntil > Date.now();
    const ignored = !!row.release?.version && prefs.ignoredVersion === row.release.version;
    const actionableUpdate = showUpdate && !deferred && !ignored;
    const canConfirm = showUpdate && row.release?.version === selectedVersion && !installLocked && !row.loadError;
    const isSuite = target === '@stardustlc/dsh-suite';
    const jobResult = job?.outcome?.result;
    const jobReason = reasonOf(job);
    const jobActiveThis = !!job && ['verifying', 'installing', 'cancelling'].includes(job.state);
    const canCancel = jobActiveThis && !['applying', 'restoring'].includes(job.phase);
    const jobAttentionThis = !!job && ['restart-required', 'restored', 'restore-failed', 'unknown', 'failed'].includes(job.state) && (unconfirmed || dismissedJobId !== job.id);
    const jobJustCompleted = !!job && job.state === 'complete' && seenActiveJob.current === job.id && dismissedJobId !== job.id;
    const canSuggestAuto = !!job && job.state === 'complete' && !jobReason && job.mode !== 'automatic' && (!prefs.autoInstall || prefs.autoScope !== 'compatible') && managed && !snapshot.preferenceError && dismissedJobId !== job.id;
    const inlineJobVisible = jobActiveThis || jobAttentionThis || jobJustCompleted;
    if (inline && !actionableUpdate && !inlineJobVisible && !working && !checking && !error && !dialog && !notesOpen) return null;
    const notesSection = notesOpen && h('section', { className: 'updates-notes', 'aria-label': t('更新记录', 'Release notes') },
      h('strong', null, target + ' · ' + (notes?.version || row.release?.version || '')),
      loadingNotes ? h('p', { className: 'w-muted updates-note' }, t('正在读取…', 'Loading…'))
        : notes?.text ? h('pre', { tabIndex: 0, role: 'region', 'aria-label': t('更新记录内容', 'Release notes content') }, h('code', null, notes.text))
        : h('p', { className: 'w-muted updates-note' }, t('未找到此版本的独立更新记录。', 'No separate notes were found for this version.')),
      notes?.url && h('a', { href: notes.url, target: '_blank', rel: 'noreferrer noopener' }, t('查看仓库更新记录', 'View repository changelog')));
    const windowsDialog = dialog === 'windows' && h(W.Dialog, { title: t('断开的窗口都已关闭？', 'Are the disconnected windows closed?'), closeLabel: t('关闭', 'Close'), onClose: () => setDialog(null) },
      h('div', { className: 'w-stack' }, h('p', null, t('只清除超过 45 秒未回应的其他窗口记录。请先确认它们已经关闭；仍在使用的窗口请保存修改并刷新。当前或仍在回应的窗口保护会保留。', 'Only other windows silent for over 45 seconds are cleared. Confirm that they are closed; save and refresh windows still in use. Current and responsive windows remain protected.')), h('div', { className: 'w-toolbar' }, h(W.Button, { onClick: () => setDialog(null) }, t('取消', 'Cancel')), h(W.Button, { onClick: () => { setDialog(null); void perform(() => api({ ...pageState(true), action: 'reconfirm-windows', confirmation: 'other-stale-windows-are-closed' })); } }, t('已关闭，重新确认状态', 'They are closed; reconfirm')))));
    const confirmDialog = ['automatic', 'install'].includes(dialog) && h(W.Dialog, { title: dialog === 'automatic' ? (isSuite ? t('允许 Suite 空闲时自动热更新？', 'Allow idle automatic updates for Suite?') : t('允许这个插件空闲时自动热更新？', 'Allow idle automatic updates for this plugin?')) : (isSuite ? t('确认更新 Suite 整包', 'Confirm Suite bundle update') : t('确认更新此插件', 'Confirm this plugin update')), closeLabel: t('关闭', 'Close'), onClose: () => setDialog(null) },
      dialog === 'automatic' ? h('div', { className: 'w-stack' }, h('p', null, (language() === 'en' ? row.labelEn : row.label) + ' · ' + target), isSuite && h('p', null, t('此处设置作用于 Suite 整包（包含 18 个组件）。独立安装的其他插件不受影响。', 'This setting applies to the whole Suite (including its 18 components). Other independently installed plugins are unaffected.')), h('p', null, t('你正在主动启用自动安装。只处理通过当前 DSH 与 Node 兼容性校验的稳定版本（含功能小版本与补丁，跨主版本仍需手动确认）；有任务、未保存修改、未知窗口或等待重启时暂停。', 'You are explicitly enabling automatic installation for compatible stable releases (minor and patch updates matching this DSH and Node runtime; major upgrades still require manual confirmation). Running tasks, unsaved changes, unknown windows or a pending restart pause it.')), h('p', null, t('支持热更新时原地重载，不会自动重启 DSH；其他插件不会跟着开启，可随时关闭。', 'Hot-reloads in place when supported and never restarts DSH automatically. Other plugins remain unchanged; turn it off anytime.')), h('div', { className: 'w-toolbar' }, h(W.Button, { onClick: () => setDialog(null) }, t('保持关闭', 'Keep off')), h(W.Button, { variant: 'primary', onClick: () => { setDialog(null); void perform(() => save({ checkEnabled: true, autoInstall: true, autoScope: 'compatible' }, 'enable-idle-compatible-updates')); } }, t('允许空闲自动热更新', 'Allow idle automatic updates')))) :
      h('div', { className: 'w-stack' },
        isSuite && h('p', null, t('此处操作的是 Suite 整包，包含 18 个组件。独立安装的其他插件不受影响。', 'This action applies to the whole Suite, including its 18 components. Other independently installed plugins are unaffected.')),
        h('p', { className: 'updates-version' }, target + ' · ' + row.version + ' → ' + selectedVersion),
        h('p', null, selectedVersion === row.release?.version ? t('Harness 会热更新并重新加载；需要手动重启时，更新区会显示宿主结果，停用状态会保留。', 'Harness hot-updates and reloads in place. If a manual restart is needed, it appears in the update result; disabled status is preserved.') : (showUpdate && row.release?.version ? message('release-changed') : message('check-first'))),
        h('div', { className: 'w-toolbar' }, h(W.Button, { onClick: () => setDialog(null) }, t('取消', 'Cancel')),
          showUpdate && row.release?.version && row.release.version !== selectedVersion
            ? h(W.Button, { variant: 'primary', disabled: installLocked || row.loadError, onClick: () => { setError(''); setSelectedVersion(row.release.version); } }, t('更新为 v', 'Use v') + row.release.version)
            : h(W.Button, { variant: 'primary', disabled: !canConfirm, onClick: () => runOperation({ action: 'install', name: target, version: selectedVersion, confirmation: 'update-installed-plugin' }) }, t('安装此版本', 'Install this version')))));
    const checkButton = variant => h(W.Button, { variant, className: 'is-sm', icon: 'refresh', disabled: checkingThis || !managed, onClick: check }, checkingThis ? t('正在检查…', 'Checking…') : isSuite ? t('检查整包更新', 'Check Suite updates') : t('检查更新', 'Check for updates'));
    const recheckButton = variant => h(W.Button, { variant, className: 'is-sm', icon: 'refresh', disabled: checkingThis || !managed, onClick: check }, checkingThis ? t('正在检查…', 'Checking…') : t('重新检查', 'Check again'));
    const primary = showUpdate
      ? h(W.Button, { variant: 'primary', className: 'is-sm', icon: 'download', disabled: installLocked || row.loadError, onClick: () => { setError(''); if (job && !jobActiveThis && !unconfirmed) setDismissedJobId(job.id); setSelectedVersion(row.release.version); setDialog('install'); } }, (isSuite ? t('更新 Suite 至 v', 'Update Suite to v') : t('更新至 v', 'Update to v')) + row.release.version)
      : managed ? checkButton() : null;
    if (inline) {
      const lockHint = unconfirmed ? message('operation-unconfirmed')
        : snapshot.updaterRestart ? message('restart-required')
        : snapshot.preferenceError ? message('preferences-unreadable')
        : (snapshot.pages.dirty || ownPage.dirty) ? t('请先保存修改后再更新', 'Save changes before updating')
        : (snapshot.activity.busy || pageBusy) ? t('当前任务或对话框结束后可更新', 'Finish active task or dialog to update')
        : (!snapshot.activity.known || !snapshot.pages.known) ? t('等待窗口状态确认', 'Waiting for window confirmation')
        : '';
      return h(FooterFrame, { name, label: title, inline: true, head: h('div', { className: 'updates-bar' },
        h('div', { className: 'updates-bar-info' },
          inlineJobVisible
            ? h(React.Fragment, null,
              h('span', { className: 'updates-pill' + (jobActiveThis ? ' is-accent' : ['failed', 'restore-failed', 'unknown', 'restored'].includes(job.state) ? ' is-error' : '') }, jobLabel(job)),
              job.to && h('span', { className: 'updates-mono' }, (isSuite ? 'dsh-suite ' : '') + job.from + ' → ' + job.to),
              jobReason && h('span', { className: 'updates-inline-msg is-error' }, message(jobReason)))
            : actionableUpdate ? h(React.Fragment, null,
              h('span', { className: 'updates-pill is-accent' }, isSuite ? t('Suite 新版本', 'Suite update') : t('有新版本', 'Update available')),
              h('span', { className: 'updates-mono' }, (isSuite ? 'dsh-suite ' : '') + 'v' + row.version + ' → v' + row.release.version),
              lockHint && h('span', { className: 'w-muted' }, '· ' + lockHint)) : null,
          error && h('span', { className: 'updates-inline-msg is-error', role: 'alert' }, message(error))),
        h('div', { className: 'updates-bar-actions' },
          staleWindows && actionableUpdate && h(W.Button, { variant: 'ghost', className: 'is-sm', onClick: () => setDialog('windows') }, t('确认已关闭窗口', 'Confirm closed windows')),
          canCancel && h(W.Button, { className: 'is-sm', disabled: job?.state === 'cancelling', onClick: () => perform(() => api({ action: 'cancel', id: job.id })) }, t('取消更新', 'Cancel update')),
          !jobActiveThis && error === 'check-first' && managed && recheckButton(actionableUpdate ? 'ghost' : 'primary'),
          !jobActiveThis && actionableUpdate && row.release && h(W.Button, { variant: 'ghost', className: 'is-sm', onClick: showNotes, 'aria-expanded': notesOpen }, t('更新记录', 'Release notes')),
          !jobActiveThis && actionableUpdate && h(W.Button, { variant: 'ghost', className: 'is-sm', disabled: working, onClick: () => perform(() => api({ action: 'later', name: target, revision: state.preferences.revision })) }, t('明天再提醒', 'Remind me tomorrow')),
          !jobActiveThis && actionableUpdate && h(W.Button, { variant: 'ghost', className: 'is-sm', disabled: working, onClick: () => perform(() => api({ action: 'ignore', name: target, revision: state.preferences.revision, version: row.release.version })) }, t('忽略此版', 'Ignore')),
          !jobActiveThis && actionableUpdate && primary,
          !jobActiveThis && !actionableUpdate && canSuggestAuto && h(W.Button, { variant: 'primary', className: 'is-sm', disabled: working, onClick: () => { setError(''); setDialog('automatic'); } }, t('开启空闲自动热更新', 'Enable idle auto-updates')),
          !jobActiveThis && !actionableUpdate && !unconfirmed && h(W.Button, { variant: 'ghost', className: 'is-sm', onClick: () => { setError(''); setNotesOpen(false); if (job) setDismissedJobId(job.id); } }, t('关闭', 'Dismiss')))) },
        notesSection, windowsDialog, confirmDialog);
    }
    function progress() {
      if (!job || (!jobActiveThis && !unconfirmed && dismissedJobId === job.id)) return null;
      if (job.state === 'complete' && !jobReason) {
        return job.to ? h('div', null,
          h('p', { className: 'w-muted updates-note' }, '✓ ' + jobLabel(job) + ' · ' + job.from + ' → ' + job.to + (job.mode === 'automatic' ? t(' · 自动更新', ' · Automatic update') : '')),
          canSuggestAuto && h('div', { className: 'updates-auto-nudge' },
            h('span', null, t('以后有兼容新版本时，需要空闲自动热更新吗？', 'Auto-install future compatible updates while idle?')),
            h(W.Button, { variant: 'ghost', className: 'is-sm', disabled: working, onClick: () => { setError(''); setDialog('automatic'); } }, t('开启空闲自动热更新', 'Enable idle auto-updates')),
            h(W.Button, { variant: 'ghost', className: 'is-sm', onClick: () => setDismissedJobId(job.id) }, t('关闭', 'Dismiss')))) : null;
      }
      return h('section', { className: 'w-section', role: 'status', 'aria-label': t('更新进度', 'Update progress') },
        h('h3', null, jobLabel(job)),
        job.to && h('p', { className: 'w-muted' }, job.from + ' → ' + job.to + (job.mode === 'automatic' ? t(' · 自动更新', ' · Automatic update') : '')),
        job.state === 'restart-required' && jobResult?.restartReason === 'package-moved' && h('p', { className: 'w-muted updates-note' }, t('新版已就绪；因多个独立插件共用底层依赖，请先手动重启一次 DSH 生效后再继续更新其他插件。', 'Installed; because standalone plugins share dependencies, restart DSH once before updating additional plugins.')),
        jobReason && h(W.Status, { tone: 'error' }, message(jobReason)),
        h('div', { className: 'updates-bar-actions', style: { marginTop: '6px' } },
          canCancel && h(W.Button, { className: 'is-sm', disabled: job.state === 'cancelling', onClick: () => perform(() => api({ action: 'cancel', id: job.id })) }, t('取消更新', 'Cancel update')),
          !jobActiveThis && !unconfirmed && h(W.Button, { variant: 'ghost', className: 'is-sm', onClick: () => setDismissedJobId(job.id) }, t('关闭提示', 'Dismiss'))));
    }
    function windowControls() {
      if (!staleWindows) return null;
      return h(W.Status, null, h('p', null, t('有窗口已断开，无法确认是否还有未保存修改。仍在使用的窗口请先保存并刷新；已关闭的窗口可以手动重新确认。', 'A disconnected window may contain unsaved changes. Save and refresh windows still in use. If they are closed, you can confirm that manually.')), h(W.Button, { className: 'is-sm', onClick: () => setDialog('windows') }, t('重新确认已关闭的窗口', 'Confirm closed windows')));
    }
    const incompatibleText = row.release && !row.release.compatible ? t('新版本暂不兼容当前环境：', 'Latest release is incompatible with this environment: ') + requirement(row.release) + (row.release.required ? ' (' + row.release.required + ')' : '') : '';
    const optionsSection = h('details', { className: 'updates-options' },
      h('summary', null, !original.bundledBy ? t('自动更新与提醒', 'Auto-update & reminders') : t('更新选项', 'Update options'), ' · ', prefs.checkEnabled ? t('自动检查：开', 'Checks: on') : t('自动检查：关', 'Checks: off'), ' · ', prefs.autoInstall ? (prefs.autoScope === 'compatible' ? t('空闲自动热更新：兼容版', 'Idle auto-update: compatible') : t('空闲自动热更新：仅补丁', 'Idle auto-update: patches')) : t('空闲自动热更新：关', 'Idle auto-update: off')),
      h('section', { className: 'updates-settings', 'aria-label': t('这个插件的更新偏好', 'Update preferences for this plugin') },
        h('div', null, h(W.Switch, { label: isSuite ? t('自动检查 Suite 整包更新', 'Automatically check Suite updates') : t('自动检查这个插件的更新', 'Automatically check this plugin'), checked: prefs.checkEnabled, disabled: working || !!snapshot.preferenceError || !managed, onChange: event => perform(() => save({ checkEnabled: event.target.checked })) }), h('p', { className: 'w-muted updates-note' }, t('默认开启，每 6 小时最多一次。只影响这个安装包，关闭后仍可手动检查。', 'On by default, at most every 6 hours. This affects only this bundle; manual checks remain available.'))),
        h('div', null, h(W.Switch, { label: isSuite ? t('空闲时自动热更新 Suite 兼容版本', 'Auto-install compatible Suite updates while idle') : t('空闲时自动热更新兼容版本', 'Auto-install compatible updates while idle'), checked: prefs.autoInstall, disabled: working || !!snapshot.preferenceError || !managed, onChange: event => event.target.checked ? (setError(''), setDialog('automatic')) : perform(() => save({ autoInstall: false })) }), h('p', { className: 'w-muted updates-note' }, t('默认关闭。明确开启后，仅在空闲且无未保存修改时热更新兼容稳定版（含功能小版本与补丁，不含跨主版本）。其他插件的开关不变。', 'Off by default. Explicitly enable compatible stable updates (minor and patch, excluding major) while idle with no unsaved changes. Other plugins’ settings stay unchanged.')), prefs.autoInstall && prefs.autoScope !== 'compatible' && h(W.Button, { variant: 'ghost', className: 'is-sm', disabled: working, onClick: () => { setError(''); setDialog('automatic'); } }, t('升级为包含兼容功能小版本', 'Include compatible minor updates')))));
    const errorStatus = error && h(W.Status, { tone: 'error' }, error === 'check-first' && managed ? h('div', { className: 'updates-bar-actions' }, h('span', null, message(error)), recheckButton('ghost')) : message(error));
    const linksNav = (() => {
      const ownRepo = repoUrl(original.name), suiteRepo = repoUrl('@stardustlc/dsh-suite'), starRepo = isSuite ? suiteRepo : ownRepo;
      if (!ownRepo && !starRepo) return null;
      return h('nav', { className: 'updates-links', 'aria-label': t('开源仓库与反馈', 'Repository and feedback') },
        starRepo && h('a', { href: starRepo, target: '_blank', rel: 'noreferrer noopener' }, isSuite ? t('★ 觉得好用？在 GitHub 给 dsh-suite 点个 Star', '★ Useful? Star dsh-suite on GitHub') : t('★ 觉得好用？在 GitHub 点个 Star', '★ Useful? Star on GitHub')),
        ownRepo && h('a', { href: ownRepo + '/issues', target: '_blank', rel: 'noreferrer noopener' }, t('提交建议 / 问题反馈', 'Feedback & issues')),
        isSuite && original.name !== '@stardustlc/dsh-suite' && ownRepo && h('a', { href: ownRepo, target: '_blank', rel: 'noreferrer noopener' }, t('组件仓库', 'Component repo')),
        !isSuite && suiteRepo && h('a', { href: suiteRepo, target: '_blank', rel: 'noreferrer noopener' }, t('了解 dsh-suite（18 合 1 组合包）', 'Explore dsh-suite (18-in-1 bundle)')));
    })();
    if (!original.bundledBy) {
      // Native bundle detail pages in DSH already render their own Version & Source sections
      // ("重新检查", version list & "更新" button). Keep only non-duplicative auto-update preferences,
      // inline changelog notes, compatibility/error diagnostics, and GitHub feedback links here.
      return h(FooterFrame, { name, label: title, supplement: true, head: h('div', { className: 'updates-compact-bar' },
        optionsSection,
        (row.release || (showUpdate && (!deferred || !ignored))) && h('div', { className: 'updates-head-actions' },
          row.release && h(W.Button, { variant: 'ghost', className: 'is-sm', onClick: showNotes, 'aria-expanded': notesOpen }, t('更新记录', 'Release notes')),
          showUpdate && !deferred && h(W.Button, { variant: 'ghost', className: 'is-sm', disabled: working, onClick: () => perform(() => api({ action: 'later', name: target, revision: state.preferences.revision })) }, t('推迟提醒 24h', 'Snooze 24h')),
          showUpdate && !ignored && h(W.Button, { variant: 'ghost', className: 'is-sm', disabled: working, onClick: () => perform(() => api({ action: 'ignore', name: target, revision: state.preferences.revision, version: row.release.version })) }, t('忽略此版提醒', 'Mute reminder')))) },
        notesSection,
        incompatibleText && h(W.Status, null, incompatibleText),
        errorStatus, snapshot.preferenceError && h(W.Status, { tone: 'error' }, message('preferences-unreadable')),
        snapshot.pendingRestart && h(W.Status, null, snapshot.updaterRestart ? message('restart-required') : t('已有插件更新等待手动重启后生效；空闲自动热更新已暂停，建议先重启一次 DSH 再继续更新其他共用依赖的插件。', 'An update awaits a manual restart; idle auto-updates are paused. Restart DSH once before updating other plugins that share dependencies.')),
        prefs.autoInstall && snapshot.autoReady === false && h(W.Status, null, message('page-not-ready')),
        (prefs.autoInstall || jobActiveThis) && windowControls(),
        jobActiveThis && (snapshot.pages.dirty || ownPage.dirty) && h(W.Status, null, message('page-dirty')),
        jobActiveThis && (snapshot.activity.busy || pageBusy) && h(W.Status, null, message(snapshot.activity.busy ? 'busy' : 'page-busy')),
        deferred && h('p', { className: 'w-muted updates-note' }, t('已推迟此插件的工作台更新提示 24 小时。', 'Workbench update notices for this plugin are snoozed for 24 hours.')),
        unconfirmed && h(W.Status, { tone: 'error' }, message('operation-unconfirmed')),
        progress(),
        linksNav,
        windowsDialog, confirmDialog
      );
    }
    const status = !managed ? t('本地 / 外部来源，保留原安装方式', 'Local / external source; keep original install method') : row.loadError ? t('加载异常，请先检查原生插件管理', 'Loading error; check native plugin management') : row.error ? t('检查失败，可以重试', 'Check failed; retry available') : incompatibleText || (row.available ? (ignored ? t('已忽略提醒，仍可手动更新', 'Reminder ignored; manual update available') : t('有兼容的新版本', 'Compatible update available')) : row.checkedAt ? t('当前已是最新稳定版', 'Latest stable version') : t('尚未检查', 'Not checked yet'));
    return h(FooterFrame, { name, label: title, head: h('div', { className: 'updates-head' },
      h('div', null,
        h('div', { className: 'updates-title-row' }, h('h2', null, t('随 Suite 整包管理', 'Managed via Suite bundle')), h('span', { className: 'updates-mono updates-badge' }, original.name + ' · v' + original.version)),
        h('p', { className: 'w-muted updates-meta-line' }, status, row.checkedAt ? ' · ' + t('上次检查：', 'Last checked: ') + new Date(row.checkedAt).toLocaleString(language() === 'en' ? 'en-US' : 'zh-CN') : ''),
        h('p', { className: 'updates-version updates-note' }, target + ' · v' + row.version, row.release?.version && row.release.version !== row.version ? ' → v' + row.release.version : '')),
      h('div', { className: 'updates-head-actions' },
        showUpdate && checkButton('ghost'),
        row.release && h(W.Button, { variant: 'ghost', className: 'is-sm', onClick: showNotes, 'aria-expanded': notesOpen }, t('更新记录', 'Release notes')),
        showUpdate && !deferred && h(W.Button, { variant: 'ghost', className: 'is-sm', disabled: working, onClick: () => perform(() => api({ action: 'later', name: target, revision: state.preferences.revision })) }, t('明天再提醒', 'Remind me tomorrow')),
        showUpdate && !ignored && h(W.Button, { variant: 'ghost', className: 'is-sm', disabled: working, onClick: () => perform(() => api({ action: 'ignore', name: target, revision: state.preferences.revision, version: row.release.version })) }, t('忽略此版本提醒', 'Ignore this reminder')),
        primary)) },
      notesSection,
      optionsSection,
      errorStatus, snapshot.preferenceError && h(W.Status, { tone: 'error' }, message('preferences-unreadable')),
      snapshot.pendingRestart && h(W.Status, null, snapshot.updaterRestart ? message('restart-required') : t('已有插件更新等待手动重启后生效；空闲自动热更新已暂停。', 'An update awaits a manual restart; idle auto-updates are paused.')),
      prefs.autoInstall && snapshot.autoReady === false && h(W.Status, null, message('page-not-ready')),
      windowControls(),
      (showUpdate || jobActiveThis) && (snapshot.pages.dirty || ownPage.dirty) && h(W.Status, null, message('page-dirty')),
      (showUpdate || jobActiveThis) && (snapshot.activity.busy || pageBusy) && h(W.Status, null, message(snapshot.activity.busy ? 'busy' : 'page-busy')),
      deferred && h(W.Status, null, t('已推迟 Suite 提醒和自动安装 24 小时，仍可手动更新。', 'Suite reminders and automatic installation are deferred for 24 hours. Manual updates remain available.')),
      unconfirmed && h(W.Status, { tone: 'error' }, message('operation-unconfirmed')),
      progress(),
      linksNav,
      windowsDialog, confirmDialog
    );
  }
  function InlineFooter({ name }) { return h(Panel, { name, inline: true }); }
  function NativeFooter({ subject }) {
    const snapshot = useSnapshot(), name = __stardustUpdatesDetailName(subject, snapshot?.rows || []);
    return name ? h(Panel, { name, inline: false }) : null;
  }
  function register() {
    if (!alive) return;
    if (!registered) {
      registered = true; pool.clients.add(client);
      ctx.slots.inject('plugins.detail.section', () => ctx.slots.register({ name: 'plugins.detail.section', id: 'stardustlc.plugin-update-footer', order: 1000 }, NativeFooter));
      notify();
    }
  }
  async function poll() {
    if (inPoll || !alive || !shared.refs.size) return;
    inPoll = true;
    try { await refresh(); register(); await heartbeat(); }
    catch { /* Owner-only controls stay absent for guests and unsupported hosts. */ }
    finally { inPoll = false; }
  }
  const timer = setInterval(() => { void poll(); }, 15000), first = setTimeout(() => { void poll(); }, 100);
  const client = { t, Footer: InlineFooter, NativeFooter, Button: W.Button, open(name) { const footer = [...document.querySelectorAll('[data-plugin-update-footer]')].find(node => node.getAttribute('data-plugin-update-footer') === name); if (!footer) return false; footer.scrollIntoView({ block: 'end', behavior: 'smooth' }); return true; }, has: name => registered && !!originalRow(name), row: rowFor, dispose() {
    close(); alive = false; clearTimeout(first); clearInterval(timer); pool.clients.delete(client);
    pool.listeners.delete(guardChanged); listeners.clear();
    for (const event of ['pointerdown', 'keydown', 'input']) document.removeEventListener(event, interaction, true);
    window.removeEventListener('pagehide', close);
    for (const controller of requests) controller.abort();
    for (const listener of pool.viewListeners) listener();
  } };
  return client;
}

/* STARDUSTLC_UPDATE_CLIENT_BODY_START */
// Generated from templates/client.js, templates/panels/ and templates/workbench-ui.js. Edit the sources.
(function () {
/* DSH Workbench UI v3 — Unified DeepSeek Harness (>=0.2.2-rc.3) Studio UI & Motion Kit.
 * Integrates @deepseek-ai/dsh-client-ui-primitives lazily at render time with semantic HTML
 * fallbacks for standalone jsdom/VM tests, 13 switchable [data-dsh-style] themes + 8 [data-dsh-font]
 * pairings (default: arcade) synced via localStorage['dsh-stardust:ui-style'] / ['dsh-stardust:ui-font'],
 * soft-slate dark adaptation, unified 48px single-row header, sliding tab indicator,
 * resizable split panes (DshSplitResizer), shimmer skeletons (DshSkeleton), row hover quick-actions,
 * calm compact update strip, tactile press physics, small-button icon micro-animations,
 * and window-drag exclusions.
 */
function createWorkbenchUI(React, requireFn) {
  const h = React.createElement;
  const useIdHook = typeof React.useId === 'function' ? React.useId : () => 'dshw-id';
  const useEffectHook = typeof React.useEffect === 'function' ? React.useEffect : () => {};
  const useLayoutHook = typeof React.useLayoutEffect === 'function' ? React.useLayoutEffect : useEffectHook;
  const useRefHook = typeof React.useRef === 'function' ? React.useRef : (initial => ({ current: initial }));
  const useStateHook = typeof React.useState === 'function' ? React.useState : (initial => [typeof initial === 'function' ? initial() : initial, () => {}]);
  const forwardRefWrap = typeof React.forwardRef === 'function' ? React.forwardRef : (fn => props => fn(props, null));
  const cx = (...values) => values.filter(Boolean).join(' ');

  const DSH_STYLE_STORAGE_KEY = 'dsh-stardust:ui-style';
  const DSH_STYLE_EVENT = 'dsh-stardust-style';
  const DSH_DEFAULT_STYLE = 'harness';

  const DSH_FONT_STORAGE_KEY = 'dsh-stardust:ui-font';
  const DSH_FONT_EVENT = 'dsh-stardust-font';
  const DSH_DEFAULT_FONT = 'arcade';

  const DSH_FONTS = Object.freeze([
    Object.freeze({ id: 'arcade', zh: '幼圆等宽（默认）', zhShort: '幼圆', en: 'YouYuan Mono (Default)', enShort: 'YouYuan' }),
    Object.freeze({ id: 'auto', zh: '跟随风格专属字', zhShort: '专属字', en: 'Match Style Font', enShort: 'Style Font' }),
    Object.freeze({ id: 'songkai', zh: '中宋+楷书', zhShort: '中宋楷', en: 'Song + Kai', enShort: 'Song+Kai' }),
    Object.freeze({ id: 'fangsong', zh: '工程仿宋', zhShort: '仿宋', en: 'Blueprint FangSong', enShort: 'FangSong' }),
    Object.freeze({ id: 'poster', zh: '重磅画报黑', zhShort: '画报黑', en: 'Poster Sans', enShort: 'Poster' }),
    Object.freeze({ id: 'retro98', zh: '千禧新宋', zhShort: '新宋98', en: 'Retro 98 SimSun', enShort: 'Retro 98' }),
    Object.freeze({ id: 'serif', zh: '思源书宋', zhShort: '书宋', en: 'Book Serif', enShort: 'Serif' }),
    Object.freeze({ id: 'modern', zh: '现代思源黑', zhShort: '思源黑', en: 'Modern Sans', enShort: 'Modern' }),
  ]);

  const DSH_STYLES = Object.freeze([
    Object.freeze({ id: 'harness', zh: '原生清透', zhShort: '原生', en: 'Native Airy', enShort: 'Native', swatch: '#4176e6', surface: '#f8fafc' }),
    Object.freeze({ id: 'cream', zh: '米白纸感', zhShort: '米白色', en: 'Warm Cream', enShort: 'Cream', swatch: '#9e5829', surface: '#faf7f0' }),
    Object.freeze({ id: 'claude', zh: 'Claude 暖书卷', zhShort: 'Claude风', en: 'Claude Warmth', enShort: 'Claude', swatch: '#c96442', surface: '#f5f4ed' }),
    Object.freeze({ id: 'pixel8bit', zh: '8-Bit 掌机', zhShort: '8-Bit', en: 'Bright 8-Bit', enShort: '8-Bit', swatch: '#2e7d5b', surface: '#f4f6e8' }),
    Object.freeze({ id: 'mint', zh: '晴空薄荷', zhShort: '薄荷', en: 'Airy Mint', enShort: 'Mint', swatch: '#0f766e', surface: '#f5fafb' }),
    Object.freeze({ id: 'glass', zh: '晴昼琉璃', zhShort: '琉璃', en: 'Daylight Glass', enShort: 'Glass', swatch: '#4f6df5', surface: '#f3f7ff' }),
    Object.freeze({ id: 'eink', zh: '护眼墨水屏', zhShort: '墨水屏', en: 'E-Ink Paper', enShort: 'E-Ink', swatch: '#171716', surface: '#f2f1ec' }),
    Object.freeze({ id: 'blueprint', zh: '工程晒图', zhShort: '晒图', en: 'Blueprint', enShort: 'Blueprint', swatch: '#0d3b66', surface: '#eaf3fb' }),
    Object.freeze({ id: 'risograph', zh: '波普孔版', zhShort: '孔版', en: 'Riso Zine', enShort: 'Riso', swatch: '#ff3e7f', surface: '#faf6ee' }),
    Object.freeze({ id: 'win98', zh: '千禧复古', zhShort: '复古98', en: 'Retro 98', enShort: 'Retro 98', swatch: '#1b4f9c', surface: '#dcdcdc' }),
    Object.freeze({ id: 'songhui', zh: '宋韵朱砂', zhShort: '宋韵', en: 'Song Xuan', enShort: 'Song', swatch: '#b83b2a', surface: '#f7f3e8' }),
    Object.freeze({ id: 'frutiger', zh: '晴空水晶', zhShort: '水晶', en: 'Aqua Gloss', enShort: 'Aqua', swatch: '#0ea5e9', surface: '#eaf7ff' }),
    Object.freeze({ id: 'gazette', zh: '铅字晨报', zhShort: '晨报', en: 'Gazette', enShort: 'Gazette', swatch: '#9b1c1c', surface: '#f6f3ec' }),
  ]);

  const VALID_STYLE_IDS = new Set(DSH_STYLES.map(preset => preset.id));
  const VALID_FONT_IDS = new Set(DSH_FONTS.map(preset => preset.id));

  function resolveWindow(win) {
    if (win && typeof win === 'object') return win;
    return typeof window !== 'undefined' ? window : null;
  }

  function clampNumber(value, min, max) {
    const lo = Number.isFinite(min) ? min : 0;
    const hi = Number.isFinite(max) ? Math.max(lo, max) : lo;
    const num = Number(value);
    if (!Number.isFinite(num)) return lo;
    return Math.min(hi, Math.max(lo, num));
  }

  function normalizeDshStyle(value) {
    const key = typeof value === 'string' ? value.trim() : '';
    return VALID_STYLE_IDS.has(key) ? key : DSH_DEFAULT_STYLE;
  }

  function getDshStylePreset(value) {
    const id = normalizeDshStyle(value);
    return DSH_STYLES.find(preset => preset.id === id) || DSH_STYLES[0];
  }

  function readDshStyle(win) {
    const target = resolveWindow(win);
    if (!target) return DSH_DEFAULT_STYLE;
    try {
      const raw = target.localStorage?.getItem(DSH_STYLE_STORAGE_KEY);
      return normalizeDshStyle(raw);
    } catch {
      return DSH_DEFAULT_STYLE;
    }
  }

  function normalizeDshFont(value) {
    const key = typeof value === 'string' ? value.trim() : '';
    return VALID_FONT_IDS.has(key) ? key : DSH_DEFAULT_FONT;
  }

  function getDshFontPreset(value) {
    const id = normalizeDshFont(value);
    return DSH_FONTS.find(preset => preset.id === id) || DSH_FONTS[0];
  }

  function readDshFont(win) {
    const target = resolveWindow(win);
    if (!target) return DSH_DEFAULT_FONT;
    try {
      const raw = target.localStorage?.getItem(DSH_FONT_STORAGE_KEY);
      return normalizeDshFont(raw);
    } catch {
      return DSH_DEFAULT_FONT;
    }
  }

  function syncPortaledOverlays(style, doc, font) {
    const normalized = normalizeDshStyle(style);
    const normalizedFont = normalizeDshFont(font ?? readDshFont());
    const targetDoc = doc || (typeof document !== 'undefined' ? document : null);
    if (!targetDoc) return;
    if (targetDoc.documentElement && typeof targetDoc.documentElement.setAttribute === 'function') {
      targetDoc.documentElement.setAttribute('data-dsh-font', normalizedFont);
    }
    if (typeof targetDoc.querySelectorAll !== 'function') return;
    for (const el of targetDoc.querySelectorAll('[data-dsh-portal-synced]')) {
      el.setAttribute('data-dsh-style', normalized);
      el.setAttribute('data-dsh-font', normalizedFont);
      if (!el.hasAttribute('data-window-drag-exclude')) {
        el.setAttribute('data-window-drag-exclude', '');
      }
    }
  }

  function syncPortaledFont(font, doc) {
    const normalizedFont = normalizeDshFont(font);
    const targetDoc = doc || (typeof document !== 'undefined' ? document : null);
    if (!targetDoc) return;
    if (targetDoc.documentElement && typeof targetDoc.documentElement.setAttribute === 'function') {
      targetDoc.documentElement.setAttribute('data-dsh-font', normalizedFont);
    }
    if (typeof targetDoc.querySelectorAll !== 'function') return;
    for (const el of targetDoc.querySelectorAll('[data-dsh-portal-synced], [data-dsh-style]')) {
      el.setAttribute('data-dsh-font', normalizedFont);
    }
  }

  function writeDshStyle(nextStyle, win) {
    const normalized = normalizeDshStyle(nextStyle);
    const target = resolveWindow(win);
    if (target) {
      try {
        target.localStorage?.setItem(DSH_STYLE_STORAGE_KEY, normalized);
      } catch {
        // Restricted storage: keep in-memory + custom event sync working.
      }
      syncPortaledOverlays(normalized, target.document, readDshFont(target));
      if (typeof target.dispatchEvent === 'function') {
        try {
          const CustomEventCtor = target.CustomEvent || (typeof CustomEvent === 'function' ? CustomEvent : null);
          if (CustomEventCtor) {
            target.dispatchEvent(new CustomEventCtor(DSH_STYLE_EVENT, { detail: { style: normalized } }));
          } else if (typeof Event === 'function') {
            const ev = new Event(DSH_STYLE_EVENT);
            ev.detail = { style: normalized };
            target.dispatchEvent(ev);
          }
        } catch {
          // Ignore synthetic event errors in minimal VM environments.
        }
      }
    }
    return normalized;
  }

  function writeDshFont(nextFont, win) {
    const normalized = normalizeDshFont(nextFont);
    const target = resolveWindow(win);
    if (target) {
      try {
        target.localStorage?.setItem(DSH_FONT_STORAGE_KEY, normalized);
      } catch {
        // Restricted storage: keep in-memory + custom event sync working.
      }
      syncPortaledFont(normalized, target.document);
      if (typeof target.dispatchEvent === 'function') {
        try {
          const CustomEventCtor = target.CustomEvent || (typeof CustomEvent === 'function' ? CustomEvent : null);
          if (CustomEventCtor) {
            target.dispatchEvent(new CustomEventCtor(DSH_FONT_EVENT, { detail: { font: normalized } }));
          } else if (typeof Event === 'function') {
            const ev = new Event(DSH_FONT_EVENT);
            ev.detail = { font: normalized };
            target.dispatchEvent(ev);
          }
        } catch {
          // Ignore synthetic event errors in minimal VM environments.
        }
      }
    }
    return normalized;
  }

  function subscribeDshStyle(onChange, win) {
    const target = resolveWindow(win);
    if (!target || typeof target.addEventListener !== 'function' || typeof onChange !== 'function') {
      return () => {};
    }
    const onCustom = event => {
      const next = normalizeDshStyle(event?.detail?.style ?? readDshStyle(target));
      syncPortaledOverlays(next, target.document, readDshFont(target));
      onChange(next);
    };
    const onStorage = event => {
      if (event && event.key !== null && event.key !== undefined && event.key !== DSH_STYLE_STORAGE_KEY) {
        return;
      }
      const next = normalizeDshStyle(event?.newValue ?? readDshStyle(target));
      syncPortaledOverlays(next, target.document, readDshFont(target));
      onChange(next);
    };
    target.addEventListener(DSH_STYLE_EVENT, onCustom);
    target.addEventListener('storage', onStorage);
    return () => {
      target.removeEventListener(DSH_STYLE_EVENT, onCustom);
      target.removeEventListener('storage', onStorage);
    };
  }

  function subscribeDshFont(onChange, win) {
    const target = resolveWindow(win);
    if (!target || typeof target.addEventListener !== 'function' || typeof onChange !== 'function') {
      return () => {};
    }
    const onCustom = event => {
      const next = normalizeDshFont(event?.detail?.font ?? readDshFont(target));
      syncPortaledFont(next, target.document);
      onChange(next);
    };
    const onStorage = event => {
      if (event && event.key !== null && event.key !== undefined && event.key !== DSH_FONT_STORAGE_KEY) {
        return;
      }
      const next = normalizeDshFont(event?.newValue ?? readDshFont(target));
      syncPortaledFont(next, target.document);
      onChange(next);
    };
    target.addEventListener(DSH_FONT_EVENT, onCustom);
    target.addEventListener('storage', onStorage);
    return () => {
      target.removeEventListener(DSH_FONT_EVENT, onCustom);
      target.removeEventListener('storage', onStorage);
    };
  }

  function useDshStyle(win) {
    if (typeof React.useState !== 'function') {
      return [readDshStyle(win), next => writeDshStyle(next, win)];
    }
    const [style, setStyleState] = React.useState(() => readDshStyle(win));
    if (typeof React.useEffect === 'function') {
      React.useEffect(() => {
        const current = readDshStyle(win);
        setStyleState(prev => (prev === current ? prev : current));
        syncPortaledOverlays(current, resolveWindow(win)?.document, readDshFont(win));
        return subscribeDshStyle(next => {
          setStyleState(prev => (prev === next ? prev : next));
        }, win);
      }, [win]);
    }
    const setStyle = next => {
      const resolved = typeof next === 'function' ? next(style) : next;
      const applied = writeDshStyle(resolved, win);
      setStyleState(applied);
      return applied;
    };
    return [style, setStyle];
  }

  function useDshFont(win) {
    if (typeof React.useState !== 'function') {
      return [readDshFont(win), next => writeDshFont(next, win)];
    }
    const [font, setFontState] = React.useState(() => readDshFont(win));
    if (typeof React.useEffect === 'function') {
      React.useEffect(() => {
        const current = readDshFont(win);
        setFontState(prev => (prev === current ? prev : current));
        syncPortaledFont(current, resolveWindow(win)?.document);
        return subscribeDshFont(next => {
          setFontState(prev => (prev === next ? prev : next));
        }, win);
      }, [win]);
    }
    const setFont = next => {
      const resolved = typeof next === 'function' ? next(font) : next;
      const applied = writeDshFont(resolved, win);
      setFontState(applied);
      return applied;
    };
    return [font, setFont];
  }

  function createOverlaySyncRef(style, font) {
    const normalized = normalizeDshStyle(style);
    const normalizedFont = normalizeDshFont(font ?? readDshFont());
    return node => {
      if (!node || typeof node.setAttribute !== 'function') return;
      node.setAttribute('data-dsh-style', normalized);
      node.setAttribute('data-dsh-font', normalizedFont);
      node.setAttribute('data-window-drag-exclude', '');
      node.setAttribute('data-dsh-portal-synced', 'true');
      if (typeof node.closest === 'function') {
        const overlay = node.closest('[role="dialog"], [role="alertdialog"], [role="menu"], dialog');
        if (overlay) {
          overlay.setAttribute('data-dsh-style', normalized);
          overlay.setAttribute('data-dsh-font', normalizedFont);
          overlay.setAttribute('data-window-drag-exclude', '');
          overlay.setAttribute('data-dsh-portal-synced', 'true');
        }
      }
    };
  }

  const paths = {
    book: ['M4 4h6a3 3 0 0 1 2 2v15a4 4 0 0 0-4-2H4z', 'M20 4h-6a3 3 0 0 0-2 2v15a4 4 0 0 1 4-2h4z'],
    calendar: ['M5 5h14a2 2 0 0 1 2 2v13H3V7a2 2 0 0 1 2-2Z', 'M7 3v4M17 3v4M3 10h18'],
    mail: ['M3 5h18v14H3z', 'm3 6 9 7 9-7'],
    inbox: ['M4 13 6 5h12l2 8v6H4z', 'M4 13h5l1 3h4l1-3h5'],
    send: ['m22 2-7 20-4-9-9-4Z', 'M22 2 11 13'],
    rss: ['M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16', 'M4 19h.01'],
    slides: ['M3 4h18v13H3z', 'M12 17v4M8 21h8'],
    shield: ['m12 3 8 3v6c0 4-4 7-8 9-4-2-8-5-8-9V6z', 'm8 12 3 3 5-6'],
    layers: ['M5 3h16v16H5z', 'M2 7v15h15'],
    play: ['m8 5 11 7-11 7Z'],
    video: ['M3 5h12v14H3z', 'm15 10 6-4v12l-6-4'],
    search: ['M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z', 'm16 16 5 5'],
    plus: ['M12 5v14M5 12h14'],
    refresh: ['M20 7a9 9 0 1 0 1 8', 'M20 2v5h-5'],
    settings: ['m9 3-.7 2.4-2 .9L4 5.8 2.5 8.4l1.7 1.8v2.3L2.5 14 4 17l2.5-.4 1.9 1L9 20h3l.8-2.4 2-1 2.5.4 1.5-2.7-1.7-1.9v-2.2l1.7-1.8-1.5-2.6-2.5.4-2-1L12 3Z', 'M14 11.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z'],
    close: ['m6 6 12 12M18 6 6 18'],
    left: ['m14 5-7 7 7 7'],
    right: ['m10 5 7 7-7 7'],
    up: ['m5 15 7-7 7 7'],
    down: ['m5 9 7 7 7-7'],
    filter: ['M4 5h16M7 12h10M10 19h4'],
    download: ['M12 3v12m-5-5 5 5 5-5', 'M4 16v5h16v-5'],
    upload: ['M12 16V4m-5 5 5-5 5 5', 'M4 16v5h16v-5'],
    copy: ['M8 8h13v13H8z', 'M16 8V3H3v13h5'],
    external: ['M14 3h7v7m0-7L10 14', 'M10 3H3v18h18v-7'],
    file: ['M4 3h10l6 6v12H4z', 'M14 3v6h6M8 13h8M8 17h6'],
    folder: ['M3 5h7l2 3h9v12H3z'],
    edit: ['m15 4 5 5-10 10-6 1 1-6Z', 'm13 6 5 5'],
    trash: ['M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7'],
    more: ['M5 12h.01M12 12h.01M19 12h.01'],
    info: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 11v6M12 7h.01'],
    check: ['m5 12 4 4L19 6'],
    quote: ['M4 12h6v7H3v-7c0-4 2-6 5-7M15 12h6v7h-7v-7c0-4 2-6 5-7'],
    star: ['m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z'],
    reply: ['m9 5-7 7 7 7v-5h6c3 0 5 2 6 5 0-8-4-11-12-11Z'],
    link: ['m10 13 4-4M8 16l-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0', 'm14 8 2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0'],
    lock: ['M5 10h14v11H5z', 'M8 10V7a4 4 0 0 1 8 0v3M12 14v3'],
    clip: ['m8 13 6-6a2.5 2.5 0 0 1 3.5 3.5l-7 7a4 4 0 0 1-5.7-5.7l8-8a5 5 0 0 1 7.1 7.1l-8 8'],
    clock: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 6v6l4 2'],
    image: ['M3 4h18v16H3z', 'm3 17 6-6 5 5 2-2 5 5M16 8h.01'],
    palette: ['M12 3a9 9 0 1 0 0 18h1.5a2.5 2.5 0 0 0 0-5H12a2 2 0 0 1 0-4h4a5 5 0 0 0 5-5c0-2.2-4-4-9-4Z', 'M7.5 10.5h.01M10.5 7.5h.01M14.5 7.5h.01'],
    sparkles: ['m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8Z', 'M19 15v4M17 17h4'],
    grip: ['M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01'],
    bookmark: ['M6 4h12v17l-6-4-6 4Z'],
    cube: ['M12 2.5 3.5 7.2v9.6L12 21.5l8.5-4.7V7.2Z', 'M12 21.5V12', 'M20.5 7.2 12 12 3.5 7.2'],
    box: ['M12 3 4 7.5v9L12 21l8-4.5v-9Z', 'M12 12 20 7.5M12 12v9M12 12 4 7.5', 'M8 5.25 16 9.75'],
    camera: ['M4 7h3l2-2h6l2 2h3v12H4z', 'M12 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z'],
    grid: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M3 14h7v7H3z', 'M14 14h7v7h-7z'],
    code: ['m8 7-5 5 5 5', 'm16 7 5 5-5 5', 'm13.5 5-3 14'],
    plug: ['M7 7v4a5 5 0 0 0 10 0V7', 'M9 3v4M15 3v4M12 16v5'],
    sun: ['M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4'],
    eye: ['M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'],
    terminal: ['m4 17 6-5-6-5', 'M12 19h8'],
    sliders: ['M4 7h16M8 5v4', 'M4 12h16M15 10v4', 'M4 17h16M10 15v4'],
    pause: ['M8 5h3v14H8z', 'M13 5h3v14h-3z'],
    rotate: ['M21 12a9 9 0 1 1-2.64-6.36', 'M21 4v5h-5'],
  };

  function Icon({ name = 'file', size = 16, ...props }) {
    return h('svg', {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.7,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': 'true',
      focusable: 'false',
      'data-dsh-icon': name,
      ...props,
    }, (paths[name] || paths.file).map((d, index) => h('path', { key: index, d })));
  }

  function useSlidingTabIndicator(arg1, arg2, arg3) {
    const isExplicitReact = Boolean(arg1 && typeof arg1 === 'object' && typeof arg1.createElement === 'function');
    const activeValue = isExplicitReact ? arg2 : arg1;
    const options = (isExplicitReact ? arg3 : arg2) || {};
    const tablistRef = useRefHook(null);
    const [metrics, setMetrics] = useStateHook({ x: 0, width: 0, ready: false });

    const syncIndicator = () => {
      const list = tablistRef.current;
      if (!list || typeof list.querySelector !== 'function') return;
      const activeTab = list.querySelector('[role="tab"][aria-selected="true"]');
      if (!activeTab) {
        list.setAttribute?.('data-indicator-ready', 'false');
        setMetrics(prev => (prev.ready ? { x: 0, width: 0, ready: false } : prev));
        return;
      }
      let x = typeof activeTab.offsetLeft === 'number' ? activeTab.offsetLeft : 0;
      let width = typeof activeTab.offsetWidth === 'number' ? activeTab.offsetWidth : 0;
      if (!width && typeof activeTab.getBoundingClientRect === 'function' && typeof list.getBoundingClientRect === 'function') {
        const tabRect = activeTab.getBoundingClientRect();
        const listRect = list.getBoundingClientRect();
        if (tabRect && listRect && tabRect.width > 0) {
          width = tabRect.width;
          x = tabRect.left - listRect.left + (list.scrollLeft || 0);
        }
      }
      const ready = width > 0;
      if (list.style && typeof list.style.setProperty === 'function') {
        list.style.setProperty('--dsh-tab-x', Math.round(x) + 'px');
        list.style.setProperty('--dsh-tab-w', Math.round(width) + 'px');
      }
      list.setAttribute?.('data-indicator-ready', ready ? 'true' : 'false');
      setMetrics(prev => (
        prev.x === Math.round(x) && prev.width === Math.round(width) && prev.ready === ready
          ? prev
          : { x: Math.round(x), width: Math.round(width), ready }
      ));
    };

    const deps = Array.isArray(options?.deps) ? [activeValue, ...options.deps] : [activeValue];
    useLayoutHook(() => {
      syncIndicator();
      const list = tablistRef.current;
      const win = resolveWindow(options?.win);
      let ro = null;
      if (list && typeof win?.ResizeObserver === 'function') {
        try {
          ro = new win.ResizeObserver(() => syncIndicator());
          ro.observe(list);
        } catch {
          ro = null;
        }
      }
      if (win && typeof win.addEventListener === 'function') {
        win.addEventListener('resize', syncIndicator);
      }
      return () => {
        ro?.disconnect?.();
        if (win && typeof win.removeEventListener === 'function') {
          win.removeEventListener('resize', syncIndicator);
        }
      };
    }, deps);

    const indicatorStyle = {
      '--dsh-tab-x': metrics.x + 'px',
      '--dsh-tab-w': metrics.width + 'px',
    };

    return {
      tablistRef,
      ready: metrics.ready,
      indicatorStyle,
      tablistProps: {
        ref: tablistRef,
        'data-dsh-tablist': '',
        'data-indicator-ready': metrics.ready ? 'true' : 'false',
      },
      indicatorProps: {
        className: 'dsh-tab-indicator',
        'aria-hidden': 'true',
        style: indicatorStyle,
      },
      syncIndicator,
    };
  }

  function useResizableSplit(arg1, arg2) {
    const isExplicitReact = Boolean(arg1 && typeof arg1 === 'object' && typeof arg1.createElement === 'function');
    const opts = (isExplicitReact ? arg2 : arg1) || {};
    const { key, initial = 320, min = 220, max = 560, orientation = 'vertical', reverse = false, win } = opts;
    const clampedInitial = clampNumber(initial, min, max);

    const readStored = () => {
      const target = resolveWindow(win);
      if (!key || !target) return clampedInitial;
      try {
        const raw = target.localStorage?.getItem(key);
        if (raw == null || raw === '') return clampedInitial;
        const parsed = Number(raw);
        return Number.isFinite(parsed) ? clampNumber(parsed, min, max) : clampedInitial;
      } catch {
        return clampedInitial;
      }
    };

    const writeStored = nextSize => {
      const clamped = Math.round(clampNumber(nextSize, min, max));
      const target = resolveWindow(win);
      if (key && target) {
        try {
          target.localStorage?.setItem(key, String(clamped));
        } catch {
          // Ignore restricted storage errors.
        }
      }
      return clamped;
    };

    const [size, setSizeState] = useStateHook(() => readStored());
    const [isDragging, setIsDragging] = useStateHook(false);

    const setSize = next => {
      const resolved = typeof next === 'function' ? next(size) : next;
      const applied = writeStored(resolved);
      setSizeState(applied);
      return applied;
    };

    const reset = () => {
      const applied = writeStored(clampedInitial);
      setSizeState(applied);
      return applied;
    };

    return {
      size,
      width: size,
      setSize,
      reset,
      isDragging,
      setIsDragging,
      paneStyle: { '--dsh-split-size': size + 'px' },
      resizerProps: {
        value: size,
        initial: clampedInitial,
        min,
        max,
        orientation,
        reverse,
        onChange: setSize,
        onReset: reset,
        onDraggingChange: setIsDragging,
      },
    };
  }

  function SplitResizer({
    value = 320,
    initial,
    min = 220,
    max = 560,
    orientation = 'vertical',
    reverse = false,
    step = 16,
    label = 'Resize pane',
    onChange,
    onReset,
    onDraggingChange,
    className,
    style,
    ...rest
  } = {}) {
    const dragRef = useRefHook(null);
    const [dragging, setDragging] = useStateHook(false);
    const isHorizontal = orientation === 'horizontal';
    const clampedValue = Math.round(clampNumber(value, min, max));

    const setDragActive = active => {
      setDragging(active);
      onDraggingChange?.(active);
    };

    const cleanupWindowListeners = () => {
      const drag = dragRef.current;
      if (drag?.cleanup) drag.cleanup();
      dragRef.current = null;
    };

    useEffectHook(() => cleanupWindowListeners, []);

    const updateFromClientPos = (clientX, clientY) => {
      const drag = dragRef.current;
      if (!drag) return;
      const rawDelta = isHorizontal ? (clientY - drag.startY) : (clientX - drag.startX);
      const delta = reverse ? -rawDelta : rawDelta;
      const next = Math.round(clampNumber(drag.startValue + delta, min, max));
      onChange?.(next);
    };

    const handlePointerDown = event => {
      if (event?.button !== undefined && event.button !== 0) return;
      event?.preventDefault?.();
      const targetEl = event?.currentTarget;
      const pointerId = event?.pointerId;
      const startX = Number(event?.clientX ?? 0);
      const startY = Number(event?.clientY ?? 0);

      cleanupWindowListeners();

      let captured = false;
      if (targetEl && typeof targetEl.setPointerCapture === 'function' && pointerId !== undefined) {
        try {
          targetEl.setPointerCapture(pointerId);
          captured = true;
        } catch {
          captured = false;
        }
      }

      const win = resolveWindow();
      let cleanup = null;
      if (!captured && win && typeof win.addEventListener === 'function') {
        const onWinMove = moveEvent => updateFromClientPos(Number(moveEvent.clientX ?? 0), Number(moveEvent.clientY ?? 0));
        const onWinUp = () => {
          cleanupWindowListeners();
          setDragActive(false);
        };
        win.addEventListener('pointermove', onWinMove);
        win.addEventListener('mousemove', onWinMove);
        win.addEventListener('pointerup', onWinUp);
        win.addEventListener('mouseup', onWinUp);
        win.addEventListener('pointercancel', onWinUp);
        cleanup = () => {
          win.removeEventListener('pointermove', onWinMove);
          win.removeEventListener('mousemove', onWinMove);
          win.removeEventListener('pointerup', onWinUp);
          win.removeEventListener('mouseup', onWinUp);
          win.removeEventListener('pointercancel', onWinUp);
        };
      }

      dragRef.current = { startX, startY, startValue: clampedValue, pointerId, captured, cleanup };
      setDragActive(true);
    };

    const handlePointerMove = event => {
      if (!dragRef.current) return;
      updateFromClientPos(Number(event?.clientX ?? 0), Number(event?.clientY ?? 0));
    };

    const handlePointerEnd = event => {
      const drag = dragRef.current;
      if (!drag) return;
      if (drag.captured && event?.currentTarget && typeof event.currentTarget.releasePointerCapture === 'function' && drag.pointerId !== undefined) {
        try {
          event.currentTarget.releasePointerCapture(drag.pointerId);
        } catch {
          // Ignore release errors when pointer already detached.
        }
      }
      cleanupWindowListeners();
      setDragActive(false);
    };

    const handleKeyDown = event => {
      const key = event?.key;
      const deltaStep = event?.shiftKey ? step * 2 : step;
      const dir = reverse ? -1 : 1;
      let next = null;
      if ((!isHorizontal && key === 'ArrowLeft') || (isHorizontal && key === 'ArrowUp')) {
        next = clampNumber(clampedValue - deltaStep * dir, min, max);
      } else if ((!isHorizontal && key === 'ArrowRight') || (isHorizontal && key === 'ArrowDown')) {
        next = clampNumber(clampedValue + deltaStep * dir, min, max);
      } else if (key === 'Home') {
        next = min;
      } else if (key === 'End') {
        next = max;
      }
      if (next !== null) {
        event?.preventDefault?.();
        onChange?.(Math.round(next));
      }
    };

    const handleDoubleClick = () => {
      if (typeof onReset === 'function') {
        onReset();
      } else if (initial !== undefined) {
        onChange?.(Math.round(clampNumber(initial, min, max)));
      }
    };

    return h('div', {
      ...rest,
      role: 'separator',
      tabIndex: 0,
      'aria-orientation': orientation,
      'aria-label': label,
      'aria-valuemin': min,
      'aria-valuemax': max,
      'aria-valuenow': clampedValue,
      'data-dsh-resizer': '',
      'data-dragging': dragging ? 'true' : 'false',
      'data-window-drag-exclude': '',
      className: cx('dsh-split-resizer', className),
      style,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerEnd,
      onPointerCancel: handlePointerEnd,
      onLostPointerCapture: handlePointerEnd,
      onKeyDown: handleKeyDown,
      onDoubleClick: handleDoubleClick,
    });
  }

  function Skeleton({
    variant = 'text',
    lines = 3,
    width,
    height,
    radius,
    animated = true,
    label,
    className,
    style,
    ...rest
  } = {}) {
    const a11yProps = label
      ? { role: 'status', 'aria-busy': 'true', 'aria-label': label }
      : { 'aria-hidden': 'true' };

    const baseBar = (barWidth, barHeight, key) =>
      h('span', {
        key,
        className: 'dsh-skeleton',
        'data-dsh-skeleton': variant,
        'data-animated': animated ? 'true' : 'false',
        style: {
          width: barWidth ?? width,
          height: barHeight ?? height,
          borderRadius: radius,
        },
      });

    if (variant === 'circle') {
      return h('span', {
        ...a11yProps,
        ...rest,
        className: cx('dsh-skeleton', 'dsh-skeleton-circle', className),
        'data-dsh-skeleton': 'circle',
        'data-animated': animated ? 'true' : 'false',
        style: { width, height, ...style },
      });
    }

    if (variant === 'rect') {
      return h('span', {
        ...a11yProps,
        ...rest,
        className: cx('dsh-skeleton', className),
        'data-dsh-skeleton': 'rect',
        'data-animated': animated ? 'true' : 'false',
        style: { width, height: height ?? '80px', borderRadius: radius, ...style },
      });
    }

    if (variant === 'row') {
      return h('div', {
        ...a11yProps,
        ...rest,
        className: cx('dsh-skeleton-row', className),
        style,
      },
      h('span', {
        className: 'dsh-skeleton dsh-skeleton-circle',
        'data-dsh-skeleton': 'circle',
        'data-animated': animated ? 'true' : 'false',
      }),
      h('div', { className: 'dsh-skeleton-group' },
        baseBar('58%', '12px', 'r1'),
        baseBar('84%', '10px', 'r2')));
    }

    if (variant === 'card') {
      return h('div', {
        ...a11yProps,
        ...rest,
        className: cx('dsh-skeleton-card', className),
        style,
      },
      baseBar('46%', '14px', 'c1'),
      baseBar('100%', '11px', 'c2'),
      baseBar('74%', '11px', 'c3'));
    }

    const count = Math.max(1, Math.round(Number(lines) || 1));
    if (count === 1) {
      return h('span', {
        ...a11yProps,
        ...rest,
        className: cx('dsh-skeleton', className),
        'data-dsh-skeleton': 'text',
        'data-animated': animated ? 'true' : 'false',
        style: { width, height, borderRadius: radius, ...style },
      });
    }

    const bars = [];
    for (let i = 0; i < count; i += 1) {
      const isLast = i === count - 1;
      bars.push(baseBar(isLast ? '68%' : '100%', height, 'l-' + i));
    }
    return h('div', {
      ...a11yProps,
      ...rest,
      className: cx('dsh-skeleton-group', className),
      style,
    }, bars);
  }

  const primitivesByHost = new Map();

  function resolveHostPrimitives(customRequire = requireFn) {
    let host = null;
    if (typeof customRequire === 'function') {
      try {
        host = customRequire('@deepseek-ai/dsh-client-ui-primitives') || null;
      } catch {
        host = null;
      }
    }

    // Keep component types stable while still discovering host changes on render.
    const cached = primitivesByHost.get(host);
    if (cached) return cached;

    const FallbackButton = forwardRefWrap(function FallbackButton({ variant = 'ghost', size = 'md', icon, className, children, type = 'button', ...rest }, ref) {
      return h('button', {
        ...(ref ? { ref } : {}),
        type,
        className: cx('dsh-btn', 'dsh-btn-' + variant, 'dsh-btn-' + size, className),
        ...rest,
      }, icon != null ? h('span', { className: 'dsh-fallback-btn-icon' }, icon) : null, children);
    });

    const FallbackInput = forwardRefWrap(function FallbackInput({ icon, className, ...rest }, ref) {
      return h('span', { className: cx('dsh-fallback-input-wrap', className) },
        icon != null ? h('span', { className: 'dsh-fallback-input-icon' }, icon) : null,
        h('input', ref ? { ...rest, ref } : rest));
    });

    function FallbackCheckbox({ checked = false, onChange, label, disabled = false, title, className, ...rest }) {
      return h('label', { className, title },
        h('input', {
          type: 'checkbox',
          checked: Boolean(checked),
          disabled,
          onChange: event => onChange?.(Boolean(event?.target?.checked)),
          ...rest,
        }),
        h('span', null, label));
    }

    function FallbackSwitch({ checked = false, onChange, label, disabled = false, title, className }) {
      return h('button', {
        type: 'button',
        role: 'switch',
        'aria-checked': Boolean(checked),
        'aria-label': label,
        title,
        disabled,
        className,
        onClick: () => onChange?.(!checked),
      }, h('span', null));
    }

    function FallbackSegmentedControl({ id, value, options = [], onChange, label, disabled = false, className }) {
      return h('div', { role: 'tablist', 'aria-label': label, className },
        options.map(opt => {
          const selected = opt.value === value;
          return h('button', {
            key: opt.value,
            id: id ? id + '-' + opt.value : undefined,
            type: 'button',
            role: 'tab',
            'aria-selected': selected,
            tabIndex: selected ? 0 : -1,
            disabled: disabled || Boolean(opt.disabled),
            onClick: () => {
              if (!disabled && !opt.disabled && opt.value !== value) onChange?.(opt.value);
            },
          }, opt.label);
        }));
    }

    function renderPortalSyncNode(styleValue, fontValue) {
      const syncStyle = normalizeDshStyle(styleValue ?? readDshStyle());
      const syncFont = normalizeDshFont(fontValue ?? readDshFont());
      return h('span', {
        key: '__dsh_portal_sync__',
        ref: createOverlaySyncRef(syncStyle, syncFont),
        hidden: true,
        'aria-hidden': 'true',
        'data-dsh-style': syncStyle,
        'data-dsh-font': syncFont,
      });
    }

    function FallbackMenu({ open = false, anchor, items = [], children, selectedId, onSelect, onClose, footer, className, listClassName, dshStyle, dshFont }) {
      const style = normalizeDshStyle(dshStyle ?? readDshStyle());
      const font = normalizeDshFont(dshFont ?? readDshFont());
      return h('div', { className: cx('dsh-style-fallback-wrap', className) },
        anchor,
        open
          ? h('div', {
              role: 'menu',
              'data-dsh-style': style,
              'data-dsh-font': font,
              'data-window-drag-exclude': '',
              'data-dsh-portal-synced': 'true',
              className: cx('dsh-style-fallback-menu', listClassName),
              onKeyDown: event => {
                if (event?.key === 'Escape') {
                  event.stopPropagation?.();
                  onClose?.();
                }
              },
            },
            items.map(item => {
              const stylePreset = VALID_STYLE_IDS.has(item.id) ? getDshStylePreset(item.id) : null;
              return h('button', {
                key: item.id,
                type: 'button',
                role: 'menuitemradio',
                'aria-checked': item.id === selectedId,
                disabled: Boolean(item.disabled),
                className: 'dsh-style-fallback-item',
                onClick: () => {
                  if (!item.disabled) {
                    onSelect?.(item.id);
                    onClose?.();
                  }
                },
              },
              h('span', { className: 'dsh-style-fallback-item-leading' },
                stylePreset ? h('span', { className: 'dsh-style-swatch', 'aria-hidden': 'true', style: { '--dsh-swatch-color': stylePreset.swatch } }) : null,
                h('span', null, item.label)),
              item.id === selectedId ? h('span', { 'aria-hidden': 'true' }, '✓') : null);
            }),
            children,
            footer)
          : null);
    }

    function FallbackModal({ open = true, onClose, title, closeLabel = 'Close', children, footer, className, contentClassName, onKeyDownCapture, headless = false, dshStyle, dshFont }) {
      if (!open) return null;
      const style = normalizeDshStyle(dshStyle ?? readDshStyle());
      const font = normalizeDshFont(dshFont ?? readDshFont());
      return h('div', {
        className: 'dsh-fallback-modal-root',
        role: 'presentation',
        'data-dsh-style': style,
        'data-dsh-font': font,
        'data-window-drag-exclude': '',
        'data-dsh-portal-synced': 'true',
        onKeyDownCapture,
        // Let nested menus/editors consume Escape before the enclosing dialog.
        onKeyDown: event => {
          if (!event?.defaultPrevented && event?.key === 'Escape') {
            event.stopPropagation?.();
            onClose?.();
          }
        },
      },
      h('div', { className: 'dsh-fallback-modal-mask', 'aria-hidden': 'true', onClick: onClose }),
      h('div', {
        role: 'dialog',
        'aria-modal': 'true',
        'aria-label': title,
        tabIndex: -1,
        'data-dsh-style': style,
        'data-dsh-font': font,
        'data-window-drag-exclude': '',
        'data-dsh-portal-synced': 'true',
        className: cx('dsh-fallback-modal-dialog', className),
      }, headless
        ? children
        : h(React.Fragment || 'div', null,
            h('header', null, h('h2', null, title), h('button', { type: 'button', 'aria-label': closeLabel, onClick: onClose }, '×')),
            h('div', { className: contentClassName }, children),
            footer ? h('footer', null, footer) : null)));
    }

    const WrappedMenu = host?.Menu
      ? function HostMenuWithStyle({ dshStyle, dshFont, children, ...menuProps }) {
          if (!menuProps.open) {
            return children !== undefined ? h(host.Menu, menuProps, children) : h(host.Menu, menuProps);
          }
          const syncNode = renderPortalSyncNode(dshStyle, dshFont);
          return children !== undefined && children !== null
            ? h(host.Menu, menuProps, children, syncNode)
            : h(host.Menu, menuProps, syncNode);
        }
      : FallbackMenu;

    const WrappedModal = host?.Modal
      ? function HostModalWithStyle({ dshStyle, dshFont, children, ...modalProps }) {
          if (!modalProps.open) {
            return children !== undefined ? h(host.Modal, modalProps, children) : h(host.Modal, modalProps);
          }
          const syncNode = renderPortalSyncNode(dshStyle, dshFont);
          return children !== undefined && children !== null
            ? h(host.Modal, modalProps, children, syncNode)
            : h(host.Modal, modalProps, syncNode);
        }
      : FallbackModal;

    const resolved = {
      ...(host || {}),
      isFallback: !host,
      Button: host?.Button || FallbackButton,
      Input: host?.Input || FallbackInput,
      Checkbox: host?.Checkbox || FallbackCheckbox,
      Switch: host?.Switch || FallbackSwitch,
      SegmentedControl: host?.SegmentedControl || FallbackSegmentedControl,
      Menu: WrappedMenu,
      Modal: WrappedModal,
    };
    primitivesByHost.set(host, resolved);
    return resolved;
  }

  const Button = forwardRefWrap(function Button({ children, icon, iconSize = 15, variant = 'outline', size = 'sm', className, ...props }, ref) {
    const P = resolveHostPrimitives();
    const hostVariant = variant === 'danger' ? 'ghost' : (variant || 'outline');
    const iconEl = typeof icon === 'string' ? h(Icon, { name: icon, size: iconSize }) : icon;
    return h(P.Button, {
      ...(ref ? { ref } : {}),
      variant: hostVariant,
      size,
      ...props,
      'data-variant': variant || 'outline',
      className: cx('w-button', variant && 'w-' + variant, className),
      icon: iconEl,
    }, children);
  });

  function IconButton({ label, icon, variant = 'ghost', className, ...props }) {
    return h(Button, { ...props, icon, variant, className: cx('w-icon-button', className), 'aria-label': label, title: label });
  }

  const Input = forwardRefWrap(function Input({ icon, className, inputRef, ...props }, ref) {
    const P = resolveHostPrimitives();
    const iconEl = typeof icon === 'string' ? h(Icon, { name: icon, size: 16 }) : icon;
    const targetRef = inputRef || ref;
    return h(P.Input, {
      ...props,
      ...(targetRef ? { ref: targetRef } : {}),
      icon: iconEl,
      className: cx('w-input', className),
    });
  });

  function Checkbox({ checked = false, onChange, label, hiddenLabel = false, disabled = false, title, className, ...props }) {
    const P = resolveHostPrimitives();
    return h(P.Checkbox, {
      ...props,
      checked: Boolean(checked),
      disabled,
      title,
      label,
      className: cx('w-checkbox', hiddenLabel && 'w-checkbox-icon', className),
      onChange: value => {
        const next = typeof value === 'boolean' ? value : Boolean(value?.target?.checked);
        onChange?.(next);
      },
    });
  }

  function ChoiceMenu({ label, id, value, items = [], onChange, disabled, children, className, align = 'start' }) {
    const [open, setOpen] = useStateHook(false);
    const [style] = useDshStyle();
    const [font] = useDshFont();
    const P = resolveHostPrimitives();
    const selected = items.find(item => item.id === value);
    return h(P.Menu, {
      open: Boolean(open && !disabled),
      selectedId: value,
      dshStyle: style,
      dshFont: font,
      items,
      align,
      portal: !P.isFallback,
      autoFocus: true,
      minWidthFromAnchor: true,
      className: cx('w-menu', className),
      onClose: () => setOpen(false),
      onSelect: next => {
        setOpen(false);
        if (next !== value) onChange?.(next);
      },
      anchor: h(Button, {
        id,
        variant: 'outline',
        className: 'w-menu-button',
        disabled: Boolean(disabled || items.length === 0),
        'aria-label': label,
        'aria-haspopup': 'menu',
        'aria-expanded': Boolean(open && !disabled),
        onClick: () => setOpen(prev => !prev),
        onKeyDown: event => {
          if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            event.preventDefault?.();
            setOpen(true);
          }
        },
      }, h('span', { className: 'w-menu-value' }, children ?? selected?.label ?? label), h(Icon, { name: 'down', size: 14 })),
    });
  }

  function FontSwitcher({ font: controlledFont, style: controlledStyle, onChange, lang = 'zh', id = 'dsh-font-switcher', compact = true, disabled = false, align = 'end', className, open: controlledOpen, onOpenChange } = {}) {
    const [syncedFont, setSyncedFont] = useDshFont();
    const [syncedStyle] = useDshStyle();
    const activeFont = normalizeDshFont(controlledFont ?? syncedFont);
    const activeStyle = normalizeDshStyle(controlledStyle ?? syncedStyle);
    const [internalOpen, setInternalOpen] = useStateHook(false);
    const open = controlledOpen !== undefined ? Boolean(controlledOpen) : internalOpen;
    const setOpen = next => {
      const resolved = typeof next === 'function' ? next(open) : Boolean(next);
      if (controlledOpen === undefined) setInternalOpen(resolved);
      onOpenChange?.(resolved);
    };
    const isZh = String(lang || '').toLowerCase().startsWith('zh');
    const preset = getDshFontPreset(activeFont);
    const P = resolveHostPrimitives();
    const triggerLabel = isZh ? '字体搭配：' + preset.zh : 'Font pairing: ' + preset.en;
    const visibleText = compact ? (isZh ? preset.zhShort : preset.enShort) : (isZh ? preset.zh : preset.en);
    const items = DSH_FONTS.map(option => ({
      id: option.id,
      label: isZh ? option.zh + ' (' + option.enShort + ')' : option.en,
    }));
    const selectFont = nextId => {
      const applied = writeDshFont(nextId);
      setSyncedFont(applied);
      onChange?.(applied);
      setOpen(false);
    };
    return h(P.Menu, {
      open: Boolean(open && !disabled),
      selectedId: activeFont,
      dshStyle: activeStyle,
      dshFont: activeFont,
      items,
      align,
      portal: !P.isFallback,
      autoFocus: true,
      minWidthFromAnchor: true,
      className,
      onClose: () => setOpen(false),
      onSelect: selectFont,
      anchor: h(P.Button, {
        id,
        variant: 'outline',
        size: 'sm',
        disabled,
        className: 'dsh-font-trigger',
        'aria-label': triggerLabel,
        'aria-haspopup': 'menu',
        'aria-expanded': Boolean(open && !disabled),
        title: triggerLabel,
        onClick: () => setOpen(prev => !prev),
        onKeyDown: event => {
          if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            event.preventDefault?.();
            setOpen(true);
          }
        },
      },
      h('span', { className: 'dsh-font-glyph', 'aria-hidden': 'true' }, isZh ? '字' : 'Aa'),
      h('span', { className: 'dsh-font-label' }, visibleText),
      h(Icon, { name: 'down', size: 13 })),
    });
  }

  function StyleSwitcher({ style: controlledStyle, font: controlledFont, onChange, onFontChange, showFontSwitcher = true, lang = 'zh', id = 'dsh-style-switcher', compact = true, disabled = false, align = 'end', className } = {}) {
    const [syncedStyle, setSyncedStyle] = useDshStyle();
    const [syncedFont] = useDshFont();
    const activeStyle = normalizeDshStyle(controlledStyle ?? syncedStyle);
    const activeFont = normalizeDshFont(controlledFont ?? syncedFont);
    const [open, setOpen] = useStateHook(false);
    const [fontOpen, setFontOpen] = useStateHook(false);
    const isZh = String(lang || '').toLowerCase().startsWith('zh');
    const preset = getDshStylePreset(activeStyle);
    const P = resolveHostPrimitives();
    const triggerLabel = isZh ? '界面风格：' + preset.zh : 'UI style: ' + preset.en;
    const visibleText = compact ? (isZh ? preset.zhShort : preset.enShort) : (isZh ? preset.zh : preset.en);
    const items = DSH_STYLES.map(option => ({
      id: option.id,
      label: isZh ? option.zh + ' (' + option.enShort + ')' : option.en,
    }));
    const selectStyle = nextId => {
      const applied = writeDshStyle(nextId);
      setSyncedStyle(applied);
      onChange?.(applied);
      setOpen(false);
    };
    return h('div', {
      className: cx('dsh-style-switcher', className),
      'data-window-drag-exclude': '',
    }, h(P.Menu, {
      open: Boolean(open && !disabled),
      selectedId: activeStyle,
      dshStyle: activeStyle,
      dshFont: activeFont,
      items,
      align,
      portal: !P.isFallback,
      autoFocus: true,
      minWidthFromAnchor: true,
      onClose: () => setOpen(false),
      onSelect: selectStyle,
      anchor: h(P.Button, {
        id,
        variant: 'outline',
        size: 'sm',
        disabled,
        className: 'dsh-style-trigger',
        'aria-label': triggerLabel,
        'aria-haspopup': 'menu',
        'aria-expanded': Boolean(open && !disabled),
        title: triggerLabel,
        onClick: () => {
          setFontOpen(false);
          setOpen(prev => !prev);
        },
        onKeyDown: event => {
          if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            event.preventDefault?.();
            setFontOpen(false);
            setOpen(true);
          }
        },
      },
      h('span', { className: 'dsh-style-swatch', 'aria-hidden': 'true', style: { '--dsh-swatch-color': preset.swatch } }),
      h('span', { className: 'dsh-style-label' }, visibleText),
      h(Icon, { name: 'down', size: 14 })),
    }),
    showFontSwitcher
      ? h(FontSwitcher, {
          id: id + '-font',
          font: controlledFont,
          style: activeStyle,
          onChange: onFontChange,
          lang,
          compact: true,
          disabled,
          align,
          open: Boolean(fontOpen && !disabled),
          onOpenChange: next => {
            if (next) setOpen(false);
            setFontOpen(next);
          },
        })
      : null);
  }

  const tourSessionDone = new Set();

  function readTourDone(storageKey, win) {
    const key = String(storageKey || 'dsh-workbench.tour.v1');
    if (tourSessionDone.has(key)) return true;
    const target = resolveWindow(win);
    if (!target) return false;
    try {
      return target.localStorage?.getItem(key) === 'done';
    } catch {
      return false;
    }
  }

  function writeTourDone(storageKey, win) {
    const key = String(storageKey || 'dsh-workbench.tour.v1');
    tourSessionDone.add(key);
    const target = resolveWindow(win);
    if (!target) return;
    try {
      target.localStorage?.setItem(key, 'done');
    } catch {
      // Restricted storage: in-memory tourSessionDone keeps tour dismissed for the session.
    }
  }

  function hasOpenModalDialog(pageNode) {
    const doc = pageNode?.ownerDocument || resolveWindow()?.document || (typeof document !== 'undefined' ? document : null);
    if (!doc || typeof doc.querySelectorAll !== 'function') return false;
    const dialogs = doc.querySelectorAll('[role="dialog"]:not([data-tour-card])');
    for (const el of dialogs) {
      if (pageNode && el !== pageNode && typeof el.contains === 'function' && el.contains(pageNode)) continue;
      return true;
    }
    return false;
  }

  function computeTourLayout(target, preferredSide, cardEl) {
    const win = resolveWindow();
    const vw = (win && win.innerWidth) || 1280;
    const vh = (win && win.innerHeight) || 800;
    const cw = cardEl?.offsetWidth || 320;
    const ch = cardEl?.offsetHeight || 196;
    const pad = 5;
    const gap = 12;
    const raw = target?.getBoundingClientRect?.();
    if (!target) {
      return {
        spotlight: null,
        side: 'center',
        left: Math.max(12, Math.round((vw - cw) / 2)),
        top: Math.max(12, Math.round((vh - ch) / 2)),
        arrowX: 28,
        arrowY: 24,
      };
    }
    const hasBox = Boolean(raw && (raw.width > 0 || raw.height > 0));
    const rect = hasBox ? raw : { left: 120, top: 72, width: 140, height: 32 };
    const spotlight = {
      left: Math.round(rect.left - pad),
      top: Math.round(rect.top - pad),
      width: Math.round(rect.width + pad * 2),
      height: Math.round(rect.height + pad * 2),
    };
    const spaceBottom = vh - spotlight.top - spotlight.height;
    const spaceTop = spotlight.top;
    const spaceRight = vw - spotlight.left - spotlight.width;
    const spaceLeft = spotlight.left;
    let side = preferredSide || 'bottom';
    if (side === 'right' && spaceRight < cw + gap + 12) {
      side = spaceBottom >= ch + gap + 12 ? 'bottom' : spaceLeft >= cw + gap + 12 ? 'left' : 'top';
    } else if (side === 'left' && spaceLeft < cw + gap + 12) {
      side = spaceRight >= cw + gap + 12 ? 'right' : 'bottom';
    } else if (side === 'bottom' && spaceBottom < ch + gap + 12 && spaceTop > spaceBottom) {
      side = 'top';
    } else if (side === 'top' && spaceTop < ch + gap + 12 && spaceBottom > spaceTop) {
      side = 'bottom';
    }
    let left = spotlight.left;
    let top = spotlight.top + spotlight.height + gap;
    if (side === 'top') top = spotlight.top - ch - gap;
    else if (side === 'right') { left = spotlight.left + spotlight.width + gap; top = spotlight.top; }
    else if (side === 'left') { left = spotlight.left - cw - gap; top = spotlight.top; }
    left = Math.round(Math.max(12, Math.min(vw - cw - 12, left)));
    top = Math.round(Math.max(12, Math.min(vh - ch - 12, top)));
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return {
      spotlight,
      side,
      left,
      top,
      arrowX: Math.round(Math.max(18, Math.min(cw - 18, centerX - left))),
      arrowY: Math.round(Math.max(18, Math.min(ch - 18, centerY - top))),
    };
  }

  function CoachmarkTour({ rootRef, steps = [], step = 0, manual = false, style = 'harness', font, lang = 'zh', layout: rawLayout, setLayout, onStep, onClose, onCopyPrompt }) {
    const layerRef = useRefHook(null);
    const cardRef = useRefHook(null);
    const nextBtnRef = useRefHook(null);
    const [copied, setCopied] = useStateHook(false);
    const titleId = useIdHook() + '-tour-title';
    const isEn = String(lang || '').toLowerCase().startsWith('en');
    const l = (zh, en) => (isEn ? en : zh);
    const safeIndex = Math.max(0, Math.min(steps.length - 1, step));
    const current = steps[safeIndex] || {};
    const activeStyle = normalizeDshStyle(style);
    const activeFont = normalizeDshFont(font ?? readDshFont());
    const layout = rawLayout && typeof rawLayout === 'object' && rawLayout.side
      ? rawLayout
      : { spotlight: null, side: current.side || 'bottom', left: 24, top: 76, arrowX: 28, arrowY: 24 };

    useEffectHook(() => {
      const node = layerRef.current;
      if (!node) return undefined;
      try {
        node.setAttribute?.('popover', 'manual');
        node.showPopover?.();
      } catch { /* ignore */ }
      return () => { try { node.hidePopover?.(); } catch { /* ignore */ } };
    }, []);

    useEffectHook(() => {
      setCopied(false);
    }, [safeIndex]);

    useEffectHook(() => {
      function safeQuery(root, selector) {
        if (!root || typeof root.querySelector !== 'function' || !selector) return null;
        try {
          return root.querySelector(selector);
        } catch {
          if (typeof selector === 'string' && selector.startsWith('#') && !/[\s>+~,\[:.\]]/.test(selector.slice(1))) {
            try {
              const id = selector.slice(1).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
              return root.querySelector('[id="' + id + '"]');
            } catch {
              return null;
            }
          }
          return null;
        }
      }
      function measure() {
        const doc = resolveWindow()?.document || (typeof document !== 'undefined' ? document : null);
        const scope = rootRef?.current || doc;
        if (!scope || typeof scope.querySelector !== 'function') return;
        const target = safeQuery(scope, current.selector)
          || safeQuery(scope, current.fallback)
          || (scope !== doc ? (safeQuery(doc, current.selector) || safeQuery(doc, current.fallback)) : null)
          || null;
        setLayout?.(computeTourLayout(target, current.side, cardRef.current));
      }
      measure();
      const raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame(measure) : null;
      const win = resolveWindow();
      if (!win || typeof win.addEventListener !== 'function') {
        return () => { if (raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf); };
      }
      win.addEventListener('resize', measure, { passive: true });
      win.addEventListener('scroll', measure, true);
      return () => {
        if (raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf);
        win.removeEventListener('resize', measure);
        win.removeEventListener('scroll', measure, true);
      };
    }, [safeIndex, current.selector, current.fallback, current.side]);

    useEffectHook(() => {
      if (manual) {
        const btn = nextBtnRef.current || cardRef.current?.querySelector?.('[data-tour-next]');
        btn?.focus?.();
      }
    }, [manual, safeIndex]);

    async function defaultCopyPrompt(text) {
      const win = resolveWindow();
      const nav = win?.navigator || (typeof navigator !== 'undefined' ? navigator : null);
      if (nav?.clipboard?.writeText) {
        try {
          await nav.clipboard.writeText(String(text));
          return true;
        } catch { /* ignore */ }
      }
      return false;
    }

    async function handleCopy() {
      if (!current.prompt) return;
      const copyFn = typeof onCopyPrompt === 'function' ? onCopyPrompt : defaultCopyPrompt;
      const ok = await copyFn(current.prompt);
      if (ok !== false) {
        setCopied(true);
        const timer = setTimeout(() => setCopied(false), 1800);
        if (timer && typeof timer.unref === 'function') timer.unref();
      }
    }

    const isLast = safeIndex >= steps.length - 1;
    function finish() { onClose?.(manual); }
    function onKeyDown(event) {
      if (event.isComposing || event.nativeEvent?.isComposing) return;
      if (event.key === 'Escape') {
        event.preventDefault?.();
        event.stopPropagation?.();
        finish();
      } else if (event.key === 'ArrowRight' && !isLast) {
        event.preventDefault?.();
        onStep?.(safeIndex + 1, true);
      } else if (event.key === 'ArrowLeft' && safeIndex > 0) {
        event.preventDefault?.();
        onStep?.(safeIndex - 1, true);
      }
    }

    return h('div', {
      ref: layerRef,
      className: 'dshw w-tour-layer',
      'data-dsh-style': activeStyle,
      'data-dsh-font': activeFont,
      'data-wb-tour': current.id || String(safeIndex),
      'data-window-drag-exclude': '',
    },
      layout.spotlight
        ? h('div', {
            className: 'w-tour-spotlight',
            'data-tour-spotlight': current.id || String(safeIndex),
            'aria-hidden': 'true',
            style: {
              left: layout.spotlight.left + 'px',
              top: layout.spotlight.top + 'px',
              width: layout.spotlight.width + 'px',
              height: layout.spotlight.height + 'px',
            },
          })
        : h('div', { className: 'w-tour-backdrop-fallback', 'aria-hidden': 'true' }),
      h('div', {
        ref: cardRef,
        role: 'dialog',
        'aria-modal': 'false',
        'aria-labelledby': titleId,
        tabIndex: -1,
        onKeyDown,
        className: 'w-tour-card',
        'data-side': layout.side,
        'data-tour-card': current.id || String(safeIndex),
        style: {
          left: layout.left + 'px',
          top: layout.top + 'px',
          '--arrow-x': layout.arrowX + 'px',
          '--arrow-y': layout.arrowY + 'px',
        },
      },
        h('span', { className: 'w-tour-arrow', 'data-tour-arrow': layout.side, 'aria-hidden': 'true' }),
        h('div', { className: 'w-tour-head' },
          h('div', { className: 'w-tour-step-meta' },
            h('span', { className: 'w-tour-step-badge' }, (safeIndex + 1) + ' / ' + steps.length),
            h('span', { className: 'w-tour-dots', 'aria-hidden': 'true' },
              steps.map((item, idx) => h('span', { key: item.id || idx, className: 'w-tour-dot', 'data-active': idx === safeIndex ? 'true' : undefined })))),
          h('button', { type: 'button', className: 'w-tour-skip', 'data-tour-skip': '', onClick: finish }, l('跳过', 'Skip'))),
        h('h2', { id: titleId, className: 'w-tour-title' }, current.title),
        h('p', { className: 'w-tour-desc' }, current.desc),
        current.prompt ? h('div', { className: 'w-tour-inline-action' },
          h(Button, {
            variant: 'outline',
            size: 'sm',
            icon: copied ? 'check' : 'copy',
            'data-copy-prompt': current.prompt,
            'data-copied': copied ? 'true' : undefined,
            onClick: () => { void handleCopy(); },
          }, copied ? l('已复制', 'Copied') : (current.promptLabel || l('复制对话指令', 'Copy prompt')))) : null,
        h('div', { className: 'w-tour-footer' },
          safeIndex > 0
            ? h(Button, { variant: 'ghost', size: 'sm', onClick: () => onStep?.(safeIndex - 1, true), 'data-tour-prev': '' }, l('上一步', 'Back'))
            : h('span', null),
          h('div', { className: 'w-tour-nav' },
            h(Button, {
              ref: nextBtnRef,
              variant: 'primary',
              size: 'sm',
              'data-tour-next': '',
              onClick: () => (isLast ? finish() : onStep?.(safeIndex + 1, true)),
            }, isLast ? l('完成引导', 'Done') : l('下一步', 'Next'))))));
  }

  function TabBar({ items = [], value, onChange, label, id: explicitId, className, pill = true }) {
    const fallbackId = useIdHook();
    const id = explicitId || fallbackId;
    const active = items.some(item => item.id === value) ? value : items[0]?.id;
    const indicator = useSlidingTabIndicator(active, { deps: [items.length] });
    function keys(event, index) {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
      const node = event.currentTarget.parentElement?.querySelectorAll('[role=tab]')[next];
      if (node) { onChange(items[next].id); node.focus(); }
    }
    return h('div', {
      ...indicator.tablistProps,
      className: cx('w-tabs', 'dsh-tablist', pill && 'dsh-tablist-pill', className),
      role: 'tablist',
      'aria-label': label,
      'data-window-drag-exclude': '',
    },
    items.map((item, index) => h('button', {
      type: 'button',
      role: 'tab',
      key: item.id,
      className: 'w-tab',
      id: id + '-' + item.id,
      'data-tab-id': item.id,
      ...(item['data-tour'] ? { 'data-tour': item['data-tour'] } : {}),
      'aria-selected': active === item.id,
      tabIndex: active === item.id ? 0 : -1,
      onClick: () => onChange(item.id),
      onKeyDown: event => keys(event, index),
    }, item.icon ? h(Icon, { name: item.icon, size: 14 }) : null, h('span', null, item.label), item.count !== undefined ? h('span', { className: 'w-count' }, item.count) : null)),
    h('span', indicator.indicatorProps));
  }

  function Page({ title, subtitle, headerMeta, icon, tabs, navigation, actions, children, workbench = false, lang = 'zh', showStyleSwitcher = true, showFontSwitcher = true, className, rootRef, tourSteps = null, tourStorageKey = 'dsh-workbench.tour.v1', onTourCopyPrompt, ...props }) {
    const [style, setStyle] = useDshStyle();
    const [font, setFont] = useDshFont();
    const fallbackRootRef = useRefHook(null);
    const pageRef = rootRef && typeof rootRef === 'object' ? rootRef : fallbackRootRef;
    const triggerRef = useRefHook(null);
    const [tour, setTour] = useStateHook({ open: false, step: 0, manual: false });
    const [tourLayout, setTourLayout] = useStateHook(null);
    const hasTour = Array.isArray(tourSteps) && tourSteps.length > 0;
    const isEn = String(lang || '').toLowerCase().startsWith('en');
    const titleTooltip = typeof subtitle === 'string' && subtitle ? subtitle : undefined;
    const inlineTabs = tabs && Array.isArray(tabs.items) && tabs.items.length > 0
      ? h(TabBar, {
          id: tabs.id,
          items: tabs.items,
          value: tabs.value,
          onChange: tabs.onChange,
          label: tabs.label,
          pill: tabs.pill !== false,
        })
      : null;

    useEffectHook(() => {
      if (!workbench || !hasTour || readTourDone(tourStorageKey)) return undefined;
      const timer = setTimeout(() => {
        if (!readTourDone(tourStorageKey) && !hasOpenModalDialog(pageRef.current)) {
          setTour({ open: true, step: 0, manual: false });
        }
      }, 280);
      if (timer && typeof timer.unref === 'function') timer.unref();
      return () => clearTimeout(timer);
    }, [workbench, hasTour, tourStorageKey]);

    useEffectHook(() => {
      if (!tour.open || tour.manual) return undefined;
      if (hasOpenModalDialog(pageRef.current)) {
        writeTourDone(tourStorageKey);
        setTour(prev => (prev.open ? { ...prev, open: false } : prev));
        return undefined;
      }
      const doc = pageRef.current?.ownerDocument || resolveWindow()?.document || (typeof document !== 'undefined' ? document : null);
      if (typeof MutationObserver !== 'function' || !doc?.body || typeof doc.body.nodeType !== 'number') return undefined;
      const observer = new MutationObserver(() => {
        if (hasOpenModalDialog(pageRef.current)) {
          writeTourDone(tourStorageKey);
          setTour(prev => (prev.open && !prev.manual ? { ...prev, open: false } : prev));
        }
      });
      observer.observe(doc.body, { childList: true, subtree: true });
      return () => observer.disconnect();
    }, [tour.open, tour.manual, tourStorageKey, children]);

    function closeTour(restoreFocus = false) {
      writeTourDone(tourStorageKey);
      setTour(prev => ({ ...prev, open: false }));
      if (restoreFocus) {
        const timer = setTimeout(() => {
          const btn = triggerRef.current || pageRef.current?.querySelector?.('[data-wb-tour-trigger]');
          btn?.focus?.();
        }, 0);
        if (timer && typeof timer.unref === 'function') timer.unref();
      }
    }

    return h('section', {
      ...props,
      ref: pageRef,
      'data-dsh-style': style,
      'data-dsh-font': font,
      'data-main': workbench ? 'true' : 'false',
      className: cx('dshw', 'w-page', !workbench && 'w-embedded', className),
    },
      h(Styles, { key: 'styles' }),
      h('header', { className: cx('w-page-header', 'dsh-header'), 'data-dsh-header': '' },
        h('div', { className: 'dsh-header-leading' },
          h('div', { className: 'dsh-header-brand' },
            icon ? h('span', { className: cx('w-brand', 'dsh-header-badge'), 'aria-hidden': 'true' }, h(Icon, { name: icon, size: 14 })) : null,
            h('h1', { className: cx('w-title', 'dsh-header-title'), title: titleTooltip }, title),
            headerMeta || null),
          (inlineTabs || navigation) ? h('div', { className: 'dsh-header-tabs' }, inlineTabs, navigation || null) : null),
        (actions || showStyleSwitcher || hasTour)
          ? h('div', { className: 'w-header-actions', 'data-dsh-header-actions': '', 'data-window-drag-exclude': '' },
              hasTour ? h(Button, {
                ref: triggerRef,
                variant: 'ghost',
                size: 'sm',
                className: 'w-tour-trigger',
                'data-wb-tour-trigger': '',
                'aria-label': isEn ? 'Interactive guide' : '使用引导',
                'aria-expanded': Boolean(tour.open),
                title: isEn ? 'Interactive guide' : '使用引导',
                onClick: () => {
                  if (tour.open) closeTour(true);
                  else setTour({ open: true, step: 0, manual: true });
                },
              }, isEn ? '? Tour' : '? 引导') : null,
              showStyleSwitcher ? h(StyleSwitcher, { style, font, onChange: setStyle, onFontChange: setFont, showFontSwitcher, lang, compact: true }) : null,
              actions)
          : null),
      h('div', { className: 'w-body' }, children),
      hasTour && tour.open ? h(CoachmarkTour, {
        rootRef: pageRef,
        steps: tourSteps,
        step: tour.step,
        manual: tour.manual,
        style,
        font,
        lang,
        layout: tourLayout,
        setLayout: setTourLayout,
        onStep: (next, isManual) => setTour({ open: true, step: next, manual: Boolean(isManual) }),
        onClose: closeTour,
        onCopyPrompt: onTourCopyPrompt,
      }) : null);
  }

  function Tabs({ items, value, onChange, label, children, pill = false }) {
    const id = useIdHook();
    const active = items.some(item => item.id === value) ? value : items[0]?.id;
    return h('div', { className: 'w-tabs-layout' },
      h(TabBar, { id, items, value: active, onChange, label, pill }),
      children !== undefined
        ? h('div', {
            key: active,
            className: 'w-tab-panel dsh-tab-panel',
            'data-dsh-tab-panel': '',
            id: id + '-panel',
            role: 'tabpanel',
            'aria-labelledby': id + '-' + active,
          }, children)
        : null);
  }

  function Status({ children, tone = 'info', className }) {
    if (!children) return null;
    return h('div', {
      className: cx('dshw', 'w-status', 'w-status-' + tone, className),
      'data-tone': tone,
      role: tone === 'error' ? 'alert' : 'status',
      'aria-live': tone === 'error' ? 'assertive' : 'polite',
    }, h(Icon, { name: tone === 'success' ? 'check' : 'info', size: 16 }), h('div', { className: 'w-status-text' }, children));
  }

  function Empty({ title, children, action, icon = 'file' }) {
    const [style] = useDshStyle();
    const [font] = useDshFont();
    return h('div', { className: 'dshw w-empty', 'data-dsh-style': style, 'data-dsh-font': font },
      h(Styles, { key: 'styles' }),
      h('span', { className: 'w-empty-icon' }, h(Icon, { name: icon, size: 24 })),
      h('h2', { 'data-dsh-serif': '' }, title),
      children ? h('div', { className: 'w-muted' }, children) : null,
      action ? h('div', { className: 'w-toolbar' }, action) : null);
  }

  function Split({ list, detail, selected, onBack, backLabel, className, listWidth = 360, storageKey, minWidth = 220, maxWidth = 540, resizerLabel = 'Resize pane' }) {
    const ref = useRefHook(null);
    const splitState = storageKey
      ? useResizableSplit({ key: storageKey, initial: listWidth, min: minWidth, max: maxWidth })
      : null;
    useEffectHook(() => {
      if (!selected || !ref.current || ref.current.clientWidth > 760) return;
      const heading = ref.current.querySelector('.w-detail h2');
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    }, [selected]);
    const effectiveWidth = splitState ? splitState.size : listWidth;
    return h('div', {
      ref,
      className: cx('w-split', storageKey && 'dsh-split-pane', className),
      'data-selected': selected ? 'true' : 'false',
      style: { '--w-list-width': effectiveWidth + 'px', '--dsh-split-size': effectiveWidth + 'px' },
    },
      h('div', { className: cx('w-master', storageKey && 'dsh-split-leading') }, list),
      storageKey ? h(SplitResizer, { ...splitState.resizerProps, label: resizerLabel }) : null,
      h('div', { className: cx('w-detail', storageKey && 'dsh-split-trailing') }, selected ? h(Button, { className: 'w-back', icon: 'left', variant: 'ghost', onClick: onBack }, backLabel) : null, detail));
  }

  function Row({ title, meta, description, active, onClick, children, actions, status, className, disabled }) {
    return h('div', {
      className: cx('w-row', 'dsh-row', active && 'w-selected', className),
      'data-dsh-row': '',
      'data-active': active ? 'true' : 'false',
      'data-selected': active ? 'true' : 'false',
    },
      children ? h('div', { className: 'w-row-select' }, children) : null,
      h('button', { type: 'button', className: 'w-row-button', onClick, disabled, 'aria-pressed': !!active },
        h('span', { className: 'w-row-head' },
          h('span', { className: 'w-row-title-wrap' },
            h('span', { className: 'dsh-pixel-cursor', 'aria-hidden': 'true' }, '▶'),
            h('strong', { 'data-dsh-serif': '' }, title)),
          status ? h('span', { className: 'w-tag' }, status) : null),
        meta ? h('span', { className: 'w-row-meta' }, meta) : null,
        description ? h('span', { className: 'w-row-description' }, description) : null),
      actions ? h('div', { className: 'dsh-row-actions', 'data-window-drag-exclude': '' }, actions) : null);
  }

  function Search({ label, value, onChange, ...props }) {
    const id = useIdHook();
    return h(Input, { type: 'search', id, icon: 'search', 'aria-label': label, placeholder: label, value, onChange, className: 'w-search', ...props });
  }

  function Switch({ label, checked, onChange, disabled, className }) {
    const P = resolveHostPrimitives();
    return h('div', { className: cx('w-switch-row', className) },
      label ? h('span', { className: 'w-switch-text' }, label) : null,
      h(P.Switch, {
        checked: Boolean(checked),
        disabled,
        label,
        className: 'w-switch',
        onChange: next => onChange?.(typeof next === 'boolean' ? next : Boolean(next?.target?.checked)),
      }));
  }

  function Dialog({ title, children, onClose, closeLabel, className, busy = false, footer, tone }) {
    const [style] = useDshStyle();
    const [font] = useDshFont();
    const id = useIdHook();
    const P = resolveHostPrimitives();
    const close = () => { if (!busy) onClose?.(); };
    return h(P.Modal, {
      open: true,
      headless: true,
      dshStyle: style,
      dshFont: font,
      title,
      onClose: close,
      backdropBlur: false,
      className: cx('dshw', 'w-dialog-modal', className),
    },
      h('div', {
        ref: createOverlaySyncRef(style, font),
        className: cx('dshw', 'w-dialog', className),
        'data-dsh-style': style,
        'data-dsh-font': font,
        'data-window-drag-exclude': '',
        'aria-labelledby': id,
      },
        h(Styles, { key: 'styles' }),
        h('header', { className: 'w-dialog-header' },
          h('h2', { id, 'data-tone': tone, 'data-dsh-serif': '' }, title),
          h(IconButton, { icon: 'close', label: closeLabel, disabled: busy, onClick: close })),
        h('div', { className: 'w-dialog-body', 'aria-busy': busy || undefined }, children),
        footer ? h('footer', { className: 'w-dialog-footer' }, footer) : null));
  }

  function register(ctx, { id, label, icon, component, inject, order = 50 }) {
    ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: id, inject: () => ({ ...(inject?.() || {}), workbench: true }) }, component));
    ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id, order, label }, function WorkbenchIcon({ size }) { return h(Icon, { name: icon, size }); }));
  }

  const styles = `
:where([data-dsh-style]),
:where([data-dsh-portal-synced]),
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):has([data-dsh-style]) {
--dsh-ease-out: cubic-bezier(0.22, 1, 0.36, 1);
--dsh-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--dsh-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--dsh-motion-fast: 140ms;
--dsh-motion-base: 200ms;
--dsh-motion-dialog: 220ms;
--dsh-control-border-width: 0.5px;
--dsh-button-shadow: none;
--dsh-button-hover-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);
--dsh-card-shadow: none;
--dsh-card-hover-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
--dsh-font-display: "Cascadia Code SemiBold", "Cascadia Code", "YouYuan", "幼圆", "Noto Sans SC", monospace;
--dsh-font-body: "Cascadia Code", "Cascadia Mono", "YouYuan", "幼圆", "Noto Sans SC", monospace;
--dsh-font-mono: "Cascadia Mono", "Cascadia Code", "YouYuan", "幼圆", Consolas, monospace;
--dsh-display-weight: 700;
--dsh-display-tracking: 0.015em;
--dsh-body-tracking: normal;
--dsh-serif-font: "Palatino Linotype", Georgia, "Noto Serif SC", "STZhongsong", "华文中宋", "STSong", "华文宋体", serif;
--dsw-font-family: var(--dsh-font-body);
--dsw-font-markdown-base: var(--dsh-font-body);
}
@supports (transition-timing-function: linear(0, 1)) {
:where([data-dsh-style]),
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):has([data-dsh-style]) {
--dsh-ease-spring: linear(
0, 0.402 7.4%, 0.711 15.3%, 0.929 23.7%, 1.008 28.2%,
1.067 33%, 1.099 36.9%, 1.12 41%, 1.13 45.4%, 1.13 50.1%,
1.111 58.5%, 1.019 83.2%, 1.004 91.3%, 1
);
}
}
[data-window-drag-exclude] {
-webkit-app-region: no-drag;
}
[data-dsh-style="harness"],
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style="harness"], :has([data-dsh-style="harness"])) {
--dsh-font-display: "Cascadia Code SemiBold", "Cascadia Code", "YouYuan", "幼圆", "Noto Sans SC", monospace;
--dsh-font-body: "Cascadia Code", "Cascadia Mono", "YouYuan", "幼圆", "Noto Sans SC", monospace;
--dsh-font-mono: "Cascadia Mono", "Cascadia Code", "YouYuan", "幼圆", Consolas, monospace;
--dsh-display-weight: 700;
--dsh-display-tracking: 0.015em;
--dsh-body-tracking: normal;
--dsw-font-family: var(--dsh-font-body);
--dsw-font-markdown-base: var(--dsh-font-body);
}
:where(body:not([data-ds-dark-theme])) [data-dsh-style="harness"],
:where(body:not([data-ds-dark-theme])) :where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):has([data-dsh-style="harness"]) {
color-scheme: light;
accent-color: var(--dsw-alias-state-business-primary, #4176e6);
}
:root:not([data-dsh-host-tokens]) [data-dsh-style="harness"] {
--dsw-radius-xs: 6px;
--dsw-radius-sm: 8px;
--dsw-radius-md: 12px;
--dsw-radius-lg: 16px;
--dsw-radius-xl: 20px;
}
body:not([data-ds-dark-theme]) [data-dsh-style="harness"] {
--dsh-surface-spotlight: rgba(65, 118, 230, 0.06);
}
body[data-ds-dark-theme] [data-dsh-style="harness"],
body[data-ds-dark-theme] :where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style="harness"], :has([data-dsh-style="harness"])) {
color-scheme: dark;
accent-color: #7aaaff;
--dsw-alias-bg-base: #1f232b;
--dsw-alias-bg-layer-1: #272c36;
--dsw-alias-bg-layer-2: #2f3542;
--dsw-alias-bg-layer-3: #373e4d;
--dsw-alias-bg-overlay: #2a303c;
--dsw-alias-bg-module-platform: #2c323e;
--dsw-alias-settings-card-fill: #262b35;
--dsw-alias-settings-card-stroke: rgba(226, 232, 240, 0.12);
--dsw-specific-menu: rgba(39, 44, 54, 0.96);
--dsw-alias-border-l1: rgba(226, 232, 240, 0.09);
--dsw-alias-border-l2: rgba(226, 232, 240, 0.15);
--dsw-alias-border-l3: rgba(226, 232, 240, 0.22);
--dsw-alias-border-l4: rgba(226, 232, 240, 0.28);
--dsw-alias-label-primary: #eef2f7;
--dsw-alias-label-secondary: #b6c0cf;
--dsw-alias-label-tertiary: #8d98ab;
--dsw-alias-label-dimmed: #737e91;
--dsw-alias-brand-primary: #7aaaff;
--dsw-alias-brand-text: #eef2f7;
--dsw-alias-state-business-primary: #7aaaff;
--dsw-alias-state-business-tertiary: rgba(122, 170, 255, 0.16);
--dsw-alias-link: #8bb6ff;
--dsw-alias-button-primary-fill: #5b8def;
--dsw-alias-button-primary-hover: #6f9cf4;
--dsw-alias-button-primary-ink: #ffffff;
--dsw-alias-interactive-bg-hover: rgba(226, 232, 240, 0.07);
--dsw-alias-interactive-bg-active: rgba(226, 232, 240, 0.13);
--dsw-alias-interactive-bg-hover-accent: rgba(122, 170, 255, 0.15);
--dsw-alias-interactive-bg-hover-danger: rgba(248, 113, 113, 0.16);
--dsw-alias-state-error-primary: #f87171;
--dsw-alias-state-warn-primary: #fbbf24;
--dsw-alias-state-warn-label: #fcd34d;
--dsw-alias-state-warn-tertiary: rgba(251, 191, 36, 0.15);
--dsw-alias-state-success-primary: #4ade80;
--dsw-elevation-panel: 0 4px 16px rgba(10, 14, 22, 0.28), 0 0 0 1px rgba(226, 232, 240, 0.12);
--dsw-elevation-prominent: 0 14px 38px rgba(10, 14, 22, 0.42), 0 0 0 1px rgba(226, 232, 240, 0.16);
--dsh-button-hover-shadow: 0 2px 8px rgba(10, 14, 22, 0.25);
--dsh-card-hover-shadow: 0 8px 22px rgba(10, 14, 22, 0.32);
--dsh-surface-spotlight: rgba(122, 170, 255, 0.10);
}
[data-dsh-style="cream"],
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style="cream"], :has([data-dsh-style="cream"])) {
color-scheme: light;
accent-color: #9e5829;
--dsw-alias-bg-base: #faf7f0;
--dsw-alias-bg-layer-1: #f3efe4;
--dsw-alias-bg-layer-2: #eae3d3;
--dsw-alias-bg-layer-3: #e0d7c3;
--dsw-alias-bg-overlay: #fcfaf4;
--dsw-alias-bg-module-platform: #efe9da;
--dsw-alias-settings-card-fill: #fdfbf6;
--dsw-alias-settings-card-stroke: #d4c8ae;
--dsw-specific-menu: rgba(252, 250, 244, 0.97);
--dsw-alias-border-l1: #e6dec8;
--dsw-alias-border-l2: #d4c8ae;
--dsw-alias-border-l3: #c0b193;
--dsw-alias-border-l4: #ad9c7c;
--dsw-alias-label-primary: #2b2620;
--dsw-alias-label-secondary: #655b4e;
--dsw-alias-label-tertiary: #857968;
--dsw-alias-label-dimmed: #9c907f;
--dsw-alias-brand-primary: #9e5829;
--dsw-alias-brand-text: #2b2620;
--dsw-alias-state-business-primary: #a65e2e;
--dsw-alias-state-business-tertiary: rgba(166, 94, 46, 0.13);
--dsw-alias-link: #934e20;
--dsw-alias-button-primary-fill: #9e5829;
--dsw-alias-button-primary-hover: #86481e;
--dsw-alias-button-primary-ink: #fffdf9;
--dsw-alias-interactive-bg-hover: rgba(108, 84, 50, 0.075);
--dsw-alias-interactive-bg-active: rgba(166, 94, 46, 0.14);
--dsw-alias-interactive-bg-hover-accent: rgba(166, 94, 46, 0.12);
--dsw-alias-interactive-bg-hover-danger: rgba(185, 56, 44, 0.11);
--dsw-alias-state-error-primary: #b9382c;
--dsw-alias-state-warn-primary: #b45309;
--dsw-alias-state-warn-label: #8c3d08;
--dsw-alias-state-warn-tertiary: #fdefd6;
--dsw-alias-state-success-primary: #2a6f4e;
--dsw-radius-xs: 6px;
--dsw-radius-sm: 9px;
--dsw-radius-md: 13px;
--dsw-radius-lg: 16px;
--dsw-radius-xl: 20px;
--dsw-elevation-panel: 0 1px 2px rgba(68, 52, 32, 0.06), 3px 3px 0 #ebe3d1, 0 0 0 1px rgba(180, 164, 138, 0.42);
--dsw-elevation-prominent: 0 14px 34px rgba(68, 52, 32, 0.14), 3px 3px 0 #ebe3d1, 0 0 0 1px rgba(180, 164, 138, 0.48);
--dsh-control-border-width: 1px;
--dsh-button-hover-shadow: 0 2px 6px rgba(84, 62, 34, 0.09);
--dsh-card-shadow: 0 1px 2px rgba(68, 52, 32, 0.06), 3px 3px 0 #ebe3d1;
--dsh-card-hover-shadow: 0 4px 10px rgba(68, 52, 32, 0.10), 4px 4px 0 #e2d7be;
--dsh-surface-spotlight: rgba(166, 94, 46, 0.08);
--dsh-font-display: "Trebuchet MS", "STKaiti", "华文楷体", "Noto Serif SC SemiBold", serif;
--dsh-font-body: "Source Sans 3", "Noto Sans SC", "Microsoft YaHei UI", sans-serif;
--dsh-font-mono: "Cascadia Mono", Consolas, monospace;
--dsh-display-weight: 700;
--dsh-display-tracking: normal;
--dsh-body-tracking: normal;
--dsw-font-family: var(--dsh-font-body);
--dsw-font-markdown-base: var(--dsh-font-body);
}
[data-dsh-style="cream"] :where([data-dsh-card], .dsh-card) {
border-color: var(--dsw-alias-border-l2);
box-shadow: var(--dsh-card-shadow);
}
[data-dsh-style="cream"] :where([data-dsh-row], .dsh-row) {
border-block-end: 1px dashed var(--dsw-alias-border-l2);
}
[data-dsh-style="cream"] [role="tab"][aria-selected="true"] {
background: rgba(158, 88, 41, 0.10);
color: #7d4119;
box-shadow: inset 0 2px 0 rgba(158, 88, 41, 0.22);
}
[data-dsh-style="cream"] [role="tab"][aria-selected="true"]::after {
border-block-end-color: #9e5829;
border-block-end-width: 2.5px;
}
[data-dsh-style="claude"],
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style="claude"], :has([data-dsh-style="claude"])) {
color-scheme: light;
accent-color: #c96442;
--dsw-alias-bg-base: #f5f4ed;
--dsw-alias-bg-layer-1: #ece9df;
--dsw-alias-bg-layer-2: #e3dfd2;
--dsw-alias-bg-layer-3: #d8d3c3;
--dsw-alias-bg-overlay: #faf9f4;
--dsw-alias-bg-module-platform: #e7e3d6;
--dsw-alias-settings-card-fill: #faf9f4;
--dsw-alias-settings-card-stroke: transparent;
--dsw-specific-menu: rgba(250, 249, 244, 0.97);
--dsw-alias-border-l1: #e4e0d3;
--dsw-alias-border-l2: #d5d0c3;
--dsw-alias-border-l3: #c1bbb0;
--dsw-alias-border-l4: #aba495;
--dsw-alias-label-primary: #1f1e1b;
--dsw-alias-label-secondary: #5d5a51;
--dsw-alias-label-tertiary: #7b776c;
--dsw-alias-label-dimmed: #948f83;
--dsw-alias-brand-primary: #c96442;
--dsw-alias-brand-text: #1f1e1b;
--dsw-alias-state-business-primary: #c96442;
--dsw-alias-state-business-tertiary: rgba(201, 100, 66, 0.14);
--dsw-alias-link: #b35030;
--dsw-alias-button-primary-fill: #c96442;
--dsw-alias-button-primary-hover: #b25232;
--dsw-alias-button-primary-ink: #faf9f5;
--dsw-alias-interactive-bg-hover: rgba(31, 30, 27, 0.055);
--dsw-alias-interactive-bg-active: rgba(201, 100, 66, 0.14);
--dsw-alias-interactive-bg-hover-accent: rgba(201, 100, 66, 0.11);
--dsw-alias-interactive-bg-hover-danger: rgba(180, 48, 42, 0.11);
--dsw-alias-state-error-primary: #b4302a;
--dsw-alias-state-warn-primary: #b85d19;
--dsw-alias-state-warn-label: #8c430c;
--dsw-alias-state-warn-tertiary: #f7e8d6;
--dsw-alias-state-success-primary: #2d6a4f;
--dsw-radius-xs: 7px;
--dsw-radius-sm: 10px;
--dsw-radius-md: 14px;
--dsw-radius-lg: 18px;
--dsw-radius-xl: 22px;
--dsw-elevation-panel: 0 2px 12px rgba(31, 30, 27, 0.05), 0 0 0 1px rgba(145, 139, 126, 0.18);
--dsw-elevation-prominent: 0 16px 38px rgba(31, 30, 27, 0.13), 0 2px 8px rgba(31, 30, 27, 0.05), 0 0 0 1px rgba(145, 139, 126, 0.24);
--dsh-control-border-width: 1px;
--dsh-button-hover-shadow: 0 2px 7px rgba(31, 30, 27, 0.08);
--dsh-card-shadow: 0 1px 3px rgba(31, 30, 27, 0.05), 0 0 0 1px rgba(145, 139, 126, 0.13);
--dsh-card-hover-shadow: 0 8px 22px rgba(31, 30, 27, 0.08), 0 0 0 1px rgba(145, 139, 126, 0.20);
--dsh-surface-spotlight: rgba(201, 100, 66, 0.08);
--dsh-font-display: "Palatino Linotype", Georgia, "Noto Serif SC SemiBold", "Noto Serif SC", "STZhongsong", "华文中宋", serif;
--dsh-font-body: Georgia, "Noto Serif SC", "STSong", "华文宋体", serif;
--dsh-font-mono: "Cascadia Code", "Cascadia Mono", Consolas, monospace;
--dsh-display-weight: 700;
--dsh-display-tracking: -0.01em;
--dsh-body-tracking: normal;
--dsw-font-family: var(--dsh-font-body);
--dsw-font-markdown-base: var(--dsh-font-body);
}
[data-dsh-style="claude"] {
background-color: var(--dsw-alias-bg-base);
background-image:
radial-gradient(rgba(31, 30, 27, 0.024) 0.75px, transparent 0),
linear-gradient(180deg, rgba(255, 253, 247, 0.45), rgba(236, 233, 223, 0.25));
background-size: 16px 16px, 100% 100%;
}
[data-dsh-style="claude"] :where([data-dsh-card], .dsh-card) {
background: var(--dsw-alias-settings-card-fill);
border-color: transparent;
box-shadow: var(--dsh-card-shadow);
}
[data-dsh-style="claude"] :where(
header h1,
[data-dsh-editorial-heading],
[data-dsh-serif],
[data-dsh-card] :is(h2, h3, .dsh-card-title),
.dsh-card :is(h2, h3, .dsh-card-title),
[data-dsh-reader] :is(h1, h2),
.dsh-reader :is(h1, h2)
),
:where([role="dialog"], dialog):where([data-dsh-style="claude"], :has([data-dsh-style="claude"])) header h2 {
font-family: var(--dsh-font-display);
font-weight: var(--dsh-display-weight, 700);
letter-spacing: var(--dsh-display-tracking, -0.01em);
}
[data-dsh-style="pixel8bit"],
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style="pixel8bit"], :has([data-dsh-style="pixel8bit"])) {
color-scheme: light;
accent-color: #2e7d5b;
--dsw-alias-bg-base: #f4f6e8;
--dsw-alias-bg-layer-1: #e7eed2;
--dsw-alias-bg-layer-2: #dbe5c0;
--dsw-alias-bg-layer-3: #cedaad;
--dsw-alias-bg-overlay: #f9fbf0;
--dsw-alias-bg-module-platform: #e2ebc9;
--dsw-alias-settings-card-fill: #edf2dc;
--dsw-alias-settings-card-stroke: #1e2826;
--dsw-specific-menu: #f9fbf0;
--dsw-alias-border-l1: #7e9478;
--dsw-alias-border-l2: #1e2826;
--dsw-alias-border-l3: #1e2826;
--dsw-alias-border-l4: #1e2826;
--dsw-alias-label-primary: #1e2826;
--dsw-alias-label-secondary: #3d514c;
--dsw-alias-label-tertiary: #58706a;
--dsw-alias-label-dimmed: #6e857f;
--dsw-alias-brand-primary: #2e7d5b;
--dsw-alias-brand-text: #1e2826;
--dsw-alias-state-business-primary: #2e7d5b;
--dsw-alias-state-business-tertiary: rgba(46, 125, 91, 0.18);
--dsw-alias-link: #226448;
--dsw-alias-button-primary-fill: #2e7d5b;
--dsw-alias-button-primary-hover: #24674a;
--dsw-alias-button-primary-ink: #f4f6e8;
--dsw-alias-interactive-bg-hover: #dfe9c4;
--dsw-alias-interactive-bg-active: #cfe0ad;
--dsw-alias-interactive-bg-hover-accent: rgba(46, 125, 91, 0.16);
--dsw-alias-interactive-bg-hover-danger: rgba(217, 91, 67, 0.18);
--dsw-alias-state-error-primary: #d95b43;
--dsw-alias-state-warn-primary: #c47614;
--dsw-alias-state-warn-label: #7a4808;
--dsw-alias-state-warn-tertiary: #f6e7b4;
--dsw-alias-state-success-primary: #2e7d5b;
--dsh-pixel-accent-secondary: #d95b43;
--dsw-radius-xs: 0px;
--dsw-radius-sm: 0px;
--dsw-radius-md: 0px;
--dsw-radius-lg: 0px;
--dsw-radius-xl: 0px;
--dsw-corner-shape: square;
--dsw-elevation-panel: 2px 2px 0px #1e2826;
--dsw-elevation-prominent: 4px 4px 0px #1e2826;
--dsh-control-border-width: 2px;
--dsh-button-shadow: 2px 2px 0px #1e2826;
--dsh-button-hover-shadow: 3px 3px 0px #1e2826;
--dsh-card-shadow: 2px 2px 0px #1e2826;
--dsh-card-hover-shadow: 4px 4px 0px #1e2826;
--dsh-surface-spotlight: rgba(46, 125, 91, 0.12);
--dsh-font-display: "Cascadia Code SemiBold", "Cascadia Code", "YouYuan", "幼圆", "Noto Sans SC", monospace;
--dsh-font-body: "Cascadia Code", "Cascadia Mono", "YouYuan", "幼圆", "Noto Sans SC", monospace;
--dsh-font-mono: "Cascadia Mono", "Cascadia Code", "YouYuan", "幼圆", Consolas, monospace;
--dsh-display-weight: 700;
--dsh-display-tracking: 0.03em;
--dsh-body-tracking: 0.03em;
--dsw-font-family: var(--dsh-font-body);
--dsw-font-markdown-base: var(--dsh-font-body);
}
[data-dsh-style="pixel8bit"] :where(.dsh-header, [data-dsh-header], .dsh-wb-header) {
background-color: var(--dsw-alias-bg-layer-1);
background-image: radial-gradient(rgba(30, 40, 38, 0.14) 1px, transparent 0);
background-size: 6px 6px;
border-block-end: 2px solid #1e2826;
}
[data-dsh-style="pixel8bit"] :where(button, input, select, textarea, [role="button"], [role="tab"], [role="menuitem"], [role="menuitemradio"], [data-dsh-card], .dsh-card, [data-dsh-panel], .dsh-panel),
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style="pixel8bit"], :has([data-dsh-style="pixel8bit"])),
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style="pixel8bit"], :has([data-dsh-style="pixel8bit"])) :where(button, input, select, textarea, [role="menuitem"], [role="menuitemradio"]) {
border-radius: 0px !important;
corner-shape: square;
}
[data-dsh-style="pixel8bit"] :where(button:not([role="tab"]), .dsh-btn),
:where([role="dialog"], [role="alertdialog"], dialog):where([data-dsh-style="pixel8bit"], :has([data-dsh-style="pixel8bit"])) :where(button:not([role="tab"]), .dsh-btn) {
border: 2px solid #1e2826;
box-shadow: 2px 2px 0px #1e2826;
}
[data-dsh-style="pixel8bit"] :where([data-dsh-card], .dsh-card, [data-dsh-panel], .dsh-panel) {
border: 2px solid #1e2826;
box-shadow: 2px 2px 0px #1e2826;
}
[data-dsh-style="pixel8bit"] :where(input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), select, textarea),
:where([role="dialog"], [role="alertdialog"], dialog):where([data-dsh-style="pixel8bit"], :has([data-dsh-style="pixel8bit"])) :where(input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), select, textarea) {
border-width: 2px;
border-color: #1e2826;
}
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style="pixel8bit"], :has([data-dsh-style="pixel8bit"])) {
border: 2px solid #1e2826 !important;
box-shadow: 4px 4px 0px #1e2826 !important;
backdrop-filter: none;
}
[data-dsh-style="pixel8bit"] [role="tab"][aria-selected="true"]::after,
[data-dsh-style="pixel8bit"] .dsh-tab-indicator {
border-block-end-color: #d95b43;
border-block-end-width: 3px;
}
.dsh-pixel-cursor {
display: none;
flex: none;
font-size: 10px;
line-height: 1;
color: var(--dsh-pixel-accent-secondary, #d95b43);
}
@keyframes dsh-pixel-cursor-nudge {
0%, 100% { translate: 0px 0px; }
50% { translate: 2px 0px; }
}
[data-dsh-style="pixel8bit"] :where([data-dsh-row], .dsh-row):where([data-active="true"], [data-selected="true"], [aria-selected="true"]) {
background-color: var(--dsw-alias-interactive-bg-active);
box-shadow: inset 3px 0 0 #d95b43;
}
[data-dsh-style="pixel8bit"] :where([data-dsh-row], .dsh-row):where([data-active="true"], [data-selected="true"], [aria-selected="true"]):not(:has(.dsh-pixel-cursor))::before {
content: "▶";
display: inline-block;
flex: none;
margin-inline-end: 6px;
font-size: 10px;
line-height: 1;
color: #d95b43;
}
[data-dsh-style="pixel8bit"] :where([data-active="true"], [data-selected="true"], [aria-selected="true"]) .dsh-pixel-cursor {
display: inline-flex;
align-items: center;
}
@media (prefers-reduced-motion: no-preference) {
[data-dsh-style="pixel8bit"] :where([data-dsh-row], .dsh-row):where([data-active="true"], [data-selected="true"], [aria-selected="true"]):not(:has(.dsh-pixel-cursor))::before,
[data-dsh-style="pixel8bit"] :where([data-active="true"], [data-selected="true"], [aria-selected="true"]) .dsh-pixel-cursor {
animation: dsh-pixel-cursor-nudge 760ms steps(2, end) infinite;
}
}
[data-dsh-style="mint"],
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style="mint"], :has([data-dsh-style="mint"])) {
color-scheme: light;
accent-color: #0f766e;
--dsw-alias-bg-base: #f5fafb;
--dsw-alias-bg-layer-1: #eaf3f6;
--dsw-alias-bg-layer-2: #dcebf0;
--dsw-alias-bg-layer-3: #cce1e8;
--dsw-alias-bg-overlay: #fafdff;
--dsw-alias-bg-module-platform: #e3eff3;
--dsw-alias-settings-card-fill: #eef6f8;
--dsw-alias-settings-card-stroke: #c7dde5;
--dsw-specific-menu: rgba(250, 253, 255, 0.97);
--dsw-alias-border-l1: #d5e6ec;
--dsw-alias-border-l2: #bdd5de;
--dsw-alias-border-l3: #9ec0cd;
--dsw-alias-border-l4: #7faab9;
--dsw-alias-label-primary: #132a2e;
--dsw-alias-label-secondary: #426067;
--dsw-alias-label-tertiary: #628088;
--dsw-alias-label-dimmed: #7c98a0;
--dsw-alias-brand-primary: #0f766e;
--dsw-alias-brand-text: #132a2e;
--dsw-alias-state-business-primary: #0f766e;
--dsw-alias-state-business-tertiary: rgba(15, 118, 110, 0.13);
--dsw-alias-link: #0284c7;
--dsw-alias-button-primary-fill: #0f766e;
--dsw-alias-button-primary-hover: #0d635c;
--dsw-alias-button-primary-ink: #f5fafb;
--dsw-alias-interactive-bg-hover: rgba(15, 118, 110, 0.07);
--dsw-alias-interactive-bg-active: rgba(15, 118, 110, 0.13);
--dsw-alias-interactive-bg-hover-accent: rgba(2, 132, 199, 0.11);
--dsw-alias-interactive-bg-hover-danger: rgba(200, 50, 64, 0.11);
--dsw-alias-state-error-primary: #c83240;
--dsw-alias-state-warn-primary: #b4690e;
--dsw-alias-state-warn-label: #864c07;
--dsw-alias-state-warn-tertiary: #fdf1d6;
--dsw-alias-state-success-primary: #0f766e;
--dsh-mint-sky-accent: #0284c7;
--dsw-radius-xs: 6px;
--dsw-radius-sm: 9px;
--dsw-radius-md: 12px;
--dsw-radius-lg: 16px;
--dsw-radius-xl: 20px;
--dsw-elevation-panel: 0 3px 12px rgba(15, 76, 92, 0.07), 0 0 0 1px rgba(127, 170, 185, 0.28);
--dsw-elevation-prominent: 0 14px 34px rgba(15, 76, 92, 0.13), 0 2px 6px rgba(15, 76, 92, 0.05), 0 0 0 1px rgba(127, 170, 185, 0.34);
--dsh-control-border-width: 1px;
--dsh-button-hover-shadow: 0 2px 7px rgba(15, 118, 110, 0.11);
--dsh-card-hover-shadow: 0 8px 22px rgba(2, 132, 199, 0.10);
--dsh-surface-spotlight: rgba(2, 132, 199, 0.08);
--dsh-font-display: "Cascadia Code SemiBold", "Cascadia Code", "YouYuan", "幼圆", "Noto Sans SC", monospace;
--dsh-font-body: "Cascadia Code", "Cascadia Mono", "YouYuan", "幼圆", "Noto Sans SC", monospace;
--dsh-font-mono: "Cascadia Mono", "Cascadia Code", "YouYuan", "幼圆", Consolas, monospace;
--dsh-display-weight: 700;
--dsh-display-tracking: 0.015em;
--dsh-body-tracking: normal;
--dsw-font-family: var(--dsh-font-body);
--dsw-font-markdown-base: var(--dsh-font-body);
}
[data-dsh-style="glass"],
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style="glass"], :has([data-dsh-style="glass"])) {
color-scheme: light;
accent-color: #4f6df5;
--dsw-alias-bg-base: #f3f7ff;
--dsw-alias-bg-layer-1: rgba(255, 255, 255, 0.70);
--dsw-alias-bg-layer-2: rgba(240, 245, 255, 0.78);
--dsw-alias-bg-layer-3: rgba(226, 236, 255, 0.84);
--dsw-alias-bg-overlay: rgba(255, 255, 255, 0.84);
--dsw-alias-bg-module-platform: rgba(244, 248, 255, 0.76);
--dsw-alias-settings-card-fill: rgba(255, 255, 255, 0.70);
--dsw-alias-settings-card-stroke: rgba(255, 255, 255, 0.82);
--dsw-specific-menu: rgba(255, 255, 255, 0.86);
--dsw-alias-border-l1: rgba(148, 173, 219, 0.24);
--dsw-alias-border-l2: rgba(132, 159, 212, 0.34);
--dsw-alias-border-l3: rgba(114, 144, 204, 0.46);
--dsw-alias-border-l4: rgba(96, 128, 196, 0.56);
--dsw-alias-label-primary: #172033;
--dsw-alias-label-secondary: #4b5973;
--dsw-alias-label-tertiary: #6b7994;
--dsw-alias-label-dimmed: #8895ae;
--dsw-alias-brand-primary: #4f6df5;
--dsw-alias-brand-text: #172033;
--dsw-alias-state-business-primary: #4f6df5;
--dsw-alias-state-business-tertiary: rgba(79, 109, 245, 0.14);
--dsw-alias-link: #3b59e2;
--dsw-alias-button-primary-fill: #4f6df5;
--dsw-alias-button-primary-hover: #3f5de3;
--dsw-alias-button-primary-ink: #ffffff;
--dsw-alias-interactive-bg-hover: rgba(79, 109, 245, 0.08);
--dsw-alias-interactive-bg-active: rgba(79, 109, 245, 0.14);
--dsw-alias-interactive-bg-hover-accent: rgba(14, 165, 233, 0.12);
--dsw-alias-interactive-bg-hover-danger: rgba(220, 56, 82, 0.12);
--dsw-alias-state-error-primary: #d13850;
--dsw-alias-state-warn-primary: #c06a12;
--dsw-alias-state-warn-label: #8a4a09;
--dsw-alias-state-warn-tertiary: rgba(251, 191, 36, 0.18);
--dsw-alias-state-success-primary: #15805d;
--dsw-radius-xs: 8px;
--dsw-radius-sm: 11px;
--dsw-radius-md: 15px;
--dsw-radius-lg: 18px;
--dsw-radius-xl: 22px;
--dsw-elevation-panel: inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 4px 18px rgba(59, 92, 168, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.72);
--dsw-elevation-prominent: inset 0 1px 0 rgba(255, 255, 255, 0.95), 0 16px 40px rgba(59, 92, 168, 0.16), 0 0 0 1px rgba(255, 255, 255, 0.80);
--dsh-control-border-width: 1px;
--dsh-button-hover-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.92), 0 3px 10px rgba(79, 109, 245, 0.12);
--dsh-card-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 4px 16px rgba(59, 92, 168, 0.07);
--dsh-card-hover-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.96), 0 10px 26px rgba(59, 92, 168, 0.12);
--dsh-surface-spotlight: rgba(79, 109, 245, 0.08);
--dsh-font-display: "Cascadia Code SemiBold", "Cascadia Code", "YouYuan", "幼圆", "Noto Sans SC", monospace;
--dsh-font-body: "Cascadia Code", "Cascadia Mono", "YouYuan", "幼圆", "Noto Sans SC", monospace;
--dsh-font-mono: "Cascadia Mono", "Cascadia Code", "YouYuan", "幼圆", Consolas, monospace;
--dsh-display-weight: 700;
--dsh-display-tracking: 0.015em;
--dsh-body-tracking: normal;
--dsw-font-family: var(--dsh-font-body);
--dsw-font-markdown-base: var(--dsh-font-body);
}
[data-dsh-style="glass"] {
background-color: #f3f7ff;
background-image:
radial-gradient(64% 58% at 12% 8%, rgba(125, 211, 252, 0.30) 0%, transparent 65%),
radial-gradient(58% 52% at 88% 14%, rgba(196, 181, 253, 0.28) 0%, transparent 65%),
radial-gradient(60% 55% at 52% 96%, rgba(153, 246, 228, 0.24) 0%, transparent 68%);
}
[data-dsh-style="glass"] :where([data-dsh-card], .dsh-card, [data-dsh-panel], .dsh-panel, .dsh-header, [data-dsh-header]),
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style="glass"], :has([data-dsh-style="glass"])) {
background: rgba(255, 255, 255, 0.70);
-webkit-backdrop-filter: blur(14px) saturate(140%);
backdrop-filter: blur(14px) saturate(140%);
box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 4px 16px rgba(59, 92, 168, 0.07);
}
@supports not (backdrop-filter: blur(1px)) {
[data-dsh-style="glass"] :where([data-dsh-card], .dsh-card, [data-dsh-panel], .dsh-panel, .dsh-header, [data-dsh-header]),
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style="glass"], :has([data-dsh-style="glass"])) {
background: rgba(255, 255, 255, 0.92);
}
}
[data-dsh-style="eink"],
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style="eink"], :has([data-dsh-style="eink"])) {
color-scheme: light;
accent-color: #171716;
--dsw-alias-bg-base: #f2f1ec;
--dsw-alias-bg-layer-1: #eae8e1;
--dsw-alias-bg-layer-2: #e1dfd6;
--dsw-alias-bg-layer-3: #d6d3c9;
--dsw-alias-bg-overlay: #f7f6f2;
--dsw-alias-bg-module-platform: #eae8e1;
--dsw-alias-settings-card-fill: #f7f6f2;
--dsw-alias-settings-card-stroke: #9e9c93;
--dsw-specific-menu: #f7f6f2;
--dsw-alias-border-l1: #c5c2b8;
--dsw-alias-border-l2: #9e9c93;
--dsw-alias-border-l3: #78766e;
--dsw-alias-border-l4: #54534d;
--dsw-alias-label-primary: #171716;
--dsw-alias-label-secondary: #484742;
--dsw-alias-label-tertiary: #66645d;
--dsw-alias-label-dimmed: #807e76;
--dsw-alias-brand-primary: #171716;
--dsw-alias-brand-text: #171716;
--dsw-alias-state-business-primary: #171716;
--dsw-alias-state-business-tertiary: rgba(23, 23, 22, 0.10);
--dsw-alias-link: #171716;
--dsw-alias-button-primary-fill: #171716;
--dsw-alias-button-primary-hover: #2f2f2c;
--dsw-alias-button-primary-ink: #f7f6f2;
--dsw-alias-interactive-bg-hover: rgba(23, 23, 22, 0.06);
--dsw-alias-interactive-bg-active: rgba(23, 23, 22, 0.12);
--dsw-alias-interactive-bg-hover-accent: rgba(23, 23, 22, 0.08);
--dsw-alias-interactive-bg-hover-danger: rgba(23, 23, 22, 0.10);
--dsw-alias-state-error-primary: #2d2c28;
--dsw-alias-state-warn-primary: #45443e;
--dsw-alias-state-warn-label: #171716;
--dsw-alias-state-warn-tertiary: #e6e4db;
--dsw-alias-state-success-primary: #242422;
--dsw-radius-xs: 2px;
--dsw-radius-sm: 3px;
--dsw-radius-md: 4px;
--dsw-radius-lg: 4px;
--dsw-radius-xl: 4px;
--dsw-elevation-panel: 0 0 0 1px #9e9c93;
--dsw-elevation-prominent: 0 2px 0 #9e9c93, 0 0 0 1px #78766e;
--dsh-control-border-width: 1px;
--dsh-motion-fast: 60ms;
--dsh-motion-base: 60ms;
--dsh-motion-dialog: 60ms;
--dsh-button-shadow: none;
--dsh-button-hover-shadow: none;
--dsh-card-shadow: none;
--dsh-card-hover-shadow: none;
--dsh-surface-spotlight: rgba(23, 23, 22, 0.06);
--dsh-font-display: "Palatino Linotype", Georgia, "Noto Serif SC SemiBold", "Noto Serif SC", "STZhongsong", "华文中宋", serif;
--dsh-font-body: Georgia, "Noto Serif SC", "STSong", "华文宋体", serif;
--dsh-font-mono: "Cascadia Code", "Cascadia Mono", Consolas, monospace;
--dsh-display-weight: 700;
--dsh-display-tracking: normal;
--dsh-body-tracking: normal;
--dsw-font-family: var(--dsh-font-body);
--dsw-font-markdown-base: var(--dsh-font-body);
}
[data-dsh-style="eink"] :where([data-dsh-card], .dsh-card, [data-dsh-panel], .dsh-panel) {
border: 1px solid #9e9c93;
box-shadow: none;
}
[data-dsh-style="eink"] :where([data-dsh-row], .dsh-row) {
border-block-end: 1px solid #c5c2b8;
}
[data-dsh-style="eink"] :where(button, [role="button"], [data-dsh-card], .dsh-card, [data-dsh-row], .dsh-row) {
translate: none !important;
scale: none !important;
transition-duration: 60ms;
}
[data-dsh-style="blueprint"],
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style="blueprint"], :has([data-dsh-style="blueprint"])) {
color-scheme: light;
accent-color: #e05a2b;
--dsw-alias-bg-base: #eaf3fb;
--dsw-alias-bg-layer-1: #f4f9fe;
--dsw-alias-bg-layer-2: #dfeef9;
--dsw-alias-bg-layer-3: #cfe3f4;
--dsw-alias-bg-overlay: #f7fbff;
--dsw-alias-bg-module-platform: #e3f0fa;
--dsw-alias-settings-card-fill: rgba(244, 249, 254, 0.92);
--dsw-alias-settings-card-stroke: #1b5e8a;
--dsw-specific-menu: rgba(247, 251, 255, 0.98);
--dsw-alias-border-l1: rgba(27, 94, 138, 0.28);
--dsw-alias-border-l2: #1b5e8a;
--dsw-alias-border-l3: #0d3b66;
--dsw-alias-border-l4: #092b4c;
--dsw-alias-label-primary: #0d3b66;
--dsw-alias-label-secondary: #1d4e78;
--dsw-alias-label-tertiary: #3b6f99;
--dsw-alias-label-dimmed: #5b89ad;
--dsw-alias-brand-primary: #e05a2b;
--dsw-alias-brand-text: #0d3b66;
--dsw-alias-state-business-primary: #e05a2b;
--dsw-alias-state-business-tertiary: rgba(224, 90, 43, 0.14);
--dsw-alias-link: #0d3b66;
--dsw-alias-button-primary-fill: #e05a2b;
--dsw-alias-button-primary-hover: #c94b20;
--dsw-alias-button-primary-ink: #ffffff;
--dsw-alias-interactive-bg-hover: rgba(27, 94, 138, 0.08);
--dsw-alias-interactive-bg-active: rgba(224, 90, 43, 0.13);
--dsw-alias-interactive-bg-hover-accent: rgba(224, 90, 43, 0.12);
--dsw-alias-interactive-bg-hover-danger: rgba(185, 45, 38, 0.12);
--dsw-alias-state-error-primary: #b92d26;
--dsw-alias-state-warn-primary: #c05614;
--dsw-alias-state-warn-label: #7c3408;
--dsw-alias-state-warn-tertiary: #fce9d8;
--dsw-alias-state-success-primary: #156d5b;
--dsw-radius-xs: 2px;
--dsw-radius-sm: 2px;
--dsw-radius-md: 3px;
--dsw-radius-lg: 4px;
--dsw-radius-xl: 4px;
--dsw-elevation-panel: 0 0 0 1px #1b5e8a;
--dsw-elevation-prominent: 0 8px 24px rgba(13, 59, 102, 0.14), 0 0 0 1px #1b5e8a;
--dsh-control-border-width: 1px;
--dsh-button-shadow: none;
--dsh-button-hover-shadow: 0 2px 0 #1b5e8a;
--dsh-card-shadow: 0 0 0 1px #1b5e8a;
--dsh-card-hover-shadow: 0 3px 0 #1b5e8a;
--dsh-surface-spotlight: rgba(27, 94, 138, 0.09);
--dsh-font-display: "Cascadia Mono SemiBold", "Cascadia Mono", "STZhongsong", "华文中宋", "FangSong", "仿宋", monospace;
--dsh-font-body: "Cascadia Mono", "STFangsong", "华文仿宋", "FangSong", "仿宋", monospace;
--dsh-font-mono: "Cascadia Mono", "STFangsong", "华文仿宋", "FangSong", "仿宋", monospace;
--dsh-display-weight: 700;
--dsh-display-tracking: 0.02em;
--dsh-body-tracking: 0.02em;
--dsw-font-family: var(--dsh-font-body);
--dsw-font-markdown-base: var(--dsh-font-body);
}
[data-dsh-style="blueprint"] {
background-color: #eaf3fb;
background-image:
linear-gradient(to right, rgba(18, 78, 120, 0.09) 1px, transparent 1px),
linear-gradient(to bottom, rgba(18, 78, 120, 0.09) 1px, transparent 1px),
linear-gradient(to right, rgba(18, 78, 120, 0.045) 1px, transparent 1px),
linear-gradient(to bottom, rgba(18, 78, 120, 0.045) 1px, transparent 1px);
background-size: 24px 24px, 24px 24px, 6px 6px, 6px 6px;
}
[data-dsh-style="blueprint"] :where(.dsh-header, [data-dsh-header], .dsh-wb-header) {
background: rgba(244, 249, 254, 0.90);
border-block-end: 1px solid #1b5e8a;
}
[data-dsh-style="blueprint"] :where([data-dsh-card], .dsh-card) {
position: relative;
border: 1px solid #1b5e8a;
background: rgba(244, 249, 254, 0.92);
}
[data-dsh-style="blueprint"] :where([data-dsh-card], .dsh-card):not([role="tab"])::after {
content: "+";
position: absolute;
inset-block-start: 4px;
inset-inline-end: 6px;
font-family: ui-monospace, "Cascadia Mono", Menlo, Consolas, monospace;
font-size: 11px;
line-height: 1;
color: #e05a2b;
opacity: 0.78;
pointer-events: none;
}
[data-dsh-style="blueprint"] :where(button:not([role="tab"]), .dsh-btn) {
border: 1px solid #1b5e8a;
}
[data-dsh-style="risograph"],
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style="risograph"], :has([data-dsh-style="risograph"])) {
color-scheme: light;
accent-color: #ff3e7f;
--dsw-alias-bg-base: #faf6ee;
--dsw-alias-bg-layer-1: #f5efe2;
--dsw-alias-bg-layer-2: #ede4d1;
--dsw-alias-bg-layer-3: #e3d7be;
--dsw-alias-bg-overlay: #fffdf7;
--dsw-alias-bg-module-platform: #f5efe2;
--dsw-alias-settings-card-fill: #fffdf7;
--dsw-alias-settings-card-stroke: #18181b;
--dsw-specific-menu: #fffdf7;
--dsw-alias-border-l1: #d4cbb8;
--dsw-alias-border-l2: #18181b;
--dsw-alias-border-l3: #18181b;
--dsw-alias-border-l4: #18181b;
--dsw-alias-label-primary: #18181b;
--dsw-alias-label-secondary: #3f3f46;
--dsw-alias-label-tertiary: #52525b;
--dsw-alias-label-dimmed: #71717a;
--dsw-alias-brand-primary: #ff3e7f;
--dsw-alias-brand-text: #18181b;
--dsw-alias-state-business-primary: #ff3e7f;
--dsw-alias-state-business-tertiary: rgba(255, 62, 127, 0.14);
--dsw-alias-link: #2563eb;
--dsw-alias-button-primary-fill: #ff3e7f;
--dsw-alias-button-primary-hover: #e62e6d;
--dsw-alias-button-primary-ink: #ffffff;
--dsw-alias-interactive-bg-hover: rgba(253, 224, 71, 0.38);
--dsw-alias-interactive-bg-active: #fde047;
--dsw-alias-interactive-bg-hover-accent: rgba(37, 99, 235, 0.14);
--dsw-alias-interactive-bg-hover-danger: rgba(255, 62, 127, 0.18);
--dsw-alias-state-error-primary: #dc2626;
--dsw-alias-state-warn-primary: #ca8a04;
--dsw-alias-state-warn-label: #713f12;
--dsw-alias-state-warn-tertiary: #fef08a;
--dsw-alias-state-success-primary: #15803d;
--dsw-radius-xs: 3px;
--dsw-radius-sm: 4px;
--dsw-radius-md: 6px;
--dsw-radius-lg: 8px;
--dsw-radius-xl: 10px;
--dsw-elevation-panel: 4px 4px 0px #2563eb;
--dsw-elevation-prominent: 4px 4px 0px #ff3e7f;
--dsh-control-border-width: 2px;
--dsh-button-shadow: 3px 3px 0px #18181b;
--dsh-button-hover-shadow: 4px 4px 0px #2563eb;
--dsh-card-shadow: 4px 4px 0px #2563eb;
--dsh-card-hover-shadow: 5px 5px 0px #ff3e7f;
--dsh-surface-spotlight: rgba(253, 224, 71, 0.35);
--dsh-font-display: Impact, "Arial Black", "Noto Sans SC Black", "SimHei", "黑体", sans-serif;
--dsh-font-body: "Source Sans 3", "Noto Sans SC Medium", "Noto Sans SC", sans-serif;
--dsh-font-mono: "Cascadia Code", "Cascadia Mono", Consolas, monospace;
--dsh-display-weight: 900;
--dsh-display-tracking: -0.02em;
--dsh-body-tracking: normal;
--dsw-font-family: var(--dsh-font-body);
--dsw-font-markdown-base: var(--dsh-font-body);
}
[data-dsh-style="risograph"] :where(.dsh-header, [data-dsh-header], .dsh-wb-header) {
background-color: #fffdf7;
background-image: radial-gradient(rgba(255, 62, 127, 0.15) 1px, transparent 0);
background-size: 7px 7px;
border-block-end: 2px solid #18181b;
}
[data-dsh-style="risograph"] :where(button:not([role="tab"]), .dsh-btn),
:where([role="dialog"], [role="alertdialog"], dialog):where([data-dsh-style="risograph"], :has([data-dsh-style="risograph"])) :where(button:not([role="tab"]), .dsh-btn) {
border: 2px solid #18181b;
box-shadow: 3px 3px 0px #18181b;
}
[data-dsh-style="risograph"] :where([data-dsh-card], .dsh-card, [data-dsh-panel], .dsh-panel) {
border: 2px solid #18181b;
box-shadow: 4px 4px 0px #2563eb;
}
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style="risograph"], :has([data-dsh-style="risograph"])) {
border: 2px solid #18181b !important;
box-shadow: 4px 4px 0px #ff3e7f !important;
}
[data-dsh-style="risograph"] [role="tab"][aria-selected="true"] {
background: #fde047;
color: #18181b;
font-weight: 700;
}
[data-dsh-style="risograph"] [role="tab"][aria-selected="true"]::after,
[data-dsh-style="risograph"] .dsh-tab-indicator {
border-block-end-color: #ff3e7f;
border-block-end-width: 3px;
}
[data-dsh-style="win98"],
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style="win98"], :has([data-dsh-style="win98"])) {
color-scheme: light;
accent-color: #1b4f9c;
--dsw-alias-bg-base: #dcdcdc;
--dsw-alias-bg-layer-1: #e4e4e4;
--dsw-alias-bg-layer-2: #d0d0d0;
--dsw-alias-bg-layer-3: #c0c0c0;
--dsw-alias-bg-overlay: #e4e4e4;
--dsw-alias-bg-module-platform: #d4d4d4;
--dsw-alias-settings-card-fill: #ffffff;
--dsw-alias-settings-card-stroke: #808080;
--dsw-specific-menu: #dcdcdc;
--dsw-alias-border-l1: #b8b8b8;
--dsw-alias-border-l2: #808080;
--dsw-alias-border-l3: #5a5a5a;
--dsw-alias-border-l4: #222222;
--dsw-alias-label-primary: #111111;
--dsw-alias-label-secondary: #333333;
--dsw-alias-label-tertiary: #555555;
--dsw-alias-label-dimmed: #767676;
--dsw-alias-brand-primary: #1b4f9c;
--dsw-alias-brand-text: #111111;
--dsw-alias-state-business-primary: #1b4f9c;
--dsw-alias-state-business-tertiary: rgba(27, 79, 156, 0.14);
--dsw-alias-link: #0b3c88;
--dsw-alias-button-primary-fill: #1b4f9c;
--dsw-alias-button-primary-hover: #245cb0;
--dsw-alias-button-primary-ink: #ffffff;
--dsw-alias-interactive-bg-hover: rgba(27, 79, 156, 0.09);
--dsw-alias-interactive-bg-active: rgba(27, 79, 156, 0.16);
--dsw-alias-interactive-bg-hover-accent: rgba(59, 130, 196, 0.15);
--dsw-alias-interactive-bg-hover-danger: rgba(185, 28, 28, 0.13);
--dsw-alias-state-error-primary: #b91c1c;
--dsw-alias-state-warn-primary: #9a5b08;
--dsw-alias-state-warn-label: #6e3f04;
--dsw-alias-state-warn-tertiary: #fef3c7;
--dsw-alias-state-success-primary: #166534;
--dsw-radius-xs: 0px;
--dsw-radius-sm: 0px;
--dsw-radius-md: 0px;
--dsw-radius-lg: 0px;
--dsw-radius-xl: 0px;
--dsw-corner-shape: square;
--dsw-elevation-panel: inset 1.5px 1.5px 0 #ffffff, inset -1.5px -1.5px 0 #5a5a5a, inset 2.5px 2.5px 0 #f4f4f4, inset -2.5px -2.5px 0 #9a9a9a;
--dsw-elevation-prominent: inset 1.5px 1.5px 0 #ffffff, inset -1.5px -1.5px 0 #5a5a5a, inset 2.5px 2.5px 0 #f4f4f4, inset -2.5px -2.5px 0 #9a9a9a, 4px 4px 12px rgba(0, 0, 0, 0.18);
--dsh-control-border-width: 1px;
--dsh-button-shadow: inset 1.5px 1.5px 0 #ffffff, inset -1.5px -1.5px 0 #5a5a5a, inset 2.5px 2.5px 0 #f4f4f4, inset -2.5px -2.5px 0 #9a9a9a;
--dsh-button-hover-shadow: inset 1.5px 1.5px 0 #ffffff, inset -1.5px -1.5px 0 #5a5a5a, inset 2.5px 2.5px 0 #f4f4f4, inset -2.5px -2.5px 0 #9a9a9a;
--dsh-card-shadow: inset 1.5px 1.5px 0 #808080, inset -1.5px -1.5px 0 #ffffff, inset 2.5px 2.5px 0 #5a5a5a, inset -2.5px -2.5px 0 #dcdcdc;
--dsh-card-hover-shadow: inset 1.5px 1.5px 0 #808080, inset -1.5px -1.5px 0 #ffffff, inset 2.5px 2.5px 0 #5a5a5a, inset -2.5px -2.5px 0 #dcdcdc;
--dsh-surface-spotlight: rgba(27, 79, 156, 0.10);
--dsh-font-display: Tahoma, "SimSun", "NSimSun", "宋体", "新宋体", sans-serif;
--dsh-font-body: Tahoma, "SimSun", "NSimSun", "宋体", "新宋体", sans-serif;
--dsh-font-mono: "Fixedsys", Consolas, "Courier New", "SimSun", "宋体", monospace;
--dsh-display-weight: 700;
--dsh-display-tracking: normal;
--dsh-body-tracking: normal;
--dsw-font-family: var(--dsh-font-body);
--dsw-font-markdown-base: var(--dsh-font-body);
}
[data-dsh-style="win98"] :where(button, input, select, textarea, [role="button"], [role="tab"], [role="menuitem"], [role="menuitemradio"], [data-dsh-card], .dsh-card, [data-dsh-panel], .dsh-panel),
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style="win98"], :has([data-dsh-style="win98"])),
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style="win98"], :has([data-dsh-style="win98"])) :where(button, input, select, textarea, [role="menuitem"], [role="menuitemradio"]) {
border-radius: 0px !important;
corner-shape: square;
}
[data-dsh-style="win98"] :where(button:not([role="tab"]), .dsh-btn),
:where([role="dialog"], [role="alertdialog"], dialog):where([data-dsh-style="win98"], :has([data-dsh-style="win98"])) :where(button:not([role="tab"]), .dsh-btn) {
border: 0;
background-color: #dcdcdc;
box-shadow: inset 1.5px 1.5px 0 #ffffff, inset -1.5px -1.5px 0 #5a5a5a, inset 2.5px 2.5px 0 #f4f4f4, inset -2.5px -2.5px 0 #9a9a9a;
}
[data-dsh-style="win98"] :where(.dsh-wb-btn-primary, .dsh-btn-primary) {
background-color: #1b4f9c;
color: #ffffff;
box-shadow: inset 1.5px 1.5px 0 #6ca0e8, inset -1.5px -1.5px 0 #0d2b57, inset 2.5px 2.5px 0 #4a82d1, inset -2.5px -2.5px 0 #143c78;
}
[data-dsh-style="win98"] :where(button, [role="button"]):is(:active, [aria-pressed="true"], [aria-expanded="true"]):not(:disabled):not([aria-disabled="true"]),
[data-dsh-style="win98"] [role="tab"][aria-selected="true"],
:where([role="dialog"], [role="alertdialog"], dialog):where([data-dsh-style="win98"], :has([data-dsh-style="win98"])) :where(button, [role="button"]):is(:active, [aria-pressed="true"]):not(:disabled):not([aria-disabled="true"]) {
translate: 0px 0px !important;
scale: 1 !important;
background-color: #e4e4e4;
box-shadow: inset 1.5px 1.5px 0 #5a5a5a, inset -1.5px -1.5px 0 #ffffff, inset 2.5px 2.5px 0 #9a9a9a, inset -2.5px -2.5px 0 #f4f4f4 !important;
}
[data-dsh-style="win98"] :where([data-dsh-card], .dsh-card, input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), select, textarea) {
border: 0;
background: #ffffff;
box-shadow: inset 1.5px 1.5px 0 #808080, inset -1.5px -1.5px 0 #ffffff, inset 2.5px 2.5px 0 #5a5a5a, inset -2.5px -2.5px 0 #dcdcdc;
}
[data-dsh-style="win98"] :where(.dsh-header, [data-dsh-header], .pageHeader, .dsh-wb-header, .topbar) {
background: linear-gradient(180deg, #ececec 0%, #dcdcdc 100%) !important;
color: #111111;
border-block-start: 3px solid #1b4f9c !important;
border-block-end: 2px solid #808080;
box-shadow: inset 0 1px 0 #ffffff, inset 0 -1px 0 #808080;
}
[data-dsh-style="win98"] .dsh-header-badge {
background: linear-gradient(90deg, #1b4f9c 0%, #3b82c4 100%);
color: #ffffff;
}
:where([role="dialog"], [role="alertdialog"], dialog):where([data-dsh-style="win98"], :has([data-dsh-style="win98"])) header {
background: linear-gradient(90deg, #1b4f9c 0%, #3b82c4 100%);
color: #ffffff;
}
:where([role="dialog"], [role="alertdialog"], dialog):where([data-dsh-style="win98"], :has([data-dsh-style="win98"])) header h2 {
color: #ffffff;
}
[data-dsh-style="songhui"],
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style="songhui"], :has([data-dsh-style="songhui"])) {
color-scheme: light;
accent-color: #b83b2a;
--dsw-alias-bg-base: #f7f3e8;
--dsw-alias-bg-layer-1: #f0ead9;
--dsw-alias-bg-layer-2: #e7dec8;
--dsw-alias-bg-layer-3: #dcd0b4;
--dsw-alias-bg-overlay: #fbf9f2;
--dsw-alias-bg-module-platform: #ede6d4;
--dsw-alias-settings-card-fill: #fbf9f2;
--dsw-alias-settings-card-stroke: #d4c4a2;
--dsw-specific-menu: #fbf9f2;
--dsw-alias-border-l1: #e4dac2;
--dsw-alias-border-l2: #cfbda0;
--dsw-alias-border-l3: #b8a382;
--dsw-alias-border-l4: #9d8765;
--dsw-alias-label-primary: #252019;
--dsw-alias-label-secondary: #5c5142;
--dsw-alias-label-tertiary: #7d705e;
--dsw-alias-label-dimmed: #998c79;
--dsw-alias-brand-primary: #b83b2a;
--dsw-alias-brand-text: #252019;
--dsw-alias-state-business-primary: #b83b2a;
--dsw-alias-state-business-tertiary: rgba(184, 59, 42, 0.12);
--dsw-alias-link: #9e2f20;
--dsw-alias-button-primary-fill: #b83b2a;
--dsw-alias-button-primary-hover: #9f3021;
--dsw-alias-button-primary-ink: #fbf9f2;
--dsw-alias-interactive-bg-hover: rgba(184, 59, 42, 0.065);
--dsw-alias-interactive-bg-active: rgba(184, 59, 42, 0.13);
--dsw-alias-interactive-bg-hover-accent: rgba(184, 59, 42, 0.11);
--dsw-alias-interactive-bg-hover-danger: rgba(184, 59, 42, 0.15);
--dsw-alias-state-error-primary: #a62b1c;
--dsw-alias-state-warn-primary: #9c6216;
--dsw-alias-state-warn-label: #704309;
--dsw-alias-state-warn-tertiary: #f7ecd1;
--dsw-alias-state-success-primary: #2e664b;
--dsw-radius-xs: 2px;
--dsw-radius-sm: 2px;
--dsw-radius-md: 3px;
--dsw-radius-lg: 4px;
--dsw-radius-xl: 4px;
--dsw-elevation-panel: 0 2px 10px rgba(66, 52, 32, 0.06), 0 0 0 1px #cfbda0;
--dsw-elevation-prominent: 0 12px 30px rgba(66, 52, 32, 0.14), 0 0 0 1px #b8a382;
--dsh-control-border-width: 1px;
--dsh-button-hover-shadow: 0 2px 6px rgba(184, 59, 42, 0.12);
--dsh-card-shadow: 0 1px 2px rgba(66, 52, 32, 0.05);
--dsh-card-hover-shadow: 0 6px 16px rgba(66, 52, 32, 0.09);
--dsh-surface-spotlight: rgba(184, 59, 42, 0.07);
--dsh-font-display: "STZhongsong", "华文中宋", "Noto Serif SC Black", "SimSun", "宋体", serif;
--dsh-font-body: "Palatino Linotype", "STKaiti", "华文楷体", "KaiTi", "楷体", "Noto Serif SC", serif;
--dsh-font-mono: "Cascadia Mono", Consolas, "STFangsong", "华文仿宋", monospace;
--dsh-display-weight: 700;
--dsh-display-tracking: 0.04em;
--dsh-body-tracking: normal;
--dsw-font-family: var(--dsh-font-body);
--dsw-font-markdown-base: var(--dsh-font-body);
}
[data-dsh-style="songhui"] {
background-color: #f7f3e8;
background-image:
radial-gradient(rgba(196, 152, 64, 0.18) 1px, transparent 0),
radial-gradient(rgba(196, 152, 64, 0.11) 0.75px, transparent 0);
background-size: 18px 18px, 29px 29px;
background-position: 0 0, 9px 7px;
}
[data-dsh-style="songhui"] :where(.pageHeader, .dsh-header, [data-dsh-header], .dsh-wb-header) {
background: rgba(251, 249, 242, 0.90);
border-block-end: 3px double #b83b2a;
}
[data-dsh-style="songhui"] :where(.dsh-wb-btn-primary, .dsh-btn-primary, .dsh-header-badge) {
background: #b83b2a;
color: #fbf9f2;
border-color: #9e2f20;
border-radius: 2px;
box-shadow: inset 0 0 0 1px rgba(251, 249, 242, 0.28);
}
[data-dsh-style="frutiger"],
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style="frutiger"], :has([data-dsh-style="frutiger"])) {
color-scheme: light;
accent-color: #0284c7;
--dsw-alias-bg-base: #eaf7ff;
--dsw-alias-bg-layer-1: rgba(255, 255, 255, 0.78);
--dsw-alias-bg-layer-2: rgba(232, 246, 255, 0.86);
--dsw-alias-bg-layer-3: rgba(209, 236, 255, 0.90);
--dsw-alias-bg-overlay: rgba(248, 253, 255, 0.93);
--dsw-alias-bg-module-platform: rgba(232, 246, 255, 0.84);
--dsw-alias-settings-card-fill: rgba(255, 255, 255, 0.82);
--dsw-alias-settings-card-stroke: rgba(56, 189, 248, 0.44);
--dsw-specific-menu: rgba(248, 253, 255, 0.95);
--dsw-alias-border-l1: rgba(56, 189, 248, 0.26);
--dsw-alias-border-l2: rgba(14, 165, 233, 0.36);
--dsw-alias-border-l3: rgba(2, 132, 199, 0.48);
--dsw-alias-border-l4: rgba(3, 105, 161, 0.58);
--dsw-alias-label-primary: #0c2b45;
--dsw-alias-label-secondary: #275373;
--dsw-alias-label-tertiary: #487596;
--dsw-alias-label-dimmed: #6c96b5;
--dsw-alias-brand-primary: #0284c7;
--dsw-alias-brand-text: #0c2b45;
--dsw-alias-state-business-primary: #0284c7;
--dsw-alias-state-business-tertiary: rgba(14, 165, 233, 0.16);
--dsw-alias-link: #0369a1;
--dsw-alias-button-primary-fill: #0284c7;
--dsw-alias-button-primary-hover: #0369a1;
--dsw-alias-button-primary-ink: #ffffff;
--dsw-alias-interactive-bg-hover: rgba(14, 165, 233, 0.10);
--dsw-alias-interactive-bg-active: rgba(14, 165, 233, 0.18);
--dsw-alias-interactive-bg-hover-accent: rgba(56, 189, 248, 0.16);
--dsw-alias-interactive-bg-hover-danger: rgba(220, 56, 82, 0.13);
--dsw-alias-state-error-primary: #c83244;
--dsw-alias-state-warn-primary: #c06a12;
--dsw-alias-state-warn-label: #8a4a09;
--dsw-alias-state-warn-tertiary: #fef0d6;
--dsw-alias-state-success-primary: #0f766e;
--dsw-radius-xs: 10px;
--dsw-radius-sm: 999px;
--dsw-radius-md: 18px;
--dsw-radius-lg: 22px;
--dsw-radius-xl: 26px;
--dsw-elevation-panel: inset 0 1.5px 0 rgba(255, 255, 255, 0.92), 0 6px 20px rgba(14, 165, 233, 0.12), 0 0 0 1px rgba(56, 189, 248, 0.36);
--dsw-elevation-prominent: inset 0 1.5px 0 rgba(255, 255, 255, 0.95), 0 16px 38px rgba(14, 165, 233, 0.18), 0 0 0 1px rgba(56, 189, 248, 0.44);
--dsh-control-border-width: 1px;
--dsh-button-shadow: inset 0 1.5px 0 rgba(255, 255, 255, 0.92), 0 2px 6px rgba(14, 165, 233, 0.12);
--dsh-button-hover-shadow: inset 0 1.5px 0 rgba(255, 255, 255, 0.96), 0 4px 12px rgba(2, 132, 199, 0.22);
--dsh-card-shadow: inset 0 1.5px 0 rgba(255, 255, 255, 0.92), 0 6px 20px rgba(14, 165, 233, 0.10);
--dsh-card-hover-shadow: inset 0 1.5px 0 rgba(255, 255, 255, 0.98), 0 10px 26px rgba(2, 132, 199, 0.16);
--dsh-surface-spotlight: rgba(14, 165, 233, 0.10);
--dsh-font-display: "Cascadia Code SemiBold", "Cascadia Code", "YouYuan", "幼圆", "Noto Sans SC", monospace;
--dsh-font-body: "Cascadia Code", "Cascadia Mono", "YouYuan", "幼圆", "Noto Sans SC", monospace;
--dsh-font-mono: "Cascadia Mono", "Cascadia Code", "YouYuan", "幼圆", Consolas, monospace;
--dsh-display-weight: 700;
--dsh-display-tracking: 0.015em;
--dsh-body-tracking: normal;
--dsw-font-family: var(--dsh-font-body);
--dsw-font-markdown-base: var(--dsh-font-body);
}
[data-dsh-style="frutiger"] {
background-color: #eaf7ff;
background-image:
radial-gradient(60% 48% at 15% 6%, rgba(125, 211, 252, 0.34) 0%, transparent 65%),
linear-gradient(180deg, #eaf7ff 0%, #f4fbff 55%, #e5f5fe 100%);
}
[data-dsh-style="frutiger"] :where(button:not([role="tab"]), .dsh-btn),
:where([role="dialog"], [role="alertdialog"], dialog):where([data-dsh-style="frutiger"], :has([data-dsh-style="frutiger"])) :where(button:not([role="tab"]), .dsh-btn) {
border-radius: 999px;
border: 1px solid rgba(14, 165, 233, 0.42);
background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(224, 244, 255, 0.88) 49%, rgba(204, 236, 255, 0.92) 51%, rgba(235, 249, 255, 0.96) 100%);
box-shadow: inset 0 1.5px 0 rgba(255, 255, 255, 0.92), 0 2px 6px rgba(14, 165, 233, 0.12);
}
[data-dsh-style="frutiger"] :where(.dsh-wb-btn-primary, .dsh-btn-primary, .dsh-header-badge) {
border-radius: 999px;
border: 1px solid #0284c7;
color: #ffffff;
background: linear-gradient(180deg, #7dd3fc 0%, #0ea5e9 48%, #0284c7 52%, #38bdf8 100%);
box-shadow: inset 0 1.5px 0 rgba(255, 255, 255, 0.88), 0 3px 10px rgba(2, 132, 199, 0.24);
}
[data-dsh-style="frutiger"] :where([data-dsh-card], .dsh-card, [data-dsh-panel], .dsh-panel, .dsh-header, [data-dsh-header]) {
background: linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(240, 250, 255, 0.78) 100%);
-webkit-backdrop-filter: blur(10px) saturate(130%);
backdrop-filter: blur(10px) saturate(130%);
box-shadow: var(--dsh-card-shadow);
}
[data-dsh-style="gazette"],
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style="gazette"], :has([data-dsh-style="gazette"])) {
color-scheme: light;
accent-color: #9b1c1c;
--dsw-alias-bg-base: #f6f3ec;
--dsw-alias-bg-layer-1: #ede8dd;
--dsw-alias-bg-layer-2: #e3dccd;
--dsw-alias-bg-layer-3: #d6cebc;
--dsw-alias-bg-overlay: #faf8f3;
--dsw-alias-bg-module-platform: #ebe5d8;
--dsw-alias-settings-card-fill: #faf8f3;
--dsw-alias-settings-card-stroke: #161514;
--dsw-specific-menu: #faf8f3;
--dsw-alias-border-l1: #cec6b6;
--dsw-alias-border-l2: #161514;
--dsw-alias-border-l3: #161514;
--dsw-alias-border-l4: #161514;
--dsw-alias-label-primary: #161514;
--dsw-alias-label-secondary: #43403c;
--dsw-alias-label-tertiary: #635f59;
--dsw-alias-label-dimmed: #827d75;
--dsw-alias-brand-primary: #9b1c1c;
--dsw-alias-brand-text: #161514;
--dsw-alias-state-business-primary: #9b1c1c;
--dsw-alias-state-business-tertiary: rgba(155, 28, 28, 0.12);
--dsw-alias-link: #9b1c1c;
--dsw-alias-button-primary-fill: #161514;
--dsw-alias-button-primary-hover: #2d2b28;
--dsw-alias-button-primary-ink: #faf8f3;
--dsw-alias-interactive-bg-hover: rgba(22, 21, 20, 0.06);
--dsw-alias-interactive-bg-active: rgba(155, 28, 28, 0.11);
--dsw-alias-interactive-bg-hover-accent: rgba(155, 28, 28, 0.10);
--dsw-alias-interactive-bg-hover-danger: rgba(155, 28, 28, 0.14);
--dsw-alias-state-error-primary: #9b1c1c;
--dsw-alias-state-warn-primary: #9a5b08;
--dsw-alias-state-warn-label: #6e3f04;
--dsw-alias-state-warn-tertiary: #f6ead2;
--dsw-alias-state-success-primary: #1f5c3a;
--dsw-radius-xs: 0px;
--dsw-radius-sm: 1px;
--dsw-radius-md: 2px;
--dsw-radius-lg: 2px;
--dsw-radius-xl: 2px;
--dsw-elevation-panel: 0 1px 0 #161514, 0 0 0 1px #161514;
--dsw-elevation-prominent: 3px 3px 0 #161514, 0 0 0 1px #161514;
--dsh-control-border-width: 1px;
--dsh-button-shadow: none;
--dsh-button-hover-shadow: 0 2px 0 #161514;
--dsh-card-shadow: none;
--dsh-card-hover-shadow: 2px 2px 0 #161514;
--dsh-surface-spotlight: rgba(155, 28, 28, 0.06);
--dsh-font-display: Garamond, Georgia, "STZhongsong", "华文中宋", "Noto Serif SC Black", serif;
--dsh-font-body: Georgia, "Noto Serif SC", "STSong", "华文宋体", serif;
--dsh-font-mono: "Cascadia Mono", Consolas, "Courier New", monospace;
--dsh-display-weight: 700;
--dsh-display-tracking: -0.01em;
--dsh-body-tracking: normal;
--dsw-font-family: var(--dsh-font-body);
--dsw-font-markdown-base: var(--dsh-font-body);
}
[data-dsh-style="gazette"] {
background-color: #f6f3ec;
}
[data-dsh-style="gazette"] :where(.pageHeader, .dsh-header, [data-dsh-header], .dsh-wb-header) {
background: #faf8f3;
border-block-end: 4px double #161514;
}
[data-dsh-style="gazette"] :where([data-dsh-card], .dsh-card, [data-dsh-panel], .dsh-panel) {
background: #faf8f3;
border: 1px solid #161514;
border-radius: 2px;
box-shadow: none;
}
[data-dsh-style="gazette"] :where([data-dsh-row], .dsh-row) {
border-block-end: 1px solid #161514;
}
[data-dsh-style="gazette"] .dsh-split-leading {
border-inline-end: 1px solid #161514;
}
[data-dsh-style="gazette"] .dsh-split-resizer::before {
background: #161514;
}
[data-dsh-style="gazette"] :where(button:not([role="tab"]), .dsh-btn),
:where([role="dialog"], [role="alertdialog"], dialog):where([data-dsh-style="gazette"], :has([data-dsh-style="gazette"])) :where(button:not([role="tab"]), .dsh-btn) {
border: 1px solid #161514;
border-radius: 1px;
}
[data-dsh-style="gazette"] :where(.dsh-wb-btn-primary, .dsh-btn-primary) {
background: #161514;
color: #faf8f3;
border-color: #161514;
}
[data-dsh-style="gazette"] :where(.dsh-wb-btn-primary, .dsh-btn-primary):hover:not(:disabled) {
background: #9b1c1c;
border-color: #9b1c1c;
}
[data-dsh-style="gazette"] .dsh-header-badge {
background: #9b1c1c;
color: #faf8f3;
border-radius: 1px;
}
[data-dsh-style="gazette"] [role="tab"][aria-selected="true"]::after,
[data-dsh-style="gazette"] .dsh-tab-indicator {
border-block-end-color: #9b1c1c;
border-block-end-width: 2.5px;
}
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style="gazette"], :has([data-dsh-style="gazette"])) {
border: 1px solid #161514 !important;
border-radius: 2px !important;
}
:root[data-dsh-font="songkai"] [data-dsh-style],
:root[data-dsh-font="songkai"] [data-dsh-portal-synced],
:root[data-dsh-font="songkai"] :where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):has([data-dsh-style]),
[data-dsh-style][data-dsh-font="songkai"],
[data-dsh-portal-synced][data-dsh-font="songkai"] {
--dsh-font-display: "STZhongsong", "华文中宋", "Noto Serif SC Black", "SimSun", "宋体", serif;
--dsh-font-body: "Palatino Linotype", "STKaiti", "华文楷体", "KaiTi", "楷体", "Noto Serif SC", serif;
--dsh-font-mono: "Cascadia Mono", Consolas, "STFangsong", "华文仿宋", monospace;
--dsh-display-weight: 700;
--dsh-display-tracking: 0.04em;
--dsh-body-tracking: normal;
--dsw-font-family: var(--dsh-font-body);
--dsw-font-markdown-base: var(--dsh-font-body);
}
:root[data-dsh-font="fangsong"] [data-dsh-style],
:root[data-dsh-font="fangsong"] [data-dsh-portal-synced],
:root[data-dsh-font="fangsong"] :where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):has([data-dsh-style]),
[data-dsh-style][data-dsh-font="fangsong"],
[data-dsh-portal-synced][data-dsh-font="fangsong"] {
--dsh-font-display: "Cascadia Mono SemiBold", "Cascadia Mono", "STZhongsong", "华文中宋", "FangSong", "仿宋", monospace;
--dsh-font-body: "Cascadia Mono", "STFangsong", "华文仿宋", "FangSong", "仿宋", monospace;
--dsh-font-mono: "Cascadia Mono", "STFangsong", "华文仿宋", "FangSong", "仿宋", monospace;
--dsh-display-weight: 700;
--dsh-display-tracking: 0.02em;
--dsh-body-tracking: 0.02em;
--dsw-font-family: var(--dsh-font-body);
--dsw-font-markdown-base: var(--dsh-font-body);
}
:root[data-dsh-font="poster"] [data-dsh-style],
:root[data-dsh-font="poster"] [data-dsh-portal-synced],
:root[data-dsh-font="poster"] :where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):has([data-dsh-style]),
[data-dsh-style][data-dsh-font="poster"],
[data-dsh-portal-synced][data-dsh-font="poster"] {
--dsh-font-display: Impact, "Arial Black", "Noto Sans SC Black", "SimHei", "黑体", sans-serif;
--dsh-font-body: "Source Sans 3", "Noto Sans SC Medium", "Noto Sans SC", sans-serif;
--dsh-font-mono: "Cascadia Code", "Cascadia Mono", Consolas, monospace;
--dsh-display-weight: 900;
--dsh-display-tracking: -0.02em;
--dsh-body-tracking: normal;
--dsw-font-family: var(--dsh-font-body);
--dsw-font-markdown-base: var(--dsh-font-body);
}
:root[data-dsh-font="retro98"] [data-dsh-style],
:root[data-dsh-font="retro98"] [data-dsh-portal-synced],
:root[data-dsh-font="retro98"] :where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):has([data-dsh-style]),
[data-dsh-style][data-dsh-font="retro98"],
[data-dsh-portal-synced][data-dsh-font="retro98"] {
--dsh-font-display: Tahoma, "SimSun", "NSimSun", "宋体", "新宋体", sans-serif;
--dsh-font-body: Tahoma, "SimSun", "NSimSun", "宋体", "新宋体", sans-serif;
--dsh-font-mono: "Fixedsys", Consolas, "Courier New", "SimSun", "宋体", monospace;
--dsh-display-weight: 700;
--dsh-display-tracking: normal;
--dsh-body-tracking: normal;
--dsw-font-family: var(--dsh-font-body);
--dsw-font-markdown-base: var(--dsh-font-body);
}
:root[data-dsh-font="serif"] [data-dsh-style],
:root[data-dsh-font="serif"] [data-dsh-portal-synced],
:root[data-dsh-font="serif"] :where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):has([data-dsh-style]),
[data-dsh-style][data-dsh-font="serif"],
[data-dsh-portal-synced][data-dsh-font="serif"] {
--dsh-font-display: "Palatino Linotype", Georgia, "Noto Serif SC SemiBold", "Noto Serif SC", "STZhongsong", "华文中宋", serif;
--dsh-font-body: Georgia, "Noto Serif SC", "STSong", "华文宋体", serif;
--dsh-font-mono: "Cascadia Code", "Cascadia Mono", Consolas, monospace;
--dsh-display-weight: 700;
--dsh-display-tracking: -0.01em;
--dsh-body-tracking: normal;
--dsw-font-family: var(--dsh-font-body);
--dsw-font-markdown-base: var(--dsh-font-body);
}
:root[data-dsh-font="arcade"] [data-dsh-style],
:root[data-dsh-font="arcade"] [data-dsh-portal-synced],
:root[data-dsh-font="arcade"] :where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):has([data-dsh-style]),
[data-dsh-style][data-dsh-font="arcade"],
[data-dsh-portal-synced][data-dsh-font="arcade"] {
--dsh-font-display: "Cascadia Code SemiBold", "Cascadia Code", "YouYuan", "幼圆", "Noto Sans SC", monospace;
--dsh-font-body: "Cascadia Code", "Cascadia Mono", "YouYuan", "幼圆", "Noto Sans SC", monospace;
--dsh-font-mono: "Cascadia Mono", "Cascadia Code", "YouYuan", "幼圆", Consolas, monospace;
--dsh-display-weight: 700;
--dsh-display-tracking: 0.015em;
--dsh-body-tracking: normal;
--dsw-font-family: var(--dsh-font-body);
--dsw-font-markdown-base: var(--dsh-font-body);
}
:root[data-dsh-font="modern"] [data-dsh-style],
:root[data-dsh-font="modern"] [data-dsh-portal-synced],
:root[data-dsh-font="modern"] :where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):has([data-dsh-style]),
[data-dsh-style][data-dsh-font="modern"],
[data-dsh-portal-synced][data-dsh-font="modern"] {
--dsh-font-display: "Source Sans 3", "Segoe UI", "Noto Sans SC", "Microsoft YaHei UI", sans-serif;
--dsh-font-body: "Source Sans 3", "Segoe UI", "Noto Sans SC", "Microsoft YaHei UI", sans-serif;
--dsh-font-mono: "Cascadia Code", "Cascadia Mono", Consolas, "Microsoft YaHei UI", monospace;
--dsh-display-weight: 650;
--dsh-display-tracking: normal;
--dsh-body-tracking: normal;
--dsw-font-family: var(--dsh-font-body);
--dsw-font-markdown-base: var(--dsh-font-body);
}
:where([data-dsh-style], [data-dsh-portal-synced]),
:where([data-dsh-style], [data-dsh-portal-synced]) :where(button, input, select, textarea),
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style], [data-dsh-portal-synced], :has([data-dsh-style])),
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style], [data-dsh-portal-synced], :has([data-dsh-style])) :where(button, input, select, textarea) {
font-family: var(--dsh-font-body);
letter-spacing: var(--dsh-body-tracking, normal);
}
:where([data-dsh-style], [data-dsh-portal-synced]) :where(
h1,
h2,
h3,
[role="tab"],
.dsh-header-title,
[data-dsh-serif],
[data-dsh-editorial-heading],
[data-dsh-card] :is(h2, h3, .dsh-card-title),
.dsh-card :is(h2, h3, .dsh-card-title),
[data-dsh-reader] :is(h1, h2),
.dsh-reader :is(h1, h2)
),
:where([role="dialog"], [role="alertdialog"], dialog):where([data-dsh-style], [data-dsh-portal-synced], :has([data-dsh-style])) :where(h1, h2, h3, header h2, [role="tab"], [data-dsh-serif]) {
font-family: var(--dsh-font-display);
font-weight: var(--dsh-display-weight, 700);
letter-spacing: var(--dsh-display-tracking, normal);
}
:where([data-dsh-style], [data-dsh-portal-synced]) :where(code, pre, kbd, samp),
:where([role="dialog"], [role="alertdialog"], dialog):where([data-dsh-style], [data-dsh-portal-synced], :has([data-dsh-style])) :where(code, pre, kbd, samp) {
font-family: var(--dsh-font-mono);
}
:where([data-dsh-style]) :where(button, [role="button"]),
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):has([data-dsh-style]) :where(button, [role="button"]) {
translate: 0px 0px;
scale: 1;
transition-property: background-color, border-color, color, box-shadow, opacity, translate, scale;
transition-duration: var(--dsh-motion-fast);
transition-timing-function: var(--dsh-ease-out);
}
:where([data-dsh-style]) :where(button, [role="button"])[aria-expanded="true"]:not(:disabled):not([aria-disabled="true"]),
:where([role="dialog"], [role="alertdialog"], dialog):has([data-dsh-style]) :where(button, [role="button"])[aria-expanded="true"]:not(:disabled):not([aria-disabled="true"]) {
background-color: var(--dsw-alias-interactive-bg-active);
color: var(--dsw-alias-label-primary);
}
@media (prefers-reduced-motion: no-preference) {
@media (hover: hover) {
:where([data-dsh-style]:not([data-dsh-style="pixel8bit"]):not([data-dsh-style="eink"]):not([data-dsh-style="win98"]):not([data-dsh-style="risograph"])) :where(button:not([role="tab"]):not([role="menuitem"]):not([role="menuitemradio"]):not([role="switch"]), .dsh-btn):hover:not(:disabled):not([aria-disabled="true"]),
:where([role="dialog"], [role="alertdialog"], dialog):has([data-dsh-style]:not([data-dsh-style="pixel8bit"]):not([data-dsh-style="eink"]):not([data-dsh-style="win98"]):not([data-dsh-style="risograph"])) :where(button:not([role="tab"]):not([role="menuitem"]):not([role="menuitemradio"]):not([role="switch"]), .dsh-btn):hover:not(:disabled):not([aria-disabled="true"]) {
translate: 0px -0.5px;
}
[data-dsh-style="pixel8bit"] :where(button:not([role="tab"]):not([role="menuitem"]):not([role="menuitemradio"]), .dsh-btn):hover:not(:disabled):not([aria-disabled="true"]),
:where([role="dialog"], [role="alertdialog"], dialog):where([data-dsh-style="pixel8bit"], :has([data-dsh-style="pixel8bit"])) :where(button:not([role="tab"]):not([role="menuitem"]):not([role="menuitemradio"]), .dsh-btn):hover:not(:disabled):not([aria-disabled="true"]) {
translate: -1px -1px;
box-shadow: 3px 3px 0px #1e2826;
transition-timing-function: steps(2, end);
transition-duration: 70ms;
}
[data-dsh-style="risograph"] :where(button:not([role="tab"]):not([role="menuitem"]):not([role="menuitemradio"]), .dsh-btn):hover:not(:disabled):not([aria-disabled="true"]),
:where([role="dialog"], [role="alertdialog"], dialog):where([data-dsh-style="risograph"], :has([data-dsh-style="risograph"])) :where(button:not([role="tab"]):not([role="menuitem"]):not([role="menuitemradio"]), .dsh-btn):hover:not(:disabled):not([aria-disabled="true"]) {
translate: -1px -1px;
box-shadow: 4px 4px 0px #2563eb;
}
}
:where([data-dsh-style]:not([data-dsh-style="pixel8bit"]):not([data-dsh-style="eink"]):not([data-dsh-style="win98"]):not([data-dsh-style="risograph"])) :where(button:not([role="switch"]), [role="button"]):active:not(:disabled):not([aria-disabled="true"]),
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):has([data-dsh-style]:not([data-dsh-style="pixel8bit"]):not([data-dsh-style="eink"]):not([data-dsh-style="win98"]):not([data-dsh-style="risograph"])) :where(button:not([role="switch"]), [role="button"]):active:not(:disabled):not([aria-disabled="true"]) {
scale: 0.965;
translate: 0px 0.5px;
transition-duration: 80ms;
}
[data-dsh-style="pixel8bit"] :where(button:not([role="tab"]):not([role="switch"]), .dsh-btn):active:not(:disabled):not([aria-disabled="true"]),
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style="pixel8bit"], :has([data-dsh-style="pixel8bit"])) :where(button:not([role="tab"]):not([role="switch"]), .dsh-btn):active:not(:disabled):not([aria-disabled="true"]) {
translate: 1px 1px !important;
scale: 1 !important;
box-shadow: 1px 1px 0px #1e2826 !important;
transition-timing-function: steps(2, end);
transition-duration: 50ms;
}
[data-dsh-style="risograph"] :where(button:not([role="tab"]):not([role="switch"]), .dsh-btn):active:not(:disabled):not([aria-disabled="true"]),
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style="risograph"], :has([data-dsh-style="risograph"])) :where(button:not([role="tab"]):not([role="switch"]), .dsh-btn):active:not(:disabled):not([aria-disabled="true"]) {
translate: 2px 2px !important;
scale: 1 !important;
box-shadow: 1px 1px 0px #18181b !important;
transition-duration: 60ms;
}
}
:where([data-dsh-style]) :where(button, [role="button"], summary) svg,
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):has([data-dsh-style]) :where(button, [role="button"], summary) svg {
translate: 0px 0px;
rotate: 0deg;
scale: 1;
transform-origin: center;
}
@keyframes dsh-icon-spin {
to {
rotate: 360deg;
}
}
@keyframes dsh-icon-wiggle {
0% { rotate: 0deg; }
25% { rotate: -12deg; }
55% { rotate: 10deg; }
80% { rotate: -5deg; }
100% { rotate: 0deg; }
}
@keyframes dsh-icon-pop {
0% { scale: 1; }
45% { scale: 1.26; }
75% { scale: 0.94; }
100% { scale: 1; }
}
@keyframes dsh-icon-bounce {
0%, 100% { translate: 0px 0px; }
45% { translate: 0px 2.5px; }
75% { translate: 0px -1px; }
}
@media (prefers-reduced-motion: no-preference) {
:where([data-dsh-style]) :where(button, [role="button"], summary) svg,
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):has([data-dsh-style]) :where(button, [role="button"], summary) svg {
transition:
translate var(--dsh-motion-base) var(--dsh-ease-spring),
rotate 240ms var(--dsh-ease-spring),
scale var(--dsh-motion-base) var(--dsh-ease-spring);
}
:where([data-dsh-style]) :where([aria-expanded="true"], [data-open="true"], details[open] > summary) :is(svg[data-dsh-icon="down"], svg[data-dsh-icon="chevron-down"], svg[data-icon="down"], svg[data-icon="chevron-down"]),
:where([role="dialog"], [role="alertdialog"], dialog):has([data-dsh-style]) :where([aria-expanded="true"], [data-open="true"]) :is(svg[data-dsh-icon="down"], svg[data-dsh-icon="chevron-down"], svg[data-icon="down"], svg[data-icon="chevron-down"]) {
rotate: 180deg;
}
:where([data-dsh-style]) :where(button, [role="button"])[aria-busy="true"] :is(svg[data-dsh-icon="refresh"], svg[data-dsh-icon="sync"], svg[data-icon="refresh"], svg[data-icon="sync"]),
:where([data-dsh-style]) :is(svg[data-dsh-icon="refresh"], svg[data-icon="refresh"])[data-spinning="true"] {
animation: dsh-icon-spin 0.85s linear infinite;
}
@media (hover: hover) {
:where([data-dsh-style], [role="dialog"], [role="alertdialog"], dialog) :where(button, [role="button"]):hover:not(:disabled):not([aria-disabled="true"]) :is(svg[data-dsh-icon="refresh"], svg[data-dsh-icon="sync"], svg[data-dsh-icon="reload"], svg[data-icon="refresh"], svg[data-icon="sync"], svg[data-icon="reload"]) {
rotate: 180deg;
}
:where([data-dsh-style], [role="dialog"], [role="alertdialog"], dialog) :where(button, [role="button"]):hover:not(:disabled):not([aria-disabled="true"]) :is(svg[data-dsh-icon="plus"], svg[data-dsh-icon="add"], svg[data-dsh-icon="close"], svg[data-dsh-icon="x"], svg[data-icon="plus"], svg[data-icon="add"], svg[data-icon="close"], svg[data-icon="x"]) {
rotate: 90deg;
}
:where([data-dsh-style], [role="dialog"], [role="alertdialog"], dialog) :where(button, [role="button"], a):hover:not(:disabled):not([aria-disabled="true"]) :is(svg[data-dsh-icon="send"], svg[data-dsh-icon="external"], svg[data-dsh-icon="link"], svg[data-icon="send"], svg[data-icon="external"], svg[data-icon="link"]) {
translate: 2px -1.5px;
}
:where([data-dsh-style], [role="dialog"], [role="alertdialog"], dialog) :where(button, [role="button"]):hover:not(:disabled):not([aria-disabled="true"]) :is(svg[data-dsh-icon="reply"], svg[data-dsh-icon="left"], svg[data-dsh-icon="undo"], svg[data-icon="reply"], svg[data-icon="left"], svg[data-icon="undo"]) {
translate: -2px 0px;
}
:where([data-dsh-style], [role="dialog"], [role="alertdialog"], dialog) :where(button, [role="button"]):hover:not(:disabled):not([aria-disabled="true"]) :is(svg[data-dsh-icon="right"], svg[data-icon="right"]) {
translate: 2px 0px;
}
:where([data-dsh-style], [role="dialog"], [role="alertdialog"], dialog) :where(button, [role="button"]):hover:not(:disabled):not([aria-disabled="true"]) :is(svg[data-dsh-icon="play"], svg[data-icon="play"]) {
translate: 1.5px 0px;
scale: 1.14;
}
:where([data-dsh-style], [role="dialog"], [role="alertdialog"], dialog) :where(button, [role="button"]):hover:not(:disabled):not([aria-disabled="true"]) :is(svg[data-dsh-icon="trash"], svg[data-dsh-icon="delete"], svg[data-icon="trash"], svg[data-icon="delete"]) {
animation: dsh-icon-wiggle 360ms var(--dsh-ease-in-out);
}
:where([data-dsh-style], [role="dialog"], [role="alertdialog"], dialog) :where(button, [role="button"]):hover:not(:disabled):not([aria-disabled="true"]) :is(svg[data-dsh-icon="star"], svg[data-dsh-icon="check"], svg[data-dsh-icon="copy"], svg[data-dsh-icon="bookmark"], svg[data-icon="star"], svg[data-icon="check"], svg[data-icon="copy"], svg[data-icon="bookmark"]) {
scale: 1.18;
}
:where([data-dsh-style], [role="dialog"], [role="alertdialog"], dialog) :where(button, [role="button"]):hover:not(:disabled):not([aria-disabled="true"]) :is(svg[data-dsh-icon="download"], svg[data-dsh-icon="export"], svg[data-icon="download"], svg[data-icon="export"]) {
animation: dsh-icon-bounce 420ms var(--dsh-ease-out);
}
:where([data-dsh-style], [role="dialog"], [role="alertdialog"], dialog) :where(button, [role="button"]):hover:not(:disabled):not([aria-disabled="true"]) :is(svg[data-dsh-icon="palette"], svg[data-dsh-icon="sparkles"], svg[data-dsh-icon="edit"], svg[data-dsh-icon="cube"], svg[data-dsh-icon="box"], svg[data-icon="palette"], svg[data-icon="sparkles"], svg[data-icon="edit"], svg[data-icon="cube"]) {
rotate: -12deg;
scale: 1.08;
}
:where([data-dsh-style], [role="dialog"], [role="alertdialog"], dialog) :where(button, [role="button"]):hover:not(:disabled):not([aria-disabled="true"]) :is(svg[data-dsh-icon="rotate"], svg[data-icon="rotate"]) {
rotate: 180deg;
}
:where([data-dsh-style], [role="dialog"], [role="alertdialog"], dialog) :where(button, [role="button"]):hover:not(:disabled):not([aria-disabled="true"]) :is(svg[data-dsh-icon="camera"], svg[data-dsh-icon="grid"], svg[data-dsh-icon="plug"], svg[data-dsh-icon="code"]) {
scale: 1.12;
}
:where([data-dsh-style], [role="dialog"], [role="alertdialog"], dialog) :where(button, [role="button"])[aria-expanded="false"]:hover:not(:disabled):not([aria-disabled="true"]) :is(svg[data-dsh-icon="down"], svg[data-dsh-icon="chevron-down"], svg[data-icon="down"], svg[data-icon="chevron-down"]) {
translate: 0px 1.5px;
}
}
:where([data-dsh-style], [role="dialog"], [role="alertdialog"], dialog) :where([aria-pressed="true"], [aria-checked="true"], [data-active="true"], [data-copied="true"]) :is(svg[data-dsh-icon="star"], svg[data-dsh-icon="check"], svg[data-dsh-icon="copy"], svg[data-icon="star"], svg[data-icon="check"], svg[data-icon="copy"]) {
animation: dsh-icon-pop 300ms var(--dsh-ease-spring);
}
}
:where([data-dsh-style]) :where(.dsh-header, [data-dsh-header]) {
display: flex;
align-items: center;
justify-content: space-between;
gap: 10px;
min-height: 48px;
padding: 6px 14px;
flex: none;
min-width: 0;
background: var(--dsw-alias-bg-base);
border-block-end: var(--dsh-control-border-width, 0.5px) solid var(--dsw-alias-border-l2);
}
.dsh-header-leading {
display: flex;
align-items: center;
gap: 10px;
min-width: 0;
flex: 1 1 auto;
}
.dsh-header-brand {
display: inline-flex;
align-items: center;
gap: 8px;
min-width: 0;
flex: none;
white-space: nowrap;
}
.dsh-header-badge {
display: inline-flex;
align-items: center;
justify-content: center;
flex: none;
width: 24px;
height: 24px;
border-radius: var(--dsw-radius-xs, 6px);
background: var(--dsw-alias-button-primary-fill, #4176e6);
color: var(--dsw-alias-button-primary-ink, #ffffff);
}
.dsh-header-title {
margin: 0;
font-size: 13.5px;
font-weight: var(--dsh-display-weight, 650);
line-height: 1.25;
color: var(--dsw-alias-label-primary);
white-space: nowrap;
}
.dsh-header-tabs {
display: flex;
align-items: center;
min-width: 0;
flex: 1 1 auto;
}
.dsh-header-actions {
display: inline-flex;
align-items: center;
gap: 6px;
flex: none;
white-space: nowrap;
}
@container (max-width: 759px) {
:where([data-dsh-style]) :where(.dsh-header, [data-dsh-header]) {
flex-wrap: wrap;
padding-block: 6px;
}
.dsh-header-leading {
flex-wrap: wrap;
gap: 6px 10px;
}
}
:where([data-dsh-style]) :where([role="tablist"], .dsh-tablist) {
position: relative;
display: flex;
align-items: center;
gap: 2px;
min-width: 0;
overflow-x: auto;
scrollbar-width: thin;
}
:where([data-dsh-style]) [role="tab"] {
position: relative;
flex: none;
white-space: nowrap;
}
:where([data-dsh-style]) [role="tab"][aria-selected="true"]::after {
content: "";
position: absolute;
inset-inline: 6px;
inset-block-end: 0;
border-block-end: 2px solid var(--dsw-alias-state-business-primary);
pointer-events: none;
}
[data-dsh-style] :where([data-dsh-tablist][data-indicator-ready="true"], .dsh-tablist[data-indicator-ready="true"]) [role="tab"][aria-selected="true"]::after {
opacity: 0;
}
.dsh-tab-indicator {
position: absolute;
inset-inline-start: 0;
inset-block-end: 0;
height: 2px;
width: var(--dsh-tab-w, 0px);
translate: var(--dsh-tab-x, 0px) 0px;
border-block-end: 2px solid var(--dsw-alias-state-business-primary);
border-radius: 2px 2px 0 0;
pointer-events: none;
opacity: 0;
transition:
translate 180ms var(--dsh-ease-out),
width 180ms var(--dsh-ease-out),
opacity 120ms ease-out;
}
[data-indicator-ready="true"] > .dsh-tab-indicator {
opacity: 1;
}
.dsh-tablist-pill > .dsh-tab-indicator {
inset-block: 3px;
height: auto;
border-block-end: 2px solid var(--dsw-alias-state-business-primary);
border-radius: var(--dsw-radius-xs, 6px);
background: var(--dsw-alias-interactive-bg-active);
z-index: 0;
}
.dsh-tablist-pill > [role="tab"] {
z-index: 1;
}
[data-dsh-style="eink"] .dsh-tab-indicator {
transition-duration: 60ms;
}
[data-dsh-style="pixel8bit"] .dsh-tab-indicator {
border-radius: 0px !important;
transition-timing-function: steps(4, end);
}
@keyframes dsh-tab-panel-enter {
from {
opacity: 0;
translate: 0px 4px;
}
to {
opacity: 1;
translate: 0px 0px;
}
}
:where([data-dsh-style]) :where(.dsh-tab-panel, [data-dsh-tab-panel]):not([hidden]) {
opacity: 1;
translate: 0px 0px;
transition:
opacity 140ms var(--dsh-ease-out),
translate 140ms var(--dsh-ease-out);
animation: dsh-tab-panel-enter 140ms var(--dsh-ease-out);
}
@starting-style {
:where([data-dsh-style]) :where(.dsh-tab-panel, [data-dsh-tab-panel]):not([hidden]) {
opacity: 0;
translate: 0px 4px;
}
}
.dsh-split-pane {
display: flex;
flex: 1 1 auto;
min-width: 0;
min-height: 0;
width: 100%;
}
.dsh-split-leading {
flex: none;
min-width: 0;
min-height: 0;
width: var(--dsh-split-size, 320px);
}
.dsh-split-trailing {
flex: 1 1 auto;
min-width: 0;
min-height: 0;
}
.dsh-split-resizer {
position: relative;
flex: none;
width: 9px;
min-height: 24px;
display: flex;
align-items: center;
justify-content: center;
cursor: col-resize;
touch-action: none;
user-select: none;
background: transparent;
outline: none;
}
.dsh-split-resizer[aria-orientation="horizontal"] {
width: 100%;
height: 9px;
min-height: 9px;
cursor: row-resize;
}
.dsh-split-resizer::before {
content: "";
width: 1px;
height: 100%;
background: var(--dsw-alias-border-l2);
transition:
width 120ms var(--dsh-ease-out),
background-color 120ms var(--dsh-ease-out);
}
.dsh-split-resizer[aria-orientation="horizontal"]::before {
width: 100%;
height: 1px;
}
.dsh-split-resizer::after {
content: "";
position: absolute;
width: 3px;
height: 28px;
border-radius: 999px;
background: var(--dsw-alias-border-l3);
opacity: 0;
transition:
opacity 120ms var(--dsh-ease-out),
background-color 120ms var(--dsh-ease-out);
}
.dsh-split-resizer[aria-orientation="horizontal"]::after {
width: 28px;
height: 3px;
}
.dsh-split-resizer:hover::before,
.dsh-split-resizer:focus-visible::before,
.dsh-split-resizer[data-dragging="true"]::before {
width: 2px;
background: var(--dsw-alias-state-business-primary);
}
.dsh-split-resizer[aria-orientation="horizontal"]:is(:hover, :focus-visible, [data-dragging="true"])::before {
width: 100%;
height: 2px;
}
.dsh-split-resizer:is(:hover, :focus-visible, [data-dragging="true"])::after {
opacity: 1;
background: var(--dsw-alias-state-business-primary);
}
.dsh-split-resizer:focus-visible {
outline: 2px solid var(--dsw-alias-state-business-primary);
outline-offset: -2px;
}
[data-dsh-style="pixel8bit"] .dsh-split-resizer::before {
width: 2px;
background: #1e2826;
}
[data-dsh-style="pixel8bit"] .dsh-split-resizer::after {
border-radius: 0px;
}
@container (max-width: 759px) {
.dsh-split-pane {
flex-direction: column;
overflow-y: auto;
}
.dsh-split-leading {
width: 100% !important;
max-width: 100%;
flex: none;
}
.dsh-split-resizer {
display: none;
}
}
@media (max-width: 759px) {
.dsh-split-pane {
flex-direction: column;
overflow-y: auto;
}
.dsh-split-leading {
width: 100% !important;
max-width: 100%;
flex: none;
}
.dsh-split-resizer {
display: none;
}
}
@keyframes dsh-skeleton-shimmer {
0% { background-position: 100% 0; }
100% { background-position: -100% 0; }
}
.dsh-skeleton-group {
display: flex;
flex-direction: column;
gap: 8px;
width: 100%;
}
.dsh-skeleton {
display: block;
width: 100%;
height: 12px;
border-radius: var(--dsw-radius-xs, 6px);
background-color: var(--dsw-alias-bg-layer-2, #e5e7eb);
background-image: linear-gradient(
90deg,
var(--dsw-alias-bg-layer-2, #e5e7eb) 0%,
color-mix(in oklab, var(--dsw-alias-bg-overlay, #ffffff) 82%, var(--dsw-alias-state-business-primary, #4176e6) 18%) 48%,
var(--dsw-alias-bg-layer-2, #e5e7eb) 100%
);
background-size: 220% 100%;
background-position: 100% 0;
}
.dsh-skeleton-circle {
width: 32px;
height: 32px;
border-radius: 50%;
flex: none;
}
.dsh-skeleton-card {
display: flex;
flex-direction: column;
gap: 10px;
padding: 12px 14px;
border-radius: var(--dsw-radius-md, 12px);
border: var(--dsh-control-border-width, 0.5px) solid var(--dsw-alias-border-l1);
background: var(--dsw-alias-bg-layer-1);
}
.dsh-skeleton-row {
display: flex;
align-items: center;
gap: 10px;
padding: 8px 10px;
}
@media (prefers-reduced-motion: no-preference) {
:where([data-dsh-style]:not([data-dsh-style="eink"])) .dsh-skeleton[data-animated="true"] {
animation: dsh-skeleton-shimmer 1.35s var(--dsh-ease-in-out) infinite;
}
[data-dsh-style="pixel8bit"] .dsh-skeleton[data-animated="true"] {
border-radius: 0px !important;
border: 1px solid #1e2826;
animation-timing-function: steps(4, end);
}
}
[data-dsh-style="eink"] .dsh-skeleton {
background-image: none;
border: 1px solid #c5c2b8;
}
.dsh-progress {
position: relative;
width: 100%;
height: 6px;
overflow: clip;
border-radius: 999px;
background: var(--dsw-alias-bg-layer-2);
}
.dsh-progress-bar {
height: 100%;
width: var(--dsh-progress-value, 0%);
border-radius: inherit;
background: var(--dsw-alias-state-business-primary);
transition: width 200ms var(--dsh-ease-out);
}
[data-dsh-style="pixel8bit"] .dsh-progress {
height: 10px;
border-radius: 0px !important;
border: 2px solid #1e2826;
background: var(--dsw-alias-bg-layer-1);
box-shadow: 2px 2px 0px #1e2826;
}
[data-dsh-style="pixel8bit"] .dsh-progress-bar {
border-radius: 0px !important;
background: repeating-linear-gradient(
90deg,
#2e7d5b 0px,
#2e7d5b 6px,
#24674a 6px,
#24674a 8px
);
transition-timing-function: steps(8, end);
}
:where([data-dsh-style]) :where([data-dsh-card], .dsh-card, [data-dsh-row], .dsh-row) {
translate: 0px 0px;
transition:
background-color var(--dsh-motion-fast) var(--dsh-ease-out),
border-color var(--dsh-motion-fast) var(--dsh-ease-out),
box-shadow var(--dsh-motion-base) var(--dsh-ease-out),
translate var(--dsh-motion-base) var(--dsh-ease-out);
}
.dsh-row-actions {
display: inline-flex;
align-items: center;
gap: 4px;
flex: none;
translate: 0px 0px;
transition:
opacity var(--dsh-motion-fast) var(--dsh-ease-out),
translate var(--dsh-motion-fast) var(--dsh-ease-out);
}
@media (hover: hover) {
:where([data-dsh-row], .dsh-row) .dsh-row-actions:not([data-always-visible="true"]) {
opacity: 0;
translate: 4px 0px;
pointer-events: none;
}
:where([data-dsh-row], .dsh-row):is(:hover, :focus-within, [data-active="true"], [data-selected="true"], [aria-selected="true"]) .dsh-row-actions {
opacity: 1;
translate: 0px 0px;
pointer-events: auto;
}
}
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
:where([data-dsh-style]:not([data-dsh-style="pixel8bit"]):not([data-dsh-style="eink"]):not([data-dsh-style="win98"]):not([data-dsh-style="risograph"])) :where([data-dsh-card], .dsh-card):hover {
translate: 0px -1.5px;
box-shadow: var(--dsh-card-hover-shadow);
}
[data-dsh-style="pixel8bit"] :where([data-dsh-card], .dsh-card):hover {
translate: -1px -1px;
box-shadow: 4px 4px 0px #1e2826;
}
[data-dsh-style="risograph"] :where([data-dsh-card], .dsh-card):hover {
translate: -1px -1px;
box-shadow: 5px 5px 0px #ff3e7f;
}
:where([data-dsh-style]) :where([data-dsh-row], .dsh-row):hover:not([data-selected="true"]):not([aria-selected="true"]):not([data-active="true"]) {
background-color: var(--dsh-surface-spotlight, var(--dsw-alias-interactive-bg-hover));
}
}
:where([role="dialog"], [role="alertdialog"], dialog[open]):where([data-dsh-style], :has([data-dsh-style])) {
overscroll-behavior: contain;
opacity: 1;
transition-property: opacity, scale, translate, display, overlay;
transition-duration: var(--dsh-motion-dialog);
transition-timing-function: var(--dsh-ease-out);
transition-behavior: allow-discrete;
}
@starting-style {
:where([role="dialog"], [role="alertdialog"], dialog[open]):where([data-dsh-style], :has([data-dsh-style])) {
opacity: 0;
}
}
@media (prefers-reduced-motion: no-preference) {
:where([role="dialog"], [role="alertdialog"], dialog[open]):where([data-dsh-style], :has([data-dsh-style])) {
scale: 1;
translate: 0px 0px;
}
@starting-style {
:where([role="dialog"], [role="alertdialog"], dialog[open]):where([data-dsh-style], :has([data-dsh-style])) {
scale: 0.965;
translate: 0px 6px;
}
}
}
dialog[open]::backdrop {
overflow: hidden;
overscroll-behavior: contain;
}
:where([data-dsh-style]) [data-plugin-update-footer] {
flex: none;
box-sizing: border-box;
width: 100%;
min-height: 32px;
margin: 0;
padding: 6px 14px;
display: flex;
flex-wrap: wrap;
align-items: center;
justify-content: space-between;
gap: 6px 12px;
font-size: 12px;
line-height: 1.4;
color: var(--dsw-alias-label-secondary);
background: var(--dsw-alias-bg-layer-1);
border-block-start: var(--dsh-control-border-width, 0.5px) solid var(--dsw-alias-border-l2);
}
:where([data-dsh-style]) [data-plugin-update-footer] :where(button, a) {
min-height: 24px;
font-size: 11.5px;
}
:where([data-dsh-style]) [data-show-updates="false"] [data-plugin-update-footer] {
display: none;
}
.dsh-style-switcher {
display: inline-flex;
align-items: center;
gap: 6px;
flex-shrink: 0;
flex: none;
white-space: nowrap;
}
.dsh-style-trigger.dsh-style-trigger,
.dsh-font-trigger.dsh-font-trigger {
display: inline-flex;
align-items: center;
gap: 6px;
min-height: 28px;
height: 28px;
padding-inline: 8px;
width: auto;
flex-shrink: 0;
font-size: 12px;
line-height: 18px;
font-weight: 500;
color: var(--dsw-alias-label-secondary);
background: var(--dsw-alias-bg-layer-1);
border: var(--dsh-control-border-width, 0.5px) solid var(--dsw-alias-border-l2);
border-radius: var(--dsw-radius-sm, 8px);
cursor: pointer;
white-space: nowrap;
}
.dsh-font-trigger.dsh-font-trigger {
gap: 5px;
padding-inline: 7px;
}
.dsh-font-glyph {
display: inline-flex;
align-items: center;
justify-content: center;
flex: none;
min-width: 16px;
height: 16px;
padding-inline: 3px;
border-radius: var(--dsw-radius-xs, 4px);
background: var(--dsw-alias-state-business-tertiary, rgba(65, 118, 230, 0.12));
color: var(--dsw-alias-state-business-primary, var(--dsw-alias-label-primary));
font-family: var(--dsh-font-display);
font-size: 10.5px;
font-weight: 700;
line-height: 1;
}
.dsh-style-label,
.dsh-font-label {
white-space: nowrap;
line-height: 1;
}
@media (hover: hover) {
.dsh-style-trigger.dsh-style-trigger:hover:not(:disabled),
.dsh-font-trigger.dsh-font-trigger:hover:not(:disabled) {
color: var(--dsw-alias-label-primary);
background: var(--dsw-alias-interactive-bg-hover);
}
}
.dsh-style-swatch {
display: inline-block;
flex: none;
width: 10px;
height: 10px;
border-radius: 50%;
corner-shape: round;
background: var(--dsh-swatch-color, var(--dsw-alias-state-business-primary));
box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.16);
}
[data-dsh-style="pixel8bit"] .dsh-style-swatch {
border-radius: 0px !important;
corner-shape: square;
box-shadow: 1px 1px 0px #1e2826;
}
.dsh-style-fallback-wrap {
position: relative;
display: inline-flex;
}
.dsh-style-fallback-menu {
position: absolute;
inset-block-start: calc(100% + 4px);
inset-inline-end: 0;
z-index: 2147483001;
display: grid;
gap: 2px;
min-width: 186px;
max-height: min(420px, 70dvh);
overflow-y: auto;
overscroll-behavior: contain;
padding: 4px;
background: var(--dsw-alias-bg-overlay, var(--dsw-alias-bg-base));
border: var(--dsh-control-border-width, 0.5px) solid var(--dsw-alias-border-l2);
border-radius: var(--dsw-radius-md, 12px);
box-shadow: var(--dsw-elevation-prominent);
}
.dsh-style-fallback-item {
display: flex;
align-items: center;
justify-content: space-between;
gap: 8px;
width: 100%;
min-height: 28px;
padding: 4px 8px;
border: 0;
border-radius: var(--dsw-radius-xs, 6px);
background: transparent;
color: var(--dsw-alias-label-primary);
font: inherit;
font-size: 12px;
text-align: start;
cursor: pointer;
}
.dsh-style-fallback-item-leading {
display: inline-flex;
align-items: center;
gap: 7px;
min-width: 0;
}
.dsh-style-fallback-item[aria-checked="true"] {
background: var(--dsw-alias-interactive-bg-active);
font-weight: 600;
}
@media (hover: hover) {
.dsh-style-fallback-item:hover:not(:disabled) {
background: var(--dsw-alias-interactive-bg-hover);
}
}
.dsh-fallback-modal-root {
position: fixed;
inset: 0;
z-index: 2147483000;
display: grid;
place-items: center;
padding: 16px;
}
.dsh-fallback-modal-mask {
position: fixed;
inset: 0;
background: rgba(15, 23, 42, 0.36);
}
.dsh-fallback-modal-dialog {
position: relative;
z-index: 1;
max-width: min(560px, calc(100dvw - 32px));
max-height: calc(100dvh - 32px);
overflow: clip;
display: flex;
flex-direction: column;
border-radius: var(--dsw-radius-md, 12px);
background: var(--dsw-alias-bg-layer-1, #f8fafc);
color: var(--dsw-alias-label-primary, #1f232b);
box-shadow: var(--dsw-elevation-prominent);
}
@media (prefers-reduced-motion: reduce) {
:where([data-dsh-style]) :where(button, [role="button"], [data-dsh-card], .dsh-card, [data-dsh-row], .dsh-row, .dsh-row-actions, .dsh-tab-panel, [data-dsh-tab-panel]),
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):has([data-dsh-style]) :where(button, [role="button"]) {
translate: none !important;
scale: none !important;
animation: none !important;
transition-property: background-color, border-color, color, opacity;
transition-duration: 90ms;
}
:where([data-dsh-style], [role="dialog"], [role="alertdialog"], dialog) :where(button, [role="button"], summary) svg,
[data-dsh-style="pixel8bit"] :where([data-dsh-row], .dsh-row)::before,
[data-dsh-style="pixel8bit"] .dsh-pixel-cursor {
animation: none !important;
transition: none !important;
translate: none !important;
scale: none !important;
}
.dsh-tab-indicator {
transition-property: opacity;
transition-duration: 90ms;
}
.dsh-skeleton {
animation: none !important;
background-image: none;
}
:where([role="dialog"], [role="alertdialog"], dialog[open]):where([data-dsh-style], :has([data-dsh-style])) {
scale: none !important;
translate: none !important;
transition-duration: 100ms;
}
}
@media (forced-colors: active) {
:where([data-dsh-style]) :where(button, input, select, textarea, [data-dsh-card], .dsh-card),
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style], :has([data-dsh-style])) {
border: 1px solid ButtonText;
}
:where([data-dsh-style]) [role="tab"][aria-selected="true"]::after {
opacity: 1 !important;
border-block-end: 3px solid Highlight;
}
.dsh-tab-indicator {
background: transparent !important;
border-block-end: 3px solid Highlight;
}
.dsh-split-resizer::before,
.dsh-split-resizer::after {
background: ButtonText;
}
.dsh-skeleton {
border: 1px solid GrayText;
background: Canvas;
}
}
.dshw,
.dshw[data-dsh-style],
[data-dsh-style] .dshw {
--w-canvas: var(--dsw-alias-bg-base, #ffffff);
--w-bg: var(--dsw-alias-bg-layer-1, #f8fafc);
--w-soft: var(--dsw-alias-bg-layer-2, #f1f5f9);
--w-text: var(--dsw-alias-label-primary, #1e293b);
--w-muted: var(--dsw-alias-label-secondary, #64748b);
--w-border: var(--dsw-alias-border-l2, #e2e8f0);
--w-accent: var(--dsw-alias-state-business-primary, #4176e6);
--w-selected: var(--dsw-alias-interactive-bg-active, color-mix(in oklab, var(--w-accent) 11%, var(--w-canvas)));
--w-primary: var(--dsw-alias-button-primary-fill, var(--w-accent));
--w-on-primary: var(--dsw-alias-button-primary-ink, #ffffff);
container-type: inline-size;
container-name: dsh-workbench;
color: var(--w-text);
font-size: 13.5px;
line-height: 1.6;
font-family: var(--dsh-font-body, var(--dsw-font-family, var(--dsh-font-family-content, system-ui, -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif)));
min-width: 0;
max-width: 100%;
box-sizing: border-box;
text-align: start;
}
.dshw *, .dshw *:before, .dshw *:after { box-sizing: border-box; }
.dshw h1, .dshw h2, .dshw h3, .dshw h4, .dshw p { margin: 0; }
.dshw h1 { font-size: 16px; line-height: 1.3; font-family: var(--dsh-font-display, inherit); letter-spacing: var(--dsh-display-tracking, -0.015em); font-weight: var(--dsh-display-weight, 650); }
.dshw .dsh-header-title { font-size: 13.5px; line-height: 1.25; }
.dshw h2 { font-size: 17px; line-height: 1.35; font-family: var(--dsh-font-display, inherit); font-weight: var(--dsh-display-weight, 650); letter-spacing: var(--dsh-display-tracking, -0.01em); overflow-wrap: anywhere; }
.dshw h3, .dshw h4 { font-size: 14.5px; line-height: 1.4; font-family: var(--dsh-font-display, inherit); font-weight: var(--dsh-display-weight, 600); letter-spacing: var(--dsh-display-tracking, normal); }
.dshw a { color: var(--dsw-alias-link, var(--w-accent)); text-underline-offset: 3px; overflow-wrap: anywhere; }
.dshw button, .dshw input, .dshw select, .dshw textarea { font: inherit; color: inherit; max-width: 100%; }
.dshw [role="tab"] { font-family: var(--dsh-font-display, inherit); font-weight: var(--dsh-display-weight, 600); letter-spacing: var(--dsh-display-tracking, normal); }
.dshw input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=range]),
.dshw select,
.dshw textarea {
background: var(--dsw-alias-bg-base, var(--w-canvas));
border: var(--dsh-control-border-width, 1px) solid var(--w-border);
border-radius: var(--dsw-radius-sm, 8px);
padding: 7px 10px;
min-width: 0;
line-height: 1.5;
}
.dshw input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=range]),
.dshw select { min-height: 34px; }
.dshw textarea { resize: vertical; }
.dshw input[type=checkbox], .dshw input[type=radio] {
width: 16px; height: 16px; flex-shrink: 0; accent-color: var(--w-accent);
}
.dshw :focus-visible { outline: 2px solid var(--w-accent); outline-offset: 2px; }
.dshw button:disabled, .dshw input:disabled, .dshw select:disabled, .dshw textarea:disabled {
opacity: 0.48; cursor: not-allowed;
}
.dshw label { font-size: 13px; }
.dshw fieldset { min-width: 0; border: 1px solid var(--w-border); border-radius: var(--dsw-radius-sm, 8px); }
.dshw summary { cursor: pointer; font-weight: 550; list-style: none; display: flex; align-items: center; gap: 8px; }
.dshw summary::-webkit-details-marker { display: none; }
.dshw summary:after {
content: ''; display: block; margin-inline-start: auto; width: 7px; height: 7px;
border-inline-end: 1.75px solid currentColor; border-bottom: 1.75px solid currentColor;
transform: rotate(45deg); flex-shrink: 0;
transition: transform var(--dsh-motion-fast, 140ms) var(--dsh-ease-out, ease);
}
.dshw details[open] > summary:after { transform: rotate(225deg); }
.dshw details > summary + * { margin-top: 12px; }
.dshw pre {
white-space: pre-wrap; overflow-wrap: anywhere;
font: 12px/1.65 var(--ds-font-family-code, ui-monospace, SFMono-Regular, Consolas, monospace);
max-width: 100%; background: var(--w-soft); border-radius: var(--dsw-radius-xs, 6px); padding: 12px;
}
.dshw img, .dshw video, .dshw iframe { max-width: 100%; }
.w-page {
display: flex; flex-direction: column; position: relative;
padding: 0; min-height: 540px; gap: 0;
background: var(--w-canvas);
}
.w-page[data-main="true"] {
height: 100%; min-height: 0;
padding-block-start: var(--dsh-frame-top-clearance, 0px);
padding-inline: 0;
padding-block-end: 0;
overflow: hidden;
}
.w-page[data-main="true"] > .dsh-header {
padding-inline-start: max(14px, calc(10px + var(--dsh-frame-leading-clearance, 0px)));
padding-inline-end: 14px;
}
.dshw :where(.dsh-header-actions, .w-header-actions, [data-dsh-header-actions]) {
display: inline-flex;
align-items: center;
gap: 6px;
flex: none;
white-space: nowrap;
}
.dshw .dsh-header-leading {
min-width: 0;
flex: 1 1 auto;
overflow: hidden;
}
.dshw .dsh-header-tabs {
min-width: 0;
flex: 1 1 auto;
overflow: hidden;
}
.dshw .w-tabs {
min-width: 0;
max-width: 100%;
scrollbar-width: none;
}
.w-page[data-main="true"] > .w-body {
padding-inline: 18px;
padding-block-start: 10px;
}
.w-page.w-embedded, .w-page[data-main="false"] { padding: 0; }
.w-page.w-embedded > .dsh-header { padding-inline: 10px; }
.dshw.w-page, .dshw .w-body, .dshw .w-tab-panel { overflow-x: clip; }
.w-brand, .w-empty-icon {
display: grid; place-items: center; flex: none;
color: var(--w-accent);
background: var(--dsw-alias-interactive-bg-hover-accent, color-mix(in oklab, var(--w-accent) 12%, transparent));
border-radius: var(--dsw-radius-sm, 8px);
}
.w-toolbar, .w-actions {
display: flex; align-items: center; flex-wrap: wrap; gap: 8px; min-width: 0;
}
.w-body, .w-tabs-layout {
display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; min-width: 0;
}
.w-body { overflow: auto; }
:where([data-dsh-style]) [data-plugin-update-footer],
.w-body > [data-plugin-update-footer] {
flex: none;
box-sizing: border-box;
width: 100%;
min-height: 32px;
margin: auto 0 0;
padding: 6px 14px;
display: flex;
flex-wrap: wrap;
align-items: center;
justify-content: space-between;
gap: 6px 12px;
font-size: 12px;
line-height: 1.4;
color: var(--dsw-alias-label-secondary, var(--w-muted));
background: var(--dsw-alias-bg-layer-1, var(--w-bg));
border-block-start: var(--dsh-control-border-width, 0.5px) solid var(--w-border);
}
.w-page[data-main="true"] > .w-body > [data-plugin-update-footer] {
width: calc(100% + 36px);
margin-inline: -18px;
}
:where([data-dsh-style]) [data-plugin-update-footer] :where(button, a) {
min-height: 24px;
font-size: 11.5px;
}
:where([data-dsh-style]) [data-show-updates="false"] [data-plugin-update-footer] {
display: none;
}
.w-tab-panel {
flex: 1 1 auto; min-width: 0; min-height: 0; display: flex; flex-direction: column; overflow: auto;
}
.w-tabs {
display: flex; align-items: center; gap: 2px;
border-block-end: var(--dsh-control-border-width, 0.5px) solid var(--w-border);
flex-shrink: 0; overflow-x: auto; scrollbar-width: thin;
}
.dshw .w-tabs > button,
.dshw[data-dsh-style] .w-tabs > button {
border: 0 !important; box-shadow: none !important; background: transparent;
padding: 5px 10px; white-space: nowrap;
font-size: 12.5px; font-weight: 550; cursor: pointer;
color: var(--w-muted); display: inline-flex; align-items: center; gap: 5px;
border-radius: var(--dsw-radius-xs, 6px);
min-height: 30px;
}
.dshw .w-tabs > button:hover:not(:disabled),
.dshw[data-dsh-style] .w-tabs > button:hover:not(:disabled) {
color: var(--w-text); background: var(--dsw-alias-interactive-bg-hover, var(--w-soft));
}
.dshw .w-tabs > button[aria-selected="true"],
.dshw[data-dsh-style] .w-tabs > button[aria-selected="true"] {
color: var(--w-accent);
}
.w-count, .w-tag {
font-size: 11px; line-height: 1.4; display: inline-flex; align-items: center;
flex-shrink: 0; background: var(--w-soft); border-radius: var(--dsw-radius-xs, 6px);
padding: 1px 6px; color: var(--w-muted);
}
.w-tabs [aria-selected="true"] .w-count, .w-selected .w-tag {
color: var(--w-accent); background: var(--w-selected);
}
.dshw .w-button {
display: inline-flex; justify-content: center; align-items: center; gap: 5px;
background: var(--dsw-alias-bg-base, var(--w-canvas));
border: var(--dsh-control-border-width, 1px) solid var(--w-border);
border-radius: var(--dsw-radius-sm, 8px);
padding: 5px 10px; min-height: 28px; height: auto;
line-height: 1.35; font-size: 12.5px; font-weight: 500;
cursor: pointer; text-decoration: none; white-space: nowrap;
box-shadow: var(--dsh-button-shadow, none);
}
.dshw .w-button:not(:disabled):hover {
background: var(--dsw-alias-interactive-bg-hover, var(--w-soft));
}
.dshw .w-button.w-primary {
background: var(--w-primary); border-color: var(--w-primary); color: var(--w-on-primary);
}
.dshw .w-button.w-primary:not(:disabled):hover {
background: var(--dsw-alias-button-primary-hover, var(--w-primary));
}
.dshw .w-button.w-ghost {
background: transparent; border-color: transparent; box-shadow: none;
}
.dshw .w-button.w-ghost:not(:disabled):hover {
background: var(--dsw-alias-interactive-bg-hover, var(--w-soft));
}
.dshw .w-button.w-danger {
color: var(--dsw-alias-state-error-primary, #c83240);
}
.dshw .w-button.w-danger:not(:disabled):hover {
background: var(--dsw-alias-interactive-bg-hover-danger, rgba(200, 50, 64, 0.1));
}
.dshw .w-icon-button {
width: 28px; min-width: 28px; padding-inline: 0; flex: none;
}
.dshw .w-button svg, .dshw .dsh-fallback-btn-icon {
display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.dshw .w-input {
display: inline-flex; align-items: center; gap: 8px;
width: 100%; min-width: 0; min-height: 34px; padding-inline: 10px;
background: var(--dsw-alias-bg-base, var(--w-canvas));
border: var(--dsh-control-border-width, 1px) solid var(--w-border);
border-radius: var(--dsw-radius-sm, 8px);
box-shadow: none;
}
.dshw .w-input:focus-within {
border-color: var(--w-accent);
outline: 2px solid color-mix(in oklab, var(--w-accent) 22%, transparent);
outline-offset: 1px;
}
.dshw .w-input > span { display: inline-flex; align-items: center; color: var(--w-muted); flex: none; }
.dshw .w-input > input {
border: 0 !important; background: transparent !important;
padding: 5px 0 !important; min-height: 30px !important;
width: 100%; min-width: 0; font: inherit; color: var(--w-text);
outline: none !important; box-shadow: none !important;
}
.dshw .w-checkbox {
display: inline-flex; align-items: flex-start; gap: 8px;
min-width: 0; cursor: pointer; color: inherit;
}
.dshw .w-checkbox input { margin-block-start: 2px; accent-color: var(--w-accent); }
.dshw .w-checkbox-icon > span {
position: absolute; inline-size: 1px; block-size: 1px;
overflow: hidden; clip-path: inset(50%); white-space: nowrap;
}
.dshw .w-switch-row {
display: inline-flex; align-items: center; gap: 10px; min-width: 0;
}
.dshw .w-switch-text { font-size: 12.5px; color: var(--w-text); }
.dshw button[role="switch"].w-switch {
position: relative; display: inline-flex; align-items: center; flex: none;
width: 38px; height: 22px; min-height: 22px; padding: 2px;
border-radius: 999px; border: 1px solid var(--w-border-strong, var(--w-border));
background: var(--dsw-alias-bg-layer-2, #dfe4ec);
cursor: pointer; transition: background-color 140ms ease, border-color 140ms ease;
}
.dshw button[role="switch"].w-switch > span {
display: block; width: 16px; height: 16px; border-radius: 50%;
background: #ffffff; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.22);
translate: 0px 0px;
}
.dshw button[role="switch"].w-switch[aria-checked="true"] {
background: var(--w-primary); border-color: var(--w-primary);
}
.dshw button[role="switch"].w-switch[aria-checked="true"] > span {
translate: 16px 0px;
}
@media (prefers-reduced-motion: no-preference) {
.dshw button[role="switch"].w-switch > span { transition: translate 160ms var(--dsh-ease-out, ease); }
}
.dshw .w-menu { display: inline-block; min-width: 0; }
.dshw .w-menu-button { width: 100%; justify-content: space-between; gap: 8px; text-align: start; }
.dshw .w-menu-value { display: block; min-width: 0; overflow-wrap: anywhere; }
.w-muted { color: var(--w-muted); font-size: 12px; line-height: 1.6; }
.w-section { padding: 18px 0; border-block-end: var(--dsh-control-border-width, 0.5px) solid var(--w-border); min-width: 0; }
.w-section > h3 { margin-block-end: 10px; }
.w-section > p + p { margin-block-start: 8px; }
.w-fields { display: grid; gap: 14px; min-width: 0; }
.w-field { display: grid; gap: 6px; min-width: 0; }
.w-field > input, .w-field > select, .w-field > textarea { width: 100%; }
.w-status {
display: flex; align-items: flex-start; gap: 8px;
padding: 8px 12px; margin: 8px 0;
border: var(--dsh-control-border-width, 0.5px) solid var(--w-border);
border-radius: var(--dsw-radius-sm, 8px);
background: var(--w-bg); font-size: 12.5px; line-height: 1.5;
overflow-wrap: anywhere; flex-shrink: 0;
}
.w-status > svg { flex-shrink: 0; margin-block-start: 2px; }
.w-status-text { min-width: 0; flex: 1; }
.w-status-error {
background: var(--dsw-alias-interactive-bg-hover-danger, color-mix(in oklab, var(--dsw-alias-state-error-primary, #c83240) 10%, var(--w-canvas)));
color: var(--dsw-alias-state-error-primary, #c83240);
}
.w-status-success { color: var(--dsw-alias-state-success-primary, #24794a); }
.w-status-warn {
background: var(--dsw-alias-state-warn-tertiary, var(--w-soft));
color: var(--dsw-alias-state-warn-label, var(--dsw-alias-state-warn-primary, #8a5a00));
}
.w-empty {
display: flex; flex-direction: column; align-items: center; justify-content: center;
text-align: center; gap: 10px; width: 100%; max-width: 560px;
padding: 40px 20px; margin: auto; min-height: 240px; overflow-wrap: anywhere;
}
.w-empty-icon { width: 44px; height: 44px; margin-block-end: 4px; }
.w-empty h2 { font-size: 16px; }
.w-empty .w-muted { font-size: 13px; max-width: 46ch; }
.w-empty .w-toolbar { justify-content: center; margin-block-start: 4px; }
.w-split {
display: grid; grid-template-columns: minmax(240px, var(--w-list-width)) minmax(0, 1fr);
min-height: 460px; flex: 1; min-width: 0;
}
.w-split.dsh-split-pane {
display: flex;
}
.w-master { min-width: 0; border-inline-end: var(--dsh-control-border-width, 0.5px) solid var(--w-border); overflow: auto; padding-block-end: 20px; }
.w-split.dsh-split-pane > .w-master { border-inline-end: 0; }
.w-detail { min-width: 0; padding: 20px 22px; overflow: auto; overflow-wrap: anywhere; display: flex; flex-direction: column; }
.w-master-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 14px; }
.w-row {
display: flex; gap: 0; min-width: 0; position: relative; align-items: stretch;
border-block-end: var(--dsh-control-border-width, 0.5px) solid var(--w-border);
border-inline-start: 3px solid transparent;
border-radius: var(--dsw-radius-xs, 6px);
}
.w-row-select { display: flex; align-items: flex-start; padding: 16px 0 0 12px; }
.dshw .w-row-button {
display: flex; flex-direction: column; align-items: stretch; gap: 4px;
text-align: start; flex: 1 1 auto; padding: 13px 14px;
border: 0; background: transparent; color: inherit; min-width: 0;
cursor: pointer; line-height: 1.45;
}
.w-row-head { display: flex; align-items: flex-start; gap: 10px; justify-content: space-between; min-width: 0; }
.w-row-title-wrap { display: inline-flex; align-items: center; gap: 6px; min-width: 0; }
.w-row-head strong { font-size: 14px; line-height: 1.45; font-weight: 600; overflow-wrap: anywhere; }
.w-row-meta, .w-row-description { color: var(--w-muted); font-size: 12px; line-height: 1.5; overflow-wrap: anywhere; }
.w-row-description { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.w-selected { background: var(--w-selected); border-inline-start-color: var(--w-accent); }
.w-back { display: none !important; }
.w-dialog-modal { padding: 0 !important; border: 0 !important; background: transparent !important; }
.w-dialog {
width: min(620px, 100%); max-height: min(85dvh, 100%);
display: flex; flex-direction: column; min-height: 0;
background: var(--dsw-alias-bg-overlay, var(--w-canvas));
color: var(--w-text);
border: var(--dsh-control-border-width, 0.5px) solid var(--w-border);
border-radius: var(--dsw-radius-md, 12px);
box-shadow: var(--dsw-elevation-prominent, 0 18px 50px rgba(15, 23, 42, 0.16));
overflow: clip;
}
.w-dialog-header, .w-dialog-footer {
display: flex; justify-content: space-between; align-items: center; gap: 12px;
padding: 14px 18px; background: var(--dsw-alias-bg-base, var(--w-canvas)); flex-shrink: 0;
}
.w-dialog-header { border-block-end: var(--dsh-control-border-width, 0.5px) solid var(--w-border); }
.w-dialog-header > h2 { font-size: 16px; line-height: 1.4; }
.w-dialog-body { overflow: auto; overscroll-behavior: contain; padding: 18px; min-height: 0; }
.w-dialog-footer { justify-content: flex-end; flex-wrap: wrap; border-block-start: var(--dsh-control-border-width, 0.5px) solid var(--w-border); }
.w-preview-empty {
display: flex; flex-direction: column; justify-content: center; align-items: center;
text-align: center; gap: 10px; aspect-ratio: 16 / 9; min-height: 180px;
background: var(--w-bg);
border: var(--dsh-control-border-width, 1px) solid var(--w-border);
border-radius: var(--dsw-radius-md, 12px);
padding: 24px; color: var(--w-muted);
}
@container dsh-workbench (max-width: 1080px) {
.dsh-header { flex-wrap: wrap; }
.dsh-header-leading { flex-wrap: wrap; gap: 6px 10px; }
.dsh-header .w-header-actions { flex-wrap: wrap; }
.w-split { grid-template-columns: minmax(240px, 34%) minmax(0, 1fr); }
}
@container dsh-workbench (max-width: 760px) {
.dsh-split-pane { flex-direction: column; overflow-y: auto; }
.dsh-split-leading { width: 100% !important; max-width: 100%; flex: none; }
.dsh-split-resizer { display: none; }
.w-split { display: block; min-height: 360px; }
.w-split[data-selected="false"] > .w-detail { display: none; }
.w-split[data-selected="true"] > .w-master { display: none; }
.w-master { border-inline-end: 0; }
.w-detail { padding: 18px 0; }
.w-back { display: inline-flex !important; align-self: flex-start; margin: 0 0 14px !important; }
.w-dialog-header, .w-dialog-body, .w-dialog-footer { padding: 14px; }
}
@media (max-width: 700px) {
.w-page[data-main="true"] > .w-body {
padding-inline: 12px;
}
.w-page[data-main="true"] > .w-body > [data-plugin-update-footer] {
width: calc(100% + 24px);
margin-inline: -12px;
}
.w-dialog { width: 100%; }
}
.dshw .w-tour-trigger {
font-weight: 600;
}
.w-tour-layer {
--tour-accent: var(--dsw-alias-state-business-primary, #4176e6);
--tour-bg: var(--dsw-alias-bg-overlay, var(--dsw-alias-bg-base, #ffffff));
--tour-ink: var(--dsw-alias-label-primary, #1e293b);
--tour-muted: var(--dsw-alias-label-secondary, #64748b);
--tour-border: var(--dsw-alias-border-l2, #e2e8f0);
--tour-radius: var(--dsw-radius-md, 12px);
container-type: normal;
position: fixed;
inset: 0;
width: 100%;
height: 100%;
max-width: none;
max-height: none;
margin: 0;
padding: 0;
border: 0 !important;
box-shadow: none !important;
background: transparent !important;
overflow: visible;
pointer-events: none;
z-index: 2147483000;
color: var(--tour-ink);
font-size: 13px;
line-height: 1.55;
font-family: var(--dsh-font-body, var(--dsw-font-family, var(--dsh-font-family-content, system-ui, -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif)));
}
.w-tour-layer[popover]:is(:popover-open, .\\:popover-open) {
display: block;
}
.w-tour-layer[data-dsh-style="pixel8bit"] {
--tour-radius: 0px;
}
.w-tour-spotlight {
position: fixed;
pointer-events: none;
border-radius: calc(var(--tour-radius) * 0.75 + 2px);
box-shadow:
0 0 0 2px var(--tour-accent),
0 0 0 5px color-mix(in oklab, var(--tour-accent) 22%, transparent),
0 0 0 9999px rgba(15, 23, 42, 0.26);
}
.w-tour-layer[data-dsh-style="pixel8bit"] .w-tour-spotlight {
border-radius: 0px;
}
.w-tour-backdrop-fallback {
position: fixed;
inset: 0;
pointer-events: none;
background: rgba(15, 23, 42, 0.24);
}
.w-tour-card {
position: fixed;
inset: auto;
margin: 0;
width: min(328px, calc(100vw - 24px));
max-block-size: calc(100dvh - 24px);
padding: 13px 15px 12px;
border: 1px solid var(--tour-border);
border-radius: var(--tour-radius);
background: var(--tour-bg);
color: var(--tour-ink);
box-shadow: var(--dsw-elevation-prominent, 0 16px 40px rgba(15, 23, 42, 0.18));
pointer-events: auto;
display: flex;
flex-direction: column;
gap: 8px;
}
.w-tour-layer[data-dsh-style="pixel8bit"] .w-tour-card {
border: 2px solid #1e2826;
border-radius: 0px;
box-shadow: 4px 4px 0px #1e2826;
}
.w-tour-arrow {
position: absolute;
width: 10px;
height: 10px;
background: var(--tour-bg);
transform: rotate(45deg);
pointer-events: none;
}
.w-tour-card[data-side="bottom"] > .w-tour-arrow {
top: -6px;
left: calc(var(--arrow-x, 28px) - 5px);
border-top: 1px solid var(--tour-border);
border-left: 1px solid var(--tour-border);
}
.w-tour-card[data-side="top"] > .w-tour-arrow {
bottom: -6px;
left: calc(var(--arrow-x, 28px) - 5px);
border-bottom: 1px solid var(--tour-border);
border-right: 1px solid var(--tour-border);
}
.w-tour-card[data-side="right"] > .w-tour-arrow {
left: -6px;
top: calc(var(--arrow-y, 24px) - 5px);
border-bottom: 1px solid var(--tour-border);
border-left: 1px solid var(--tour-border);
}
.w-tour-card[data-side="left"] > .w-tour-arrow {
right: -6px;
top: calc(var(--arrow-y, 24px) - 5px);
border-top: 1px solid var(--tour-border);
border-right: 1px solid var(--tour-border);
}
.w-tour-card[data-side="center"] > .w-tour-arrow {
display: none;
}
.w-tour-layer[data-dsh-style="pixel8bit"] .w-tour-card[data-side="bottom"] > .w-tour-arrow {
top: -7px;
border-top-width: 2px;
border-left-width: 2px;
}
.w-tour-layer[data-dsh-style="pixel8bit"] .w-tour-card[data-side="top"] > .w-tour-arrow {
bottom: -7px;
border-bottom-width: 2px;
border-right-width: 2px;
}
.w-tour-layer[data-dsh-style="pixel8bit"] .w-tour-card[data-side="right"] > .w-tour-arrow {
left: -7px;
border-bottom-width: 2px;
border-left-width: 2px;
}
.w-tour-layer[data-dsh-style="pixel8bit"] .w-tour-card[data-side="left"] > .w-tour-arrow {
right: -7px;
border-top-width: 2px;
border-right-width: 2px;
}
.w-tour-head {
display: flex;
align-items: center;
justify-content: space-between;
gap: 8px;
}
.w-tour-step-meta {
display: inline-flex;
align-items: center;
gap: 8px;
}
.w-tour-step-badge {
display: inline-flex;
align-items: center;
padding: 1px 7px;
border-radius: 999px;
font-size: 11px;
font-weight: 650;
font-variant-numeric: tabular-nums;
background: color-mix(in oklab, var(--tour-accent) 14%, transparent);
color: var(--tour-accent);
}
.w-tour-dots {
display: inline-flex;
align-items: center;
gap: 4px;
}
.w-tour-dot {
width: 6px;
height: 6px;
border-radius: 999px;
background: var(--tour-border);
}
.w-tour-dot[data-active="true"] {
width: 14px;
background: var(--tour-accent);
}
.w-tour-layer[data-dsh-style="pixel8bit"] .w-tour-step-badge,
.w-tour-layer[data-dsh-style="pixel8bit"] .w-tour-dot {
border-radius: 0px;
}
.w-tour-skip {
min-block-size: 24px;
min-inline-size: 24px;
padding: 2px 6px;
border: 0 !important;
box-shadow: none !important;
border-radius: var(--dsw-radius-xs, 6px);
background: transparent;
color: var(--tour-muted);
font: inherit;
font-size: 11.5px;
cursor: pointer;
}
.w-tour-skip:hover {
color: var(--tour-ink);
background: var(--dsw-alias-interactive-bg-hover, rgba(15, 23, 42, 0.05));
}
.dshw .w-tour-title,
.w-tour-title {
margin: 0;
font-size: 14px;
line-height: 1.38;
font-weight: 650;
}
.dshw .w-tour-desc,
.w-tour-desc {
margin: 0;
font-size: 12.5px;
line-height: 1.55;
color: var(--tour-muted);
}
.w-tour-inline-action {
display: flex;
flex-wrap: wrap;
align-items: center;
gap: 6px;
padding-block-start: 2px;
}
.w-tour-footer {
display: flex;
align-items: center;
justify-content: space-between;
gap: 8px;
margin-block-start: 2px;
padding-block-start: 8px;
border-block-start: 0.5px solid var(--tour-border);
}
.w-tour-nav {
display: inline-flex;
align-items: center;
gap: 6px;
margin-inline-start: auto;
}
@media (pointer: coarse) {
.w-tour-skip {
min-block-size: 32px;
padding: 4px 10px;
}
}
@media (prefers-reduced-motion: no-preference) {
.w-tour-spotlight {
transition:
top 0.24s cubic-bezier(0.22, 1, 0.36, 1),
left 0.24s cubic-bezier(0.22, 1, 0.36, 1),
width 0.24s cubic-bezier(0.22, 1, 0.36, 1),
height 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}
.w-tour-card {
transition: top 0.22s cubic-bezier(0.22, 1, 0.36, 1), left 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}
.w-tour-dot {
transition: width 0.18s ease, background-color 0.18s ease;
}
}
@media (prefers-reduced-motion: reduce) {
.w-tour-spotlight,
.w-tour-card,
.w-tour-dot {
transition: none !important;
}
:where([data-dsh-style]) :where(button, [role="button"], a.w-button, [data-dsh-card], .dsh-card, [data-dsh-row], .dsh-row, .dsh-row-actions, .dsh-tab-panel, [data-dsh-tab-panel]),
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):has([data-dsh-style]) :where(button, [role="button"], a.w-button) {
translate: none !important;
scale: none !important;
animation: none !important;
transition-property: background-color, border-color, color, opacity;
transition-duration: 90ms;
}
:where([data-dsh-style], [role="dialog"], [role="alertdialog"], dialog) :where(button, [role="button"], summary, a.w-button) svg,
[data-dsh-style="pixel8bit"] :where([data-dsh-row], .dsh-row)::before,
[data-dsh-style="pixel8bit"] .dsh-pixel-cursor {
animation: none !important;
transition: none !important;
translate: none !important;
scale: none !important;
rotate: none !important;
}
.dsh-tab-indicator {
transition-property: opacity;
transition-duration: 90ms;
}
.dsh-skeleton {
animation: none !important;
background-image: none;
}
:where([role="dialog"], [role="alertdialog"], dialog[open]):where([data-dsh-style], :has([data-dsh-style])) {
scale: none !important;
translate: none !important;
transition-duration: 100ms;
}
.dshw .w-tab-panel,
.dshw .ppt-inspector-panel:not([hidden]) {
translate: none !important;
transition: opacity 90ms linear;
}
}
@media (forced-colors: active) {
:where([data-dsh-style]) :where(button, input, select, textarea, [data-dsh-card], .dsh-card),
:where([role="dialog"], [role="alertdialog"], [role="menu"], dialog):where([data-dsh-style], :has([data-dsh-style])) {
border: 1px solid ButtonText;
}
:where([data-dsh-style]) [role="tab"][aria-selected="true"]::after {
opacity: 1 !important;
border-block-end: 3px solid Highlight;
}
.dsh-tab-indicator {
background: transparent !important;
border-block-end: 3px solid Highlight;
}
.dsh-split-resizer::before,
.dsh-split-resizer::after {
background: ButtonText;
}
.dsh-skeleton {
border: 1px solid GrayText;
background: Canvas;
}
}
`;

  const DSH_STYLE_NODE_ID = 'dsh-workbench-ui-v3-styles';

  function ensureStyleNode(id, cssText) {
    if (typeof document === 'undefined' || !document.head || typeof document.getElementById !== 'function') return false;
    let node = document.getElementById(id);
    if (!node || (typeof node.isConnected === 'boolean' && !node.isConnected)) {
      node = document.createElement('style');
      node.id = id;
      node.textContent = cssText;
      if (typeof document.head.appendChild === 'function') document.head.appendChild(node);
      else if (typeof document.head.append === 'function') document.head.append(node);
      else return false;
    } else if (node.textContent !== cssText) {
      node.textContent = cssText;
    }
    return true;
  }

  function Styles({ id = DSH_STYLE_NODE_ID, cssText = styles } = {}) {
    const mounted = ensureStyleNode(id, cssText);
    useLayoutHook(() => { ensureStyleNode(id, cssText); }, [id, cssText]);
    return mounted ? null : h('style', null, cssText);
  }

  return {
    Icon,
    Button,
    IconButton,
    Input,
    Checkbox,
    ChoiceMenu,
    StyleSwitcher,
    FontSwitcher,
    CoachmarkTour,
    computeTourLayout,
    Page,
    TabBar,
    Tabs,
    Status,
    Empty,
    Split,
    SplitResizer,
    DshSplitResizer: SplitResizer,
    Skeleton,
    DshSkeleton: Skeleton,
    Row,
    Search,
    Switch,
    Dialog,
    Styles,
    register,
    styles,
    DSH_STYLES,
    DSH_STYLE_STORAGE_KEY,
    DSH_STYLE_EVENT,
    DSH_DEFAULT_STYLE,
    normalizeDshStyle,
    getDshStylePreset,
    readDshStyle,
    writeDshStyle,
    subscribeDshStyle,
    useDshStyle,
    DSH_FONTS,
    DSH_FONT_STORAGE_KEY,
    DSH_FONT_EVENT,
    DSH_DEFAULT_FONT,
    normalizeDshFont,
    getDshFontPreset,
    readDshFont,
    writeDshFont,
    subscribeDshFont,
    useDshFont,
    syncPortaledOverlays,
    syncPortaledFont,
    useSlidingTabIndicator,
    useResizableSplit,
    createOverlaySyncRef,
    resolveHostPrimitives,
  };
}

// Editable browser entry for dsh-blender-studio. Build with:
//   node scripts/build-client.mjs && node scripts/build-updates.mjs
window.__ModuleLoader__.load(__stardustUpdatesWrap({
  id: 'dsh-blender-studio',
  factory: require => {
    const React = require('react');
    const { useState, useEffect, useRef } = React;
    const h = React.createElement;
    const W = createWorkbenchUI(React, require);
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
    if (cat === 'horology') return t('精密制表', 'Horology');
    if (cat === 'precision') return t('精密机械', 'Precision');
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
.bl-library{max-width:1120px;padding:6px 0 24px;min-width:0}
.bl-exemplars-strip{display:flex;flex-direction:column;gap:10px;padding:12px 14px;margin:4px 0 12px;border:var(--dsh-control-border-width,1px) solid var(--w-border);border-radius:var(--dsw-radius-md,12px);background:var(--dsw-alias-settings-card-fill,var(--w-canvas))}
.bl-exemplars-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.bl-exemplars-title-wrap{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}
.bl-exemplars-badge{font-family:var(--dsh-font-mono,ui-monospace,monospace);font-size:10.5px;font-weight:700;background:color-mix(in oklab,#10b981 14%,var(--w-bg));border-color:color-mix(in oklab,#10b981 36%,var(--w-border));color:#047857}
[data-theme="dark"] .bl-exemplars-badge{color:#6ee7b7}
.bl-exemplars-sub{font-size:12px}
.bl-exemplars-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(188px,1fr));gap:9px}
.bl-exemplar-card{display:flex;flex-direction:column;gap:6px;padding:11px 12px;border-radius:var(--dsw-radius-sm,10px);border:var(--dsh-control-border-width,1px) solid var(--w-border);background:var(--w-bg);min-width:0}
.bl-exemplar-tags{display:flex;align-items:center;justify-content:space-between;gap:4px;flex-wrap:wrap}
.bl-exemplar-cat{font-size:10px;font-weight:700}
.bl-exemplar-title{font-size:12.5px;line-height:1.35;color:var(--w-text)}
.bl-exemplar-desc{margin:0;font-size:11.5px;line-height:1.45;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;max-height:calc(1.45em * 3)}
.bl-exemplar-foot{display:flex;justify-content:flex-end;margin-top:auto;padding-top:6px}
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
  // Use the cofactor matrix (proportional to inverse-transpose of the upper-left 3x3)
  // so normals remain perpendicular to surfaces even under non-uniform or mirrored scale.
  const a00 = m[0], a01 = m[4], a02 = m[8];
  const a10 = m[1], a11 = m[5], a12 = m[9];
  const a20 = m[2], a21 = m[6], a22 = m[10];
  const c00 = a11 * a22 - a12 * a21;
  const c01 = a12 * a20 - a10 * a22;
  const c02 = a10 * a21 - a11 * a20;
  const c10 = a02 * a21 - a01 * a22;
  const c11 = a00 * a22 - a02 * a20;
  const c12 = a01 * a20 - a00 * a21;
  const c20 = a01 * a12 - a02 * a11;
  const c21 = a02 * a10 - a00 * a12;
  const c22 = a00 * a11 - a01 * a10;
  const det = a00 * c00 + a01 * c01 + a02 * c02;
  let gx, gy, gz;
  if (Math.abs(det) > 1e-10) {
    const sign = det < 0 ? -1 : 1;
    gx = (c00 * nx + c01 * ny + c02 * nz) * sign;
    gy = (c10 * nx + c11 * ny + c12 * nz) * sign;
    gz = (c20 * nx + c21 * ny + c22 * nz) * sign;
  } else {
    gx = a00 * nx + a01 * ny + a02 * nz;
    gy = a10 * nx + a11 * ny + a12 * nz;
    gz = a20 * nx + a21 * ny + a22 * nz;
  }
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
  const maxTriangles = Math.max(100, Math.min(16000, Number(options.maxTriangles) || 9000));
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

  function materialProps(matIdx) {
    const mat = matIdx !== undefined ? materials[matIdx] : null;
    const matName = String(mat?.name || '');
    const pbr = mat?.pbrMetallicRoughness;
    const factor = pbr?.baseColorFactor;
    const isNamedGlassFallback = !pbr && /(?:glass|crystal|sapphire|canopy|windshield|lens|visor)/i.test(matName);
    const toSrgb = c => Math.max(20, Math.min(248, Math.round(Math.pow(Math.max(0, Math.min(1, Number(c) || 0)), 1 / 2.2) * 255)));
    const rgb = isNamedGlassFallback
      ? [208, 228, 248]
      : Array.isArray(factor) && factor.length >= 3
      ? [toSrgb(factor[0]), toSrgb(factor[1]), toSrgb(factor[2])]
      : [192, 204, 220];
    // Per glTF 2.0 spec, omitted metallicFactor on a pbrMetallicRoughness material defaults to 1.0
    // (Blender's glTF exporter omits metallicFactor when Metallic == 1.0).
    const metallic = isNamedGlassFallback
      ? 0.04
      : pbr && typeof pbr.metallicFactor === 'number' && Number.isFinite(pbr.metallicFactor)
      ? Math.max(0, Math.min(1, pbr.metallicFactor))
      : pbr && !pbr.metallicRoughnessTexture
      ? 1.0
      : 0.12;
    const roughness = isNamedGlassFallback
      ? 0.06
      : pbr && typeof pbr.roughnessFactor === 'number' && Number.isFinite(pbr.roughnessFactor)
      ? Math.max(0.04, Math.min(1, pbr.roughnessFactor))
      : 0.52;
    const em = mat?.emissiveFactor;
    const emissive =
      Array.isArray(em) && em.length >= 3 && (Number(em[0]) > 0.02 || Number(em[1]) > 0.02 || Number(em[2]) > 0.02)
        ? [
            Math.min(255, Math.round(Math.pow(Math.max(0, Math.min(1, Number(em[0]) || 0)), 1 / 2.2) * 255)),
            Math.min(255, Math.round(Math.pow(Math.max(0, Math.min(1, Number(em[1]) || 0)), 1 / 2.2) * 255)),
            Math.min(255, Math.round(Math.pow(Math.max(0, Math.min(1, Number(em[2]) || 0)), 1 / 2.2) * 255)),
          ]
        : null;
    const baseAlpha =
      Array.isArray(factor) && factor.length >= 4 && Number.isFinite(Number(factor[3]))
        ? Math.max(0, Math.min(1, Number(factor[3])))
        : 1;
    const transmission = Number(mat?.extensions?.KHR_materials_transmission?.transmissionFactor) || 0;
    let alpha = 1.0;
    if (isNamedGlassFallback) {
      alpha = 0.16;
    } else if (mat?.alphaMode === 'BLEND' && baseAlpha < 0.96) {
      alpha = Math.max(0.14, Math.min(0.88, baseAlpha));
    } else if (transmission > 0.25) {
      alpha = emissive
        ? Math.max(0.58, Math.min(0.92, 1 - transmission * 0.35))
        : Math.max(0.16, Math.min(0.45, 1 - transmission * 0.78));
    }
    const transparent = alpha < 0.94;
    return {
      rgb,
      metallic,
      roughness,
      emissive,
      alpha,
      transparent,
      layer: transparent ? 3 : 2,
      matKey: matIdx !== undefined && matIdx !== null ? Number(matIdx) : -1,
    };
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

  const backdropRe = /^(?:Studio_|Backdrop_|Stage_Floor|Softbox_|Cyclorama|Ground_Plane|Abstract_Floor|Logo_Floor|GP_Paper_Card|Pavilion_Ground|Pavilion_Water)/i;
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

  // Pass 1: gather world-transformed triangles (supports TRIANGLES=4, TRIANGLE_STRIP=5, TRIANGLE_FAN=6) and exact bounds
  const rawTris = [];
  for (const inst of activeInstances) {
    const mesh = meshes[inst.meshIndex];
    if (!mesh || !Array.isArray(mesh.primitives)) continue;
    const instStartIdx = rawTris.length;
    let sumAx = 0, sumAy = 0, sumAz = 0;
    let sumArea = 0;
    let signedVol = 0;
    let refPt = null;
    for (const prim of mesh.primitives) {
      const primMode = prim.mode === undefined ? 4 : prim.mode;
      if (primMode !== 4 && primMode !== 5 && primMode !== 6) continue;
      const posIdx = prim.attributes?.POSITION;
      if (posIdx === undefined) continue;
      const posArr = readVec3(posIdx);
      if (!posArr || posArr.length < 9) continue;
      const vCount = Math.floor(posArr.length / 3);
      vertexCount += vCount;
      const normArr = prim.attributes?.NORMAL !== undefined ? readVec3(prim.attributes.NORMAL) : null;
      const idxArr = prim.indices !== undefined ? readIndices(prim.indices) : null;
      const mat = materialProps(prim.material);

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

      const elemCount = idxArr ? idxArr.length : vCount;
      const triCount =
        primMode === 4
          ? Math.floor(elemCount / 3)
          : elemCount >= 3
          ? elemCount - 2
          : 0;

      for (let t = 0; t < triCount; t++) {
        let i0, i1, i2;
        if (primMode === 4) {
          i0 = idxArr ? idxArr[t * 3] : t * 3;
          i1 = idxArr ? idxArr[t * 3 + 1] : t * 3 + 1;
          i2 = idxArr ? idxArr[t * 3 + 2] : t * 3 + 2;
        } else if (primMode === 5) {
          // TRIANGLE_STRIP: alternate winding on odd triangles to keep consistent outward normals
          const a = idxArr ? idxArr[t] : t;
          const b = idxArr ? idxArr[t + 1] : t + 1;
          const c = idxArr ? idxArr[t + 2] : t + 2;
          if ((t & 1) === 0) {
            i0 = a; i1 = b; i2 = c;
          } else {
            i0 = b; i1 = a; i2 = c;
          }
        } else {
          // TRIANGLE_FAN
          i0 = idxArr ? idxArr[0] : 0;
          i1 = idxArr ? idxArr[t + 1] : t + 1;
          i2 = idxArr ? idxArr[t + 2] : t + 2;
        }
        if (i0 === i1 || i1 === i2 || i2 === i0) continue;
        const p0 = transformedPts[i0];
        const p1 = transformedPts[i1];
        const p2 = transformedPts[i2];
        if (!p0 || !p1 || !p2) continue;
        totalTriangles += 1;

        const ux = p1[0] - p0[0];
        const uy = p1[1] - p0[1];
        const uz = p1[2] - p0[2];
        const vx = p2[0] - p0[0];
        const vy = p2[1] - p0[1];
        const vz = p2[2] - p0[2];
        const gnx = uy * vz - uz * vy;
        const gny = uz * vx - ux * vz;
        const gnz = ux * vy - uy * vx;
        const gnLen = Math.hypot(gnx, gny, gnz) || 1;
        const gNormal = [gnx / gnLen, gny / gnLen, gnz / gnLen];

        if (!refPt) refPt = p0;
        const q0x = p0[0] - refPt[0], q0y = p0[1] - refPt[1], q0z = p0[2] - refPt[2];
        const q1x = p1[0] - refPt[0], q1y = p1[1] - refPt[1], q1z = p1[2] - refPt[2];
        const q2x = p2[0] - refPt[0], q2y = p2[1] - refPt[1], q2z = p2[2] - refPt[2];
        sumAx += gnx; sumAy += gny; sumAz += gnz;
        sumArea += gnLen;
        signedVol += (q0x * (q1y * q2z - q1z * q2y) + q0y * (q1z * q2x - q1x * q2z) + q0z * (q1x * q2y - q1y * q2x)) / 6;

        let normal;
        if (normArr && i0 * 3 + 2 < normArr.length && i1 * 3 + 2 < normArr.length && i2 * 3 + 2 < normArr.length) {
          const anx = (normArr[i0 * 3] + normArr[i1 * 3] + normArr[i2 * 3]) / 3;
          const any = (normArr[i0 * 3 + 1] + normArr[i1 * 3 + 1] + normArr[i2 * 3 + 1]) / 3;
          const anz = (normArr[i0 * 3 + 2] + normArr[i1 * 3 + 2] + normArr[i2 * 3 + 2]) / 3;
          normal = transformNormalGltfToBlenderZUp(inst.matrix, anx, any, anz);
        } else {
          normal = gNormal;
        }
        rawTris.push({
          p0,
          p1,
          p2,
          normal,
          gNormal,
          cullDir: 0,
          rgb: mat.rgb,
          metallic: mat.metallic,
          roughness: mat.roughness,
          emissive: mat.emissive,
          alpha: mat.alpha,
          transparent: mat.transparent,
          layer: mat.layer,
          matKey: mat.matKey,
        });
      }
    }
    // Divergence theorem: a closed solid mesh satisfies sum(areaVec) == 0 and signedVol != 0.
    // Mark closed solid instances for safe geometric backface culling (open planes stay double-sided).
    const instTriCount = rawTris.length - instStartIdx;
    if (instTriCount >= 4 && sumArea > 1e-8) {
      const closureRatio = Math.hypot(sumAx, sumAy, sumAz) / sumArea;
      if (closureRatio < 0.02 && Math.abs(signedVol) > 1e-9) {
        const cullDir = signedVol > 0 ? 1 : -1;
        for (let k = instStartIdx; k < rawTris.length; k++) {
          rawTris[k].cullDir = cullDir;
        }
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
    // Subdivide oversized cap/chord triangles on multi-part/complex meshes (>= 64 tris) to prevent Painter's Algorithm sorting pops
    triangles = [];
    const allowSubdiv = rawTris.length >= 64;
    let extraBudget = allowSubdiv ? Math.max(0, maxTriangles - rawTris.length) : 0;
    const pushSubdiv = (a, b, c, tri, depth) => {
      const e01 = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      const e12 = Math.hypot(c[0] - b[0], c[1] - b[1], c[2] - b[2]);
      const e20 = Math.hypot(a[0] - c[0], a[1] - c[1], a[2] - c[2]);
      if (allowSubdiv && depth > 0 && extraBudget >= 3 && Math.max(e01, e12, e20) > 0.48) {
        extraBudget -= 3;
        const m01 = [(a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5, (a[2] + b[2]) * 0.5];
        const m12 = [(b[0] + c[0]) * 0.5, (b[1] + c[1]) * 0.5, (b[2] + c[2]) * 0.5];
        const m20 = [(c[0] + a[0]) * 0.5, (c[1] + a[1]) * 0.5, (c[2] + a[2]) * 0.5];
        pushSubdiv(a, m01, m20, tri, depth - 1);
        pushSubdiv(m01, b, m12, tri, depth - 1);
        pushSubdiv(m20, m12, c, tri, depth - 1);
        pushSubdiv(m01, m12, m20, tri, depth - 1);
        return;
      }
      triangles.push({
        pts: [a, b, c],
        normal: tri.normal,
        gNormal: tri.gNormal,
        cullDir: tri.cullDir,
        rgb: tri.rgb,
        metallic: tri.metallic,
        roughness: tri.roughness,
        emissive: tri.emissive,
        alpha: tri.alpha,
        transparent: tri.transparent,
        layer: tri.layer ?? 2,
      });
    };
    for (let i = 0; i < rawTris.length; i++) {
      const tri = rawTris[i];
      pushSubdiv(normPt(tri.p0), normPt(tri.p1), normPt(tri.p2), tri, 2);
    }
  } else {
    // Material-aware Rossignac-Borrel spatial vertex-clustering decimation:
    // keeps surfaces solid & watertight while preserving crisp material boundaries.
    const clusterAt = gridRes => {
      const cellSize = 3.45 / gridRes;
      const accum = new Map();
      const keyOf = (matKey, np) => {
        const ix = Math.round(np[0] / cellSize);
        const iy = Math.round(np[1] / cellSize);
        const iz = Math.round(np[2] / cellSize);
        return matKey + ':' + ix + ',' + iy + ',' + iz;
      };
      const mapped = new Array(rawTris.length);
      for (let i = 0; i < rawTris.length; i++) {
        const tri = rawTris[i];
        const a = normPt(tri.p0);
        const b = normPt(tri.p1);
        const c = normPt(tri.p2);
        const ka = keyOf(tri.matKey, a);
        const kb = keyOf(tri.matKey, b);
        const kc = keyOf(tri.matKey, c);
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
          mapped[i] = {
            ka,
            kb,
            kc,
            rgb: tri.rgb,
            metallic: tri.metallic,
            roughness: tri.roughness,
            emissive: tri.emissive,
            alpha: tri.alpha,
            transparent: tri.transparent,
            layer: tri.layer ?? 2,
            cullDir: tri.cullDir,
            normal: tri.normal,
          };
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
        const gNormal = [nx / area2, ny / area2, nz / area2];
        out.push({
          pts: [p0, p1, p2],
          normal: gNormal,
          gNormal,
          cullDir: m.cullDir,
          rgb: m.rgb,
          metallic: m.metallic,
          roughness: m.roughness,
          emissive: m.emissive,
          alpha: m.alpha,
          transparent: m.transparent,
          area: area2,
          layer: m.layer ?? 2,
        });
      }
      return out;
    };

    let clustered = clusterAt(68);
    if (clustered.length > maxTriangles * 1.45) clustered = clusterAt(52);
    if (clustered.length > maxTriangles * 1.45) clustered = clusterAt(40);
    if (clustered.length > maxTriangles * 1.45) clustered = clusterAt(30);
    if (clustered.length > maxTriangles) {
      const opaqueTris = clustered.filter(t => !t.transparent);
      const glassTris = clustered.filter(t => t.transparent);
      const glassBudget = Math.min(glassTris.length, Math.max(80, Math.floor(maxTriangles * 0.12)));
      const opaqueBudget = Math.max(0, maxTriangles - glassBudget);
      opaqueTris.sort((a, b) => (b.emissive ? 1 : 0) - (a.emissive ? 1 : 0) || b.area - a.area);
      glassTris.sort((a, b) => b.area - a.area);
      clustered = opaqueTris.slice(0, opaqueBudget).concat(glassTris.slice(0, glassBudget));
    }
    triangles = clustered.map(t => ({
      pts: t.pts,
      normal: t.normal,
      gNormal: t.gNormal,
      cullDir: t.cullDir,
      rgb: t.rgb,
      metallic: t.metallic,
      roughness: t.roughness,
      emissive: t.emissive,
      alpha: t.alpha,
      transparent: t.transparent,
      layer: t.layer ?? 2,
    }));
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
  const [resizeTick, setResizeTick] = useState(0);
  const ratioCss = fields.aspect === 'portrait' ? '9 / 16' : fields.aspect === 'square' ? '1 / 1' : '16 / 9';

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement || canvas;
    if (!host || typeof ResizeObserver !== 'function') return undefined;
    const ro = new ResizeObserver(() => setResizeTick(v => (v + 1) % 100000));
    try {
      ro.observe(host);
    } catch {
      return undefined;
    }
    return () => ro.disconnect();
  }, [canvasRef]);

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
    const rawLens = Number(fields.lensMm);
    const lensFactor = Number.isFinite(rawLens) && rawLens > 0 ? Math.max(0.48, Math.min(2.2, rawLens / 50)) : 1;
    const scaleBase = Math.min(w, hVal) * (orbit.ortho ? 0.22 * orbit.zoom : 0.98 * lensFactor);
    const rawEv = Number(fields.exposure);
    const evGain = Number.isFinite(rawEv) ? Math.pow(2, Math.max(-3, Math.min(3, rawEv)) * 0.42) : 1;

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
        const faceAlpha = typeof face.alpha === 'number' ? face.alpha : 1;
        const isGlass = Boolean(face.transparent) || faceAlpha < 0.94;
        // Closed-solid geometric backface culling prevents hidden undersides/back walls from popping through stacked parts
        if (face.cullDir && !isGlass && glbShading !== 'wireframe') {
          const gn = face.gNormal;
          if (gn && (gn[0] * vx + gn[1] * vy + gn[2] * vz) * face.cullDir < -0.02) {
            continue;
          }
        }
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
        const rough = typeof face.roughness === 'number' ? face.roughness : 0.52;
        const metal = typeof face.metallic === 'number' ? face.metallic : 0.12;
        const shininess = Math.round(8 + (1 - rough) * (1 - rough) * 72);
        const spec = Math.pow(Math.max(0, (fnx * hkx + fny * hky + fnz * hkz) / hkLen), shininess);
        const baseColor = glbShading === 'clay' ? clayRgb : face.rgb || clayRgb;

        if (glbShading === 'wireframe') {
          fill = isGlass ? 'rgba(56,189,248,0.08)' : 'rgba(24,32,48,0.22)';
          wire = isGlass ? 'rgba(125,211,252,0.45)' : 'rgba(96,165,250,0.75)';
        } else if (glbShading === 'clay') {
          const clayFactor = Math.min(1.45, (palette.ambient + 0.14 + keyDiff * 0.72 + fillDiff * 0.30 + rimDiff * 0.22) * evGain);
          const cr = Math.min(255, Math.round(clayRgb[0] * clayFactor + fresnel * 14));
          const cg = Math.min(255, Math.round(clayRgb[1] * clayFactor + fresnel * 16));
          const cb = Math.min(255, Math.round(clayRgb[2] * clayFactor + fresnel * 20));
          const clayAlpha = isGlass ? Number(Math.min(0.28, Math.max(0.10, faceAlpha * 0.75)).toFixed(3)) : 0.98;
          fill = `rgba(${cr},${cg},${cb},${clayAlpha})`;
          wire = isGlass ? null : 'rgba(15,23,42,0.10)';
        } else {
          // PBR-aware 3-Light Studio Shading (metallic tint, roughness specular lobe, emissive glow, glass transmission & exposure EV)
          const diffScale = 1 - metal * 0.35;
          const diff = Math.min(1.5, (palette.ambient + 0.12 + keyDiff * 0.76 + fillDiff * 0.32 + rimDiff * 0.26) * diffScale * evGain);
          const specStrength = (spec * (55 + (1 - rough) * 95) + fresnel * (24 + metal * 36)) * evGain;
          const specR = 1 - metal + (baseColor[0] / 255) * metal;
          const specG = 1 - metal + (baseColor[1] / 255) * metal;
          const specB = 1 - metal + (baseColor[2] / 255) * metal;
          const em = face.emissive;
          const r = Math.max(0, Math.min(255, Math.round(baseColor[0] * diff + specStrength * specR + fillDiff * 8 + (em ? em[0] * 0.92 : 0))));
          const g = Math.max(0, Math.min(255, Math.round(baseColor[1] * diff + specStrength * specG + fillDiff * 14 + (em ? em[1] * 0.92 : 0))));
          const b = Math.max(0, Math.min(255, Math.round(baseColor[2] * diff + specStrength * specB + fillDiff * 24 + rimDiff * 14 + (em ? em[2] * 0.92 : 0))));
          if (isGlass) {
            const glassAlpha = Number(Math.min(0.72, Math.max(0.09, faceAlpha * (0.52 + fresnel * 0.92) + spec * 0.32)).toFixed(3));
            fill = `rgba(${r},${g},${b},${glassAlpha})`;
            wire = glbShading === 'wire-overlay' ? 'rgba(186,230,253,0.24)' : null;
          } else {
            fill = `rgba(${r},${g},${b},0.98)`;
            wire = glbShading === 'wire-overlay' ? 'rgba(15,23,42,0.34)' : fill;
          }
        }
      } else {
        const ndotl = Math.abs(nx * lx + ny * ly + nz * lz);
        const fillLight = Math.max(0, -nx * 0.45 + ny * 0.35 + nz * 0.35) * 0.28;
        const rim = Math.max(0, 1 - Math.abs(nz));
        const intensity = (palette.ambient + ndotl * 0.78 + fillLight) * evGain;
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
  }, [fields.template, fields.accentColor, fields.lightingPreset, fields.materialPreset, fields.transparentBg, fields.clayMode, fields.lensMm, fields.exposure, fields.headline, fields.aspect, orbit.yaw, orbit.pitch, orbit.zoom, orbit.ortho, orbit.panX, orbit.panY, framePhase, glbMesh, glbShading, resizeTick]);

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
  side_profile: { zh: '正侧面 · 70mm', en: 'Side Profile · 70mm' },
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

function BlenderCompareViewer({ project, imageArtifacts, initialPair = null, aspect = 'landscape', lang = 'zh', t }) {
  const [leftId, setLeftId] = useState(() => initialPair?.leftId || imageArtifacts[1]?.id || imageArtifacts[0]?.id || '');
  const [rightId, setRightId] = useState(() => initialPair?.rightId || imageArtifacts[0]?.id || '');
  const [splitPct, setSplitPct] = useState(50);
  const stageRef = useRef(null);
  const draggingRef = useRef(false);
  const ratioCss = aspect === 'portrait' ? '9 / 16' : aspect === 'square' ? '1 / 1' : '16 / 9';

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
        'data-aspect': aspect,
        style: { aspectRatio: ratioCss },
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
  studioFocus = null,
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
  const [selectedGlbKey, setSelectedGlbKey] = useState(() => studioFocus?.glbKey || '');
  const [selectedShotId, setSelectedShotId] = useState(() => studioFocus?.shotId || '');
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
    if (studioFocus?.shotId) setSelectedShotId(studioFocus.shotId);
    if (studioFocus?.glbKey) setSelectedGlbKey(studioFocus.glbKey);
  }, [studioFocus?.nonce, studioFocus?.shotId, studioFocus?.glbKey]);

  useEffect(() => {
    if (shotArtifacts.length > 0 && !shotArtifacts.some(s => s.id === selectedShotId)) {
      const preferred =
        studioFocus?.shotId && shotArtifacts.some(s => s.id === studioFocus.shotId)
          ? studioFocus.shotId
          : shotArtifacts[0].id;
      setSelectedShotId(preferred);
    }
  }, [shotArtifacts, selectedShotId, studioFocus?.shotId]);

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
            ? h(BlenderCompareViewer, { project, imageArtifacts, initialPair: comparePair, aspect: fields.aspect, lang, t })
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
        h('span', { className: 'bl-kbd-item' }, h('kbd', null, '1–6'), ' ', t('切换视图', 'Views')),
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
  onInspectArtifact,
  onInspectGlb,
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
      shot: t('多机位分镜', 'Multi-Shot'),
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
              const extLower = String(asset.ext || '').replace(/^\./, '').toLowerCase();
              const isImg = ['png', 'jpg', 'jpeg', 'webp'].includes(extLower);
              const isGlbAsset = extLower === 'glb' || String(asset.file || '').toLowerCase().endsWith('.glb');
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
                  isGlbAsset
                    ? h(
                        W.Button,
                        {
                          size: 'sm',
                          variant: 'ghost',
                          icon: 'cube',
                          'data-action': 'inspect-glb-asset',
                          onClick: () => {
                            if (typeof onInspectGlb === 'function') {
                              onInspectGlb('asset:' + project.id + ':' + asset.id);
                            } else {
                              setStageView('mesh');
                              setEditorTab('studio');
                            }
                          },
                        },
                        t('3D 预览', 'Inspect 3D'),
                      )
                    : null,
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
          { id: 'shot', label: t('分镜', 'Shots') },
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
              const isImage = art.kind === 'still' || art.kind === 'contact_sheet' || art.kind === 'shot';
              const isVideo = art.kind === 'animation' && String(art.mime || '').startsWith('video/');
              const isGlb = art.kind === 'glb';
              const isLatestRev = art.revision === project.revision && !dirty;
              const titleSuffix =
                art.kind === 'shot' && typeof formatShotLabel === 'function'
                  ? formatShotLabel(art, lang)
                  : art.file;
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
                    h('strong', { 'data-dsh-serif': '' }, artifactKindLabel(art.kind) + ' · ' + titleSuffix),
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
                          'data-action': 'inspect-artifact',
                          onClick: () => {
                            if (typeof onInspectArtifact === 'function') {
                              onInspectArtifact(art);
                            } else {
                              setStageView(
                                art.kind === 'contact_sheet'
                                  ? 'contact_sheet'
                                  : art.kind === 'animation'
                                  ? 'animation'
                                  : art.kind === 'shot'
                                  ? 'shot'
                                  : 'still',
                              );
                              setEditorTab('studio');
                            }
                          },
                        },
                        t('在舞台查看', 'Inspect'),
                      )
                    : isGlb
                    ? h(
                        W.Button,
                        {
                          size: 'sm',
                          variant: 'ghost',
                          icon: 'cube',
                          'data-action': 'inspect-glb-artifact',
                          onClick: () => {
                            if (typeof onInspectGlb === 'function') {
                              onInspectGlb('art:' + project.id + ':' + art.id);
                            } else {
                              setStageView('mesh');
                              setEditorTab('studio');
                            }
                          },
                        },
                        t('3D 预览', 'Inspect 3D'),
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
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [installResult, setInstallResult] = useState(null);
  const [directLens, setDirectLens] = useState(50);
  const [directFstop, setDirectFstop] = useState('');
  const [directMatName, setDirectMatName] = useState('');
  const [directMatColor, setDirectMatColor] = useState('#3b82f6');
  const [directMatMetallic, setDirectMatMetallic] = useState(0);
  const [directMatRoughness, setDirectMatRoughness] = useState(0.28);
  const [directObjName, setDirectObjName] = useState('');
  const [directLocX, setDirectLocX] = useState('0');
  const [directLocY, setDirectLocY] = useState('0');
  const [directLocZ, setDirectLocZ] = useState('0');
  const [directRotX, setDirectRotX] = useState('0');
  const [directRotY, setDirectRotY] = useState('0');
  const [directRotZ, setDirectRotZ] = useState('0');
  const [directRotActive, setDirectRotActive] = useState(false);

  const controlId = typeof React.useId === 'function' ? React.useId() : 'bl-be';
  const lastSceneStampRef = useRef('');

  function isFiniteCoord(v) {
    const s = String(v ?? '').trim();
    return s !== '' && Number.isFinite(Number(s));
  }

  function syncMaterialFields(matName, sceneObj) {
    const det = sceneObj?.materialDetails?.[matName];
    if (!det) return;
    if (typeof det.color === 'string' && /^#[0-9a-f]{6}$/i.test(det.color)) {
      setDirectMatColor(det.color.toLowerCase());
    }
    if (typeof det.metallic === 'number' && Number.isFinite(det.metallic)) {
      setDirectMatMetallic(Math.max(0, Math.min(1, det.metallic)));
    }
    if (typeof det.roughness === 'number' && Number.isFinite(det.roughness)) {
      setDirectMatRoughness(Math.max(0, Math.min(1, det.roughness)));
    }
  }

  function syncObjectFields(objEntry) {
    if (!objEntry) return;
    if (Array.isArray(objEntry.location) && objEntry.location.length === 3) {
      setDirectLocX(String(Number(objEntry.location[0]).toFixed(2)));
      setDirectLocY(String(Number(objEntry.location[1]).toFixed(2)));
      setDirectLocZ(String(Number(objEntry.location[2]).toFixed(2)));
    }
    if (Array.isArray(objEntry.rotationDeg) && objEntry.rotationDeg.length === 3) {
      setDirectRotX(String(Number(objEntry.rotationDeg[0]).toFixed(1)));
      setDirectRotY(String(Number(objEntry.rotationDeg[1]).toFixed(1)));
      setDirectRotZ(String(Number(objEntry.rotationDeg[2]).toFixed(1)));
      setDirectRotActive(true);
    } else {
      setDirectRotX('0');
      setDirectRotY('0');
      setDirectRotZ('0');
      setDirectRotActive(false);
    }
  }

  useEffect(() => {
    const stamp = liveScene?.capturedAt || '';
    const sceneChanged = Boolean(stamp && stamp !== lastSceneStampRef.current);
    if (sceneChanged) lastSceneStampRef.current = stamp;

    const mats = Array.isArray(liveScene?.materials) ? liveScene.materials : [];
    if (mats.length > 0) {
      if (!directMatName || !mats.includes(directMatName)) {
        setDirectMatName(mats[0]);
        syncMaterialFields(mats[0], liveScene);
      } else if (sceneChanged) {
        syncMaterialFields(directMatName, liveScene);
      }
    }

    const objs = Array.isArray(liveScene?.objects) ? liveScene.objects : [];
    if (objs.length > 0) {
      const existing = directObjName ? objs.find(o => o.name === directObjName) : null;
      if (!existing) {
        const first = objs[0];
        setDirectObjName(first.name);
        syncObjectFields(first);
      } else if (sceneChanged) {
        syncObjectFields(existing);
      }
    }
  }, [liveScene, directMatName, directObjName]);

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
  const gpuInfo = environment?.gpu || activeBlender?.gpu || null;
  const computeDevice = environment?.computeDevice || 'auto';

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
            ? h(
                'p',
                { className: 'bl-bridge-err' },
                t('上次探测反馈：', 'Last check: ') +
                  (lang === 'en' && /[\u3400-\u9fff]/.test(String(bridge.error))
                    ? blenderError(bridge.error, true)
                    : bridge.error),
              )
            : null,
        ),
        h(
          'div',
          { className: 'bl-be-head-actions' },
          h(
            W.Button,
            {
              variant: 'primary',
              size: 'sm',
              icon: 'sparkles',
              'data-action': 'bridge-install-addon',
              disabled: !environment?.ready || running || bridgeWorking,
              title: !environment?.ready
                ? t('请先在下方配置或探测到本机 Blender 安装。', 'Detect or configure a local Blender executable first.')
                : t('自动在无头 Blender 中安装并启用 dsh_blender_bridge.py 插件', 'Install and enable dsh_blender_bridge.py via headless Blender'),
              onClick: () => setInstallDialogOpen(true),
            },
            t('一键安装到本机 Blender', 'Install Add-on to Blender'),
          ),
          h(
            'a',
            {
              className: 'w-button',
              href: addonUrl(),
              download: 'dsh_blender_bridge.py',
            },
            h(W.Icon, { name: 'download', size: 15 }),
            t('下载 dsh_blender_bridge.py', 'Download dsh_blender_bridge.py'),
          ),
        ),
      ),
      installResult
        ? h(
            W.Status,
            { tone: 'success' },
            t('Live Bridge 插件已安装并启用：', 'Live Bridge add-on installed & enabled: ') +
              (installResult.executablePath || activeBlender?.path || 'Blender'),
          )
        : null,

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
          h('li', null, t('打开桌面 Blender → Edit（编辑）→ Preferences（偏好设置）→ Add-ons（插件）→ 点击右上角下拉或 Install from Disk，选择该 .py 文件并勾选启用「DSH Blender Bridge」。', 'Open Blender → Edit → Preferences → Add-ons → Install from Disk → select dsh_blender_bridge.py and enable "DSH Blender Bridge".')),
          h('li', null, t('在 3D 视口按快捷键 N 打开右侧栏，切换至「DSH Bridge」标签页，核对端口（默认 9876）与可选 Token 后点击「Start DSH Bridge」。', 'Press N in the 3D Viewport, switch to the "DSH Bridge" tab, verify port 9876 (and optional token), then click "Start DSH Bridge".')),
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

      // Live Direct Controls Panel (no bpy scripting required, automatic Undo push)
      h(
        'details',
        { className: 'bl-guide-details bl-direct-details', 'data-bridge-direct': 'true' },
        h('summary', null, t('实时直控（免写脚本 · 自动 Undo）', 'Live Direct Controls (No Script · Auto Undo)')),
        h(
          'div',
          { className: 'bl-direct-grid' },
          h(
            'div',
            { className: 'bl-direct-card' },
            h('strong', { className: 'bl-direct-title' }, t('实时相机焦距', 'Live Camera Lens')),
            h(
              'div',
              { className: 'bl-direct-row' },
              h(
                'label',
                { htmlFor: controlId + '-dlens', className: 'bl-direct-lbl' },
                t('焦段 (mm)', 'Lens (mm)'),
                h('input', {
                  id: controlId + '-dlens',
                  type: 'number',
                  min: 18,
                  max: 135,
                  step: 1,
                  'data-bridge-lens-input': 'true',
                  value: directLens,
                  onChange: e => setDirectLens(Number(e.target.value)),
                }),
              ),
              h(
                'label',
                { htmlFor: controlId + '-dfstop', className: 'bl-direct-lbl' },
                t('景深 f-stop（可选）', 'DoF f-stop (opt.)'),
                h('input', {
                  id: controlId + '-dfstop',
                  type: 'number',
                  min: 0.7,
                  max: 22,
                  step: 0.1,
                  placeholder: '2.8',
                  'data-bridge-fstop-input': 'true',
                  value: directFstop,
                  onChange: e => setDirectFstop(e.target.value),
                }),
              ),
              h(
                W.Button,
                {
                  size: 'sm',
                  variant: 'primary',
                  icon: 'camera',
                  'data-action': 'bridge-set-camera',
                  disabled: running || bridgeWorking || !Number.isFinite(Number(directLens)) || Number(directLens) < 18 || Number(directLens) > 135,
                  onClick: () =>
                    runBridgeAction(async () => {
                      const payload = { action: 'bridge_set_camera', lensMm: Number(directLens) };
                      const fNum = Number(directFstop);
                      if (String(directFstop).trim() !== '' && Number.isFinite(fNum) && fNum > 0) {
                        payload.dofFstop = fNum;
                      }
                      const res = await api(payload);
                      if (res?.sceneSummary) setLiveScene(res.sceneSummary);
                      setNotice(t('已实时更新 Blender 相机焦距：', 'Updated live Blender camera lens: ') + payload.lensMm + 'mm');
                    }),
                },
                t('应用焦距', 'Apply Lens'),
              ),
            ),
          ),
          h(
            'div',
            { className: 'bl-direct-card' },
            h('strong', { className: 'bl-direct-title' }, t('实时材质换色', 'Live Material Repaint')),
            h(
              'div',
              { className: 'bl-direct-row' },
              h(
                'label',
                { htmlFor: controlId + '-dmat', className: 'bl-direct-lbl bl-direct-mat-field' },
                t('目标材质', 'Material'),
                Array.isArray(liveScene?.materials) && liveScene.materials.length > 0
                  ? h(
                      'select',
                      {
                        id: controlId + '-dmat',
                        'data-bridge-mat-select': 'true',
                        value: directMatName,
                        onChange: e => {
                          const nextMat = e.target.value;
                          setDirectMatName(nextMat);
                          syncMaterialFields(nextMat, liveScene);
                        },
                      },
                      liveScene.materials.map(m => h('option', { key: m, value: m }, m)),
                    )
                  : h('input', {
                      id: controlId + '-dmat',
                      type: 'text',
                      'data-bridge-mat-select': 'true',
                      placeholder: t('先点击「拉取实时场景」或直接输入材质名', 'Pull live scene or enter material name'),
                      value: directMatName,
                      onChange: e => setDirectMatName(e.target.value),
                    }),
              ),
              h(
                'label',
                { htmlFor: controlId + '-dcolor', className: 'bl-direct-lbl bl-direct-color-field' },
                t('颜色', 'Color'),
                h('input', {
                  id: controlId + '-dcolor',
                  type: 'color',
                  className: 'bl-color-swatch',
                  'data-bridge-mat-color': 'true',
                  value: directMatColor,
                  onChange: e => setDirectMatColor(e.target.value),
                }),
              ),
              h(
                'label',
                { htmlFor: controlId + '-dmetal', className: 'bl-direct-lbl bl-direct-rough-field' },
                t('金属度 ', 'Metallic ') + Number(directMatMetallic).toFixed(2),
                h('input', {
                  id: controlId + '-dmetal',
                  type: 'range',
                  min: 0,
                  max: 1,
                  step: 0.02,
                  className: 'bl-tactile-slider',
                  'data-bridge-mat-metallic': 'true',
                  value: directMatMetallic,
                  onChange: e => setDirectMatMetallic(Number(e.target.value)),
                }),
              ),
              h(
                'label',
                { htmlFor: controlId + '-drough', className: 'bl-direct-lbl bl-direct-rough-field' },
                t('粗糙度 ', 'Roughness ') + Number(directMatRoughness).toFixed(2),
                h('input', {
                  id: controlId + '-drough',
                  type: 'range',
                  min: 0,
                  max: 1,
                  step: 0.02,
                  className: 'bl-tactile-slider',
                  'data-bridge-mat-roughness': 'true',
                  value: directMatRoughness,
                  onChange: e => setDirectMatRoughness(Number(e.target.value)),
                }),
              ),
              h(
                W.Button,
                {
                  size: 'sm',
                  variant: 'primary',
                  icon: 'palette',
                  'data-action': 'bridge-set-material',
                  disabled: running || bridgeWorking || !String(directMatName || '').trim(),
                  onClick: () =>
                    runBridgeAction(async () => {
                      const res = await api({
                        action: 'bridge_set_material',
                        materialName: String(directMatName).trim(),
                        color: directMatColor,
                        metallic: Number(directMatMetallic),
                        roughness: Number(directMatRoughness),
                      });
                      if (res?.sceneSummary) setLiveScene(res.sceneSummary);
                      setNotice(
                        t('已实时更新材质颜色：', 'Updated live material color: ') +
                          String(directMatName).trim() +
                          ' (' +
                          directMatColor.toUpperCase() +
                          ')',
                      );
                    }),
                },
                t('实时换色', 'Apply Material'),
              ),
            ),
          ),
          h(
            'div',
            { className: 'bl-direct-card' },
            h('strong', { className: 'bl-direct-title' }, t('实时对象变换', 'Live Object Transform')),
            h(
              'div',
              { className: 'bl-direct-row' },
              h(
                'label',
                { htmlFor: controlId + '-dobj', className: 'bl-direct-lbl bl-direct-mat-field' },
                t('目标对象', 'Object'),
                Array.isArray(liveScene?.objects) && liveScene.objects.length > 0
                  ? h(
                      'select',
                      {
                        id: controlId + '-dobj',
                        'data-bridge-obj-select': 'true',
                        value: directObjName,
                        onChange: e => {
                          const nextName = e.target.value;
                          setDirectObjName(nextName);
                          const hit = liveScene.objects.find(o => o.name === nextName);
                          if (hit) syncObjectFields(hit);
                        },
                      },
                      liveScene.objects.map(o => h('option', { key: o.name, value: o.name }, o.name + ' (' + o.type + ')')),
                    )
                  : h('input', {
                      id: controlId + '-dobj',
                      type: 'text',
                      'data-bridge-obj-select': 'true',
                      placeholder: t('先点击「拉取实时场景」或直接输入对象名', 'Pull live scene or enter object name'),
                      value: directObjName,
                      onChange: e => {
                        setDirectObjName(e.target.value);
                        setDirectRotActive(false);
                      },
                    }),
              ),
              h(
                'label',
                { htmlFor: controlId + '-dlx', className: 'bl-direct-lbl bl-direct-coord-field' },
                'X (m)',
                h('input', {
                  id: controlId + '-dlx',
                  type: 'number',
                  step: 0.1,
                  'data-bridge-obj-x': 'true',
                  value: directLocX,
                  onChange: e => setDirectLocX(e.target.value),
                }),
              ),
              h(
                'label',
                { htmlFor: controlId + '-dly', className: 'bl-direct-lbl bl-direct-coord-field' },
                'Y (m)',
                h('input', {
                  id: controlId + '-dly',
                  type: 'number',
                  step: 0.1,
                  'data-bridge-obj-y': 'true',
                  value: directLocY,
                  onChange: e => setDirectLocY(e.target.value),
                }),
              ),
              h(
                'label',
                { htmlFor: controlId + '-dlz', className: 'bl-direct-lbl bl-direct-coord-field' },
                'Z (m)',
                h('input', {
                  id: controlId + '-dlz',
                  type: 'number',
                  step: 0.1,
                  'data-bridge-obj-z': 'true',
                  value: directLocZ,
                  onChange: e => setDirectLocZ(e.target.value),
                }),
              ),
              h(
                'label',
                { htmlFor: controlId + '-drx', className: 'bl-direct-lbl bl-direct-coord-field' },
                t('旋转 X°', 'Rot X°'),
                h('input', {
                  id: controlId + '-drx',
                  type: 'number',
                  step: 5,
                  'data-bridge-obj-rx': 'true',
                  value: directRotX,
                  onChange: e => {
                    setDirectRotX(e.target.value);
                    setDirectRotActive(true);
                  },
                }),
              ),
              h(
                'label',
                { htmlFor: controlId + '-dry', className: 'bl-direct-lbl bl-direct-coord-field' },
                t('旋转 Y°', 'Rot Y°'),
                h('input', {
                  id: controlId + '-dry',
                  type: 'number',
                  step: 5,
                  'data-bridge-obj-ry': 'true',
                  value: directRotY,
                  onChange: e => {
                    setDirectRotY(e.target.value);
                    setDirectRotActive(true);
                  },
                }),
              ),
              h(
                'label',
                { htmlFor: controlId + '-drz', className: 'bl-direct-lbl bl-direct-coord-field' },
                t('旋转 Z°', 'Rot Z°'),
                h('input', {
                  id: controlId + '-drz',
                  type: 'number',
                  step: 5,
                  'data-bridge-obj-rz': 'true',
                  value: directRotZ,
                  onChange: e => {
                    setDirectRotZ(e.target.value);
                    setDirectRotActive(true);
                  },
                }),
              ),
              h(
                W.Button,
                {
                  size: 'sm',
                  variant: 'primary',
                  icon: 'sliders',
                  'data-action': 'bridge-transform-object',
                  disabled:
                    running ||
                    bridgeWorking ||
                    !String(directObjName || '').trim() ||
                    !isFiniteCoord(directLocX) ||
                    !isFiniteCoord(directLocY) ||
                    !isFiniteCoord(directLocZ) ||
                    (directRotActive &&
                      (!isFiniteCoord(directRotX) ||
                        !isFiniteCoord(directRotY) ||
                        !isFiniteCoord(directRotZ))),
                  onClick: () =>
                    runBridgeAction(async () => {
                      const payload = {
                        action: 'bridge_transform_object',
                        name: String(directObjName).trim(),
                        location: [Number(directLocX), Number(directLocY), Number(directLocZ)],
                        ...(directRotActive
                          ? { rotationDeg: [Number(directRotX), Number(directRotY), Number(directRotZ)] }
                          : {}),
                      };
                      const res = await api(payload);
                      if (res?.sceneSummary) setLiveScene(res.sceneSummary);
                      setNotice(
                        t('已实时变换对象位置与朝向：', 'Transformed live object: ') + payload.name,
                      );
                    }),
                },
                t('应用变换', 'Apply Transform'),
              ),
            ),
          ),
        ),
      ),

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
            { className: 'w-muted bl-be-sub', 'data-env-summary': 'true' },
            environment?.ready && activeBlender
              ? (() => {
                  const eeveeName =
                    activeBlender.major >= 5
                      ? 'EEVEE (5.x)'
                      : activeBlender.eeveeEngine === 'BLENDER_EEVEE_NEXT'
                      ? 'EEVEE Next'
                      : 'EEVEE';
                  const gpName = activeBlender.greasePencilApi === 'gpv3' ? 'GPv3' : 'GPv2';
                  return t(
                    `已就绪：Blender ${activeBlender.version}（${eeveeName} · ${gpName}），支持无头 CLI 渲染与可选 Live Bridge 实时联动。`,
                    `Ready: Blender ${activeBlender.version} (${eeveeName} · ${gpName}) — Headless CLI rendering and optional Live Bridge enabled.`,
                  );
                })()
              : t(
                  '尚未探测到本机 Blender 安装。请安装 Blender 3.6–5.x 或在下方手动配置可执行文件路径，Headless CLI 模式无需打开 Blender GUI 即可渲染与导出。',
                  'No local Blender installation detected yet. Install Blender 3.6–5.x or set the executable path below; Headless CLI renders and exports without opening Blender GUI.',
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
              h(
                'span',
                {
                  className: 'w-tag bl-gpu-chip',
                  'data-gpu-badge': 'true',
                  'data-gpu-available': gpuInfo?.available ? 'true' : 'false',
                },
                gpuInfo?.available
                  ? 'Cycles GPU: ' + gpuInfo.backend + (Array.isArray(gpuInfo.devices) && gpuInfo.devices.length ? ' · ' + gpuInfo.devices[0] : '')
                  : 'Cycles: CPU',
              ),
              h('span', { className: 'w-tag' }, t('来源：', 'Source: ') + activeBlender.source),
            ),
          )
        : null,

      // Cycles Compute Device Selector
      h(
        'div',
        { className: 'bl-policy-box bl-compute-box' },
        h(
          'div',
          null,
          h('strong', null, t('Cycles 计算设备', 'Cycles Compute Device')),
          h(
            'p',
            { className: 'w-muted bl-be-sub' },
            t(
              '控制 Cycles 渲染时是否启用本机 GPU 加速（OPTIX / CUDA / METAL / HIP / ONEAPI）；若驱动或显存异常可切回「仅 CPU」。',
              'Controls GPU acceleration (OPTIX / CUDA / METAL / HIP / ONEAPI) for Cycles renders; switch to CPU Only if drivers are unstable.',
            ),
          ),
        ),
        h(
          'div',
          {
            className: 'bl-compute-group',
            role: 'group',
            'data-compute-device-group': 'true',
            'aria-label': t('Cycles 计算设备选择', 'Cycles compute device selection'),
          },
          [
            { id: 'auto', zh: '自动 Auto', en: 'Auto' },
            { id: 'gpu', zh: '优先 GPU', en: 'Prefer GPU' },
            { id: 'cpu', zh: '仅 CPU', en: 'CPU Only' },
          ].map(opt =>
            h(
              'button',
              {
                key: opt.id,
                type: 'button',
                className: 'bl-compute-btn',
                'data-compute-device': opt.id,
                'aria-pressed': computeDevice === opt.id,
                disabled: running,
                onClick: () =>
                  perform(async () => {
                    await api({ action: 'configure', computeDevice: opt.id });
                    await refresh();
                    setNotice(
                      t('Cycles 计算设备已切换为：', 'Cycles compute device set to: ') + (lang === 'en' ? opt.en : opt.zh),
                    );
                  }),
              },
              lang === 'en' ? opt.en : opt.zh,
            ),
          ),
        ),
      ),

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

    installDialogOpen
      ? h(
          W.Dialog,
          {
            className: 'dbw blender-dialog',
            title: t('一键安装 Live Bridge 插件到本机 Blender', 'Install Live Bridge Add-on to Blender'),
            closeLabel: t('取消安装', 'Cancel install'),
            busy: bridgeWorking || running,
            onClose: () => setInstallDialogOpen(false),
          },
          h(
            'div',
            { 'data-bridge-install-dialog': 'true' },
            h(
              'p',
              null,
              t(
                '确认后将调用本机无头 Blender（--background --factory-startup）执行官方偏好设置命令：addon_install、addon_enable("dsh_blender_bridge") 与 save_userpref()，不会覆盖你的工程文件。',
                'This runs headless Blender (--background --factory-startup) to execute addon_install, addon_enable("dsh_blender_bridge"), and save_userpref() without modifying your project files.',
              ),
            ),
            activeBlender
              ? h('p', { className: 'w-muted' }, t('目标可执行程序：', 'Target executable: '), h('code', null, activeBlender.path))
              : null,
            h(
              'div',
              { className: 'w-toolbar' },
              h(
                W.Button,
                {
                  variant: 'primary',
                  icon: 'check',
                  'data-action': 'confirm-bridge-install',
                  disabled: bridgeWorking || running,
                  onClick: () =>
                    runBridgeAction(async () => {
                      const res = await api({ action: 'bridge_install_addon', confirmed: true });
                      setInstallResult(res || { installed: true, enabled: true });
                      setInstallDialogOpen(false);
                      await refresh();
                      setNotice(
                        t(
                          '已成功将 dsh_blender_bridge.py 安装并启用到本机 Blender！打开桌面 Blender 侧栏即可一键启动桥接服务。',
                          'Successfully installed and enabled dsh_blender_bridge.py in local Blender! Open Blender sidebar to start the bridge.',
                        ),
                      );
                    }),
                },
                bridgeWorking ? t('安装中…', 'Installing…') : t('确认安装并启用', 'Confirm Install & Enable'),
              ),
              h(
                W.Button,
                { variant: 'ghost', disabled: bridgeWorking, onClick: () => setInstallDialogOpen(false) },
                t('取消', 'Cancel'),
              ),
            ),
          ),
        )
      : null,
  );
}

const BLENDER_BRIDGE_CSS = `
.bl-be-root{display:flex;flex-direction:column;gap:14px;max-width:1040px;padding:8px 0 24px;min-width:0}
.bl-be-card{display:flex;flex-direction:column;gap:14px;padding:16px 18px;border:var(--dsh-control-border-width,1px) solid var(--w-border);border-radius:var(--dsw-radius-md,12px);background:var(--dsw-alias-settings-card-fill,var(--w-canvas));min-width:0}
.bl-be-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
.bl-be-head-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.bl-gpu-chip[data-gpu-available="true"]{background:color-mix(in oklab,#10b981 14%,var(--w-bg));border-color:color-mix(in oklab,#10b981 36%,var(--w-border));color:#047857;font-weight:700}
[data-theme="dark"] .bl-gpu-chip[data-gpu-available="true"]{color:#6ee7b7}
.bl-compute-group{display:inline-flex;align-items:center;gap:5px;flex-wrap:wrap}
.bl-compute-btn{padding:5px 11px;border-radius:var(--dsw-radius-sm,8px);border:var(--dsh-control-border-width,1px) solid var(--w-border);background:var(--w-bg);color:var(--w-text);font:inherit;font-size:12px;font-weight:600;cursor:pointer}
.bl-compute-btn[aria-pressed="true"]{background:var(--w-selected);border-color:var(--w-accent);color:var(--w-accent);box-shadow:inset 0 0 0 1px var(--w-accent)}
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
.bl-direct-grid{display:grid;grid-template-columns:1fr;gap:10px;margin-top:10px}
.bl-direct-card{display:flex;flex-direction:column;gap:8px;padding:10px 12px;border-radius:var(--dsw-radius-sm,8px);background:var(--w-canvas);border:var(--dsh-control-border-width,1px) solid var(--w-border)}
.bl-direct-title{font-size:12px;color:var(--w-text)}
.bl-direct-row{display:flex;align-items:end;gap:8px;flex-wrap:wrap}
.bl-direct-lbl{display:flex;flex-direction:column;gap:4px;margin:0;font-size:11px;font-weight:600;color:var(--w-muted);min-width:96px}
.bl-direct-mat-field{flex:1 1 170px}
.bl-direct-color-field{min-width:54px}
.bl-direct-rough-field{flex:0 1 130px}
.bl-direct-coord-field{min-width:68px;max-width:86px;flex:0 1 76px}
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

    const FALLBACK_EXEMPLARS = [
      {
        id: 'aero-x900-turbofan',
        titleZh: 'AERO-X900 高涵道比剖视涡扇航发',
        titleEn: 'AERO-X900 Cutaway Turbofan Engine',
        summaryZh: '24 片宽弦钛合金扇叶、8 级压气机、热蓝 5 级涡轮与工业台架剖视总成。',
        summaryEn: '24 twisted titanium fan blades, 8-stage compressor, heat-blued turbine & cutaway nacelle on gantry.',
        category: 'aerospace',
        engine: 'CYCLES',
        samples: 64,
        aspect: 'landscape',
        estimatedPolys: '~26k polys',
        previewImage: 'docs/assets/intro/hero-turbofan.webp',
      },
      {
        id: 'apex-09-racecar',
        titleZh: 'APEX-09 Cyber GT 超级赛车',
        titleEn: 'APEX-09 Cyber GT Hypercar',
        summaryZh: '深红金属车漆、碳纤维空力前后翼、10 辐锻造轮毂与双层 LED 棚拍展台。',
        summaryEn: 'Metallic crimson clearcoat monocoque, carbon aero wings, 10-spoke forged rims & studio turntable.',
        category: 'vehicle',
        engine: 'CYCLES',
        samples: 96,
        aspect: 'landscape',
        estimatedPolys: '~150k subdiv',
        previewImage: 'docs/assets/intro/hero-racecar.webp',
      },
      {
        id: 'vanguard-h145x-helicopter',
        titleZh: 'VANGUARD H-145X 双发复合直升机',
        titleEn: 'VANGUARD H-145X Twin-Turbine Helicopter',
        summaryZh: '炭灰与救援橙涂装、防弹多面座舱、四叶主旋翼、涵道尾桨与亮灯停机坪。',
        summaryEn: 'Tactical slate-and-orange fuselage, ballistic tinted canopy, 4-blade rotor & illuminated helipad.',
        category: 'aerospace',
        engine: 'CYCLES',
        samples: 64,
        aspect: 'landscape',
        estimatedPolys: '~4.2k base',
        previewImage: 'docs/assets/intro/hero-helicopter.webp',
      },
      {
        id: 'kuka-6axis-robot-arm',
        titleZh: '6 轴工业机械臂装配工作站',
        titleEn: '6-Axis Industrial Robot Arm Cell',
        summaryZh: '安全橙铸铝六轴关节、螺栓法兰盘、肩部线缆包与平行气动夹爪装配台。',
        summaryEn: 'Safety-orange articulated 6-axis servo joints, bolted flanges, dress-pack cables & precision fixture.',
        category: 'robotics',
        engine: 'CYCLES',
        samples: 64,
        aspect: 'landscape',
        estimatedPolys: '~18k polys',
        previewImage: 'docs/assets/intro/hero-robot-arm.webp',
      },
      {
        id: 'chronograph-tourbillon-watch',
        titleZh: 'CHRONO-X1 镂空陀飞轮机械腕表',
        titleEn: 'CHRONO-X1 Skeleton Tourbillon Watch',
        summaryZh: '42mm 拉丝钛金属与玫瑰金表壳、镂空夹板齿轮、红宝石轴承与拱形蓝宝石表镜微距展台。',
        summaryEn: '42mm brushed titanium & rose-gold case, skeleton bridges, ruby tourbillon cage & domed sapphire crystal.',
        category: 'horology',
        engine: 'CYCLES',
        samples: 64,
        aspect: 'landscape',
        estimatedPolys: '13.1K / 24K+ Mod',
        previewImage: 'docs/assets/intro/hero-tourbillon-watch.webp',
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
        LENS_INVALID: 'Camera focal length (lensMm) must be between 18 and 135 mm.',
        EXPOSURE_INVALID: 'Exposure must be between -3 and +3 EV.',
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
        PROJECT_NOT_CORRUPT: 'This 3D project is healthy and cannot be removed as a damaged folder.',
        CONFIRM_REQUIRED: 'Confirmation is required for this action.',
        JOB_TIMEOUT: 'Blender job timed out and was terminated safely. Your project is preserved.',
        LOCK_LOST: 'Storage lock was lost; retry after refreshing.',
        CLI_FAILED: 'Blender CLI execution failed. Expand the job log for full Python/Blender output.',
        OUTPUT_INVALID: 'Expected render or export output file was not produced.',
        OUTPUT_TOO_LARGE: 'Output artifact exceeds the 200 MB safety limit.',
        ORIGIN_FORBIDDEN: 'Request origin or CSRF header check failed.',
        DOWNLOAD_INVALID: 'Invalid download parameters.',
        CHECKPOINT_NOT_FOUND: 'Requested script checkpoint was not found.',
        SCRIPT_PATCH_NOT_FOUND: 'Target snippet was not found in the current custom script.',
        SCRIPT_PATCH_AMBIGUOUS: 'Target snippet matched multiple locations in the script; narrow the search text or pass replaceAll.',
        EXEMPLAR_NOT_FOUND: 'Requested Pro Exemplar was not found.',
        ADDON_INSTALL_FAILED: 'Failed to install or enable dsh_blender_bridge.py in local Blender. Check Blender permissions and logs.',
        PLUGIN_DISPOSED: 'Plugin is unloading. Wait for reload and retry.',
      };
      if (code && byCode[code]) return byCode[code];
      if (/网络共享路径/.test(message)) return 'Network share paths do not support the system Recycle Bin. Clean them up manually.';
      if (/回收站/.test(message)) return 'Could not move the folder to the system Recycle Bin. Close any app using its files and try again.';
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
        lensMm: 50,
        exposure: 0,
        clayMode: false,
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
        lensMm: Number.isFinite(Number(p.lensMm)) ? Number(p.lensMm) : base.lensMm,
        exposure: Number.isFinite(Number(p.exposure)) ? Number(p.exposure) : base.exposure,
        clayMode: Boolean(p.clayMode),
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
        render_shots: t('多机位分镜', 'Multi-Shot Pack'),
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
      if (job.kind === 'render_shots') {
        const doneCount = Array.isArray(job.shots) ? job.shots.length : 0;
        if (job.state === 'done') {
          return t(
            `多机位完成（生成 ${doneCount} 张分镜）`,
            `Completed (${doneCount} ${doneCount === 1 ? 'shot' : 'shots'})`,
          );
        }
        if (lang === 'en' && /[\u3400-\u9fff]/.test(String(job.stage || ''))) {
          if (job.state === 'failed') return 'Failed — expand job log for details';
          if (job.state === 'cancelled') return 'Cancelled';
          return doneCount > 0 ? `Rendering multi-shot pack (${doneCount} done)…` : 'Rendering multi-shot lookdev pack…';
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
.w-dialog-modal.blender-dialog,.dsh-fallback-modal-dialog.blender-dialog{width:min(560px,calc(100dvw - 32px));container-type:normal}
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
      const [studioFocus, setStudioFocus] = useState(null);

      const [projects, setProjects] = useState([]);
      const [archived, setArchived] = useState([]);
      const [corruptedCount, setCorruptedCount] = useState(0);
      const [corruptedProjects, setCorruptedProjects] = useState([]);
      const [corruptedDialog, setCorruptedDialog] = useState(false);
      const [clearArchivedDialog, setClearArchivedDialog] = useState(false);
      const [environment, setEnvironment] = useState(null);
      const [templates, setTemplates] = useState(FALLBACK_TEMPLATES);
      const [exemplars, setExemplars] = useState(FALLBACK_EXEMPLARS);

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
        setCorruptedProjects(Array.isArray(data?.corruptedProjects) ? data.corruptedProjects : []);
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
        if (Array.isArray(data?.exemplars) && data.exemplars.length) {
          setExemplars(data.exemplars);
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
        if (project || creating || archiveTarget || trashTarget || corruptedDialog || clearArchivedDialog) return undefined;
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
      }, [!!project, creating, !!archiveTarget, !!trashTarget, corruptedDialog, clearArchivedDialog]);

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
                else if (next.kind === 'export_model') {
                  if (next.artifactKind === 'glb' && next.artifactId && next.projectId) {
                    setStudioFocus({ glbKey: 'art:' + next.projectId + ':' + next.artifactId, nonce: Date.now() });
                    setStageView('mesh');
                    setNotice(t('GLB 3D 模型导出完成，已切换至交互式 3D 网格视图。', 'GLB 3D model exported. Switched to interactive 3D Mesh view.'));
                  }
                } else if (next.kind === 'render_shots') {
                  if (next.shots?.[0]?.artifactId) {
                    setStudioFocus({ shotId: next.shots[0].artifactId, nonce: Date.now() });
                  }
                  setStageView('shot');
                  const shotCount = Array.isArray(next.shots) ? next.shots.length : 0;
                  setNotice(
                    t(
                      `多机位分镜渲染完成（共 ${shotCount} 张），可在下方胶片条点击切换或对比。`,
                      `Multi-shot lookdev pack finished (${shotCount} shots). Click thumbnails in the filmstrip below to inspect or compare.`,
                    ),
                  );
                } else if (next.kind === 'pipeline') {
                  if (next.pipeline?.stoppedEarly) {
                    const reasonText =
                      lang === 'en' && /[\u3400-\u9fff]/.test(String(next.pipeline.stopReason || ''))
                        ? 'critical scene error found'
                        : next.pipeline.stopReason || t('检测到严重场景错误', 'critical scene error found');
                    setNotice(
                      t('全流程在 QC-3D 体检阶段提前中止：', 'Pipeline stopped during QC-3D audit: ') + reasonText,
                    );
                  } else {
                    if (next.pipeline?.primaryRenderId) {
                      setStageView(next.artifactKind === 'animation' ? 'animation' : 'still');
                    } else if (next.pipeline?.contactSheetId) {
                      setStageView('contact_sheet');
                    }
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
          setStudioFocus(null);
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
          setStudioFocus(null);
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
            setStudioFocus(null);
            setStageView('stage');
          }
          setNotice(t('已复制 3D 工程：', 'Duplicated 3D project: ') + (cloned?.title || item.title));
        });
      }

      async function createFromExemplar(exemplar) {
        if (!exemplar?.id) return;
        await perform(async () => {
          const created = await api({ action: 'create_from_exemplar', exemplarId: exemplar.id });
          await refresh();
          if (created?.id) {
            setProject(created);
            syncFields(fieldsOf(created));
            setCreating(false);
            setDirty(false);
            setConflict(false);
            setEditorTab('studio');
            setStudioFocus(null);
            setStageView('stage');
          }
          setNotice(
            t('已从高阶工程范本创建：', 'Created project from Pro Exemplar: ') +
              (lang === 'en' ? exemplar.titleEn || created?.title || exemplar.id : exemplar.titleZh || created?.title || exemplar.id),
          );
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

      async function trashAllArchived() {
        const result = await api({ action: 'trashArchived', confirmed: true });
        setClearArchivedDialog(false);
        await refresh().catch(() => {});
        setNotice(
          result?.trashedCount > 0
            ? t(
                `已将 ${result.trashedCount} 个已归档 3D 工程移入系统回收站，可在系统回收站还原。`,
                `Moved ${result.trashedCount} archived 3D project(s) to the system Recycle Bin.`,
              )
            : t('没有需要清理的已归档工程。', 'No archived projects to clean up.'),
        );
      }

      async function trashCorruptedFolders() {
        const result = await api({ action: 'trashCorrupted', confirmed: true });
        setCorruptedDialog(false);
        await refresh().catch(() => {});
        setNotice(
          result?.trashedCount > 0
            ? t(
                `已将 ${result.trashedCount} 个损坏工程目录移入系统回收站，黄色提示已清除。`,
                `Moved ${result.trashedCount} damaged project folder(s) to the system Recycle Bin.`,
              )
            : t('损坏工程目录已不存在，列表已自动同步。', 'Damaged project folders were already gone; list refreshed.'),
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
      const lensNum = Number(fields.lensMm);
      const lensValid = Number.isFinite(lensNum) && lensNum >= 18 && lensNum <= 135;
      const exposureNum = Number(fields.exposure);
      const exposureValid = Number.isFinite(exposureNum) && exposureNum >= -3 && exposureNum <= 3;
      const scriptBytes = utf8ByteLength(fields.customScript || '');
      const scriptValid = scriptBytes <= MAX_SCRIPT_BYTES;
      const canSave = titleValid && descValid && headlineValid && samplesValid && framesValid && colorValid && lensValid && exposureValid && scriptValid;
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
        : !lensValid
        ? t('相机焦段需在 18–135 mm 之间。', 'Camera focal length must be between 18 and 135 mm.')
        : !exposureValid
        ? t('曝光补偿需在 -3 至 +3 EV 之间。', 'Exposure must be between -3 and +3 EV.')
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
        return __stardustUpdatesInlinePage(React,h(
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
        ),"dsh-blender-studio");
      }

      const jobPct = Math.max(0, Math.min(100, Math.round(Number(job?.progress || 0))));
      const jobStartMs = job?.startedAt ? Date.parse(job.startedAt) : NaN;
      const jobEndMs = job?.finishedAt ? Date.parse(job.finishedAt) : Date.now();
      const jobElapsedSec = Number.isFinite(jobStartMs) ? Math.max(0, Math.floor(((Number.isFinite(jobEndMs) ? jobEndMs : Date.now()) - jobStartMs) / 1000)) : null;

      return __stardustUpdatesInlinePage(React,h(
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
              ' ',
              h(
                W.Button,
                {
                  size: 'sm',
                  variant: 'ghost',
                  icon: 'trash',
                  disabled: busy || activeJob,
                  onClick: () => {
                    setError('');
                    setCorruptedDialog(true);
                  },
                },
                t('查看并移入回收站清理', 'Inspect & move to Recycle Bin'),
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
                  exemplars,
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
                  onCreateFromExemplar: createFromExemplar,
                  onDuplicate: duplicateProject,
                  onArchiveRequest: item => setArchiveTarget(item),
                  onTrashRequest: (item, isArchived) => {
                    setError('');
                    setTrashTarget({ project: item, archived: Boolean(isArchived) });
                  },
                  onClearArchivedRequest: () => {
                    setError('');
                    setClearArchivedDialog(true);
                  },
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
                onInspectArtifact: art => {
                  if (art.kind === 'shot') {
                    setStudioFocus({ shotId: art.id, nonce: Date.now() });
                    setStageView('shot');
                  } else {
                    setStageView(
                      art.kind === 'contact_sheet'
                        ? 'contact_sheet'
                        : art.kind === 'animation'
                        ? 'animation'
                        : 'still',
                    );
                  }
                  setEditorTab('studio');
                },
                onInspectGlb: glbKey => {
                  setStudioFocus({ glbKey, nonce: Date.now() });
                  setStageView('mesh');
                  setEditorTab('studio');
                },
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
                lensValid,
                exposureValid,
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
                studioFocus,
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
              error ? h(W.Status, { tone: 'error' }, blenderError(error, lang === 'en')) : null,
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

        // Clear all archived projects confirmation dialog
        clearArchivedDialog
          ? h(
              W.Dialog,
              {
                className: 'dbw blender-dialog',
                title: t('清空已归档 3D 工程', 'Clear all archived 3D projects'),
                closeLabel: t('取消', 'Cancel'),
                busy: busy || activeJob,
                onClose: () => setClearArchivedDialog(false),
              },
              h(
                'p',
                null,
                t(
                  `确定将全部 ${archived.length} 个已归档 3D 工程一次性移入系统回收站吗？移入后仍可在系统回收站中还原。`,
                  `Move all ${archived.length} archived 3D project(s) to the system Recycle Bin in one batch? You can restore them from your OS Recycle Bin later.`,
                ),
              ),
              archived.length > 0
                ? h(
                    'ul',
                    { className: 'dbw-checks' },
                    archived.slice(0, 8).map(item => h('li', { key: item.id }, item.title)),
                    archived.length > 8
                      ? h('li', { key: 'more', className: 'w-muted' }, t(`以及其余 ${archived.length - 8} 个已归档工程…`, `and ${archived.length - 8} more archived project(s)…`))
                      : null,
                  )
                : null,
              error ? h(W.Status, { tone: 'error' }, blenderError(error, lang === 'en')) : null,
              h(
                'div',
                { className: 'w-toolbar' },
                h(
                  W.Button,
                  {
                    variant: 'danger',
                    icon: 'trash',
                    disabled: busy || dirty || activeJob,
                    onClick: () => perform(trashAllArchived),
                  },
                  t('确认全部移入回收站', 'Move all to Recycle Bin'),
                ),
                h(W.Button, { disabled: busy, onClick: () => setClearArchivedDialog(false) }, t('取消', 'Cancel')),
              ),
            )
          : null,

        // Corrupted project folders cleanup confirmation dialog
        corruptedDialog
          ? h(
              W.Dialog,
              {
                className: 'dbw blender-dialog',
                title: t('清理损坏工程目录', 'Clean up damaged project folders'),
                closeLabel: t('取消', 'Cancel'),
                busy: busy || activeJob,
                onClose: () => setCorruptedDialog(false),
              },
              h(
                'p',
                null,
                t(
                  `共检测到 ${corruptedProjects.length || corruptedCount} 个损坏工程目录。移入系统回收站后黄色提醒将消除，且仍可在系统回收站找回原始文件。`,
                  `Found ${corruptedProjects.length || corruptedCount} damaged project folder(s). Moving them to the OS Recycle Bin clears the warning while keeping the original files recoverable.`,
                ),
              ),
              corruptedProjects.length > 0
                ? h(
                    'ul',
                    { className: 'dbw-checks' },
                    corruptedProjects.map(item =>
                      h(
                        'li',
                        { key: (item.archived ? 'a:' : 'p:') + item.id },
                        h('code', null, (item.archived ? 'archives/' : 'projects/') + item.id),
                        ' — ',
                        item.detail,
                      ),
                    ),
                  )
                : null,
              error ? h(W.Status, { tone: 'error' }, blenderError(error, lang === 'en')) : null,
              h(
                'div',
                { className: 'w-toolbar' },
                h(
                  W.Button,
                  {
                    variant: 'danger',
                    icon: 'trash',
                    disabled: busy || activeJob,
                    onClick: () => perform(trashCorruptedFolders),
                  },
                  t('全部移入系统回收站', 'Move all to Recycle Bin'),
                ),
                h(W.Button, { disabled: busy, onClick: () => setCorruptedDialog(false) }, t('取消', 'Cancel')),
              ),
            )
          : null,
      ),"dsh-blender-studio");
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

    if (typeof window !== 'undefined' && typeof parseGlbMesh === 'function') {
      window.__DSH_BLENDER_GLB__ = { parseGlbMesh };
    }

    return {
      inject: ['slots', 'locale'],
      apply,
      ...(typeof parseGlbMesh === 'function' ? { parseGlbMesh } : {}),
    };
  },
},{"name":"dsh-blender-studio","version":"0.1.0","hasWorkbench":true,"packageVersion":"0.5.1","label":"Blender 3D","labelEn":"Blender 3D","suiteComponent":false,"sectionIds":["dsh-blender-studio"],"iconData":"data:image/webp;base64,UklGRmBIAABXRUJQVlA4TFRIAAAv/8A/EA1IkiRJUqR2tyiHpIr/P7i2SJj1FtH/CdD/2Kqu4lNS1QIgEIBAAsShACQkAUqqGmhfadzVx9gdoKq6Q/tD1UJV1TV3Ld7kHp63Rtu6din2JyApqR5fcx8wknTwuOMJQJJ5Yw5J8i3jYIwkubHcYfYYI8mU8QEkyZcMYAwgSc62ru3dcT4Yik+WJm9J+g5t9/jETpJr42zsfLbOCePA2yb55L0B2MyC7A9+JOmn6uDw1cYlkJIA7FT15D1tHK1HLCdPaVRVcW6PWesBoB9AbPqa1QQK5LKvuIl7Wm2/C9jsT/DZOMG22QBueRKXiuNLT5tJ40x21dmYxxkXqqokAQzO3eYGdiWJ695/Cqkf7a9hmxZakLSt63qLOes1kM3dWazPaaomH9j2jeVWbLuHQ5XIHCSOm5CkZJLkFgMLIFCSCXu1nS9KHkevJnVwM0kOHk3MAykB6Dm88W5ASR6v16fIvgckif3q8idwQPPjTtktkKiPa6pn09wbqvq++jJVVX2XVJUkuwUWSUgCSSAJnbd98Pf9W15IkiRJsR3/JH3+Yqb7n0ZLLWspVoqp7VF3z+ofQHJt26oVTdxhIwGc/CMgAqdVinMG7tzyasqSbVu1mvHi7vZFpf+teS1ITdzhEr1GXv8nANelDCwKqUgFqIiopFKpybDsfN6N+8W3xe0i0WKGe+XWxmxnvlXTkuMx+7ICGGBIAHBuCpNTmI8NmH8e+79GHQgAGG/Nj6NjMyuoIwCrd+3VAISlx2bMnWvXvjmzda5pHQiA+XV0aAVAXev7dn0nfZOtzA8/Ju80DQAI01ugJ6zOd39ubx5VkiRFUYSGhmHpFh2o8027XO4sn6skKZIiVYTojzQNBEToSUUAD1Y97T+fWM5ykhSNpUfzJ55PV88ASNIAIKg+ehXPV332aPYwiv44fDZ99MDhP0dRdDp9cmOc3Ph5yn2JgAJDAoGIPnvXWuvjZ9NHq2ur041Tq1ur2+NXObkxTi4nf0pCbTEjADSMN26hjWs/r7jy6JabKJKILVsgiE5SAAx+vXPMf/m/xwLHGKNIUhGAwtCBAKgUIjJJ89Pp9R6ATg1dKdERABCICL7A8bi8NS6xIsYokv6ICChhQDShTHNsdb1ZeeDWsTGKIkl0ZVujCXUqIgqOX+IWUbc/65sIKNEAgGL7VfOIptHAvLb4AwvUFg2x2t655FolIlKNZP2XB/8WH1iN3QyvBYAATSMiFUVRDM2Ddv1AAcD/ybm//AMAAuCYRiRJza550GhgGJJnHY6NM2h6AzQPfAKAAAIcwPByfjRmACCAAJdPHT0AYfqL/H05ugWWEuYER6/y/9UIMM8wIMwJ+Pj6rXwurzD3hVfIvKIoQ1QqSmWIygCpDKXy7u3Pd/EinmH5IbdAGYBSCW9UgmTA53rGd1yXDMltIwmSJMl/rysru3b37h8RE8B/Uv2kK+XqDV24v7FQuVoLnBF1qCw8ARllNgGqWMtYcS11MVqyLb7J2s4VlqAKljy0TLPkCZRp8lwL5SfGn+joBzCV008OqDyqYVk7rXaWQOcBqDdVXpqHyuykDjhz/wYHdy/IY7mr3lyyXc0q/0lPtm2rtm1JUut7n/+FmUVCIimQNEkeJJsS5xjjZ7rn7F7KmmOMOeeY69wvLLIjSVIky2PmMQny9Bfg6YOf3JOSG0lyJMmiepZ8V6XTXx1OyiXXtqRIzo3IBjFryyxTwADtRp6BFawVgwXMK2bsqQhZtK3UkWQVrXmgN4CKJJ3p+fWkbdvbRrZtPd//AyBI+cgIRaT3Psf03pvqLM1ZmtcszU7MLtgGzFmbPcjS7EO6yBjepXfhNUIREika/P/3XhcJUoaILPuubVu1rU2SaptrXzJmZqZHU4DZZDEJ7JFNAFTCFDARrJgAzMzm8P3f2Xt1zdm2LdueLet2XM/7Jr/g7g5DGqAARlRBD14AC33ZTMfM3DUfyZv3uXZKtrUd26N9P98X27Zt2/YE1C2NxNafzMBJr/QnPZtl2/zx3LBgW43bEKtavAghhB6y09a/nrVtWxvZtq33+8WSLdvB5ABHJGfjhM7cS8zMzP0k2gl0KFOJocQMtcbMHI16cqYtW/rh+67LdmDGAfi6bdu0bVvbUi61tdpH15iew9q2bdu8tO7W9Oay+QP2H1iX27Zt29bkmKP31mrNviRJVm3bti0zj9JaH4uZ/ihHKzmT+hiLOUErKczMNGSO3lsLD4eS7KaNknKFpicFPgAC/NT//L//6X+CJIgrKYSNZHPbhBgAQH/6hMWDIMHkKwXTp75wGGoBDW019Kc9BvmioAKCN5urzT7I3/Y+fquP5TshAQ6NYWNItDTGlQyAYJAAwQYgAQy0EUwmmiMSkgEYKRkMIkBAGG4CFmSgu7AgwBCAkS9FMAYgb57V3/Lr/7f9Wn9SZhVV/pGUJRTU50shRRToAACUXddX7md8aYvKbtSr+3FqaZMtQ63ra9a9d65L5Wl6Ad4ggGEDPAByAbBhYTgYiM21hTBsWICHGwbLhcIABtPAuMAAloEHuUAGbIyBIAEKmMY1XFAyLsACLvAGGBAMAJALmAPrd9a/tJXbH2/f3N6/thd//7rH2X3p3Lhz9jm0AwASTav6WBVYwqrhdM51/c19nbXR1r/u6+rau3SrZ3SorpgmMEBiJp+jDTDYGICNkSQ6xMS4towkxaAOAAwWkBABhhEK3oytgDHoaIh4YL1QJv2BDBNknGOHg2EjI1zo3Dw3Bq//x93neV2+fbk483wIDwC41WdYNbDOx4WsAmvMj399N/f5ngPPzZ5NH3NjujRFcEOXRrVwwgkPEdqoBCsx2GT5IQwjWI43CGIThRrwBCFWxhW1kE+3CTgGOg/igh2rQ0C8gosirlB0w0AIBtYC1ew0Lu8aGHNAONFqm+baoTv3gFNwFwAoWDwWR0ADOsDV6flcDr2xO3yl1ska2cuLVbWSLZqKE4zNSUzQmCZyOLywyeOIBwYpqgxjDQJABpGqtEEwSAXEhpEAMIgLEjFwZlA2adCS2CCSEnqAoCEj85DneOJtFE2BQNJVEWwFJ4SlfcR7d44Th5wG0AmN7iceNoMOcMUN/V2eebmO9jWpiYyQTrMyqziSh+VojKLxysVBx8IMHcOSqc0irmQXegqoySZCTHDymEwwGABkhRFBCQgjgrEBREIpGTpw2DCIKw1FOxgyFiFKlKWHEiGJVadhJSKde1iqy0Eewr9QsXHvJBICPHHX+/e3Y6/WEzWTZqAyKpsqD3EfhxgjFzMh6IFYA4AEszpM0ugsZcqlBQKgoFpJjAh0gr10ZIb9qkjUCShMVfqmKpbqXbBFrMF9TS+7tuMf+zs3gCkmb5zEDED98a+de2EdrhkxA12NifEWt/vqnscQuYQSjAVGUA+wQsJ1aZEQsE8IaKQCjjoL5iXWVF51p9+JJKQTsfqVntG/ymkA5eRdkywN8Af/HfmTn6786Vc9dahaUEY9cfN+3PEY9wgmFAsBYNQDdDswQBsBFgwQ1Cn26pdYESu8qyK+yak/6Fn7pS/fjgIolLdMZgUqeH1t3WkrUji1IMadW7iNCWIJAYyzLnMGoLJm5uuPAABGSAGixOFFiiJD5PkUQIXoIFHAkwx+7rI6ur6pE0PEQbnrNU8Jjy3MrutYgmUikyOUMgGpLuxcj51j9Y4GgM5tIl4A8dyYDRYKUo2Uocf9nZNOOI8LTE3qv9+qaxWOigcoSqjQVO5XocV2jAbGzRIUeHUmlhnisKSchx5HHpJoLtKPvB8Z+9ehQhAGjDoxSpDM54QMvexjPIC6lQsCDb6x7Svpm3uERDLHe0wlooMKxLiVARKL4ywk0XhAaLHq/2DfzaTzYJsgMhAzj2NHPULI6ZxKCTXADyHcTpMIpnF8gVAwAdsAYNxlLwQAWmxNRS4Numg9DJOoAIQbdlwGixsvEKYdjNvEZSDBix9uAHDJPSwudn5o+xyhezPYEqZnIxjQLM53AHmLFACa9rlgDQCCAXRSRAwA5AAMkNO9OUkI4gYxYZtevAGKGyQV8Gn/9+PG/rAUtgxhJ900rwxAAYANppuzsxcAbA3xqu//4sfLG+wSCbJ9OWu/huIRJW46i7QWzVlH2qbDWACgUbFa8aFP5t35LyT8fLJdDeHUspTnCJ0FTXbCgYMdOrWXUbvzD8iYBu88gq+QUKfzb/zmooVGUbaczsJoToB/TuUrcPT/vgsfYtHZhflnozCh8h2/bh2uAAr8+Zt7OetPO4phq4cFAN0Emwb/LEL97Wf7D/8JcPinnyZ/E17pakDA2wa1uoF9+ReuAaVO0t+/FPD4O+1BTOTU3R69cCyTOt0CkRKVzR99PH//c0//8j+y/UsA/l+O/vjc/oNItKzXA9kg8Ii3xmldi5/YXXj+HcuDux4M8GdvXXiTjI2ydR4ZHR0YJpypv4OXf/sfq3+Ikz5xD2jO2fiE/udD7zvCGRMMuOXCzHgzz7A8++8fuAiUPBdiBd/5PH2855OQYkfu7wuLNY4umz2yUN9h5fX77N2q/5z3fu1+6K8DeOQe/uNxuIGrr7vk21pKeMulisGQgQlhKc3x8Oj6dh6s7c4YNODvr6el1yuvvOwxKBldrZDs7KvvXgR7fPvuggVPAHDueMh+//V6kdlXX8gKbIdhDtklw0Y6BEKWhTk6v74N/x5d35qQa4qh4+Pz7c3p7gdVqVte9YXjLD8Yd0gUhmTR+n1bwHu/KbgXwxvpChCTXZ4fv5aC1u+bdDoMN1Uu4YVNtKQVzze33v/Usq4IGuATvVidSV0+1dRoS6R7diGAabRUFfHx6M/geN8rD2QBDPH8ftcDj48qJlwOGwGAO7pfKkRualGyMIfn2/Pwy+h8b0KuJ94/T89tz8TkondQ6eo5IACKxOw4Ryxol3GP6oW+1KRS4CNTd+hYyzKcpQGe23Oofz77C/2KKRygqyRQ/VMxzn3oAVH1KoIUgBhVrw89IM4VU/2zgsJNfQ8AotkSSrU3dp8f+9cDvlyd4I2eY1JUZxlj5nQ0NggeNTn9v7E/P5Hyz8fljodw5kcH3IZ/+efjjDT2Z07/b2rKSwwB3LSFDamnht5y+fX1KBB1HTfWIV/rY+6V865Mis1EDmDRxUdJzIAcVXPlPp3qDZv/O/OXv/rVqvGHr8/bvs7x3wJ45J7+8/FWjX7ltr//48TOrePzuw/PKy+Ae54glNg2Sgy0dv/1w0zINURSAS/sDkhdYjr70ZROxoIMPtQ4uTO132PP/93CY/+s2/8+Vv79jNYIHc+hB8zOp2o/KJ2XPH6/P2DvS78z6Z+MPfPooAoZBA5icmeRMBM7qh/ddn3dD0RpTxDQAZ45H3uSDBIxsljc7+4KoVCSGWn0tCbT3nJmbWjfPy+V/5a874tr8mXsKRZAIRuba3gOxSaN3odXmnXlVXmi9p0vMyBxIJmEmbHGzY6P3QA62tODBG/2MWvrfJ/rsl3h0cFKGARizMs0WhdWaG8SDp96ma5fIy0RAQUclqYSKpX0CqMoXmgaI0oaJNlq9irPNPqNQejwjSgHK7kDYAangKotvOrHaRd/8IMZ2GB9qC6WunmSyoXESGsjAkKDmLwml7NHXdkiO0BvOP0WUkkRBV6RIgAAEipCBpgzQOEUK0mmOYs7Ti+Rq3lFhU4CIA9YU1tkSTCqnXUra+3F04sCr/V1TeOElnWTxaJjMmBQSq02N5OLrGx0akmdt5flBBEgKCSAECCSkdHDBAACEFaAAJfGRgKaLQwqgxO4dzxapRJsCA4Y/JIpws4y44qvay/8ZAioMl17tQSTuhJD0qHAABAwQsmgUbY5dHnD+TV5cO+22LQKyQLIAAgAw08Ew08AARQLIBISiIhNWp0oJclx/cvyeN1cG7LcXkcXYK8VUUA8LS7ShDLRmx4EeNmX8dvnc3R20oRiVUA6gDSExrReyRvnl21vTTTZYkDVQkAWCAAAgMNXIABIAplvFoBijSgiISUGIMKkgKStUYs+XX2CxbKB6iRAuFGLFBWvUNPrnXC5H8cBEc0/QMkiq67W8qR46c5VCeMFPyavm9PZQ6xt0ThIf3j6rZJUDgBABkgGEgDYEtpWjFCgiASIFAUADadYqWjWxgtfd9QT5TblUvgRh6x7bfEBhDxAaN0i8wBEd6rWKAxVx3A5L9l0zjYqrMHW+w9PfB3P/Qj73zXN9WmIfBIEA4TIBQBGuE4PCAghwCPA0/i+IJzuFsJ2skmlXMorvu7OaIUOxSg4GE3uBgCPD4gJqO3rTi8avLLfmdp0zJyES0dKSTJApjLXaY587od59ofGPn46Ls3BTswhMKO3CTSxPgXI1coEOBhERgRAAiOcSRaSTHDzb5THKvOa0MiDgkIYxruRfOC3z+s4MN2bwwQKTWbjiklYdELvSQoIjUSdNJrOL7O8Tf8rP42uTBqLMEC7FITBFggYQmbUJ9BEQyTCeSIhQERrKMl0RJisTqNP4qq+uisdZ0TxsUFBeeQg6I4+vjE3hgKvaNAN1MfgpakreWT6kJ17OnGEwdCR0RXrtM4KvY0mfkHOA5zYDUVCCAJEgeS0lnqQDcan1fH78f426YVgAB4I51/GCYD2PhnQzYxiFqqvOu4kI1k/8Dd4saYmc5xYzOrmzq7imqdeg0sEme9DKIuC4kBoIugBk/MwCYFCiACKdIHVRGqaw73VifKZd21EU1CFu5hdD/g7BiF2wKwb6ocSugMROSTrB9ns1R/br0djIe31Lm81WHjTXTi6gUKCVSqWmhCuJioeTFUlIVAEpEhQAonYUDCNTTJm9lIfW+nQoQHg3piQllnAIKGF2vhiNEsM/Nb/z9FLF4ckd9YM/M0IMlVs39k+n5782v9kdWuz/VsMz6ApQoVjcUUobetKgIpLAKO3hS8mIIEYsooECABEgUKGQysJ0zxBUp+qObFcqyPXX4c3iMs3tPylPQMIvem3/n8uqzS1aCx7wWfsHiNxhNhctuTyl/9PL33Lv3Xla/+TakCvqUQVAABER7thVXIMMkR0vYjIShSDEhAAKRIAEAUuqGiIujRW+lDLEqmO3d2Zx5YrguE6938EgDdmv7Rn0Y01E4bDDQNgDi52BCis5cnbM3Ekqw9h4b7l9NTFD//oQqaeXIXcROQaVU2qJAarGgBoCAwBgD0o73ccRkHaLJevVyd+xO98MIkqACi4joQBCEBeRHeic0ElkGN3V0iyRmhM6/naWDxL92X1IY0mT72E5kaRBwBQRLkSAEyqlBn+tiLzlIMSwIwCER5KpQE1qWLTtnG+6d3vmuM/4nJ0YBRIBdd3DZB0JzY2LDbGublWvEFMncnD+XvQeVjzo/eiTR8QEBmbXEouTF5wqMScJvY2kODQDHSKkUsAoMEgbi4oEjVSYdrWD/TJ75mTZaKFRQDR60YEQTmgKTfIOTdTRWqYw9SiaxvO3lOTboVXYpVCuM2wSj4WEIiyWOQYRTUoxRwzXBMEuGGIgAACONaKUNTaGwrV8XXveHRUJMN124+IcNCRDJIBSgZ5pTV0dZ32KmieusJqKUIICiQAlj0q2aAMSDxhwTEdlDAAEAkPBgCaoAYiQAls1JEoJRmM6x71sTvPsKoWwDXNQCdydVhsbE4kAgGhsVq3jcbFo6ytNxndiuG1aiSh6JYwg9itiNgETWYVKlejbkKISsCELkpDAGJoGKhICHI4sCGZtDVs0KfWHr+7Gp2SA6wlIQjECVtFGP1JgMEX9ZpczB7Kxhatgw6Gp9+KgBQgADAWT0Uh4eI8DLjyAIemaCKiLGwtoBMGCAAQSCgSRiQkAYdWKpm1eGn08bs7tVfusWYdHrlxYhfGDej/QcCg1Jpbt5OT/3TWdm5Jl557eTiqgAAASbjTaBOKJoAw6YmYYv1NCAkNIaRcAIDsSCdAJKggCKRLOhNGslYu/tEX/1+vf862UeMwIGcX1ypRCEV/xuINpX24hZKKnDSHrm52ZSfF+//pWFKf7GAOZsmMVk1gJiqYLjhKTAEJJufXBg1GTRiqbQAgGF/G6/Bz74kXjp0/mivu0lWnMbC/KITmSA4Y3iCM7kaiaF3mOUvL7Ww3Gz8Vo+sENOZgFgMrDqN1bxNmwTYBEDM4xLAmSsoJTODJHZG4+AwA6LDry4FI1jRI6tM1J8qVKsXiltEJ2kFqAAJOHKG0uR2g40o8paapp5k55MY9mVqyyhSNiIYwAacNKyE2AQCmagKUvQ2Tgy+lSQIBBJ4Bgiba4CAbGgaGVSO9mCzrudWJ8un3GCAY9gkCggCbABSkP2Np3Usyg3plcmpnu4ur5XjTy8OxpECDaXFCICA2Aaa9bRJsqzBNmpj0QgUB1AQ4BsOGhsWGAIp0oSNRmORI954+0Y1+64IjrBAA9w93C0fGahakyXMhYBAaQ17abLpydDvbhPlNb3jRjRRDQHRLAFeILtSeg22RtfKxZMoqKQOLIooJKJIKNACgyTNR7KiISACBSJMimAZx1uw9mmMr3VZpDN0/HQoK0b7HDTCaog5mBISGSl6bh4uHXF9LPnoqRtcySiEhALBtPyuawERx5x6FITCzYFtVJSCAooKOGTwCcVFasWCGqkYZObmjjDxQzal1J25sdGAVAuG2D216MBCbpltJGdZxeurGmnOH1Zl+q0QVAIkCoBAFGpbOAfmEebBNWAm2pe/YQxBCzIGWxKMmzEIEEGKnHEFCkdBAOmFFILOFQ1Yfu8vpd62s5AsdXxYGQkhObHrTEtAzbCyN/j452PWVtpeUeOotPNgkaYDEjvoX0R3iWjch5N62GmxLlqYAmJgTw6ZBzGVqWxy+wisKQBQYCJvGmVhNsty/NFfcZK+/AMPYH0EBIBCin5nBBjQkRQ97GJxv2vd5vvH/b/xn/vXZ2QudOlZWm8dgscmEJtK8mXvMdrBtxoNJ+0ERiSJGfwVJPYsKLACisIGFk00Mxw5O/qSTmLch7HkP557IEWQ/nmeI8azvXn///7z51f9O+uj/PixeiYfAKAQSHXUjMwsBzntbaEJYDLYJqwsORapOkVoRKsA04Nq/dFkADEBEv0ZFji32C/fLOxfTUTxlH7AnQZxwvDo2MiI2zV/+72+5+yU/suUh6ac/2t4YUQmGHABQzCwNmSoXEtdasA2UwbbkX1VNyBTVEOlSUkCiFS9aBQtw1OECeSN57dzTl/JF0ZDKCJDZ++ogEAeIEVSF2Yk7GhqAFKP//X3iv/xJ5WNn+rnT7o5Swu64uIskbAnQzEIBqwVH0a0mwTYgLAbbhLqJAh0mDNaZp7BFC0Do0MAEnmXeWXLzbDb2OvsPeYYBSAEAzMErPCDAKGhnM8VP/utP2DJ+MgJzbYJbiKltTzGoaROKekhWV7ESbMNEe4pNZJ5ylMEAYdIEwKQ8ghNAEaiwZs4CxkJq13HZTXpqpa0GW+DUCwkHZPfhRBXixKYH4oFsEwCU/Dy/+I8/4dzF1IfWB5ESdz3R+ER1y+zowiOAAlZXIRR2Fq0rgKo0k/bKZN9MUS04QKmBqolCewAxMWmkQFuu03pJ0jOhRgnHXtml0o5dvrUvlYfuZAPYADYdlRLleV3cHdNpsT4ya3VXj9xAkimuc2LGB8KkPazWg22xc1VNKCZNJNNMKBVj55Qn50iG5Gp5DRM1cUcT06R1qypEfw6UfYkhghCUEweQlo7Lxs+5vEuQtHYwRzXJR0bSXkP4jb+m/xFdZ4gETDAUzLyJINzYhEodbNtpIo1cZRO1LZqjSM6O83K55lE/v8grjQYJtXG1ABX0ZyuwD6QA4AQncNPhdhpsgENQKMqDnAbjqA47Pnj1Yq9/N8jvJt3FDG69xX/ZhTfkA4AUKQpRANHdFNtmTSCrq7BmyeFYugyIDYCUL/UIlKExUIgSgBoZk3VY4WQdWUkziJidT8lrsbohEToGV8up13o10IjmWxQqEowVnUyXxmSpdY9cffimt6JMWM5g/P9i+h8OiYgiCgDK+G4Aqy67eKMJgBZioayuIuyc8rR7AgoACLToyUW5xjR64zItNU4Yt+mTFwoAGAnGgnTMLQ5BoPQnG4C4meBYI2AAYEYHnVBAKC59dCJvSH1xV3+Nbnw7VTymgEESCshWkasX28B6sM0MAKf5m4W2MDUP5NA4kk4yTsNhnKoTddM0WdJJXXGONWZaAQDGPjks4MQ2ggCb3XK2aQUAbIBOgFItluBFG0roi7n+Xf/Gd+MMp/SwCkkQjPMgq5FmscxeVYUJMDExGBaattrfBEUTwqQJUiCdWyedcMEkXeo2T1JUV6yFHHNpHlQYxhohJY3zKBrtiWlgIA2aGUrXQVcwbHSygPYISepKiVFDk6hyzDUJp5Ok1bIbWKkUKGChLxYLTUrDjCKyEob2w0DsWCAYLxgVicKgHgYTFoX3AJh2FeUqi6ibIICilYDcGK6kvjQ/L/dpBUGgK8bCHU02LTZDjAyyX46KJPoz08BNgydnAMAGw1DRCQHAvBxGCQlLa0QttTaJXIncSDyOnzKgRRqOCVicQwGUtWAbwJhjkjupaXyIqDqFRCl7qZOROqnMFo9YCgkLDmhLaHHBYYFYFGXVnhJX6nl2Fr9ZgHWNEbPt6UAhRrBBClrvKcj4ifQfcbAgPaszBptFk3QgYACgEgKUYDkoMjYPNRnEvjd0M9kIStODBLzMWbiHrSrmwTZzwMQ3k/1sM57eh2d7XZVNr75UEUQlxViG5RC3zM09bsdJ30x9A8wDWeVwFE20+sAcb7LMyNNyyanmMWyU1xS687JLKhCwLY2MZaHMWLIQyoEshZ33mQyd6MoiBeYpCEhQAASh7VPu4mcbBw0T5mr94ask86rfJ+5DArACKBaxifL2i4k5HmM/c7y8v+gf+lueMt4LwX+Hn+D/wy+E9rqK9+m+/NP+plf9BY4TvwBBlpS0yENHNUeRsOmrl/1eR6TrDvWdyrraosf0jYKxLgm5tR+HOPHSsi8c5NSGN4jN/hUxgj0jNuHNcQOjzZg6DJOTSQyw8/xgv/JF+tV/KBpMXFq1dqdxjeQAJIbo+HiDRFobBZAFmKbhnF++JM9syboLgHyRD4ooYYR7EIDx8/BOBj2Ke+IdAdb9qe3+7JUTzqnyAGBVgEQdA6U9AsdsJgFqwdcsi1WlVjL47Iu9t0cVs5I2EsoKQ95alDQQGTYGMBpWXIhwgtEG2aeJheYZUAed2MHGRJqLTWy9fcVXIjc2acYn/UGLEZyGHCDBKH5Et4YL4QBm9c+c/X4FBGxs2TQs5WvwAHg1V5oyC1ChNOUNDsCn5nqUTW2sgMAbvrPrf0SsSbGQSDCrqiAKBDoAzsM6Nnuibpp0YNKhgZ9YGACYSJAwZLTdHqEcoLGY2SeGjTeGNylA6U0YiQkCw5jjgxNY0xwkJuaaqJuTEYjuOOUAEYRjvxFtn2PhyC5x+Peu/LkAG/cqrYsVAHfP3DA/Mp+YOzjE2IB+Zy+uxWuH3znze2euLgIutkpr4w7o/LHHf0vtElnkAAylxehYEY+Fg6bZELNO3Ntw8xYJZ3AYwPI1MWmEpgBDCkuYAvZPQDROOB4h8mQzndZsZmWW6xTDZnCBWAJsdIIQwCJIUwYFv0mjNayYawjyyxhtiqpaSqDYbQ40YVy2D2t/AgzHsrSxAjb2L9539+k93NlMSuxRSJAA4OJIyJvaXDv50/P6i3dojIvhWDAbf+i25LFYWgeU0SsBqMVUdmDRSXqyYjOtCrR1ZoWwwSTLkAOAfSLAkdvODBsAPFqiGQgRuFInjTdrdIIBJlzXkMlRbjxsI8CVr9wNxIOJ2gywK10apQBYM6YMQbZlUwAsYL16QP9Q/H7X3/ednUdfSoQebBSKBTsGOr5pZIzQnErztfa8V/HqoQoLwLbZEXUEoA6FMTLTSOBhvEXUC3FJK4gSttZWdn1ZHsUiw2J0iBCDnDjFhoUFeHSQYWMgkSueDFodwAAYSCi2FtSSPFuLw1eu3JR0Ej9ZYCFFkgYSIMAaG1X0gIEhBDyp/rzvHVVWGmDioVjZBEOAQIGAd6Q8qQIIBTH1pgcWOhSgDoDAqYJL6ill2innH2y6acKBqWUyjjSWMwQmE2FIMXrAaugZqbsIQrQTYmPTcest1GvjkQyfEUo6WbRTh4WtF42t9gsq2WqN2rFX1rvVdCiHXSxDkgEIQGYFwUsdhYA7C/dWLGQAcHCGFigEXMV7K3cWhnx4gWk097HCMA+WljSwI1br0d2LoJ6pwfsUNbVsiO5OTpsXSg4LoyXuvhB2aBPoXpMIEnXLwhJLLDZpKdBKAVBR4IKSooQu9ovBMM2Deoq5ynBinLV4FRNALEcxkwVnm/acSYGU3Z5G6CkpnDObdtS7Jn2oLrQgMyeBNdEmSX/l/mEyPwXt06CMrYoC3O1k0s7khQ3ooHEm0p4c2/pMY7LhUQxBiStBCNIydAMqNFATeX/w3q+7W99ORFjO7D8r8tqE3kgw5AIAk8VHiRXdSUiScEgqKxqoUT7wm8nnAQAAIN0RlxYjYuGfeeGzD9ufPerPP+y96PdKJg2FTHmtGAIUwVggCVM+sl86dusBAY4O1xyEdwYbRuayAYy6ORuCABIKWfRDp23IWne117zCTW997GPc/GNeWhUAhQEQC0Asi1kpJA2a0IFIMxZRio4hlCVWBGLOGAMZwHMbOfP9fPH90/vCV7tv2fTyXg1kDEtmRii2Jl4/A9gAm5b7zuDEE3sGQDrI5lL8jMsICBihNIJ3QEICD03QD7xos07UXSa//DDxtwMgEAC0tUouoxklQQupcVauwSSpSXWOdw6cr3xoxkkHhFjWEyXbWoAAScDiX3nNt7oDOzThoy0vYaUeTHl3HHQE3RGAAKH/y2KzXwKBDUFYZlxRDkSAPiZlCREQahyIWJz70YurBa/cAYDTqTPCgGGJBgh8i3v72395BOvoOQTu0fjBuK+O5N9O/kTARJbIwsCMOJ0KIADY2KV/bBNpUTGsxFlEMKB5p7rIRtLShyQEYPRvuulboHiscUXFjRJAgABAwilF+/ybX39YwMTa2EPmlmgfSbYthwBOwee5nUBU2PaVa1yu6gqiV+3TTqdw0vnwq/HuPgGXdo+Q7OMt0UPGxRKoulYrGMC5wAImlRk2HeODY0iQOBJ3A5j9c6PdI3OuEA7LSoAZwTACVh+7MAKVbgKfaG8+3SJNYePtf/jwWa1XLeIwQ6EKPfBAHbyE1Mke7lF1mvKi38tkSTZifPqJ9hnIQGAjZ5xrMAV3kSEMwNilaEYHvoab8gCybNFhY86FVEARxpgJCgbN7Uh/EZ5trIu1sWeiBSgY88gGY+MLp357dXkwdbjTedysYiEBi9v17uFO8sAJ/aDnA6PdcwoKOBN9V9w4VgEgNhgAkNPNzMoG8IYARAMRkn6yCTLs8bttPJBlLpvkgQFAifTb549xFyhjBf5ildkyt0hGH16EjO3Hn55s58HfN5MPvnjDcA/JBZvuuId75B6N03iMzjCsafOlzPfaN14dB8r0DpLzTyVhBvOoxbMBFTmy7ECQFmK56kUY61xREhh1gDYbHm98zWACwLvPxyNEtBSrhIfXrWIIIYKc2aWzsHRWti/zy5eZ5aPGY0YTXWpBJp/jHdvjf37qX5ihdUzEI7z7fACDOk+HorR7DDEbgAWQ+Bi7IkVOPnqA2Dh6zNMwGIwtrgCIYdKYV77ki/2PJx/Km7uH915nCkO7Tx89OqGBNBcjDbCuqwVbAHJunxjJl/JOcz6U8cVX/EYpQouFKd57nbuH4kZ4xMO4VP1NWPA8hGLTaLKq3s1Kbi06ZRge61xBiuoAjIyhMU9/OeH+IgHnxuvcEdCKB+ZNf4AqCqrO8z94AYAkSQpCiQhunp0vI62p8nl4J5fC461/+MPaEbgjN14HxyE8GgYjuh2LA3BxZtMryzQQgOk/M13hNiHIKlcEjgRADpXQeebLBgjgR/eZoJUn0PL2D5qAB+f+eHn5Rx8IekUAABLhIOh95jI/hi5i8o6X7JQnv/UXf0EI0MpO8KP7AACehpENf2MATmTTkCjEiXMcLg5je2wagrVBZlxIHbNlhCLGUTmXPgEKYD550Q4WZvZ69O/+f3o8RQiZ+aWrzkCRCKHOdEa2OT8Z6QcGMczk6f/4Q3Y//5DR3v3JC0yAQw0BMPv+AuJNuMaWQwTmwLqLDTD2CdgMNgYyW3kGrghqlIANl8LZ+hC8AprDnZ0CQovW/p3UM1AISNM7e5lZG0iJsARAtg+S9vNCMaQSuqe3x/5//QEZLXUqcGenOYQNeKCc+NYGYEokYNNBDiAgSD8jAGyMfQKABXiwzBoBiavqi8BL6NF/B8Y2DQ6dgFY7HEyd11O0BhrEVOWipiNEQj8pSSqJWlkIpadrna3//zschgUFHDoNbAMUwAEwu0ZzkeFNj0QpB/YZwMUFGLtkE65dEvzuYlfhgVVXYIIpTHmCsTHDeBMAWsOwtieIUUThGE+6SD984aLPXPSFi5QGFlARItCpP/9Rm4WA8WYGxMCABsfjIjbIKHccJg58GU3WaXmBcKEAwHBkrtwPir1AiDjFhbGNOt4jd4AQrhSYvLj/xvTt0+Q5Aav1IWAM70jOgZbqlRcB0gSMADZJwdvuB3HkuVOEpbRoZGNiMohRWucywIJA2mnuD4iiQr8srTYdfXo05+EFAIk6IQovrg8hdB5gNU2Qyvj9L9rk6EcFjAJBbOpAy2LswQYBNi00CkL7Eca2MRvhglyQF4Q5l00YkAtsKkKAjYzx21eISok9rzaLEQdfmmkf1GlZLPU49c6GoRmz8zj64p+0TJPBsedVQgEMI7odyxuURMg+DfUjAJzYQEIrG/WDYfYM8AJwDONwJK5yBmYkCAyDocHR578Nx1HeudYrwdCaVL76usfxdQLmGwY5S1NPLu5/+f/UGqKGhGt9Ku+HB3iFTVXP8gA8iGHTQAAIBDAOHWiowuNjjO7vKLlA5iqaU7GYxoP/97tAAvLaRcbSLPivfzS18XI2y+jYuPO3f/I3qGmvdGe8dn1CfCO8xEAAZt856PG6GQxACAcCzyzAZpcQEB7NeIcEOADCBtjE0qS5gFwF4zCT8e3//iHAAH7nvGq0dgRMxh/9zanvyJyJDDN56d//hFf/+c9or0o5avzO+Q5QwIdMHvxaCEFFAi8Y+y4X49TCy4YF2afwfQcxSgBZ5IoRuSwuBb797z/Ez68K4PV71+uaWRbrN19JWc4W0fzOn/11S35Xg2vm965f4RXgeC9uJoGW5czo8J8ML4CCMDD9cWebJu1Y3jFqclnmiuA9PEp8939/n7tf+B3xTnO4eudPr9cYAS25zvBfP/uL8g6hcgZK5ur//kFP/tcfkmBo1/un16+u3o90XoaXfLgEZNOPThv7S+/UCKHRn0eZIfvqsWgAN+tcNkhw4BkgmBH+5Xv/DSAD4IPNhq7Alh720j//PsEXzXmoc7p4ip1r//En6MwSB6H9YLMAAbKPHjaABoD1lZdQjHseUTKMXTrhdzgQxE0DAYTlBYLY4CqiD1bG5q0v+V/Asw8cfXviVMp43Q1IiN7nXzTnA3DnFP6tMKrnV7aXpEUKCziVfHuC46ZQBMDQTAMtK4EHDwBeAwTaXnwRyJnAawMxABvwChoAEDfrXGFSVAEY4OOJi3o1Bryar+VunWIxxOjDlNerLII7mOU7/KCQVGaPb1YJ5mv57tWLA2UtdVEsBVpmhkgAYHgAGwaj4blryQliIEbLv4yFGIYEcbPOZTBSCYQxjH/9CVAPXPS93N+RvIqe0m4Ugtf/3j+41elF5QQAwcVFABFVh7i7151m2cny5FV8R/K9xMVNIaCK22zdQRRsxKxTXds9H4XA6KXkSvf4Ku+GZoMr9cd2IyJ46/YBMng1Tyr3VlOqsfQk7BQ9vBm/1Xl6j15fBR/Yw31IfZj2gxPn8/Kjk9uBWbKyGincW3lS69WLACFpWKxEnOdZ0KvhTc+XAJQTCy8EFAnZmZwCm5sJ18QHWfLJginl4X3n8OjOWgDgzsI5U2KpMVZkphKd3djvsS29vpCMexx5HOBTr9mZMhjLvyX2nLmzCBAgqRgWghvirm87pPhGzzSKtFdkxEda99czHh9DAtyUXEjiSiUEtGclFSCK2JsOA45TFAA2HR8rFCAUIXVy44IBSPSK0oN5LA9vwsemAyAEJQvqBJGliPPapMLICDYFRCGMM28sMzpGZvAOmskaY4EL0w5syGugnjhy6AoAKABMFsBYYUINiMWCfYximQ/GnC0iQ61W3ZcsEUMMMgxv9iksnxWY/uSB7JcZYGyEdfc6Vx6IgYcKkczuB3Yf4AUAIJZKMUDKbj2x0iCUOoAKAA+s/PNek5VXfurQRmvZYYh1T0TIoefubIxra4MKN1Mu42MRgGPGBS6uWglxDaPAEHnsfZj6EbxYAIC2mJF9FFfBbihA40T249kGSIAbNQ+zEmhZjDrMgwpLKNtsE0FhEP1xh+14XiDEm+uUKdfFO1vts8RxT0UQ2Om9gx0EwAA4nXpL1IcCAVFMVpNJEDCSAr97Xn94vYAMEIAaACTrgZaZRjAqF2ZOJYp+TgqwYQPAlkUzUu98hxB9i3LdPeVK7rfAAGxUJi8mL0CA4gIOuZ9o9kys8j4q0wJih9F67s7EhHA0ZRxh80fn0z8/Pr06gGAGGI71YSa1VGJRAQyViWCWXXCDIPoTxoiCawD4jostcIFVrsIDA5hcCDuZbXpXrswFelLQRgVs9C/23b3ekztjUmJn8dylF48UGTWuxZ9u/vHx+vvrU7wf+bwMCPDyAsBsBFqWOuswvLHpKvbfdavHM5utMf0dNJtcNhl324sxyXJp7qNnBXdVMUEZuKgAuHteN/AjfII7cihjgH7ZwzW8ht/Z/N64en8Afl4ZATZUkpdj00AWNBIw8mpYd5567IARe1BDVTbvkCAAOJa5prehWFSAwWe7c+79n49fHGGFtdFSDZ3yDg7Aq7loyixAJSXK+zHnIF0vISAMkGJ2ImNjI9Cy+mPYID2HKQQhHIi7hDvvjP3CO+K6G9hsctnEYYIAgDVeCHjsbH/0yz56AeFZKD7l6yRRKUyQsCAAo4MfHEQQExsqqZl6Ja+VrvaKoaxpJGAYTULsdbrXutpEt4waDpt30CAVMCQ/fj7jCqvP6B95AEYwjpM7vTOvfTm//zXnneZas9iH8etIEDMmBYAixzu+xJceNju2sRCCihBtXEyx4WX0zfYkF4sN0vHc8Zy3sbtaeaZnEFa4GKAYilRAaHxMXzg2zbMXz8dz17kiW+fsysYmeinceLjJTWqyMQBGALuBltk0bGPBUsDI9NxAZxCUfkYbG4QFeLSszj4WYT7bGMFln3HZFNbYhgoWIJumzM6Jctx5cF5vO3/0Z3nhq/8jrk9TnwhBAGZoGIg7dgMts560fBrC6CCgIgjgACOGsZkwC5rjrhBCdFNwxdKcKwFKK7GFrCj0MMNeE5l1dI5BwUZhAIaWxjKAloZACwCYWUXRnvf6FSM+AtPvdxrG5g/M8oUwA0IDVw2KsdQfbFSsmFlIl835zAxmcwCeF0f97rgHjEPvnSSavC4G0PKxBL8rW1nBZZlxjcVH2stYwiALdhWLDmaj0jIzHYGWhQG4lWkQzerCrAEug8Wm/LGmV4Q92utOSCncyGVUXEjBVeBbTi2OnzNw7qU9zN7EGTC88YM34DEEZNU/qDzCA363DcOw2T7FpNmn8v2v1Cca67t3/xFLXGwyFwJWuJa0AQCgc3QOZpXN2A+0rJyJAJZwMv5iHh9fdM9H8734ggcYu+MDARjtSTJcSZu9JDFgg0tZ+EsX/rv52ddcXvf5nEJQkbsDWrEvTrhsciPFNBRubiPezB8Lalp5kQEAoFKSOs9/tdWXTu8P89Rv5uFzzs5wzl7RB9Eed0hz5C4yMpP/uC3+7h5edhDaZgLF8BXHl4QLAACQcBdACyxyxWkoP9jKEpB50zLMCGBtIU4Vd5beZ7nycfiCAlFrNOUdwY1CyT0SA1AUZ547NnYSRcDlhLPohirToQnZZK0FH3bxOWh3PO+mhwsJSxubtLEbaFnWCAGjNxaXcHNpYLSR/IHR5738nQ56m1gGUtj0WSlCfwnryTFkQZMPc2k5gyFIaZrPyqO+K3nFnpz82mnBB8jswAXauEbXvPYbF57GQMtkLBLwRfJ0qEFam/fy+A2XcC0ovfjlJsvh1gtz7o95YU+KAug/gAJsLuiID7T+TbK3VnxIvSUdUZ2Y5vmzyz+eb/5vYjm+AHf0AQCjjyuUaAKCoRlGW6BlPgt6UH4K05of9MSbL9H2cA/bqRe/OHL9sTMmFnJSvGMzO/GLZ8jeczcOAGrncM1p9T0eLbvXQIJ+ujb0+vj41xrIH9wyotq4shLCzV2WoaQi0NI6AAsCCBzwX3Qw8eAJRxd7CQoBcu428ezJDkVk2xgCQPa8ROTAwhPZoslHJCjEvnPFK/NgGdrZlMieRoAWdjg3bpdO+F3Ibqm3X6/2cptHnLj9IKiItD5f5UOP7H4xBE+vQVkC9pUrKQGAqCwbYNMWaJlqWwAQrOGJSz9evXvzJxEDoP3XS59p8T+IbIaCsblB9OfI7vsMNZJy7/wpWk5mP3vfh6P7UZErMxYn/2Zr6idaw89MN78siakAiO6Vy5tCCUYBysYYCBjesLQGWgocsCKIHL7+q89+hQt3yU3mHnk5cd1/w9WicPEr13R1q56PX6a1gJvzgYgTRcTYvJnNgnHKzFmzrigrkbXFJE1e2EU4vn0pfe6x+1Hnf1mHZyvjEAYSABAFsE3mOeFKuii4Qoch0uCGtAVaEp8trZwa5WSevnzuyfyFnr4+x7891xLhyjYedDMXcuV7F+qdGXgrmN7zhev4iRfvbYISCuR0moZ1ymw0H13LGEagvRq3ezn/W9FvJBH1SUsmBhDLBmbLTZ7YAGOPK5aMQQMQ0hdoEaoRSIHUPRTzFNxpNs3/Y+2lfuJ919d+7eLvaWaowB9xydTEzJKNRWMRzhPOuF0AGDtHA/roL7nUOhfDV/Yz+/+p76JImX31yF8H7e1V58FeR/yIalVu+8DT2pgshwUj5I5cxoyrMjILGCVvQIBkNAZaYtJBUTn9+3FvuQMeE1e0hTownEB487fnVmihVZ+3d3ac+3/13OY+r8gGrAhnD0A4UrIwlguCSQ89AVMMgIE0HLCqGCCrAK9eyAuFAW4upxPUqJxsTljQ1hAg0cCVFh9gnSsgGWFHD8CwYWFIGgMtwYCjM3COnI/LT8dF2YMSIBTCgg5GAYTAqDGkAbJR4cD0JZ+MDRBUzhjAoRePAwubRWss0ZM4ZjGFgyQAACTgOKAE41VndhUq109FY9SblkOeqmKtQYTS+myD5PegeYNBAiADaQ60AMGcwR7Z45dxXW6VYa+CChCOFkBVBTASEAoIjFDooPRkp1QhaKy2RTmxIQPYsFmat4ulHuVoYoKENg+i2WoMXAIBBxaV9NMiTdQn68oEeR0AgYA5VyoBRuKK6ojHbIzOQIvhpr8Uzpfxvnx5OGpGe6VQSLhjUARQFbAjOyhi8SIoRzbcZVlCQ6lQIccUDYDh1AAAgBIALDL6KSqt5yT9/OHnLz//6eV14gMx5wrSSSvZAg1NDlh0BlqMbzQ/2xzIx8sv8dCMvCYHE4qIXfQJFeFhDE2BPfycWfjG6yZ23wUha0EXgwP8BD+GEUs280GakpEcobg+2fVd3Nl8o1imS7MYOAfBtBlTJ3AFnDNrNCiADcMyUKQJHtNwe8QjeGzsnDg3vG68ftvB/WE4TgSccZ1FAAzjgZ/HL8BYoSN+F2AIS3EHG8IEG++5Vll4wskJpXhgZ3pPBs+wTJ08zLQUQp3TzjIiF5KVYKReuLO+KDRiAyhsGSze+TWux00MMRJHwHlmRBfGahmR9N93sCz6nQYDWKel//Qgb2ITH1ipn2fwIjvTG0dboGymXIzKcxuOxyDDZi/QYqOVAwpFLZXz7eY9r8/KkTk+p0GALedzL5bpTFWH3lZpAGnjPYpDeEwc/eepXhlcL4d3KIANRp0JV7EWYQCDCA9csgFIS6BFJ4rCqXv8plyPX5jDZngyNSYGYS34UXFiA9FgOTRfA0OGCVI8jl1T3GfjmbgzlWaxjYU6C8bXuACl+NUGBgsAks1Ai0xYBh6znZ9sPva6Z4bmBCpBFOCx+TAsxiFajDGXNKKJD+xQPTN4RmOy5MWCAmymXMVsY2CCZ0cYNruBFgXSd2z5RD6Sb83xyShyBCwYXlMC6RcgtIE5SIAOnVSSFOfExwQM3tgTx3hHA6xw2YQSEe/OsNhsX4XQk55zW94vv3aOcByzMMdEZX1KRDmw4QSCIC2ErJE6dDDBgCTaFIfwwK55Ymcbzeb14EEkrklz0bUfCFg2Ay0vxE7febhc3/nZ8qAZxsSYBJznuowO6TCM7vRcDW1slJu0YSE0i6G8PvH4VL0+bLx9IFsSQwiIbtcoK5GYkfoDw2Mj0OInYRnsJOfnr3z0yp17hhhCWDhVh8XwtO5O3+bf+2NdAJimNw9stGnIJS9WisevOEQ9SQnqlsQZAJQxDMJmAcOQ1ANHXR5D2N6sO9wKRi1RPpMPnvnmxZEMkRHEFnCWLCwsGm/7t+x/d9DxO5p+Yv8JoEi6PmeABpBKXsrz8lKJpN2GnloDU0YoC95V2m1iST3Qw5ux5jCI1UALRlFJvXPP+Wj5pTzE0ExhYnLBpcgCjNDQhNHsbfsWU/eA/XBK3T8A+krHPwFsElgnSFGNnj00ZXlAFLAr2F7LZ1XNIQhDAjQYDLAUeBDi0u9xXK7Lj+TgMIwxkCACAGve6xHOK0wCdf88beqGi1bmGwAP9Ls4axft0IPJcEZLKWEx7QGZLmnQsYIBLRyCpFn49RAUYGPYzAMtCBDM6ffw5ZdyXW6WYQzDI6ADnU8B8XpZIbR+d1a9CRrAZHtvKN2v8CVSAeQKOIxAxfgNFIl6Bk98M/HwAQB7LRmqEHH6eCauu9kBAJitvAShd04pX+G95YtyhKFpeddrJxUToTyfTCkwP0BBQDf/zS0v9yWAflzHCze4ZgDgAggYnMskEF4ijvp5qhczx6GNGZC5gM31gwFsVl4KoBDK0peDO9ff8otyGKNmEiYmZ7IVyIFLF8p3nwJpJutTANn9J/f8o++Pn/GKNxg3IEa7DlEswi0exy7iMnjLsx+mvJIhUakeyHkdGIYBkKuxyXyjETqDzolz4+1cf577N8NmdACdAdlCkPrdN4rY49b/9wjIonvKyPWlCtOIArrzIQyOhIDiQThUz/RfRzJ1khjoAAzQORQCAEVLrktHEssgu7/R8utXPno9vnvNECO8xolGbNZH/977iAZId58D6N4kAjg3tP7HxJOAM4K8U+tRQ5I0ClM8hnPqt/SfKMaOjBlAhwIYKgQBMACjolj56DhD0ZMevt2H997y6StHciwzCShXysdHf6GM+vESxH/5drP/D/C61/fPpuszilVWIbnAOd6mAZ4BJLhTHuI1wXniZhvJTHpQzFAAQYB5ico8bV6rYGYhfeeBXH+bn90fHoyhTMRgEG71p4703xOvLxnM+H4/vf3Z+wUw3ZwgoSNxBZjVzZB07F9gseKdxrG9qovpl7x6cXmPGmpSD8A5rRQbzIob3DaAR1gGTrP8ZPmo3L0ZykiEAKFjLvTGR+Leal7N3RXo+CC7f4gZuOd7azRSlMXifLb+wLAQYDBxSRJQPBKa8nX6r6gzRYYZQgVh0zLOktaqkALUYnv8uvOBfCPHMUJGQDd6uj5z8xOyiHLz/2kFIpuBXzCb9qHU5ucpRUSsiDqyAcSAJJNRnBQPTPpv1HdSmTjuWLABigUOtb0AAhSOyqmX2+X9+GV5VI5jWk47i3ELzt7FxvsRxfX/9KUVQPXjhYdTH9fCXoFangO692ETDGgKm+IQrwlO/3WKPZrRLCo6mV9+HqkAIcj2eCQfyU+WBzHaaxImy1ivU3u2P01R1TBZ1+DRGihNEzzy/WwISQ/WdI7YayEJRVOsU11jF+XzMXh+ZTsTJ4+Wb6+iDdhA4dy4f8tHcqsMm1F4mCguZHbtLgsBu1/8AqFz8NnOgkZN0J4sFRzaKUubVylLLOvN7qzIs+QRm+Jx7Jzqjf4z+z5RcjFjRuGm3kTns85748vO8TJaEi5yrkUaE+LNoNfmu+/ytWL6/55OAVPtT1BvT8C90Z7WEJbagzpINypZceuSZClLcRGcvY/zktlscnETsXfPQ1986PzCeYRhLObabvaxzN7HnxWrBjk674dw/5vre0A9gNhSwH1aIlzRKyE6+x9mWtF5pFApT776Lk6+fnYvttDvwfL/Pvz7clCGMYZtrHQzBYDQ27n04Wf5LAqPm6sFmAoABzLw0E4m95FOEVvWpqPiUKFQgBk/j2Q+/+Lc+qa8923n9hflK/x35//kp52R8bAOG9DRj42MSx9/Vid1isYe369Tq85uXnse3vdmAa2s5WIjpBmjwZDPIxVDDMW35VGZmAADprN/PVco48qn38inLPe4kzfmIlwLQUDHzd53fPetdyUma+eCxsPBwJwDjA04fUX5RkpgY5LH1a/4n/qkWsntm89pWfzbZWcy+OWBnitCZC0R51S045+wAfPUemfXXaHI9B48/zt/Wz6yus9tPQu/roy7gw/f2ctpewglVPY9zvgb+O4iq7a1wXRYr3159mv+s52PPydWpnnwKa8ACADWFYFfPs6+cdyVxcQaxfL5/0JZROccvj38XMjqz24nfpMzQDYOXqqtwO/9aQ0LklE6d6/z8+hREXDymslN3OTDH+U8eFWdhC4S6sHh6IYIQUIRgAr4Gn+sM+sMn4SKfOTAVr3lEBTkUey2BOhzsx4iC0VvRwDfQ4TsD3u2Ya+TV3Qu2NIY8LS2Hv/bYyHBzvPrGoW1VJOiu0bE5taaOXklw0jFFdYAp8CVzu7afn3tH7MEL7OQl8fKpYCv5T5DGmlYFzJVLbm0+p1Sdsj7AsboyCCFtRDY9B1Evha9knDJHavwcwobFGo0gADgBt/Lzx/Hh9YXb5KgEW7D8GnUZ6ONWYiM6vcU4zvy72cb4MF+GKS1C2PmYhDB18NFMQAATcbT2Q9cbnIVUIBslUtuENZ0X6ZdQreKYOwASAiqrQAK3CRpAgBAQNDS0FoO/x4EoQRgFIcIJbFwhCHjRh/0nZaEkqGpD166pSq3jTT4gRj0KkKWJkw13293PbIvvP0avGzLYMpNCBnM9xz0pgBH1QwQG7W0kttvuX0BbpagIcHB9fNn2n6wogRNeabcAMn3Gva04cUwaLa8zPgRQdL1fn/r0//7DEBC3y9G4vk6tSvWcFaUWjR1E0sXL8m4jWj8xEsvLr2oGz+qUQwzrnj7GpjcUDiQAH59eH1ewn6Jgy3Msnfo+xRD43sJZ1IMfuKocEl2ELbMLeKO7vv5/oefLsFvHX0hFZEG+Jfr382f5M4TViHL2PQvbJPFF4oZoEJhXLRZYbT2JMfGBTBKiDqsOF7FoaV3fXfp40/2P/xf/cc3mYrKM37g3Pnb89wEkKjvqltIAM/+7nap8d4tjKqw1XiIFcF4x8U7FBudGF3IJoomMgAViUvA4PrF3offuPTxJ/X5NT0pSiUT3fmbs0vw/For3de4RX3nKsGR7xceXo67fVkaT2BiZXlEPAQvhhYvDAMBiBWq0kPInIj26YhRQdQFsAF0YKhoUQmlF9vntXtm693P4lnNCogSyfPFnfte+CSvgX8j7/0fUIGSJYB/b57vx39zvNCfscV5BivhFaF1lt6ozhvl9Sp6hVCRCBIJY17OYjCM68MIn/SHiwQoAIPBlGSMTylohpE+JQUwNjazX3wf2CZlhg4KhkIREKSI/mHjsBWDM8UpsZpdI6JAs+f+bc87n6/j8At4kLf//7cYMX/vkq093Xd3+/bvOzw4z0b2dnWjhqqW1FZcke+kJY0EXxwOblQYDoBgsuxCAxjEEbsFMEqzCcgIxrVlENN3eyC1+bJMDNKm/iWSgBtY2JkYMUpTNXXTO9RRkCHVE1KxTvAI03bEu9/ty4n7OgP/gYfWbL17y2cogP19mbG3DuxqV8UiS7fsBfAClk4KE6oQbEKl9TUaQgsxhIoAASDE2BIGX0ACiPCrv5T0NyAQo25EEYAQAKnwKQASoUtin6QAIYEkgJBQEowLHWHgjJEWgQyWMqqGinVAseP5fzJXDh6/nL+/nYL7AHynBlRIAMCnKEARdd7AJ++PaWVbu79bU7QlPY231h1kLwJji8EPMsKQlkaUnwQkQVGihAWEyADiISFLshRpogRRIDIRSLyKAa1EDyysLFSzuA/F89+4fdq0Kzff/dI67bMVHgHwTcKqsNXH6gWEjNJ6756C5pV9jIveeaHG7vu90yITYIilH/QsXbeia7IAIp0bJKZlKmlCQoTXHzEkgIjIJJEXKAY6FyIWBAMoHJKgMYQAa6qJQIFh0fTZ3pzvbegfbr8rP+T26c33//dhti/ScfP24+cvFhJorrdpqo/hqweJhDQVr/U5gzZ7MX6Z8cuzeBE0aUQg6hddBmuMMIny30BBMKNvEnmkyhgxFEMmvj+DBgEJPmYgECLu+gIenf4W/79l09Mmt1W87o9rKRIK6tP+l6NEQEDYOnT2T3vdkEpAQ5uG/hr8x6uEz5WIkBhuAIAGP/U//+9/+p8gCQA="}));

})();

/* STARDUSTLC_UPDATE_CLIENT_BODY_END */
})();
