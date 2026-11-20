// الصفحات المتعددة
(function () {
  const $ = App.$;
  App.pages = [{ id: 'p1', name: 'صفحة 1', json: null, history: null }];
  App.pageIndex = 0;

  App.saveCurrentPage = function () {
    const p = App.pages[App.pageIndex];
    if (p) p.json = App.snapshot();
  };

  App.updatePageUI = function () {
    $('#pageInfo').textContent = `${App.pageIndex + 1} / ${App.pages.length}`;
    $('#pageName').textContent = App.pages[App.pageIndex].name;
    $('#btnDelPage').disabled = App.pages.length <= 1;
    $('#btnPrevPage').disabled = App.pageIndex === 0;
    $('#btnNextPage').disabled = App.pageIndex >= App.pages.length - 1;
    App.updateUndoButtons();
  };

  App.gotoPage = async function (i) {
    if (i < 0 || i >= App.pages.length || i === App.pageIndex) return;
    if (App.simRunning) App.stopSim();
    App.pushHistory();
    App.saveCurrentPage();
    App.pageIndex = i;
    const p = App.pages[i];
    await App.loadSnapshot(p.json || { objects: [] });
    App.resetView();
    App.updatePageUI();
    App.markDirty();
  };

  App.newPage = async function () {
    App.pushHistory();
    App.saveCurrentPage();
    const n = App.pages.length + 1;
    App.pages.splice(App.pageIndex + 1, 0, { id: 'p' + App.uid(), name: `صفحة ${n}`, json: null, history: null });
    App.pageIndex = App.pageIndex + 1;
    await App.loadSnapshot({ objects: [] });
    App.resetView();
    App.updatePageUI();
    App.markDirty();
  };

  App.deletePage = async function () {
    if (App.pages.length <= 1) return;
    const p = App.pages[App.pageIndex];
    if (!(await App.confirm(`حذف «${p.name}» نهائياً؟`, 'حذف الصفحة'))) return;
    App.pages.splice(App.pageIndex, 1);
    App.pageIndex = Math.min(App.pageIndex, App.pages.length - 1);
    await App.loadSnapshot(App.pages[App.pageIndex].json || { objects: [] });
    App.resetView();
    App.updatePageUI();
    App.markDirty();
  };

  App.renamePage = function () {
    const btn = $('#pageName');
    const inp = document.createElement('input');
    inp.className = 'page-name-input';
    inp.value = App.pages[App.pageIndex].name;
    btn.replaceWith(inp);
    inp.focus(); inp.select();
    const done = save => {
      if (save && inp.value.trim()) App.pages[App.pageIndex].name = inp.value.trim();
      inp.replaceWith(btn);
      App.updatePageUI();
      if (save) App.markDirty();
    };
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') done(true); if (e.key === 'Escape') done(false); });
    inp.addEventListener('blur', () => done(true), { once: true });
  };

  App.initPages = function () {
    $('#btnNewPage').onclick = () => App.newPage();
    $('#btnDelPage').onclick = () => App.deletePage();
    $('#btnPrevPage').onclick = () => App.gotoPage(App.pageIndex - 1);
    $('#btnNextPage').onclick = () => App.gotoPage(App.pageIndex + 1);
    $('#pageName').ondblclick = () => App.renamePage();
    App.updatePageUI();
  };
})();
