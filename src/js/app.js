// تشغيل سبورتي
(function () {
  const $ = App.$;
  let clipboard = null;

  function buildToolbar() {
    // الألوان العشرة + تحرير الألوان
    $('#colors').innerHTML = App.COLORS.map(c => `<button class="swatch ${c === App.state.color ? 'active' : ''}" data-color="${c}" style="background:${c}" title="لون ${c}"></button>`).join('') +
      `<button class="swatch edit" id="btnColorEdit" title="تحرير الألوان"></button>`;
    $('#colors').onclick = e => {
      const s = e.target.closest('[data-color]');
      if (s) App.setColor(s.dataset.color);
      if (e.target.closest('#btnColorEdit')) App.colorEditor(e.target.closest('#btnColorEdit'));
    };
    $('#stickyColors').innerHTML = App.STICKY_COLORS.map(c => `<button class="swatch ${c === App.state.stickyColor ? 'active' : ''}" data-sc="${c}" style="background:${c}" title="لون الملاحظة"></button>`).join('');
    $('#stickyColors').onclick = e => {
      const s = e.target.closest('[data-sc]'); if (!s) return;
      App.state.stickyColor = s.dataset.sc;
      App.$$('#stickyColors .swatch').forEach(x => x.classList.toggle('active', x === s));
    };
    // السماكات
    $('#thicknesses').innerHTML = App.THICKNESSES.map(t => `<button class="tool ${t === App.state.thickness ? 'active' : ''}" data-t="${t}" title="سماكة ${t}"><i style="height:${Math.max(1, t * 1.6)}px"></i></button>`).join('');
    $('#thicknesses').onclick = e => { const b = e.target.closest('[data-t]'); if (b) App.setThickness(+b.dataset.t); };
    // أدوات الرسم
    $('#toolGroup').addEventListener('click', e => {
      const b = e.target.closest('.tool[data-tool]'); if (!b) return;
      const t = b.dataset.tool;
      if (t === 'shapes') return; // تفتح قائمة الأشكال
      App.setTool(t);
      if (t === 'text') App.textMenu(b);
    });
  }

  function bindHeader() {
    $('#lessonTitle').addEventListener('input', e => { App.state.title = e.target.value; App.markDirty(); });
    $('#lessonTitle').addEventListener('change', e => { window.api && window.api.setTitle(e.target.value); });
    $('#lessonTitle').addEventListener('keydown', e => { if (e.key === 'Enter') e.target.blur(); });
    $('#btnClear').onclick = async () => {
      if (!(await App.confirm('مسح كل محتوى الصفحة الحالية؟ يمكنك التراجع بعد ذلك.', 'مسح الصفحة'))) return;
      const c = App.canvas;
      App.loading = true; c.discardActiveObject(); c.remove(...c.getObjects()); App.loading = false;
      c.requestRenderAll(); App.changed();
    };
    $('#btnUndo').onclick = () => App.undo();
    $('#btnRedo').onclick = () => App.redo();
    $('#btnSave').onclick = () => App.save();
    $('#btnProjects').onclick = () => App.openProjects();
    $('#btnPng').onclick = e => App.exportMenu(e.currentTarget, 'png');
    $('#btnPdf').onclick = e => App.exportMenu(e.currentTarget, 'pdf');
    // التكبير
    $('#btnZoomIn').onclick = $('#btnZoomPlus').onclick = () => App.setZoom(App.canvas.getZoom() * 1.2);
    $('#btnZoomOut').onclick = $('#btnZoomMinus').onclick = () => App.setZoom(App.canvas.getZoom() / 1.2);
    $('#btnZoomReset').onclick = () => { if (App.state.zoomLocked) return App.toast('نسبة التقريب مقفلة 🔒'); App.resetView(); };
    $('#btnZoomLock').onclick = () => {
      App.state.zoomLocked = !App.state.zoomLocked;
      const b = $('#btnZoomLock');
      b.classList.toggle('on', App.state.zoomLocked);
      b.innerHTML = icon(App.state.zoomLocked ? 'lock' : 'unlock');
      App.toast(App.state.zoomLocked ? 'تم قفل نسبة التقريب 🔒' : 'تم إلغاء قفل التقريب');
    };
    // السكة اليسرى
    $('#railUp').onclick = () => App.panBy(0, 300);
    $('#railDown').onclick = () => App.panBy(0, -300);
    $('#railProps').onclick = () => App.showProps($('#propsPanel').classList.contains('hidden'));
    $('#propsClose').onclick = () => App.showProps(false);
  }

  function bindKeys() {
    document.addEventListener('keydown', async e => {
      const ctrl = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
      if (e.key === 'F11') { e.preventDefault(); App.toggleFullscreen(); return; }
      if (e.key === 'Escape') {
        if (document.body.classList.contains('presenting')) { App.setPresenting(false); return; }
        App.closePopover();
        const a = App.canvas.getActiveObject();
        if (a && a.isEditing) return;
        App.canvas.discardActiveObject(); App.canvas.requestRenderAll();
        if (App.state.tool !== 'select') App.setTool('select');
        return;
      }
      if (ctrl && k === 's') { e.preventDefault(); e.shiftKey ? App.saveAs() : App.save(); return; }
      if (ctrl && k === 'o') { e.preventDefault(); App.openLesson(); return; }
      if (App.isTyping() || document.querySelector('.modal-back')) return;
      const c = App.canvas;
      if (ctrl && k === 'z') { e.preventDefault(); e.shiftKey ? App.redo() : App.undo(); return; }
      if (ctrl && k === 'y') { e.preventDefault(); App.redo(); return; }
      if (ctrl && k === 'a') { e.preventDefault(); App.selectAll(); return; }
      if (ctrl && k === 'd') { e.preventDefault(); App.duplicateSelection(); return; }
      if (ctrl && k === 'g') { e.preventDefault(); e.shiftKey ? App.ungroupSelection() : App.groupSelection(); return; }
      if (ctrl && k === 'c') { const a = c.getActiveObject(); if (a) clipboard = await a.clone(); return; }
      if (ctrl && k === 'x') { const a = c.getActiveObject(); if (a) { clipboard = await a.clone(); App.deleteSelection(); } return; }
      if (ctrl && k === 'v') {
        if (!clipboard) return;
        const cl = await clipboard.clone();
        c.discardActiveObject();
        cl.set({ left: cl.left + 24, top: cl.top + 24 });
        clipboard.set({ left: clipboard.left + 24, top: clipboard.top + 24 });
        if (cl.type === 'activeselection') { cl.canvas = c; cl.forEachObject(o => { o.uid = App.uid(); c.add(o); }); cl.setCoords(); }
        else { cl.uid = App.uid(); c.add(cl); }
        c.setActiveObject(cl); c.requestRenderAll();
        return;
      }
      if (ctrl && (k === '=' || k === '+')) { e.preventDefault(); App.setZoom(c.getZoom() * 1.2); return; }
      if (ctrl && k === '-') { e.preventDefault(); App.setZoom(c.getZoom() / 1.2); return; }
      if (ctrl && k === '0') { e.preventDefault(); App.resetView(); return; }
      if (e.key === 'Delete' || e.key === 'Backspace') { App.deleteSelection(); return; }
      if (e.key === 'PageDown') { App.gotoPage(App.pageIndex + 1); return; }
      if (e.key === 'PageUp') { App.gotoPage(App.pageIndex - 1); return; }
      if (e.key.startsWith('Arrow')) {
        const a = c.getActiveObject(); if (!a || a.userLocked) return;
        e.preventDefault();
        const d = e.shiftKey ? 10 : 1;
        if (e.key === 'ArrowLeft') a.left -= d; if (e.key === 'ArrowRight') a.left += d;
        if (e.key === 'ArrowUp') a.top -= d; if (e.key === 'ArrowDown') a.top += d;
        a.setCoords(); c.requestRenderAll(); App.changed();
        return;
      }
      if (ctrl || e.altKey) return;
      const shape = App.SHAPES.find(s => s.key.toLowerCase() === k);
      if (shape) { App.setShape(shape.id); return; }
      const map = { v: 'select', h: 'pan', p: 'pen', e: 'eraser', t: 'text' };
      if (map[k]) App.setTool(map[k]);
    });
  }

  async function start() {
    renderIcons();
    App.initBoard();
    App.initTools();
    App.initSelection();
    App.initSim();
    App.initPages();
    App.initExtras();
    App.initRecord();
    buildToolbar();
    bindHeader();
    bindKeys();
    App.setTool('select');
    await App.initLibrary();
    // ننتظر تحميل الخطوط قبل رسم النصوص
    try { await document.fonts.load('16px Tajawal'); await document.fonts.load('bold 16px Cairo'); } catch (e) { /* ignore */ }
    await App.restoreOnStart();
    App.currentHistory();
    App.updatePageUI();
    App.updateCounter();
    App.renderBackground();
    if (window.api) {
      window.api.on('before-close', () => App.flushAndClose());
      window.api.on('open-path', p => App.openPath(p));
      window.api.setTitle(App.state.title);
    }
    window.addEventListener('beforeunload', () => { App.autosave(); });
    document.body.dataset.ready = '1';
  }
  window.addEventListener('DOMContentLoaded', () => start().catch(e => console.error('startup failed', e)));
})();
