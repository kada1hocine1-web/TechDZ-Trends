// لوحة الخصائص (يسار)
(function () {
  const $ = App.$;
  const TYPE_NAMES = {
    path: 'رسم حرّ', rect: 'مستطيل', ellipse: 'بيضاوي', polygon: 'مضلع', line: 'خط', textbox: 'نص', 'i-text': 'نص', text: 'نص',
    group: 'مجموعة', image: 'صورة', activeselection: 'تحديد متعدد', simobject: 'محاكاة'
  };

  App.showProps = function (on) {
    $('#propsPanel').classList.toggle('hidden', !on);
    App.refreshProps();
  };

  function objLabel(o) {
    if (o.elName) return o.elName;
    if (o.simType && App.SIMS[o.simType]) return App.SIMS[o.simType].name;
    const roles = { sticky: 'ملاحظة لاصقة', equation: 'معادلة', curve: 'منحنى', table: 'جدول', highlight: 'قلم تمييز', chalk: 'طباشير', shape: 'شكل', teacherTool: 'أداة هندسية' };
    return roles[o.role] || TYPE_NAMES[o.type] || o.type;
  }

  function row(label, inner) { return `<div class="prow">${inner}<label>${label}</label></div>`; }
  function range(id, min, max, step, val, unit = '') {
    return `<div class="rangewrap"><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"><span id="${id}V">${val}${unit}</span></div>`;
  }
  const r1 = v => Math.round(v * 10) / 10;
  const toHex = c => (typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c)) ? c : (typeof c === 'string' && /^#[0-9a-f]{3}$/i.test(c) ? '#' + c.slice(1).split('').map(x => x + x).join('') : '#000000');

  function mainColor(o) {
    if (o.isType && o.isType('textbox', 'i-text', 'text')) return o.fill;
    if (o.role === 'sticky') return o.item(0).fill;
    if (o.isType && o.isType('group')) { const ch = o.getObjects().find(x => typeof x.stroke === 'string' && x.stroke); return ch ? ch.stroke : '#000000'; }
    return typeof o.stroke === 'string' ? o.stroke : (typeof o.fill === 'string' ? o.fill : '#000000');
  }

  App.refreshProps = function (light) {
    const panel = $('#propsPanel');
    if (panel.classList.contains('hidden')) return;
    const body = $('#propsBody');
    if (light && body.contains(document.activeElement)) return;
    const c = App.canvas;
    const o = c.getActiveObject();
    if (!o) {
      $('#propsType').textContent = 'لم يتم تحديد أي عنصر';
      const hidden = c.getObjects().filter(x => !x.visible).length;
      body.innerHTML = `<div class="empty-props">حدّد عنصرًا على السبورة لتعديل خصائصه العلمية والشكلية.</div>` +
        (hidden ? `<button class="btn" id="pShowHidden" style="margin-top:12px;width:100%">${icon('eye')} إظهار العناصر المخفية (${hidden})</button>` : '');
      const b = $('#pShowHidden');
      if (b) b.onclick = () => { c.getObjects().forEach(x => x.set('visible', true)); c.requestRenderAll(); App.changed(); App.refreshProps(); };
      return;
    }
    $('#propsType').textContent = objLabel(o);
    const br = o.getBoundingRect();
    const isText = o.isType('textbox', 'i-text', 'text');
    const multi = o.type === 'activeselection';
    const hasStroke = !isText && (typeof o.stroke === 'string' || o.isType('group'));
    const hasFill = !isText && !multi && ['rect', 'ellipse', 'polygon'].includes(o.type);
    let html = `<div class="psec"><h4>إجراءات</h4><div class="pactions">
      <button id="pDup" title="نسخ مكرر (Ctrl+D)">${icon('copy')}</button>
      <button id="pLock" class="${o.userLocked ? 'on' : ''}" title="قفل / إلغاء القفل">${icon(o.userLocked ? 'lock' : 'unlock')}</button>
      <button id="pHide" title="إخفاء">${icon('hide')}</button>
      <button id="pFwd" title="رفع للأمام">${icon('up')}</button>
      <button id="pBack" title="إنزال للخلف">${icon('down')}</button>
      ${multi ? `<button id="pGroup" title="تجميع (Ctrl+G)">${icon('group')}</button>` : ''}
      ${o.type === 'group' && !o.role && !o.elId ? `<button id="pUngroup" title="فك التجميع">${icon('ungroup')}</button>` : ''}
      <button id="pDel" class="danger" title="حذف (Delete)">${icon('trash')}</button>
    </div></div>`;
    html += `<div class="psec"><h4>الهيئة</h4>
      ${row('X', `<input type="number" id="pX" value="${Math.round(br.left)}">`)}
      ${row('Y', `<input type="number" id="pY" value="${Math.round(br.top)}">`)}
      ${row('العرض', `<input type="number" id="pW" min="1" value="${Math.round(o.getScaledWidth())}">`)}
      ${row('الارتفاع', `<input type="number" id="pH" min="1" value="${Math.round(o.getScaledHeight())}">`)}
      ${row('الدوران', range('pRot', 0, 360, 1, Math.round(o.angle || 0), '°'))}
    </div>`;
    html += `<div class="psec"><h4>المظهر</h4>
      ${!multi ? row('اللون', `<input type="color" id="pColor" value="${toHex(mainColor(o))}">`) : ''}
      ${hasFill ? row('التعبئة', `<div class="rangewrap"><input type="color" id="pFill" value="${toHex(typeof o.fill === 'string' && o.fill !== 'transparent' && !o.fill.startsWith('rgba') ? o.fill : '#ffffff')}"><label class="chk"><input type="checkbox" id="pNoFill" ${(!o.fill || o.fill === 'transparent') ? 'checked' : ''}>بدون</label></div>`) : ''}
      ${hasStroke && !o.isType('group') ? row('السماكة', range('pStroke', 0, 40, 0.5, r1(o.strokeWidth || 0))) : ''}
      ${row('الشفافية', range('pOpacity', 0, 100, 1, Math.round((o.opacity ?? 1) * 100), '%'))}
    </div>`;
    if (isText) {
      html += `<div class="psec"><h4>النص</h4>
        ${row('حجم الخط', `<input type="number" id="pFont" min="6" max="300" value="${Math.round(o.fontSize)}">`)}
        ${row('الخط', `<select id="pFamily"><option ${o.fontFamily === 'Tajawal' ? 'selected' : ''}>Tajawal</option><option ${o.fontFamily === 'Cairo' ? 'selected' : ''}>Cairo</option><option value="Cambria Math, Times New Roman, serif" ${/Cambria/.test(o.fontFamily) ? 'selected' : ''}>رياضيات</option></select>`)}
        ${row('عريض', `<label class="chk"><input type="checkbox" id="pBold" ${String(o.fontWeight) === 'bold' || +o.fontWeight >= 600 ? 'checked' : ''}>عريض</label>`)}
        ${row('المحاذاة', `<select id="pAlign"><option value="right" ${o.textAlign === 'right' ? 'selected' : ''}>يمين</option><option value="center" ${o.textAlign === 'center' ? 'selected' : ''}>وسط</option><option value="left" ${o.textAlign === 'left' ? 'selected' : ''}>يسار</option></select>`)}
      </div>`;
    }
    if (o.simType && App.SIMS[o.simType]) {
      const def = App.SIMS[o.simType];
      html += `<div class="psec"><h4>الخصائص العلمية — ${def.name}</h4>`;
      def.params.forEach(p => {
        if (p.type === 'bool') html += row(p.label, `<label class="chk"><input type="checkbox" data-sim="${p.key}" ${o.sim[p.key] ? 'checked' : ''}>${p.on || 'مفعّل'}</label>`);
        else html += row(`${p.label}${p.unit ? ` (${p.unit})` : ''}`, `<input type="number" data-sim="${p.key}" min="${p.min}" max="${p.max}" step="${p.step}" value="${o.sim[p.key]}">`);
      });
      html += `<div class="hint">${def.hint || ''}</div></div>`;
    }
    if (o.elId) {
      html += `<div class="psec"><h4>العنصر العلمي</h4>${row('الاسم', `<input type="text" id="pElName" value="${App.esc(o.elName || '')}">`)}
        <div class="hint">الاسم يُستعمل في البحث والتعريف بالعنصر.</div></div>`;
    }
    body.innerHTML = html;
    bind(o);
  };

  function bind(o) {
    const c = App.canvas;
    const done = () => { o.setCoords(); c.requestRenderAll(); App.changed(); App.updateSelOverlay(); };
    const on = (id, ev, fn) => { const el = $('#' + id); if (el) el.addEventListener(ev, fn); };
    on('pDup', 'click', () => App.duplicateSelection());
    on('pLock', 'click', () => $('#selLock').click());
    on('pHide', 'click', () => { c.getActiveObjects().forEach(x => x.set('visible', false)); c.discardActiveObject(); c.requestRenderAll(); App.changed(); });
    on('pFwd', 'click', () => { c.getActiveObjects().forEach(x => c.bringObjectForward(x)); c.requestRenderAll(); App.changed(); });
    on('pBack', 'click', () => { c.getActiveObjects().forEach(x => c.sendObjectBackwards(x)); c.requestRenderAll(); App.changed(); });
    on('pGroup', 'click', () => App.groupSelection());
    on('pUngroup', 'click', () => App.ungroupSelection());
    on('pDel', 'click', () => App.deleteSelection());

    const moveTo = (axis, v) => {
      if (isNaN(v)) return;
      const br = o.getBoundingRect();
      if (axis === 'x') o.set('left', o.left + (v - br.left)); else o.set('top', o.top + (v - br.top));
      done();
    };
    on('pX', 'change', e => moveTo('x', +e.target.value));
    on('pY', 'change', e => moveTo('y', +e.target.value));
    // الأبعاد المرئية تشمل سماكة الخط
    const sw = () => (o.stroke ? o.strokeWidth || 0 : 0);
    const scaleFor = (v, dim) => o.strokeUniform ? (v - sw()) / dim : v / (dim + sw());
    on('pW', 'change', e => { const v = +e.target.value; if (v > 0) { o.set('scaleX', scaleFor(v, o.width)); done(); } });
    on('pH', 'change', e => { const v = +e.target.value; if (v > 0) { o.set('scaleY', scaleFor(v, o.height)); done(); } });
    on('pRot', 'input', e => { o.rotate(+e.target.value); $('#pRotV').textContent = e.target.value + '°'; o.setCoords(); c.requestRenderAll(); App.updateSelOverlay(); });
    on('pRot', 'change', () => done());
    on('pColor', 'input', e => { App.recolor(o, e.target.value); c.requestRenderAll(); });
    on('pColor', 'change', () => done());
    on('pFill', 'input', e => { o.set('fill', e.target.value); const n = $('#pNoFill'); if (n) n.checked = false; c.requestRenderAll(); });
    on('pFill', 'change', () => done());
    on('pNoFill', 'change', e => { o.set('fill', e.target.checked ? 'transparent' : $('#pFill').value); done(); });
    on('pStroke', 'input', e => { o.set('strokeWidth', +e.target.value); $('#pStrokeV').textContent = e.target.value; c.requestRenderAll(); });
    on('pStroke', 'change', () => done());
    on('pOpacity', 'input', e => { o.set('opacity', +e.target.value / 100); $('#pOpacityV').textContent = e.target.value + '%'; c.requestRenderAll(); });
    on('pOpacity', 'change', () => done());
    on('pFont', 'change', e => { o.set('fontSize', +e.target.value); done(); });
    on('pFamily', 'change', e => { o.set('fontFamily', e.target.value); done(); });
    on('pBold', 'change', e => { o.set('fontWeight', e.target.checked ? 'bold' : 'normal'); done(); });
    on('pAlign', 'change', e => { o.set('textAlign', e.target.value); done(); });
    on('pElName', 'change', e => { o.elName = e.target.value; App.$('#propsType').textContent = e.target.value; App.changed(); });
    App.$$('#propsBody [data-sim]').forEach(inp => inp.addEventListener('change', () => {
      const def = App.SIMS[o.simType].params.find(p => p.key === inp.dataset.sim);
      let v = def.type === 'bool' ? inp.checked : Math.min(def.max, Math.max(def.min, +inp.value));
      if (def.type !== 'bool' && isNaN(v)) return;
      o.sim = { ...o.sim, [def.key]: v };
      App.simResetObject(o);
      done();
    }));
  }

  App.duplicateSelection = async function () {
    const c = App.canvas;
    const a = c.getActiveObject();
    if (!a) return;
    const clone = await a.clone();
    c.discardActiveObject();
    clone.set({ left: clone.left + 24, top: clone.top + 24, evented: true });
    if (clone.type === 'activeselection') {
      clone.canvas = c;
      clone.forEachObject(ob => { ob.uid = App.uid(); c.add(ob); });
      clone.setCoords();
    } else { clone.uid = App.uid(); c.add(clone); }
    c.setActiveObject(clone);
    c.requestRenderAll();
  };

  App.groupSelection = function () {
    const c = App.canvas, a = c.getActiveObject();
    if (!a || a.type !== 'activeselection') return;
    const objs = a.getObjects();
    c.discardActiveObject();
    objs.forEach(o => c.remove(o));
    const g = new fabric.Group(objs);
    g.uid = App.uid();
    c.add(g); c.setActiveObject(g); c.requestRenderAll();
  };
  App.ungroupSelection = function () {
    const c = App.canvas, g = c.getActiveObject();
    if (!g || g.type !== 'group') return;
    const items = g.removeAll();
    c.remove(g);
    items.forEach(i => { i.uid = i.uid || App.uid(); c.add(i); });
    c.setActiveObject(new fabric.ActiveSelection(items, { canvas: c }));
    c.requestRenderAll();
  };
})();
