// الحفظ والفتح والحفظ التلقائي والتصدير
(function () {
  const $ = App.$;
  const api = window.api || null;
  let saveTimer = null, dirty = false, saving = false;

  // ---------- تسلسل الدرس ----------
  App.serializeLesson = function () {
    App.saveCurrentPage();
    const s = App.state;
    return JSON.stringify({
      app: 'sbourati', format: 1, savedAt: new Date().toISOString(),
      title: s.title,
      settings: { bg: s.bg, paper: s.paper, snap: s.snap },
      pageIndex: App.pageIndex,
      view: App.canvas.viewportTransform.slice(),
      pages: App.pages.map(p => ({ id: p.id, name: p.name, json: typeof p.json === 'string' ? JSON.parse(p.json) : (p.json || { objects: [] }) }))
    });
  };

  App.loadLesson = async function (text, filePath) {
    const d = typeof text === 'string' ? JSON.parse(text) : text;
    if (!d || d.app !== 'sbourati' || !Array.isArray(d.pages) || !d.pages.length) throw new Error('ملف غير صالح');
    if (App.simRunning) App.stopSim();
    const s = App.state;
    s.title = d.title || 'درس';
    s.bg = (d.settings && d.settings.bg) || 'grid';
    s.paper = { ...s.paper, ...((d.settings && d.settings.paper) || {}) };
    s.snap = !!(d.settings && d.settings.snap);
    s.filePath = filePath || null;
    App.pages = d.pages.map(p => ({ id: p.id || 'p' + App.uid(), name: p.name || 'صفحة', json: JSON.stringify(p.json || { objects: [] }), history: null }));
    App.pageIndex = Math.min(Math.max(0, d.pageIndex || 0), App.pages.length - 1);
    await App.loadSnapshot(App.pages[App.pageIndex].json);
    if (Array.isArray(d.view) && d.view.length === 6) App.canvas.setViewportTransform(d.view); else App.resetView();
    $('#lessonTitle').value = s.title;
    App.syncSettingsUI();
    App.updatePageUI();
    App.onViewChange();
    api && api.setTitle(s.title);
  };

  App.afterLoad = function () {
    App.canvas.getObjects().forEach(o => {
      if (o.userLocked) App.setLocked(o, true);
      if (o.isEraser) { o.selectable = false; o.evented = false; }
    });
    App.applyTool(App.state.tool);
  };

  // ---------- مؤشر الحفظ ----------
  function badge(state) {
    const b = $('#saveBadge');
    b.className = 'save-badge ' + state;
    b.querySelector('span').textContent = state === 'saved' ? 'محفوظ ✓' : state === 'pending' ? 'سيُحفَظ تلقائياً…' : 'تعذّر الحفظ';
  }
  App.markDirty = function () {
    if (App.loading) return;
    dirty = true;
    badge('pending');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(App.autosave, 1200);
  };
  App.autosave = async function () {
    clearTimeout(saveTimer);
    if (!dirty || saving) return;
    saving = true;
    try {
      App.pushHistory();
      const json = App.serializeLesson();
      if (api) {
        await api.autosaveWrite(json);
        if (App.state.filePath) await api.writeFile(App.state.filePath, json);
      } else {
        try { localStorage.setItem('sbourati-autosave', json); } catch (e) { /* ignore */ }
      }
      dirty = false;
      badge('saved');
    } catch (e) {
      console.error(e);
      badge('error');
    } finally { saving = false; }
  };

  // ---------- حفظ / فتح ----------
  App.save = async function () {
    if (!api) return App.autosave();
    App.pushHistory();
    const json = App.serializeLesson();
    if (App.state.filePath) {
      await api.writeFile(App.state.filePath, json);
      await api.autosaveWrite(json);
      dirty = false; badge('saved');
      App.toast('تم حفظ الدرس ✓');
    } else await App.saveAs();
  };
  App.saveAs = async function () {
    if (!api) return;
    const json = App.serializeLesson();
    const p = await api.saveAs(json, App.safeName(App.state.title));
    if (p) { App.state.filePath = p; await api.autosaveWrite(App.serializeLesson()); dirty = false; badge('saved'); App.toast('تم حفظ الدرس في ملف ✓'); }
  };
  App.openLesson = async function () {
    if (!api) return;
    const r = await api.openFile();
    if (r) await openResult(r);
  };
  async function openResult(r) {
    try {
      await App.loadLesson(r.json, r.filePath);
      dirty = true; await App.autosave();
      App.toast('تم فتح الدرس ✓');
    } catch (e) { console.error(e); App.toast('تعذّر فتح الملف: ' + e.message, 3500); }
  }
  App.openPath = async function (p) { if (api) openResult(await api.readFile(p)); };
  App.newLesson = async function () {
    if (App.userObjects().length || App.pages.length > 1) {
      if (!(await App.confirm('إنشاء درس جديد؟ الدرس الحالي محفوظ في ملفه إن كنت قد حفظته.', 'درس جديد', false))) return;
    }
    await App.loadLesson({ app: 'sbourati', title: 'درس جديد', settings: { bg: App.state.bg, paper: App.state.paper }, pages: [{ name: 'صفحة 1', json: { objects: [] } }] }, null);
    App.markDirty();
  };

  App.openProjects = async function () {
    const recent = api ? await api.recentFiles() : [];
    const m = App.modal({
      title: 'إدارة المشاريع',
      body: `<div class="chip-row" style="padding:0 0 12px">
          <button class="btn primary" data-a="save">${icon('save')} حفظ (Ctrl+S)</button>
          <button class="btn" data-a="saveas">${icon('saveAs')} حفظ باسم…</button>
          <button class="btn" data-a="open">${icon('folder')} فتح درس…</button>
          <button class="btn" data-a="new">${icon('plus')} درس جديد</button>
        </div>
        <div class="hint" style="margin-bottom:8px">الملف الحالي: ${App.state.filePath ? `<b dir="ltr">${App.esc(App.state.filePath)}</b>` : 'غير محفوظ في ملف بعد (الحفظ التلقائي يعمل دائماً)'}</div>
        <h4 style="margin:12px 0 8px;font-size:13px">الدروس الأخيرة</h4>
        <div class="list">${recent.length ? recent.map(f => `<div class="list-item">${icon('file')}<span class="grow" title="${App.esc(f)}">${App.esc(f)}</span><button class="btn" data-open="${App.esc(f)}">فتح</button></div>`).join('') : '<div class="hint">لا توجد دروس حديثة.</div>'}</div>`
    });
    m.el.addEventListener('click', async e => {
      const a = e.target.closest('[data-a]'), o = e.target.closest('[data-open]');
      if (a) { m.close(); ({ save: App.save, saveas: App.saveAs, open: App.openLesson, new: App.newLesson })[a.dataset.a](); }
      if (o) { m.close(); App.openPath(o.dataset.open); }
    });
  };

  // ---------- التصدير ----------
  async function renderPage(json, scale = 2) {
    const sc = new fabric.StaticCanvas(null, { enableRetinaScaling: false, renderOnAddRemove: false });
    await sc.loadFromJSON(typeof json === 'string' ? JSON.parse(json) : json);
    let rect;
    if (App.state.paper.on) rect = App.paperRect();
    else {
      const objs = sc.getObjects().filter(o => o.visible && !o.isEraser);
      if (objs.length) {
        let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
        objs.forEach(o => { o.setCoords(); const br = o.getBoundingRect(); l = Math.min(l, br.left); t = Math.min(t, br.top); r = Math.max(r, br.left + br.width); b = Math.max(b, br.top + br.height); });
        const pad = 40;
        rect = { left: l - pad, top: t - pad, width: r - l + pad * 2, height: b - t + pad * 2 };
      } else {
        const c = App.canvas, vt = c.viewportTransform;
        rect = { left: -vt[4] / vt[0], top: -vt[5] / vt[0], width: c.getWidth() / vt[0], height: c.getHeight() / vt[0] };
      }
    }
    scale = Math.min(scale, 8000 / rect.width, 8000 / rect.height);
    const W = Math.max(1, Math.round(rect.width * scale)), H = Math.max(1, Math.round(rect.height * scale));
    sc.setDimensions({ width: W, height: H });
    sc.setViewportTransform([scale, 0, 0, scale, -rect.left * scale, -rect.top * scale]);
    sc.renderAll();
    const out = document.createElement('canvas');
    out.width = W; out.height = H;
    const ctx = out.getContext('2d');
    App.drawBackgroundRegion(ctx, rect, scale, W, H);
    ctx.drawImage(sc.getElement(), 0, 0);
    sc.dispose();
    return { canvas: out, rect };
  }
  App.renderPageImage = renderPage;

  function allPagesJson() { App.saveCurrentPage(); return App.pages.map(p => p.json || { objects: [] }); }
  const baseName = () => App.safeName(App.state.title);

  App.exportPNG = async function (all) {
    if (App.simRunning) App.stopSim();
    App.toast('جارٍ التصدير…');
    if (!all) {
      const { canvas } = await renderPage(App.snapshot());
      const bytes = App.dataUrlToBytes(canvas.toDataURL('image/png'));
      if (api) { const p = await api.saveBinary(bytes, `${baseName()} - ${App.pages[App.pageIndex].name}.png`, 'png', 'صورة PNG'); if (p) App.toast('تم تصدير الصورة ✓'); }
      return;
    }
    const files = [];
    const pages = allPagesJson();
    for (let i = 0; i < pages.length; i++) {
      const { canvas } = await renderPage(pages[i]);
      files.push({ name: `${baseName()} - ${String(i + 1).padStart(2, '0')} - ${App.safeName(App.pages[i].name)}.png`, data: App.dataUrlToBytes(canvas.toDataURL('image/png')) });
    }
    if (api) { const d = await api.saveMany(files); if (d) App.toast(`تم تصدير ${files.length} صورة ✓`); }
  };

  App.buildPDF = async function (all) {
    const { jsPDF } = window.jspdf;
    const pages = all ? allPagesJson() : [App.snapshot()];
    let doc = null;
    for (const json of pages) {
      const { canvas, rect } = await renderPage(json, 2);
      const w = rect.width * 0.75, h = rect.height * 0.75; // px → pt
      const orient = w > h ? 'l' : 'p';
      if (!doc) doc = new jsPDF({ orientation: orient, unit: 'pt', format: [w, h], compress: true });
      else doc.addPage([w, h], orient);
      doc.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, w, h, undefined, 'FAST');
    }
    doc.setProperties({ title: App.state.title, creator: 'سبورتي' });
    return doc;
  };

  App.exportPDF = async function (all) {
    if (App.simRunning) App.stopSim();
    App.toast('جارٍ إنشاء PDF…');
    const doc = await App.buildPDF(all);
    const bytes = new Uint8Array(doc.output('arraybuffer'));
    if (api) { const p = await api.saveBinary(bytes, `${baseName()}${all ? '' : ' - ' + App.pages[App.pageIndex].name}.pdf`, 'pdf', 'ملف PDF'); if (p) App.toast('تم تصدير PDF ✓'); }
  };

  App.exportMenu = function (anchor, kind) {
    const n = App.pages.length;
    const pop = App.popover(anchor, `<h5>تصدير ${kind.toUpperCase()}</h5>
      <button class="menu-item" data-x="page">${icon('page')}<span>الصفحة الحالية<span class="desc">${App.esc(App.pages[App.pageIndex].name)}</span></span></button>
      <button class="menu-item" data-x="all">${icon('copy')}<span>الدرس كاملاً<span class="desc">${n} ${n > 2 && n < 11 ? 'صفحات' : 'صفحة'}${kind === 'png' ? ' — صورة لكل صفحة في مجلد' : ' — ملف واحد'}</span></span></button>
      ${App.state.paper.on ? '<div class="hint" style="padding:0 10px">📄 «ورقتي» مفعّلة: يُصدَّر محتوى الورقة بمقاسها.</div>' : ''}`, { width: 260 });
    if (!pop) return;
    pop.onclick = e => {
      const b = e.target.closest('[data-x]'); if (!b) return;
      App.closePopover();
      (kind === 'png' ? App.exportPNG : App.exportPDF)(b.dataset.x === 'all').catch(err => { console.error(err); App.toast('تعذّر التصدير'); });
    };
  };

  // ---------- عند الإغلاق ----------
  App.flushAndClose = async function () {
    try { dirty = true; await App.autosave(); } catch (e) { /* ignore */ }
    api && api.closeReady();
  };

  // ---------- عند البدء ----------
  App.restoreOnStart = async function () {
    try {
      const pending = api && await api.pendingFile();
      if (pending) { await App.openPath(pending); return; }
      const text = api ? await api.autosaveRead() : localStorage.getItem('sbourati-autosave');
      if (text) await App.loadLesson(text, JSON.parse(text).filePath || null);
    } catch (e) { console.error('restore failed', e); }
    // استرجاع مسار الملف الأخير المرتبط بالحفظ التلقائي
    if (api) {
      const prefs = await api.getPrefs();
      if (prefs.lastFile && !App.state.filePath) App.state.filePath = prefs.lastFile;
    }
    badge('saved');
  };
  // نحفظ مسار الملف الحالي في التفضيلات لاستعادته بعد إعادة الفتح
  const origSerialize = App.serializeLesson;
  App.serializeLesson = function () {
    if (api) api.setPrefs({ lastFile: App.state.filePath || null });
    return origSerialize();
  };
})();
