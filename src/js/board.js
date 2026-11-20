// السبورة: لوح Fabric، التكبير والتحريك، العدّاد
(function () {
  App.state = {
    tool: 'select', color: '#000000', thickness: 1, bg: 'grid', snap: false,
    zoomLocked: false, paper: { on: false, size: 'A4', orient: 'portrait', margins: true },
    title: 'درس جديد', filePath: null, simSpeed: 1, stickyColor: '#fef08a', dark: false
  };
  // خصائص إضافية تُحفظ مع كل عنصر
  fabric.FabricObject.customProperties = ['uid', 'elId', 'elName', 'isEraser', 'simType', 'sim', 'eqSrc', 'curveSpec', 'tableData', 'userLocked', 'role'];
  fabric.FabricObject.ownDefaults.borderColor = '#155dfc';
  fabric.FabricObject.ownDefaults.cornerColor = '#ffffff';
  fabric.FabricObject.ownDefaults.cornerStrokeColor = '#155dfc';
  fabric.FabricObject.ownDefaults.cornerStyle = 'rect';
  fabric.FabricObject.ownDefaults.transparentCorners = false;
  fabric.FabricObject.ownDefaults.cornerSize = 11;
  fabric.FabricObject.ownDefaults.borderScaleFactor = 1.5;
  fabric.FabricObject.ownDefaults.padding = 4;

  App.uid = () => Math.random().toString(36).slice(2, 10);

  App.initBoard = function () {
    const board = document.getElementById('board');
    const canvas = new fabric.Canvas('c', {
      width: board.clientWidth, height: board.clientHeight,
      preserveObjectStacking: true, stopContextMenu: true, fireRightClick: false,
      selectionColor: 'rgba(0,166,244,.08)', selectionBorderColor: '#00a6f4', selectionLineWidth: 1,
      enableRetinaScaling: true, targetFindTolerance: 6
    });
    App.canvas = canvas;

    // مقبض التدوير أخضر
    const mtr = fabric.controlsUtils.createObjectDefaultControls().mtr;
    if (mtr) {
      mtr.offsetY = -30;
      mtr.render = function (ctx, left, top) {
        ctx.save(); ctx.fillStyle = '#22c55e'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(left, top, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
      };
      fabric.InteractiveFabricObject.ownDefaults.controls = { ...fabric.controlsUtils.createObjectDefaultControls(), mtr };
    }

    const resize = () => {
      canvas.setDimensions({ width: board.clientWidth, height: board.clientHeight });
      App.renderBackground();
      canvas.requestRenderAll();
    };
    new ResizeObserver(resize).observe(board);

    canvas.on('after:render', () => { App.renderBackground(); App.updateSelOverlay && App.updateSelOverlay(); });

    // ---------- العجلة: تحريك، وCtrl للتكبير ----------
    canvas.on('mouse:wheel', opt => {
      const e = opt.e;
      e.preventDefault(); e.stopPropagation();
      if (e.ctrlKey || e.metaKey) {
        if (App.state.zoomLocked) return;
        const z = App.clampZoom(canvas.getZoom() * Math.pow(0.999, e.deltaY));
        canvas.zoomToPoint(new fabric.Point(e.offsetX, e.offsetY), z);
        App.onViewChange();
      } else {
        const vt = canvas.viewportTransform;
        if (e.shiftKey) vt[4] -= e.deltaY; else { vt[4] -= e.deltaX; vt[5] -= e.deltaY; }
        canvas.setViewportTransform(vt);
        App.onViewChange();
      }
    });

    // ---------- التحريك بالزر الأوسط أو بمسطرة المسافة ----------
    let panning = null, spaceDown = false;
    window.addEventListener('keydown', e => { if (e.code === 'Space' && !App.isTyping()) { spaceDown = true; canvas.defaultCursor = 'grab'; } });
    window.addEventListener('keyup', e => { if (e.code === 'Space') { spaceDown = false; App.applyToolCursor && App.applyToolCursor(); } });
    canvas.on('mouse:down:before', opt => {
      const e = opt.e;
      if (e.button === 1 || spaceDown || App.state.tool === 'pan') {
        panning = { x: e.clientX, y: e.clientY };
        canvas.selection = false;
        canvas.isDrawingMode = false;
        canvas.setCursor('grabbing');
      }
    });
    canvas.on('mouse:move', opt => {
      if (!panning) return;
      const e = opt.e;
      const vt = canvas.viewportTransform;
      vt[4] += e.clientX - panning.x; vt[5] += e.clientY - panning.y;
      panning = { x: e.clientX, y: e.clientY };
      canvas.setViewportTransform(vt);
      App.onViewChange();
    });
    canvas.on('mouse:up', () => {
      if (panning) { panning = null; App.applyTool && App.applyTool(App.state.tool, true); }
    });
    App.isPanning = () => !!panning;

    // ---------- الالتصاق بالشبكة ----------
    canvas.on('object:moving', opt => {
      if (!App.state.snap) return;
      const o = opt.target, s = 20;
      const br = o.getBoundingRect();
      const dx = Math.round(br.left / s) * s - br.left, dy = Math.round(br.top / s) * s - br.top;
      o.set({ left: o.left + dx, top: o.top + dy });
    });

    // ---------- تتبّع التغييرات ----------
    const changed = () => App.changed();
    canvas.on('object:modified', changed);
    canvas.on('object:added', e => { if (!e.target.excludeFromHistory) changed(); });
    canvas.on('object:removed', e => { if (!e.target.excludeFromHistory) changed(); });
    canvas.on('text:changed', () => App.updateCounter());
    canvas.on('text:editing:exited', changed);
  };

  App.clampZoom = z => Math.min(5, Math.max(0.1, z));

  App.setZoom = function (z, center) {
    if (App.state.zoomLocked) { App.toast('نسبة التقريب مقفلة 🔒'); return; }
    const c = App.canvas;
    const pt = center || new fabric.Point(c.getWidth() / 2, c.getHeight() / 2);
    c.zoomToPoint(pt, App.clampZoom(z));
    App.onViewChange();
  };
  App.resetView = function () {
    const c = App.canvas;
    c.setViewportTransform([1, 0, 0, 1, 0, 0]);
    App.onViewChange();
  };
  App.panBy = function (dx, dy) {
    const c = App.canvas, vt = c.viewportTransform;
    vt[4] += dx; vt[5] += dy;
    c.setViewportTransform(vt);
    App.onViewChange();
  };
  // تكبير بحيث يملأ العنصر الشاشة
  App.zoomToObject = function (obj, fill = 0.8) {
    const c = App.canvas;
    const br = obj.getBoundingRect(); // إحداثيات السبورة
    const sw = Math.max(br.width, 10), sh = Math.max(br.height, 10), sl = br.left, st = br.top;
    const z = App.clampZoom(Math.min(c.getWidth() * fill / sw, c.getHeight() * fill / sh));
    c.setViewportTransform([z, 0, 0, z, c.getWidth() / 2 - (sl + sw / 2) * z, c.getHeight() / 2 - (st + sh / 2) * z]);
    App.onViewChange();
  };

  App.onViewChange = function () {
    App.canvas.requestRenderAll();
    App.canvas.getObjects().forEach(o => o.setCoords());
    App.updateCounter();
  };

  // العناصر المرئية للمستخدم (دون آثار الممحاة والليزر)
  App.userObjects = () => App.canvas.getObjects().filter(o => !o.isEraser && !o.excludeFromHistory);

  App.updateCounter = function () {
    const z = Math.round(App.canvas.getZoom() * 100);
    const n = App.userObjects().length;
    document.getElementById('zoomBadge').textContent = `${z}% · ${n} عنصر`;
    document.getElementById('btnZoomReset').textContent = `${z}%`;
    document.getElementById('btnClear').disabled = App.canvas.getObjects().length === 0;
    App.updateSimButtons && App.updateSimButtons();
  };

  // مركز العرض الحالي بإحداثيات السبورة
  App.viewCenter = function () {
    const c = App.canvas, vt = c.viewportTransform;
    return new fabric.Point((c.getWidth() / 2 - vt[4]) / vt[0], (c.getHeight() / 2 - vt[5]) / vt[0]);
  };
  App.toScene = function (clientX, clientY) {
    const c = App.canvas, r = c.upperCanvasEl.getBoundingClientRect(), vt = c.viewportTransform;
    return new fabric.Point((clientX - r.left - vt[4]) / vt[0], (clientY - r.top - vt[5]) / vt[0]);
  };

  // إضافة عنصر جديد في نقطة (افتراضياً وسط الشاشة)
  App.addObject = function (obj, at, select = true) {
    const c = App.canvas;
    const p = at || App.viewCenter();
    obj.set({ originX: 'center', originY: 'center', left: p.x, top: p.y });
    if (!obj.uid) obj.uid = App.uid();
    c.add(obj);
    obj.setCoords();
    if (select) { App.setTool('select'); c.setActiveObject(obj); }
    c.requestRenderAll();
    return obj;
  };

  App.isTyping = function () {
    const a = document.activeElement;
    if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable)) return true;
    const o = App.canvas && App.canvas.getActiveObject();
    return !!(o && o.isEditing);
  };
})();
