// التراجع والإعادة (لكل صفحة سجلّها) + إطلاق الحفظ التلقائي
(function () {
  const MAX = 80;
  App.loading = false;
  let timer = null;

  App.snapshot = function () {
    return JSON.stringify(App.canvas.toObject());
  };

  App.currentHistory = function () {
    const p = App.pages[App.pageIndex];
    if (!p.history) p.history = { stack: [App.snapshot()], index: 0 };
    return p.history;
  };

  // يُستدعى بعد كل تعديل
  App.changed = function () {
    if (App.loading) return;
    App.updateCounter();
    App.markDirty && App.markDirty();
    clearTimeout(timer);
    timer = setTimeout(App.pushHistory, 150);
  };

  App.pushHistory = function () {
    if (App.loading) return;
    clearTimeout(timer);
    const h = App.currentHistory();
    const snap = App.snapshot();
    if (h.stack[h.index] === snap) return;
    h.stack = h.stack.slice(0, h.index + 1);
    h.stack.push(snap);
    if (h.stack.length > MAX) h.stack.shift();
    h.index = h.stack.length - 1;
    App.updateUndoButtons();
  };

  App.loadSnapshot = async function (json) {
    App.loading = true;
    try {
      const c = App.canvas;
      c.discardActiveObject();
      const vt = c.viewportTransform.slice();
      await c.loadFromJSON(typeof json === 'string' ? JSON.parse(json) : json);
      c.setViewportTransform(vt);
      App.afterLoad && App.afterLoad();
      c.requestRenderAll();
    } finally {
      App.loading = false;
    }
    App.updateCounter();
  };

  App.undo = async function () {
    if (App.simRunning) App.stopSim();
    App.pushHistory();
    const h = App.currentHistory();
    if (h.index <= 0) return;
    h.index--;
    await App.loadSnapshot(h.stack[h.index]);
    App.updateUndoButtons();
    App.markDirty();
  };
  App.redo = async function () {
    if (App.simRunning) App.stopSim();
    const h = App.currentHistory();
    if (h.index >= h.stack.length - 1) return;
    h.index++;
    await App.loadSnapshot(h.stack[h.index]);
    App.updateUndoButtons();
    App.markDirty();
  };

  App.updateUndoButtons = function () {
    const h = App.currentHistory();
    document.getElementById('btnUndo').disabled = h.index <= 0;
    document.getElementById('btnRedo').disabled = h.index >= h.stack.length - 1;
  };
})();
