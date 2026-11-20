// أدوات «التحرير والرسم»
(function () {
  App.COLORS = ['#000000', '#dc2626', '#2563eb', '#16a34a', '#f59e0b', '#fef08a', '#7c3aed', '#0ea5e9', '#db2777', '#ffffff'];
  App.STICKY_COLORS = ['#fef08a', '#fed7aa', '#fecaca', '#fbcfe8', '#ddd6fe', '#bfdbfe', '#bbf7d0', '#e5e7eb'];
  App.THICKNESSES = [0.4, 0.8, 1, 2, 4];
  App.SHAPES = [
    { id: 'line', name: 'خط', key: 'L' }, { id: 'arrow', name: 'سهم', key: 'A' },
    { id: 'elbow', name: 'سهم بمرفق', key: 'W' }, { id: 'wideArrow', name: 'سهم عريض', key: 'K' },
    { id: 'rect', name: 'مستطيل', key: 'R' }, { id: 'ellipse', name: 'بيضاوي', key: 'O' },
    { id: 'diamond', name: 'معين', key: 'D' }, { id: 'triangle', name: 'مثلث', key: 'G' }
  ];
  App.TEXT_STYLES = {
    title: { name: 'إضافة عنوان', size: 38, weight: 'bold', font: 'Cairo', tag: 'عريض 38px', desc: 'خط Cairo للعناوين' },
    subtitle: { name: 'إضافة عنوان فرعي', size: 26, weight: '600', font: 'Cairo', tag: 'شبه عريض 26px', desc: 'للأقسام والفقرات' },
    body: { name: 'إضافة نص تكميلي قصير', size: 18, weight: 'normal', font: 'Tajawal', tag: 'عادي 18px', desc: 'للوصف والملاحظات' }
  };
  const DRAW_TOOLS = ['pen', 'chalk', 'magic', 'laser', 'highlighter', 'eraser'];
  const SHAPE_IDS = App.SHAPES.map(s => s.id);
  let shapeKind = 'rect';
  App.state.textStyle = 'body';

  const sw = () => App.state.thickness;
  App.strokeWidth = () => Math.max(1, sw() * 2.5);

  // ---------- قوام الطباشير ----------
  function chalkPattern(color) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 24;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = color;
    for (let i = 0; i < 260; i++) {
      ctx.globalAlpha = 0.25 + Math.random() * 0.75;
      ctx.fillRect(Math.random() * 24, Math.random() * 24, 1 + Math.random() * 1.6, 1 + Math.random() * 1.6);
    }
    return cv;
  }

  function hexToRgba(hex, a) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map(x => x + x).join('') : h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  App.hexToRgba = hexToRgba;

  // ---------- تهيئة الفرشاة حسب الأداة ----------
  function setupBrush(tool) {
    const c = App.canvas, color = App.state.color;
    let b;
    switch (tool) {
      case 'chalk':
        b = new fabric.PatternBrush(c);
        b.source = chalkPattern(color);
        b.width = sw() * 4 + 3;
        break;
      case 'laser':
        b = new fabric.PencilBrush(c);
        b.color = '#ef4444'; b.width = 4;
        b.shadow = new fabric.Shadow({ color: 'rgba(239,68,68,.9)', blur: 14 });
        break;
      case 'highlighter':
        b = new fabric.PencilBrush(c);
        b.color = hexToRgba(color === '#000000' ? '#fde047' : color, 0.38);
        b.width = sw() * 10 + 8;
        b.strokeLineCap = 'square';
        break;
      case 'eraser':
        b = new fabric.PencilBrush(c);
        b.color = 'rgba(148,163,184,.55)';
        b.width = sw() * 10 + 12;
        break;
      default:
        b = new fabric.PencilBrush(c);
        b.color = color; b.width = sw() * 3;
    }
    b.decimate = 2;
    c.freeDrawingBrush = b;
  }

  App.applyToolCursor = function () {
    const c = App.canvas, t = App.state.tool;
    c.defaultCursor = t === 'pan' ? 'grab' : (t === 'select' ? 'default' : 'crosshair');
    c.hoverCursor = t === 'select' ? 'move' : (t === 'eraser2' ? 'not-allowed' : c.defaultCursor);
    c.freeDrawingCursor = 'crosshair';
  };

  function setObjectsSelectable(on) {
    App.canvas.getObjects().forEach(o => {
      if (o.isEraser) { o.selectable = false; o.evented = false; return; }
      o.selectable = on; o.evented = true;
    });
  }

  // تفعيل أداة (keep=true لإعادة تطبيق الحالة دون تغيير)
  App.applyTool = function (tool) {
    const c = App.canvas;
    if (!c) return;
    c.isDrawingMode = DRAW_TOOLS.includes(tool);
    if (c.isDrawingMode) setupBrush(tool);
    c.selection = tool === 'select';
    c.skipTargetFind = !(tool === 'select' || tool === 'eraser2');
    setObjectsSelectable(tool === 'select');
    if (tool !== 'select') c.discardActiveObject();
    App.applyToolCursor();
    c.requestRenderAll();
  };

  App.setTool = function (tool) {
    if (tool === 'selectAll') { App.selectAll(); return; }
    App.state.tool = tool;
    App.$$('#toolGroup .tool[data-tool]').forEach(b => b.classList.toggle('active', b.dataset.tool === tool || (tool === 'shape' && b.dataset.tool === 'shapes')));
    document.getElementById('stickyColors').classList.toggle('hidden', tool !== 'sticky');
    document.getElementById('colors').classList.toggle('hidden', tool === 'sticky');
    App.applyTool(tool);
  };

  App.selectAll = function () {
    App.setTool('select');
    const c = App.canvas;
    const objs = c.getObjects().filter(o => o.selectable && o.visible);
    if (!objs.length) return;
    c.discardActiveObject();
    c.setActiveObject(new fabric.ActiveSelection(objs, { canvas: c }));
    c.requestRenderAll();
    App.$$('#toolGroup .tool[data-tool]').forEach(b => b.classList.toggle('active', b.dataset.tool === 'selectAll'));
  };

  App.setColor = function (color) {
    App.state.color = color;
    App.$$('#colors .swatch[data-color]').forEach(s => s.classList.toggle('active', s.dataset.color.toLowerCase() === color.toLowerCase()));
    if (App.canvas.isDrawingMode) setupBrush(App.state.tool);
    App.applyColorToSelection(color);
  };

  App.setThickness = function (t) {
    App.state.thickness = t;
    App.$$('#thicknesses .tool').forEach(b => b.classList.toggle('active', +b.dataset.t === t));
    if (App.canvas.isDrawingMode) setupBrush(App.state.tool);
    const objs = App.canvas.getActiveObjects();
    if (objs.length) {
      objs.forEach(o => { if (o.stroke && !o.isType('textbox', 'i-text', 'text')) o.set('strokeWidth', o.type === 'path' && !o.role ? t * 3 : App.strokeWidth()); });
      App.canvas.requestRenderAll(); App.changed();
    }
  };

  // تطبيق اللون على العناصر المحددة
  App.applyColorToSelection = function (color) {
    const objs = App.canvas.getActiveObjects();
    if (!objs.length) return;
    objs.forEach(o => App.recolor(o, color));
    App.canvas.requestRenderAll();
    App.changed();
  };
  App.recolor = function (o, color) {
    if (o.isType('textbox', 'i-text', 'text')) { o.set('fill', color); return; }
    if (o.role === 'sticky') { o.item(0).set('fill', color); o.dirty = true; return; }
    if (o.isType('group')) { o.getObjects().forEach(ch => App.recolor(ch, color)); o.dirty = true; return; }
    if (o.stroke && typeof o.stroke === 'string') o.set('stroke', color);
    else if (o.fill && typeof o.fill === 'string' && o.fill !== 'transparent') o.set('fill', color);
  };

  // ---------- الأشكال ----------
  function headPath(x1, y1, x2, y2, size) {
    const a = Math.atan2(y2 - y1, x2 - x1), s = size;
    const p1 = [x2 - s * Math.cos(a - 0.45), y2 - s * Math.sin(a - 0.45)];
    const p2 = [x2 - s * Math.cos(a + 0.45), y2 - s * Math.sin(a + 0.45)];
    return `M ${p1[0]} ${p1[1]} L ${x2} ${y2} L ${p2[0]} ${p2[1]}`;
  }
  App.makeShape = function (kind, x1, y1, x2, y2, color, width) {
    color = color || App.state.color; width = width || App.strokeWidth();
    const base = { stroke: color, strokeWidth: width, fill: 'transparent', strokeLineCap: 'round', strokeLineJoin: 'round', strokeUniform: true };
    const l = Math.min(x1, x2), t = Math.min(y1, y2), w = Math.abs(x2 - x1), h = Math.abs(y2 - y1);
    const head = Math.max(12, width * 4);
    let o;
    switch (kind) {
      case 'line': o = new fabric.Path(`M ${x1} ${y1} L ${x2} ${y2}`, base); break;
      case 'arrow': o = new fabric.Path(`M ${x1} ${y1} L ${x2} ${y2} ${headPath(x1, y1, x2, y2, head)}`, base); break;
      case 'elbow': o = new fabric.Path(`M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2} ${headPath(x2, y1, x2, y2 === y1 ? y1 + 0.01 : y2, head)}`, base); break;
      case 'wideArrow': {
        const len = Math.hypot(x2 - x1, y2 - y1) || 1, a = Math.atan2(y2 - y1, x2 - x1);
        const th = Math.max(14, len * 0.18), hl = Math.min(len * 0.4, th * 2.2), hw = th * 1.9;
        const pts = [[0, -th / 2], [len - hl, -th / 2], [len - hl, -hw / 2], [len, 0], [len - hl, hw / 2], [len - hl, th / 2], [0, th / 2]]
          .map(([u, v]) => ({ x: x1 + u * Math.cos(a) - v * Math.sin(a), y: y1 + u * Math.sin(a) + v * Math.cos(a) }));
        o = new fabric.Polygon(pts, { ...base, fill: hexToRgba(color === '#ffffff' ? '#94a3b8' : color, 0.22) });
        break;
      }
      case 'rect': o = new fabric.Rect({ ...base, left: l + w / 2, top: t + h / 2, width: w, height: h, rx: 2, ry: 2 }); break;
      case 'ellipse': o = new fabric.Ellipse({ ...base, left: l + w / 2, top: t + h / 2, rx: w / 2, ry: h / 2 }); break;
      case 'diamond': o = new fabric.Polygon([{ x: l + w / 2, y: t }, { x: l + w, y: t + h / 2 }, { x: l + w / 2, y: t + h }, { x: l, y: t + h / 2 }], base); break;
      case 'triangle': o = new fabric.Polygon([{ x: l + w / 2, y: t }, { x: l + w, y: t + h }, { x: l, y: t + h }], base); break;
    }
    if (o) o.role = 'shape';
    return o;
  };

  App.setShape = function (kind) {
    shapeKind = kind;
    App.setTool('shape');
  };

  // ---------- التعرّف على الأشكال (الرسم السحري) ----------
  function pathPoints(path) {
    const pts = [];
    path.path.forEach(cmd => { const n = cmd.length; if (n >= 3) pts.push({ x: cmd[n - 2], y: cmd[n - 1] }); });
    // نقل من فضاء المسار إلى فضاء السبورة
    const m = path.calcTransformMatrix(), off = path.pathOffset;
    return pts.map(p => fabric.util.transformPoint(new fabric.Point(p.x - off.x, p.y - off.y), m));
  }
  function rdp(pts, eps) {
    if (pts.length < 3) return pts;
    const [a, b] = [pts[0], pts[pts.length - 1]];
    let idx = 0, dmax = 0;
    const L = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    for (let i = 1; i < pts.length - 1; i++) {
      const d = Math.abs((b.y - a.y) * pts[i].x - (b.x - a.x) * pts[i].y + b.x * a.y - b.y * a.x) / L;
      if (d > dmax) { dmax = d; idx = i; }
    }
    if (dmax > eps) return rdp(pts.slice(0, idx + 1), eps).slice(0, -1).concat(rdp(pts.slice(idx), eps));
    return [a, b];
  }
  function recognize(path) {
    const pts = pathPoints(path);
    if (pts.length < 4) return null;
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    const l = Math.min(...xs), r = Math.max(...xs), t = Math.min(...ys), b = Math.max(...ys);
    const w = r - l, h = b - t, diag = Math.hypot(w, h);
    if (diag < 20) return null;
    const first = pts[0], last = pts[pts.length - 1];
    // مغلق إذا عادت النهاية قرب أي نقطة من بداية المسار (يتسامح مع التجاوز)
    const head = pts.slice(0, Math.max(2, Math.ceil(pts.length * 0.25)));
    const tail = pts.slice(-Math.max(2, Math.ceil(pts.length * 0.25)));
    const closed = head.some(a => tail.some(b => Math.hypot(a.x - b.x, a.y - b.y) < diag * 0.12)) && Math.hypot(last.x - first.x, last.y - first.y) < diag * 0.8;
    const color = path.stroke, width = App.strokeWidth();
    if (!closed) {
      const simp = rdp(pts, diag * 0.06);
      if (simp.length <= 2) return App.makeShape('line', first.x, first.y, last.x, last.y, color, width);
      return null;
    }
    const cx = xs.reduce((s, v) => s + v, 0) / xs.length, cy = ys.reduce((s, v) => s + v, 0) / ys.length;
    const ds = pts.map(p => Math.hypot((p.x - cx) / (w || 1), (p.y - cy) / (h || 1)));
    const mean = ds.reduce((s, v) => s + v, 0) / ds.length;
    const cv = Math.sqrt(ds.reduce((s, v) => s + (v - mean) ** 2, 0) / ds.length) / mean;
    let simp = rdp(pts.concat([first]), diag * 0.09);
    if (simp.length > 1 && Math.hypot(simp[0].x - simp[simp.length - 1].x, simp[0].y - simp[simp.length - 1].y) < diag * 0.25) simp = simp.slice(0, -1);
    const n = simp.length;
    if (cv < 0.12 && n > 4) return App.makeShape('ellipse', l, t, r, b, color, width);
    if (n === 3) return new fabric.Polygon(simp.map(p => ({ x: p.x, y: p.y })), { stroke: color, strokeWidth: width, fill: 'transparent', strokeLineJoin: 'round', role: 'shape' });
    if (n === 4) return App.makeShape('rect', l, t, r, b, color, width);
    if (cv < 0.2) return App.makeShape('ellipse', l, t, r, b, color, width);
    return new fabric.Polygon(simp.map(p => ({ x: p.x, y: p.y })), { stroke: color, strokeWidth: width, fill: 'transparent', strokeLineJoin: 'round', role: 'shape' });
  }

  // ---------- ملاحظة لاصقة ----------
  App.makeSticky = function (text, color) {
    const W = 220, H = 180;
    const rect = new fabric.Rect({ width: W, height: H, fill: color, rx: 6, ry: 6, originX: 'center', originY: 'center',
      shadow: new fabric.Shadow({ color: 'rgba(15,23,42,.25)', blur: 12, offsetY: 5 }) });
    const tb = new fabric.Textbox(text, { width: W - 28, fontSize: 20, fontFamily: 'Tajawal', fill: '#1f2937', textAlign: 'right', direction: 'rtl', originX: 'center', originY: 'center', splitByGrapheme: false });
    const g = new fabric.Group([rect, tb], { role: 'sticky', subTargetCheck: false });
    return g;
  };
  App.editSticky = async function (g) {
    const tb = g.item(1);
    const v = await App.prompt('تعديل الملاحظة', 'النص', tb.text);
    if (v === null) return;
    tb.set('text', v);
    g.dirty = true; g.triggerLayout && g.triggerLayout();
    App.canvas.requestRenderAll(); App.changed();
  };

  // ---------- النص ----------
  App.addTextAt = function (p, styleKey) {
    const st = App.TEXT_STYLES[styleKey || App.state.textStyle] || App.TEXT_STYLES.body;
    const dark = App.isDarkBg();
    const color = App.state.color === '#000000' && dark ? '#ffffff' : App.state.color;
    const tb = new fabric.Textbox('', {
      fontSize: st.size, fontWeight: st.weight, fontFamily: st.font, fill: color,
      width: Math.max(260, st.size * 10), textAlign: 'right', direction: 'rtl', role: 'text', splitByGrapheme: false
    });
    App.addObject(tb, p);
    tb.enterEditing();
    tb.hiddenTextarea && tb.hiddenTextarea.focus();
    tb.on('editing:exited', () => { if (!tb.text.trim()) App.canvas.remove(tb); });
  };

  // ---------- أحداث المؤشر حسب الأداة ----------
  App._recognize = p => recognize(p);
  App.initTools = function () {
    const c = App.canvas;
    let drawing = null, erasing = false;

    c.on('before:path:created', ({ path }) => {
      const t = App.state.tool;
      path.uid = App.uid();
      path.strokeUniform = false;
      if (t === 'laser') { path.excludeFromHistory = true; path.selectable = false; path.evented = false; }
      if (t === 'eraser') { path.isEraser = true; path.globalCompositeOperation = 'destination-out'; path.stroke = '#000'; path.selectable = false; path.evented = false; }
      if (t === 'magic') path.excludeFromHistory = true;
      if (t === 'highlighter') path.role = 'highlight';
      if (t === 'chalk') path.role = 'chalk';
    });
    c.on('path:created', ({ path }) => {
      const t = App.state.tool;
      if (t === 'laser') {
        const start = performance.now();
        const fade = () => {
          const k = (performance.now() - start) / 900;
          if (k >= 1) { c.remove(path); c.requestRenderAll(); return; }
          path.set('opacity', 1 - k); c.requestRenderAll(); requestAnimationFrame(fade);
        };
        setTimeout(() => requestAnimationFrame(fade), 350);
      } else if (t === 'magic') {
        const shape = recognize(path);
        c.remove(path);
        const final = shape || (() => { path.excludeFromHistory = false; return path; })();
        if (!final.uid) final.uid = App.uid();
        final.selectable = false;
        c.add(final);
        c.requestRenderAll();
      }
    });

    c.on('mouse:down', opt => {
      const t = App.state.tool;
      if (App.isPanning()) return;
      const p = opt.scenePoint || c.getScenePoint(opt.e);
      if (t === 'shape') {
        drawing = { x: p.x, y: p.y, obj: null };
      } else if (t === 'eraser2') {
        erasing = true;
        if (opt.target && !opt.target.isEraser) { c.remove(opt.target); c.requestRenderAll(); }
      } else if (t === 'sticky') {
        const g = App.makeSticky('ملاحظة…', App.state.stickyColor);
        App.addObject(g, p);
        App.editSticky(g);
      } else if (t === 'text') {
        if (opt.target && opt.target.isType('textbox')) return;
        App.addTextAt(p);
      } else if (t === 'equation') {
        App.openEquationEditor(null, p);
      }
    });
    c.on('mouse:move', opt => {
      const t = App.state.tool;
      if (t === 'eraser2' && erasing && opt.target && !opt.target.isEraser) { c.remove(opt.target); c.requestRenderAll(); return; }
      if (!drawing) return;
      const p = opt.scenePoint || c.getScenePoint(opt.e);
      if (drawing.obj) c.remove(drawing.obj);
      let x2 = p.x, y2 = p.y;
      if (opt.e.shiftKey && ['rect', 'ellipse', 'diamond', 'triangle'].includes(shapeKind)) {
        const d = Math.max(Math.abs(x2 - drawing.x), Math.abs(y2 - drawing.y));
        x2 = drawing.x + Math.sign(x2 - drawing.x || 1) * d; y2 = drawing.y + Math.sign(y2 - drawing.y || 1) * d;
      }
      drawing.obj = App.makeShape(shapeKind, drawing.x, drawing.y, x2, y2);
      drawing.obj.excludeFromHistory = true;
      drawing.obj.selectable = false; drawing.obj.evented = false;
      c.add(drawing.obj);
      c.requestRenderAll();
    });
    c.on('mouse:up', opt => {
      erasing = false;
      if (!drawing) return;
      const p = opt.scenePoint || c.getScenePoint(opt.e);
      if (drawing.obj) c.remove(drawing.obj);
      let { x, y } = drawing;
      let x2 = p.x, y2 = p.y;
      if (Math.hypot(x2 - x, y2 - y) < 6) { // نقرة فقط: حجم افتراضي
        const lin = ['line', 'arrow', 'elbow', 'wideArrow'].includes(shapeKind);
        x -= lin ? 80 : 70; y -= lin ? 0 : 50;
        x2 = x + (lin ? 160 : 140); y2 = y + (lin ? (shapeKind === 'elbow' ? 80 : 0) : 100);
      } else if (opt.e.shiftKey && ['rect', 'ellipse', 'diamond', 'triangle'].includes(shapeKind)) {
        const d = Math.max(Math.abs(x2 - x), Math.abs(y2 - y));
        x2 = x + Math.sign(x2 - x || 1) * d; y2 = y + Math.sign(y2 - y || 1) * d;
      }
      const o = App.makeShape(shapeKind, x, y, x2, y2);
      drawing = null;
      if (o) { o.uid = App.uid(); c.add(o); App.setTool('select'); c.setActiveObject(o); c.requestRenderAll(); }
    });

    c.on('mouse:dblclick', opt => {
      const o = opt.target;
      if (!o || App.state.tool !== 'select') return;
      if (o.role === 'sticky') App.editSticky(o);
      else if (o.eqSrc !== undefined && o.role === 'equation') App.openEquationEditor(o);
      else if (o.role === 'curve') App.openCurveEditor(o);
      else if (o.role === 'table') App.openTableEditor(o);
      else if (o.simType === 'circuit') App.toggleCircuitSwitch(o);
    });
  };
})();
