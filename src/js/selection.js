// أزرار العنصر المحدد (حذف، قفل، تكبير، ملء الشاشة، خيارات متقدمة)
(function () {
  const $ = App.$;

  App.sceneRectToScreen = function (r) {
    const vt = App.canvas.viewportTransform;
    return { left: r.left * vt[0] + vt[4], top: r.top * vt[3] + vt[5], width: r.width * vt[0], height: r.height * vt[3] };
  };

  App.updateSelOverlay = function () {
    const ov = $('#selOverlay');
    const c = App.canvas;
    const o = c.getActiveObject();
    if (!o || o.isEditing || App.state.tool !== 'select' || App.simRunning) { ov.classList.add('hidden'); return; }
    ov.classList.remove('hidden');
    const r = App.sceneRectToScreen(o.getBoundingRect());
    const pad = 6;
    const L = r.left - pad, T = r.top - pad, R = r.left + r.width + pad, B = r.top + r.height + pad;
    const place = (el, x, y) => { el.style.left = Math.round(x) + 'px'; el.style.top = Math.round(y) + 'px'; };
    place($('#selDel'), L - 30, T - 30);
    place($('#selLock'), R - 2, T - 30);
    place($('#selZoom'), L - 34, T + 10);
    const acts = ov.querySelector('.sel-actions');
    acts.style.left = Math.round((L + R) / 2 - acts.offsetWidth / 2) + 'px';
    acts.style.top = Math.round(B + 10) + 'px';
    const locked = !!o.userLocked;
    const lockBtn = $('#selLock');
    lockBtn.classList.toggle('locked', locked);
    lockBtn.innerHTML = icon(locked ? 'lock' : 'unlock');
    lockBtn.title = locked ? 'إلغاء قفل العنصر' : 'قفل العنصر';
  };

  App.setLocked = function (o, on) {
    o.userLocked = on;
    o.set({ lockMovementX: on, lockMovementY: on, lockRotation: on, lockScalingX: on, lockScalingY: on, hasControls: !on });
  };

  App.deleteSelection = function () {
    const c = App.canvas;
    const objs = c.getActiveObjects().filter(o => !o.userLocked);
    if (!objs.length) return;
    c.discardActiveObject();
    objs.forEach(o => c.remove(o));
    c.requestRenderAll();
  };

  App.initSelection = function () {
    const c = App.canvas;
    const sync = () => {
      const has = c.getActiveObjects().length > 0;
      $('#btnRotate').disabled = !has;
      $('#btnFlip').disabled = !has;
      App.refreshProps && App.refreshProps();
    };
    c.on('selection:created', sync);
    c.on('selection:updated', sync);
    c.on('selection:cleared', sync);
    c.on('object:modified', () => App.refreshProps && App.refreshProps(true));
    c.on('object:scaling', () => App.refreshProps && App.refreshProps(true));
    c.on('object:moving', () => App.refreshProps && App.refreshProps(true));
    c.on('object:rotating', () => App.refreshProps && App.refreshProps(true));

    $('#selDel').onclick = () => App.deleteSelection();
    $('#selLock').onclick = () => {
      const objs = c.getActiveObjects();
      const on = !objs.every(o => o.userLocked);
      objs.forEach(o => App.setLocked(o, on));
      const a = c.getActiveObject(); if (a && a.type === 'activeselection') App.setLocked(a, on);
      c.requestRenderAll(); App.changed(); App.refreshProps();
    };
    $('#selZoom').onclick = () => {
      const o = c.getActiveObject(); if (!o || o.userLocked) return;
      o.scale((o.scaleX || 1) * 1.2); o.setCoords(); c.requestRenderAll(); App.changed();
    };
    $('#selFull').onclick = () => { const o = c.getActiveObject(); if (o) App.zoomToObject(o, 0.85); };
    $('#selAdv').onclick = () => App.showProps(true);

    $('#btnRotate').onclick = () => {
      c.getActiveObjects().length && (() => {
        const o = c.getActiveObject();
        if (o.userLocked) return;
        o.rotate(((o.angle || 0) + 90) % 360); o.setCoords(); c.requestRenderAll(); App.changed(); App.refreshProps(true);
      })();
    };
    $('#btnFlip').onclick = () => {
      const o = c.getActiveObject(); if (!o || o.userLocked) return;
      o.set('flipX', !o.flipX); c.requestRenderAll(); App.changed();
    };
  };
})();
