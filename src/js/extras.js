// القوائم والنوافذ الإضافية: الخلفيات، العرض، الأشكال، النص، المعادلات، المنحنيات، الجدول، أدوات المعلم، ورقتي، الإعدادات
(function () {
  const $ = App.$;

  // =============== خلفية السبورة ===============
  App.setBackground = function (key) {
    App.state.bg = key;
    $('#bgLabel').textContent = App.BACKGROUNDS[key].short;
    App.renderBackground(); App.canvas.requestRenderAll(); App.markDirty();
  };
  function bgMenu(anchor) {
    const B = App.BACKGROUNDS;
    const prev = k => {
      const b = B[k];
      const lines = b.lines && b.lines.length ? `repeating-linear-gradient(0deg, ${b.lines[0].c} 0 1px, transparent 1px 6px), repeating-linear-gradient(90deg, ${b.lines[0].c} 0 1px, transparent 1px 6px),` : b.dots ? 'radial-gradient(#c3cfdc 1px, transparent 1.2px) 0 0/6px 6px,' : b.seyes ? 'repeating-linear-gradient(0deg, #9db9e6 0 1px, transparent 1px 5px),' : '';
      return `<span class="bgprev" style="background:${lines} ${b.color}"></span>`;
    };
    const chalk = ['#ffffff', '#fef08a', '#fda4af', '#93c5fd', '#86efac', '#fdba74'];
    const pop = App.popover(anchor, `<h5>أنماط وخلفيات السبورة</h5><div class="sub">8 أنماط</div>
      ${Object.keys(B).map(k => `<button class="menu-item ${App.state.bg === k ? 'active' : ''}" data-bg="${k}">${prev(k)}<span><b>${B[k].name}</b><span class="desc">${B[k].tag} — ${B[k].desc}</span></span></button>`).join('')}
      <div class="menu-sep"></div><h5>ألوان الطباشير السريعة</h5>
      <div class="chip-row">${chalk.map(c => `<button class="swatch" data-chalk="${c}" style="background:${c};width:24px;height:24px"></button>`).join('')}</div>
      <button class="menu-item" data-chalkon>✍️ تفعيل قلم الطباشير</button>`, { width: 340 });
    if (!pop) return;
    pop.onclick = e => {
      const b = e.target.closest('[data-bg]'), ch = e.target.closest('[data-chalk]'), on = e.target.closest('[data-chalkon]');
      if (b) { App.setBackground(b.dataset.bg); App.closePopover(); }
      if (ch) { App.setColor(ch.dataset.chalk); App.setTool('chalk'); App.closePopover(); }
      if (on) { App.setTool('chalk'); App.closePopover(); }
    };
  }

  // =============== قائمة العرض ===============
  function viewMenu(anchor) {
    const pop = App.popover(anchor, `<h5>العرض</h5>
      <div class="toggle-row" data-t="snap"><span>التصاق بالشبكة</span><i class="switch ${App.state.snap ? 'on' : ''}"></i></div>`, { width: 230 });
    if (!pop) return;
    pop.onclick = e => {
      const r = e.target.closest('[data-t]'); if (!r) return;
      App.state.snap = !App.state.snap; r.querySelector('.switch').classList.toggle('on', App.state.snap);
      $('#btnView').classList.toggle('on', App.state.snap); App.markDirty();
    };
  }

  // =============== الأشكال ===============
  const SHAPE_PREV = {
    line: '<path d="M4 18 20 6"/>', arrow: '<path d="M4 18 20 6M13 6h7v7"/>', elbow: '<path d="M4 6h12v12M12 14l4 4 4-4"/>',
    wideArrow: '<path d="M3 9.5h11V6l7 6-7 6v-3.5H3z"/>', rect: '<rect x="4" y="6" width="16" height="12" rx="1"/>',
    ellipse: '<ellipse cx="12" cy="12" rx="8.5" ry="6"/>', diamond: '<path d="M12 3.5 20.5 12 12 20.5 3.5 12z"/>', triangle: '<path d="M12 4 21 20H3z"/>'
  };
  function shapesMenu(anchor) {
    const pop = App.popover(anchor, App.SHAPES.map(s => `<button class="menu-item" data-shape="${s.id}"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">${SHAPE_PREV[s.id]}</svg><span>${s.name}</span><span class="kbd">${s.key}</span></button>`).join(''), { width: 200 });
    if (!pop) return;
    pop.onclick = e => { const b = e.target.closest('[data-shape]'); if (b) { App.setShape(b.dataset.shape); App.closePopover(); } };
  }

  // =============== أنماط النص ===============
  function textMenu(anchor) {
    const S = App.TEXT_STYLES;
    const pop = App.popover(anchor, `<h5>أنماط النص الافتراضية</h5><div class="sub">اختر نمطاً ثم انقر على السبورة للكتابة</div>
      ${Object.keys(S).map(k => `<button class="text-style" data-ts="${k}"><b style="font-family:${S[k].font};font-size:${Math.min(S[k].size, 26)}px;font-weight:${S[k].weight}">${S[k].name}</b><small>${S[k].desc}</small><br><span class="tag">${S[k].tag}</span></button>`).join('')}`, { width: 290 });
    if (!pop) return;
    pop.onclick = e => { const b = e.target.closest('[data-ts]'); if (b) { App.state.textStyle = b.dataset.ts; App.closePopover(); App.toast('انقر على السبورة لبدء الكتابة'); } };
  }

  // =============== أدوات المعلم ===============
  function favMenu(anchor) {
    const pop = App.popover(anchor, `<h5>أدوات المعلم</h5>
      <button class="menu-item" data-tt="ruler">${icon('ruler')}<span>المسطرة المدرجة (30 cm)</span></button>
      <button class="menu-item" data-tt="protractor">${icon('protractor')}<span>المنقلة الهندسية</span></button>
      <button class="menu-item" data-tt="setsquare">${icon('setsquare')}<span>الكوس الرياضي</span></button>`, { width: 240 });
    if (!pop) return;
    pop.onclick = async e => {
      const b = e.target.closest('[data-tt]'); if (!b) return;
      App.closePopover();
      const names = { ruler: 'المسطرة المدرجة', protractor: 'المنقلة الهندسية', setsquare: 'الكوس الرياضي' };
      const o = await App.svgToObject('tool-' + b.dataset.tt);
      o.role = 'teacherTool'; o.elName = names[b.dataset.tt]; o.uid = App.uid();
      App.addObject(o);
    };
  }

  // =============== تحرير الألوان ===============
  function colorEditor(anchor) {
    const custom = App.customColors || [];
    const pop = App.popover(anchor, `<h5>تحرير الألوان</h5>
      <div class="sub">الألوان الأساسية</div>
      <div class="chip-row">${App.COLORS.map(c => `<button class="swatch" data-c="${c}" style="background:${c};width:24px;height:24px"></button>`).join('')}</div>
      <div class="sub" style="margin-top:6px">الألوان المخصصة</div>
      <div class="chip-row">${custom.map(c => `<button class="swatch" data-c="${c}" style="background:${c};width:24px;height:24px"></button>`).join('') || '<span class="hint">لا توجد بعد</span>'}</div>
      <div class="prow" style="margin-top:8px"><input type="color" id="ceInput" value="${App.state.color}"><label>لون</label></div>
      <div class="chip-row"><button class="btn primary" id="ceOk">موافق</button><button class="btn" id="ceAdd">إضافة إلى الألوان المخصصة</button></div>`, { width: 280 });
    if (!pop) return;
    pop.onclick = e => {
      const s = e.target.closest('[data-c]');
      if (s) { App.setColor(s.dataset.c); App.closePopover(); }
      if (e.target.id === 'ceOk') { App.setColor($('#ceInput').value); App.closePopover(); }
      if (e.target.id === 'ceAdd') {
        const v = $('#ceInput').value;
        App.customColors = [v, ...custom.filter(c => c !== v)].slice(0, 12);
        try { localStorage.setItem('sbourati-colors', JSON.stringify(App.customColors)); } catch (er) { /* ignore */ }
        App.setColor(v); App.closePopover();
      }
    };
  }

  // =============== المعادلات ===============
  const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', n: 'ⁿ', i: 'ⁱ', x: 'ˣ', t: 'ᵗ', a: 'ᵃ', b: 'ᵇ', c: 'ᶜ', e: 'ᵉ', k: 'ᵏ', m: 'ᵐ', '*': '˙' };
  const SUB = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎', a: 'ₐ', e: 'ₑ', o: 'ₒ', x: 'ₓ', h: 'ₕ', k: 'ₖ', l: 'ₗ', m: 'ₘ', n: 'ₙ', p: 'ₚ', s: 'ₛ', t: 'ₜ', i: 'ᵢ', r: 'ᵣ', v: 'ᵥ' };
  const GREEK = { alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', Delta: 'Δ', epsilon: 'ε', theta: 'θ', lambda: 'λ', mu: 'μ', nu: 'ν', pi: 'π', rho: 'ρ', sigma: 'σ', Sigma: 'Σ', tau: 'τ', phi: 'φ', omega: 'ω', Omega: 'Ω', infty: '∞', pm: '±', times: '×', cdot: '·', approx: '≈', neq: '≠', leq: '≤', geq: '≥', to: '→', rightleftharpoons: '⇌', deg: '°', int: '∫', sum: '∑', partial: '∂', vec: '⃗' };
  App.eqToUnicode = function (src) {
    let s = src.replace(/\\([a-zA-Z]+)/g, (m, w) => GREEK[w] !== undefined ? GREEK[w] : m);
    s = s.replace(/sqrt\(([^()]*)\)/g, '√($1)').replace(/<=>/g, '⇌').replace(/->/g, '→').replace(/\*/g, '×');
    const conv = (map, str) => str.split('').map(ch => map[ch] || ch).join('');
    s = s.replace(/\^\{([^}]*)\}/g, (m, g) => conv(SUP, g)).replace(/\^(.)/g, (m, g) => conv(SUP, g));
    s = s.replace(/_\{([^}]*)\}/g, (m, g) => conv(SUB, g)).replace(/_(.)/g, (m, g) => conv(SUB, g));
    return s;
  };
  App.openEquationEditor = function (obj, at) {
    const syms = ['^2', '_2', 'sqrt()', '\\Delta', '\\alpha', '\\theta', '\\lambda', '\\omega', '\\pi', '\\rho', '\\sigma', '\\tau', '\\pm', '\\times', '\\cdot', '\\approx', '\\leq', '\\geq', '->', '<=>', '\\infty', '\\deg', '\\int', '\\sum', '\\vec'];
    const m = App.modal({
      title: obj ? 'تعديل المعادلة' : 'معادلة رياضية',
      body: `<label class="field">اكتب المعادلة (^ للأس، _ للدليل، \\alpha للحروف الإغريقية)
          <input type="text" id="eqIn" dir="ltr" value="${App.esc(obj ? obj.eqSrc : 'E_c = 1/2 m v^2')}"></label>
        <div class="sym-row">${syms.map(s => `<button data-s="${App.esc(s)}">${App.esc(App.eqToUnicode(s === 'sqrt()' ? '√' : s === '^2' ? 'x^2' : s === '_2' ? 'x_2' : s))}</button>`).join('')}</div>
        <div class="eq-preview" id="eqPrev"></div>
        <div class="grid2" style="margin-top:10px"><label class="field">حجم الخط<input type="number" id="eqSize" value="${obj ? Math.round(obj.fontSize) : 34}" min="10" max="200"></label></div>`,
      foot: `<button class="btn primary" id="eqOk">${obj ? 'تحديث' : 'إدراج'}</button><button class="btn" data-close>إلغاء</button>`
    });
    const inp = m.el.querySelector('#eqIn'), prev = m.el.querySelector('#eqPrev');
    const upd = () => prev.textContent = App.eqToUnicode(inp.value);
    upd(); inp.oninput = upd; setTimeout(() => inp.focus(), 0);
    m.el.querySelector('.sym-row').onclick = e => {
      const b = e.target.closest('[data-s]'); if (!b) return;
      const s = b.dataset.s, p = inp.selectionStart;
      inp.value = inp.value.slice(0, p) + s + inp.value.slice(inp.selectionEnd);
      inp.focus(); const np = p + (s === 'sqrt()' ? 5 : s.length); inp.setSelectionRange(np, np); upd();
    };
    m.el.querySelector('[data-close]').onclick = m.close;
    const ok = () => {
      const src = inp.value.trim(); if (!src) return;
      const size = +m.el.querySelector('#eqSize').value || 34;
      const color = App.isDarkBg() && App.state.color === '#000000' ? '#ffffff' : App.state.color;
      if (obj) { obj.set({ text: App.eqToUnicode(src), fontSize: size }); obj.eqSrc = src; App.canvas.requestRenderAll(); App.changed(); }
      else {
        const t = new fabric.Text(App.eqToUnicode(src), { fontFamily: 'Cambria Math, Times New Roman, serif', fontSize: size, fill: color, direction: 'ltr' });
        t.eqSrc = src; t.role = 'equation';
        App.addObject(t, at);
      }
      m.close();
    };
    m.el.querySelector('#eqOk').onclick = ok;
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') ok(); });
  };

  // =============== محلّل تعابير رياضية (دون eval) ===============
  App.parseExpr = function (src) {
    const s = src.replace(/\s+/g, '').replace(/,/g, '.').replace(/\*\*/g, '^');
    let i = 0;
    const peek = () => s[i], eat = c => { if (s[i] === c) { i++; return true; } return false; };
    const FN = { sin: Math.sin, cos: Math.cos, tan: Math.tan, exp: Math.exp, ln: Math.log, log: Math.log10, sqrt: Math.sqrt, abs: Math.abs, asin: Math.asin, acos: Math.acos, atan: Math.atan };
    function primary() {
      if (eat('(')) { const e = expr(); if (!eat(')')) throw new Error(')'); return e; }
      if (eat('-')) { const e = factor(); return x => -e(x); }
      if (eat('+')) return factor();
      const m1 = /^\d*\.?\d+(e[+-]?\d+)?/i.exec(s.slice(i));
      if (m1) { i += m1[0].length; const v = parseFloat(m1[0]); return () => v; }
      const m2 = /^[a-zA-Z_]+/.exec(s.slice(i));
      if (m2) {
        const w = m2[0]; i += w.length;
        if (FN[w]) { if (!eat('(')) throw new Error('('); const a = expr(); if (!eat(')')) throw new Error(')'); const f = FN[w]; return x => f(a(x)); }
        if (w === 'x' || w === 't') return x => x;
        if (w === 'pi') return () => Math.PI;
        if (w === 'e') return () => Math.E;
        throw new Error('رمز غير معروف: ' + w);
      }
      throw new Error('تعبير غير صالح');
    }
    function factor() {
      const b = primary();
      if (eat('^')) { const e = factor(); return x => Math.pow(b(x), e(x)); }
      return b;
    }
    function term() {
      let a = factor();
      for (;;) {
        if (eat('*')) { const b = factor(), A = a; a = x => A(x) * b(x); }
        else if (eat('/')) { const b = factor(), A = a; a = x => A(x) / b(x); }
        else if (peek() && /[a-zA-Z(\d.]/.test(peek())) { const b = factor(), A = a; a = x => A(x) * b(x); } // ضرب ضمني
        else return a;
      }
    }
    function expr() {
      let a = term();
      for (;;) {
        if (eat('+')) { const b = term(), A = a; a = x => A(x) + b(x); }
        else if (eat('-')) { const b = term(), A = a; a = x => A(x) - b(x); }
        else return a;
      }
    }
    const f = expr();
    if (i < s.length) throw new Error('تعبير غير صالح');
    return f;
  };

  // =============== رسم المنحنيات ===============
  const PRESETS = [
    { u: 'الوحدة 1: المتابعة الزمنية', n: 'تقدم التفاعل x(t)', f: ['20*(1-exp(-0.005x))'], x: [0, 1200], y: [0, 24], xl: 't (s)', yl: 'x (mmol)', tan: 0 },
    { u: 'الوحدة 1: المتابعة الزمنية', n: 'كمية مادة متفاعل n(t)', f: ['20*exp(-0.005x)+4'], x: [0, 1200], y: [0, 26], xl: 't (s)', yl: 'n (mmol)' },
    { u: 'الوحدة 1: المتابعة الزمنية', n: 'الناقلية σ(t)', f: ['0.5-0.3*(1-exp(-0.004x))'], x: [0, 1200], y: [0, 0.6], xl: 't (s)', yl: 'σ (S/m)' },
    { u: 'الوحدة 2: الميكانيك', n: 'v(t) حركة منتظمة', f: ['5'], x: [0, 10], y: [0, 8], xl: 't (s)', yl: 'v (m/s)' },
    { u: 'الوحدة 2: الميكانيك', n: 'v(t) متغيرة بانتظام', f: ['2+1.5x'], x: [0, 10], y: [0, 20], xl: 't (s)', yl: 'v (m/s)' },
    { u: 'الوحدة 2: الميكانيك', n: 'x(t) متغيرة بانتظام', f: ['0.75x^2+2x'], x: [0, 10], y: [0, 100], xl: 't (s)', yl: 'x (m)', tan: 4 },
    { u: 'الوحدة 2: الميكانيك', n: 'v(t) سقوط في مائع', f: ['6*(1-exp(-x/0.8))'], x: [0, 5], y: [0, 7], xl: 't (s)', yl: 'v (m/s)', tan: 0, asym: 6 },
    { u: 'الوحدة 2: الميكانيك', n: 'مسار قذيفة y(x)', f: ['x*tan(0.785)-9.8*x^2/(2*400*0.5)'], x: [0, 42], y: [0, 12], xl: 'x (m)', yl: 'y (m)' },
    { u: 'الوحدة 3: RC و RL', n: 'شحن مكثفة u_C(t)', f: ['12*(1-exp(-x/2))'], x: [0, 12], y: [0, 14], xl: 't (ms)', yl: 'uC (V)', tan: 0, asym: 12 },
    { u: 'الوحدة 3: RC و RL', n: 'تفريغ مكثفة u_C(t)', f: ['12*exp(-x/2)'], x: [0, 12], y: [0, 14], xl: 't (ms)', yl: 'uC (V)', tan: 0 },
    { u: 'الوحدة 3: RC و RL', n: 'ظهور التيار في وشيعة i(t)', f: ['0.2*(1-exp(-x/5))'], x: [0, 30], y: [0, 0.25], xl: 't (ms)', yl: 'i (A)', tan: 0, asym: 0.2 },
    { u: 'الوحدة 4: التوازن الكيميائي', n: 'معايرة pH-مترية pH(V_b)', f: ['7+3.2*atan(0.9*(x-10))/1.57+0.12*(x-10)/(1+abs(x-10))'], x: [0, 20], y: [0, 14], xl: 'Vb (mL)', yl: 'pH' },
    { u: 'الوحدة 5: التحولات النووية', n: 'التناقص الإشعاعي N(t)', f: ['1000*exp(-0.1386x)'], x: [0, 30], y: [0, 1100], xl: 't (j)', yl: 'N' },
    { u: 'الوحدة 5: التحولات النووية', n: 'ln N = f(t)', f: ['6.9-0.1386x'], x: [0, 30], y: [0, 8], xl: 't (j)', yl: 'ln N' },
    { u: 'الوحدة 6: الأسترة والإماهة', n: 'كمية الأستر n(t)', f: ['0.67*(1-exp(-x/12))'], x: [0, 80], y: [0, 1], xl: 't (min)', yl: 'n (mol)', asym: 0.67 },
    { u: 'الضوء والمخبر', n: 'قانون الانكسار sin i = f(sin r)', f: ['1.5x'], x: [0, 0.66], y: [0, 1], xl: 'sin r', yl: 'sin i' }
  ];
  const GRIDS = { red: ['#fecaca', '#fca5a5'], blue: ['#dbeafe', '#93c5fd'], gray: ['#e5e7eb', '#cbd5e1'] };
  const niceStep = range => { const r = range / 6, p = Math.pow(10, Math.floor(Math.log10(r))); const n = r / p; return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * p; };
  const fmtN = v => { const a = Math.abs(v); return (a >= 1000 || (a < 0.01 && a > 0)) ? v.toExponential(1) : String(+v.toFixed(3)); };

  App.curveSVG = function (spec) {
    const W = 640, H = 440, ml = 64, mb = 52, mt = 34, mr = 30;
    const [x0, x1] = spec.x, [y0, y1] = spec.y;
    const pw = W - ml - mr, ph = H - mt - mb;
    const X = x => ml + (x - x0) / (x1 - x0) * pw, Y = y => mt + ph - (y - y0) / (y1 - y0) * ph;
    const g = GRIDS[spec.grid] || GRIDS.red;
    let s = `<rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>`;
    const sx = niceStep(x1 - x0), sy = niceStep(y1 - y0);
    for (let k = Math.ceil(x0 / (sx / 5)); k * sx / 5 <= x1 + 1e-9; k++) { const x = X(k * sx / 5); s += `<line x1="${x}" y1="${mt}" x2="${x}" y2="${mt + ph}" stroke="${k % 5 ? g[0] : g[1]}" stroke-width="${k % 5 ? .6 : 1}"/>`; }
    for (let k = Math.ceil(y0 / (sy / 5)); k * sy / 5 <= y1 + 1e-9; k++) { const y = Y(k * sy / 5); s += `<line x1="${ml}" y1="${y}" x2="${ml + pw}" y2="${y}" stroke="${k % 5 ? g[0] : g[1]}" stroke-width="${k % 5 ? .6 : 1}"/>`; }
    const ax = X(Math.max(x0, Math.min(0, x1))), ay = Y(Math.max(y0, Math.min(0, y1)));
    s += `<line x1="${ml}" y1="${ay}" x2="${ml + pw + 14}" y2="${ay}" stroke="#0f172a" stroke-width="1.6"/><polygon points="${ml + pw + 18},${ay} ${ml + pw + 8},${ay - 4} ${ml + pw + 8},${ay + 4}" fill="#0f172a"/>`;
    s += `<line x1="${ax}" y1="${mt + ph}" x2="${ax}" y2="${mt - 14}" stroke="#0f172a" stroke-width="1.6"/><polygon points="${ax},${mt - 18} ${ax - 4},${mt - 8} ${ax + 4},${mt - 8}" fill="#0f172a"/>`;
    if (spec.numbers !== false) {
      for (let k = Math.ceil(x0 / sx); k * sx <= x1 + 1e-9; k++) { const v = k * sx; if (Math.abs(v) < 1e-12) continue; s += `<text x="${X(v)}" y="${ay + 16}" font-family="Times New Roman, serif" font-size="12" text-anchor="middle" fill="#0f172a">${fmtN(v)}</text>`; }
      for (let k = Math.ceil(y0 / sy); k * sy <= y1 + 1e-9; k++) { const v = k * sy; if (Math.abs(v) < 1e-12) continue; s += `<text x="${ax - 6}" y="${Y(v) + 4}" font-family="Times New Roman, serif" font-size="12" text-anchor="end" fill="#0f172a">${fmtN(v)}</text>`; }
    }
    s += `<text x="${ml + pw + 6}" y="${ay - 10}" font-family="Times New Roman, serif" font-size="15" font-style="italic" text-anchor="end" fill="#0f172a">${App.esc(spec.xl || 'x')}</text>`;
    s += `<text x="${ax + 8}" y="${mt - 8}" font-family="Times New Roman, serif" font-size="15" font-style="italic" text-anchor="start" fill="#0f172a">${App.esc(spec.yl || 'y')}</text>`;
    s += `<defs><clipPath id="cp"><rect x="${ml}" y="${mt}" width="${pw}" height="${ph}"/></clipPath></defs>`;
    const colors = ['#1d4ed8', '#dc2626', '#16a34a'];
    (spec.f || []).forEach((src, idx) => {
      if (!src || !src.trim()) return;
      let fn; try { fn = App.parseExpr(src); } catch (e) { return; }
      let d = '', pen = false;
      for (let k = 0; k <= 400; k++) {
        const x = x0 + (x1 - x0) * k / 400, y = fn(x);
        if (!isFinite(y)) { pen = false; continue; }
        d += `${pen ? 'L' : 'M'}${X(x).toFixed(1)} ${Y(Math.max(y0 - (y1 - y0), Math.min(y1 + (y1 - y0), y))).toFixed(1)} `; pen = true;
      }
      s += `<path d="${d}" fill="none" stroke="${colors[idx]}" stroke-width="2.4" clip-path="url(#cp)"/>`;
      if (idx === 0 && spec.tan !== undefined && spec.tan !== '' && spec.tan !== null && isFinite(+spec.tan)) {
        const t = +spec.tan, h = (x1 - x0) * 1e-4, m = (fn(t + h) - fn(t - h)) / (2 * h), yt = fn(t);
        if (isFinite(m) && isFinite(yt)) {
          s += `<line x1="${X(x0)}" y1="${Y(yt + m * (x0 - t))}" x2="${X(x1)}" y2="${Y(yt + m * (x1 - t))}" stroke="#dc2626" stroke-width="1.6" stroke-dasharray="7 5" clip-path="url(#cp)"/>`;
          s += `<circle cx="${X(t)}" cy="${Y(yt)}" r="4" fill="#dc2626"/>`;
          s += `<text x="${X(t) + 8}" y="${Math.min(mt + ph - 8, Y(yt) + 18)}" font-family="Times New Roman, serif" font-size="13" fill="#dc2626">a = ${fmtN(m)}</text>`;
        }
      }
    });
    if (spec.asym !== undefined && spec.asym !== '' && isFinite(+spec.asym)) s += `<line x1="${ml}" y1="${Y(+spec.asym)}" x2="${ml + pw}" y2="${Y(+spec.asym)}" stroke="#16a34a" stroke-width="1.4" stroke-dasharray="4 4"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${s}</svg>`;
  };

  async function curveObject(spec) {
    const { objects, options } = await fabric.loadSVGFromString(App.curveSVG(spec));
    const g = fabric.util.groupSVGElements(objects.filter(Boolean), options);
    g.role = 'curve'; g.curveSpec = spec; g.uid = App.uid();
    return g;
  }

  App.openCurveEditor = function (obj) {
    let spec = obj ? JSON.parse(JSON.stringify(obj.curveSpec)) : { ...PRESETS[0], f: [...PRESETS[0].f, '', ''], grid: 'red', numbers: true };
    while (spec.f.length < 3) spec.f.push('');
    let units = '', last = '';
    PRESETS.forEach((p, i) => { if (p.u !== last) { units += `<h6>${p.u}</h6>`; last = p.u; } units += `<button data-p="${i}">${i + 1}. ${App.esc(p.n)}</button>`; });
    const m = App.modal({
      title: '📈 رسم المنحنيات', wide: true,
      body: `<div class="curve-layout">
        <div class="curve-presets"><b style="font-size:13px">الرسوم الجاهزة</b>${units}</div>
        <div class="curve-preview" id="cvPrev"></div>
        <div class="curve-form">
          <label class="field">f₁(x) =<input id="cvF0"></label>
          <label class="field">f₂(x) =<input id="cvF1" placeholder="اختياري"></label>
          <label class="field">f₃(x) =<input id="cvF2" placeholder="اختياري"></label>
          <div class="grid2"><label class="field">x من<input id="cvX0" type="number" step="any"></label><label class="field">إلى<input id="cvX1" type="number" step="any"></label></div>
          <div class="grid2"><label class="field">y من<input id="cvY0" type="number" step="any"></label><label class="field">إلى<input id="cvY1" type="number" step="any"></label></div>
          <div class="grid2"><label class="field">اسم المحور الأفقي<input id="cvXL"></label><label class="field">اسم المحور الرأسي<input id="cvYL"></label></div>
          <div class="grid2"><label class="field">المماس عند x =<input id="cvTan" type="number" step="any" placeholder="—"></label><label class="field">مقارب أفقي y =<input id="cvAsym" type="number" step="any" placeholder="—"></label></div>
          <label class="field">لون الشبكة<select id="cvGrid"><option value="red">شبكة حمراء كلاسيكية</option><option value="blue">شبكة زرقاء هندسية</option><option value="gray">شبكة رمادية</option></select></label>
          <label class="chk" style="font-size:13px;display:flex;gap:6px"><input type="checkbox" id="cvNum">أرقام المحاور</label>
          <div class="hint">الدوال المتاحة: sin cos tan exp ln log sqrt abs، والثوابت pi و e. مثال: 12*(1-exp(-x/2))</div>
          <div class="hint" id="cvErr" style="color:#dc2626"></div>
        </div></div>`,
      foot: `<button class="btn primary" id="cvOk">${obj ? 'تحديث المنحنى' : 'إدراج في السبورة'}</button><button class="btn" id="cvPng">${icon('image')} حفظ PNG</button><button class="btn" data-close>إلغاء</button>`
    });
    const q = id => m.el.querySelector('#' + id);
    const fill = () => {
      spec.f.forEach((f, i) => q('cvF' + i).value = f || '');
      q('cvX0').value = spec.x[0]; q('cvX1').value = spec.x[1]; q('cvY0').value = spec.y[0]; q('cvY1').value = spec.y[1];
      q('cvXL').value = spec.xl || ''; q('cvYL').value = spec.yl || '';
      q('cvTan').value = spec.tan ?? ''; q('cvAsym').value = spec.asym ?? '';
      q('cvGrid').value = spec.grid || 'red'; q('cvNum').checked = spec.numbers !== false;
    };
    const read = () => {
      spec.f = [0, 1, 2].map(i => q('cvF' + i).value);
      spec.x = [+q('cvX0').value, +q('cvX1').value]; spec.y = [+q('cvY0').value, +q('cvY1').value];
      spec.xl = q('cvXL').value; spec.yl = q('cvYL').value;
      spec.tan = q('cvTan').value === '' ? undefined : +q('cvTan').value;
      spec.asym = q('cvAsym').value === '' ? undefined : +q('cvAsym').value;
      spec.grid = q('cvGrid').value; spec.numbers = q('cvNum').checked;
    };
    const draw = () => {
      read();
      const errs = [];
      spec.f.forEach((f, i) => { if (f.trim()) { try { App.parseExpr(f); } catch (e) { errs.push(`f${i + 1}: ${e.message}`); } } });
      if (!(spec.x[1] > spec.x[0]) || !(spec.y[1] > spec.y[0])) errs.push('تحقق من مجالات المحورين');
      q('cvErr').textContent = errs.join(' — ');
      if (!errs.length || errs.every(e => e.startsWith('f'))) q('cvPrev').innerHTML = App.curveSVG(spec);
    };
    fill(); draw();
    m.el.querySelector('.curve-form').addEventListener('input', draw);
    m.el.querySelector('.curve-form').addEventListener('change', draw);
    m.el.querySelector('.curve-presets').onclick = e => {
      const b = e.target.closest('[data-p]'); if (!b) return;
      const p = PRESETS[+b.dataset.p];
      spec = { ...p, f: [...p.f, '', ''].slice(0, 3), grid: spec.grid, numbers: spec.numbers };
      m.el.querySelectorAll('.curve-presets button').forEach(x => x.classList.toggle('active', x === b));
      fill(); draw();
    };
    m.el.querySelector('[data-close]').onclick = m.close;
    q('cvOk').onclick = async () => {
      read();
      const g = await curveObject(JSON.parse(JSON.stringify(spec)));
      if (obj) {
        g.set({ left: obj.left, top: obj.top, scaleX: obj.scaleX, scaleY: obj.scaleY, angle: obj.angle, originX: obj.originX, originY: obj.originY });
        const idx = App.canvas.getObjects().indexOf(obj);
        App.canvas.remove(obj); App.canvas.insertAt(idx, g); App.canvas.setActiveObject(g); App.canvas.requestRenderAll();
      } else { g.scaleToWidth(520); App.addObject(g); }
      m.close();
    };
    q('cvPng').onclick = async () => {
      read();
      const img = new Image();
      img.onload = async () => {
        const cv = document.createElement('canvas'); cv.width = img.width * 2; cv.height = img.height * 2;
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        if (window.api) await window.api.saveBinary(App.dataUrlToBytes(cv.toDataURL('image/png')), 'منحنى.png', 'png', 'PNG');
      };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(App.curveSVG(spec));
    };
  };

  // =============== الجدول ===============
  App.tableSVG = function (d) {
    const cw = 120, rh = 40, rows = d.rows.length, cols = d.rows[0].length;
    let s = '';
    d.rows.forEach((r, i) => r.forEach((cell, j) => {
      const x = (cols - 1 - j) * cw, y = i * rh; // من اليمين إلى اليسار
      const head = d.header && i === 0;
      s += `<rect x="${x}" y="${y}" width="${cw}" height="${rh}" fill="${head ? '#bfdbfe' : (i % 2 ? '#f8fafc' : '#ffffff')}" stroke="#334155" stroke-width="1.5"/>`;
      if (cell) s += `<text x="${x + cw / 2}" y="${y + rh / 2 + 6}" font-family="Tajawal, sans-serif" font-size="17" text-anchor="middle" fill="#0f172a"${head ? ' font-weight="bold"' : ''}>${App.esc(cell)}</text>`;
    }));
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cols * cw} ${rows * rh}">${s}</svg>`;
  };
  async function tableObject(d) {
    const { objects, options } = await fabric.loadSVGFromString(App.tableSVG(d));
    const g = fabric.util.groupSVGElements(objects.filter(Boolean), options);
    g.role = 'table'; g.tableData = d; g.uid = App.uid();
    return g;
  }
  App.openTableEditor = function (obj) {
    let d = obj ? JSON.parse(JSON.stringify(obj.tableData)) : { header: true, rows: [['t (s)', '', ''], ['', '', ''], ['', '', '']] };
    const m = App.modal({
      title: obj ? 'تعديل الجدول' : 'إدراج جدول', wide: true,
      body: `<div class="chip-row" style="padding:0 0 8px">
          <button class="btn" data-a="row+">صف ▼+</button><button class="btn" data-a="row-">حذف صف</button>
          <button class="btn" data-a="col+">عمود ◀+</button><button class="btn" data-a="col-">حذف عمود</button>
          <label class="chk" style="display:flex;gap:6px;align-items:center;font-size:13px"><input type="checkbox" id="tbHead">الصف الأول عنوان</label>
        </div><div style="overflow:auto"><table class="tbl-edit" id="tbGrid"></table></div>`,
      foot: `<button class="btn primary" id="tbOk">${obj ? 'تحديث' : 'إدراج'}</button><button class="btn" data-close>إلغاء</button>`
    });
    const grid = m.el.querySelector('#tbGrid'), head = m.el.querySelector('#tbHead');
    const readGrid = () => { d.rows = Array.from(grid.rows).map(r => Array.from(r.cells).map(c => c.firstChild.value)); d.header = head.checked; };
    const render = () => {
      head.checked = d.header;
      grid.innerHTML = d.rows.map((r, i) => `<tr>${r.map(c => `<td><input class="${d.header && i === 0 ? 'head' : ''}" value="${App.esc(c)}"></td>`).join('')}</tr>`).join('');
    };
    render();
    head.onchange = () => { readGrid(); render(); };
    m.el.querySelector('.chip-row').onclick = e => {
      const a = e.target.closest('[data-a]'); if (!a) return;
      readGrid();
      const cols = d.rows[0].length;
      if (a.dataset.a === 'row+') d.rows.push(Array(cols).fill(''));
      if (a.dataset.a === 'row-' && d.rows.length > 1) d.rows.pop();
      if (a.dataset.a === 'col+') d.rows.forEach(r => r.push(''));
      if (a.dataset.a === 'col-' && cols > 1) d.rows.forEach(r => r.pop());
      render();
    };
    m.el.querySelector('[data-close]').onclick = m.close;
    m.el.querySelector('#tbOk').onclick = async () => {
      readGrid();
      const g = await tableObject(d);
      if (obj) {
        g.set({ left: obj.left, top: obj.top, scaleX: obj.scaleX, scaleY: obj.scaleY, angle: obj.angle });
        const idx = App.canvas.getObjects().indexOf(obj);
        App.canvas.remove(obj); App.canvas.insertAt(idx, g); App.canvas.setActiveObject(g);
      } else App.addObject(g);
      App.canvas.requestRenderAll();
      m.close();
    };
  };

  // =============== الصور ===============
  App.insertImageFile = function (file, at) {
    const reader = new FileReader();
    reader.onload = async () => {
      const img = await fabric.FabricImage.fromURL(reader.result);
      const c = App.canvas, max = Math.min(c.getWidth(), c.getHeight()) * 0.6 / c.getZoom();
      if (img.width > max || img.height > max) img.scale(max / Math.max(img.width, img.height));
      img.uid = App.uid();
      App.addObject(img, at);
    };
    reader.readAsDataURL(file);
  };

  // =============== ورقتي ===============
  App.togglePaper = function (on) {
    App.state.paper.on = on === undefined ? !App.state.paper.on : on;
    $('#btnPaper').classList.toggle('on', App.state.paper.on);
    if (App.state.paper.on) {
      // نجعل الورقة مرئية بكاملها
      const p = App.paperRect(), c = App.canvas;
      const z = App.clampZoom(Math.min(c.getWidth() * 0.9 / p.width, c.getHeight() * 0.9 / p.height));
      if (!App.state.zoomLocked) c.setViewportTransform([z, 0, 0, z, (c.getWidth() - p.width * z) / 2, (c.getHeight() - p.height * z) / 2]);
      App.onViewChange();
    }
    App.renderBackground(); App.canvas.requestRenderAll(); App.markDirty();
  };
  function paperMenu(anchor) {
    const p = App.state.paper, [w, h] = App.PAPER_SIZES[p.size];
    const mm = v => Math.round(v * 25.4 / 96);
    const pop = App.popover(anchor, `<h5>ورقتي</h5><div class="sub">${p.orient === 'landscape' ? mm(h) + ' × ' + mm(w) : mm(w) + ' × ' + mm(h)} mm</div>
      <div class="sub">المقاس</div><div class="chip-row">${Object.keys(App.PAPER_SIZES).map(s => `<button class="chip ${p.size === s ? 'on' : ''}" data-size="${s}">${s}</button>`).join('')}</div>
      <div class="sub" style="margin-top:6px">الاتجاه</div><div class="chip-row"><button class="chip ${p.orient === 'portrait' ? 'on' : ''}" data-or="portrait">عمودي</button><button class="chip ${p.orient === 'landscape' ? 'on' : ''}" data-or="landscape">أفقي</button></div>
      <div class="toggle-row" data-m><span>إظهار هوامش الطباعة الآمنة (1 سم)</span><i class="switch ${p.margins ? 'on' : ''}"></i></div>
      <button class="menu-item" data-pdf>${icon('pdf')}<span>تصدير PDF بمقاس الورقة</span></button>
      <button class="menu-item" data-show>${icon(p.on ? 'hide' : 'eye')}<span>${p.on ? 'إيقاف الورقة' : 'إظهار الورقة'}</span></button>`, { width: 270, above: true, alignLeft: true });
    if (!pop) return;
    pop.onclick = e => {
      const s = e.target.closest('[data-size]'), o = e.target.closest('[data-or]');
      if (s) { p.size = s.dataset.size; App.togglePaper(true); App.closePopover(); paperMenu(anchor); }
      if (o) { p.orient = o.dataset.or; App.togglePaper(true); App.closePopover(); paperMenu(anchor); }
      if (e.target.closest('[data-m]')) { p.margins = !p.margins; App.renderBackground(); App.markDirty(); App.closePopover(); paperMenu(anchor); }
      if (e.target.closest('[data-pdf]')) { App.closePopover(); App.togglePaper(true); App.exportPDF(App.pages.length > 1); }
      if (e.target.closest('[data-show]')) { App.closePopover(); App.togglePaper(); }
    };
  }

  // =============== الإعدادات ===============
  App.setDark = function (on) {
    App.state.dark = on;
    document.body.classList.toggle('dark', on);
    try { localStorage.setItem('sbourati-dark', on ? '1' : '0'); } catch (e) { /* ignore */ }
  };
  function settingsMenu(anchor) {
    const pop = App.popover(anchor, `
      <div class="toggle-row" data-dark><span>${icon('moon')}</span><span style="flex:1">الوضع المظلم</span><i class="switch ${App.state.dark ? 'on' : ''}"></i></div>
      <div class="menu-sep"></div>
      <button class="menu-item" data-a="open">${icon('folder')}<span>فتح ملف درس (.sboard)</span><span class="kbd">Ctrl+O</span></button>
      <button class="menu-item" data-a="saveas">${icon('saveAs')}<span>حفظ باسم…</span><span class="kbd">Ctrl+Shift+S</span></button>
      <button class="menu-item" data-a="new">${icon('plus')}<span>درس جديد</span></button>
      <button class="menu-item" data-a="reset">${icon('reset')}<span>إعادة ضبط العرض 100%</span><span class="kbd">Ctrl+0</span></button>
      <div class="menu-sep"></div>
      <div class="hint" style="padding:0 10px">سبورتي 1.0 — يعمل دون إنترنت</div>`, { width: 270, alignLeft: true });
    if (!pop) return;
    pop.onclick = e => {
      if (e.target.closest('[data-dark]')) { App.setDark(!App.state.dark); pop.querySelector('.switch').classList.toggle('on', App.state.dark); return; }
      const a = e.target.closest('[data-a]'); if (!a) return;
      App.closePopover();
      ({ open: App.openLesson, saveas: App.saveAs, new: App.newLesson, reset: App.resetView })[a.dataset.a]();
    };
  }

  // =============== العرض التقديمي وملء الشاشة ===============
  App.setPresenting = function (on) {
    document.body.classList.toggle('presenting', on);
    $('#presentExit').classList.toggle('hidden', !on);
    if (window.api) window.api.fullscreen(on);
  };
  App.toggleFullscreen = function () {
    if (window.api) window.api.fullscreen();
    else if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen();
  };

  // مزامنة الواجهة مع الإعدادات بعد تحميل درس
  App.syncSettingsUI = function () {
    $('#bgLabel').textContent = (App.BACKGROUNDS[App.state.bg] || App.BACKGROUNDS.grid).short;
    $('#btnPaper').classList.toggle('on', App.state.paper.on);
    $('#btnView').classList.toggle('on', App.state.snap);
    App.renderBackground();
  };

  App.initExtras = function () {
    try { App.customColors = JSON.parse(localStorage.getItem('sbourati-colors') || '[]'); } catch (e) { App.customColors = []; }
    try { App.setDark(localStorage.getItem('sbourati-dark') === '1'); } catch (e) { /* ignore */ }
    $('#btnBg').onclick = e => bgMenu(e.currentTarget);
    $('#btnView').onclick = e => viewMenu(e.currentTarget);
    $('#btnTable').onclick = () => App.openTableEditor();
    $('#btnShapes').onclick = e => shapesMenu(e.currentTarget);
    $('#btnFav').onclick = e => favMenu(e.currentTarget);
    $('#btnCurve').onclick = () => App.openCurveEditor();
    $('#btnImage').onclick = () => $('#imageInput').click();
    $('#imageInput').onchange = e => { const f = e.target.files[0]; if (f) App.insertImageFile(f); e.target.value = ''; };
    $('#btnPaper').onclick = () => App.togglePaper();
    $('#btnPaperSettings').onclick = e => paperMenu(e.currentTarget);
    $('#btnSettings').onclick = e => settingsMenu(e.currentTarget);
    $('#btnPresent').onclick = () => App.setPresenting(true);
    $('#btnPresentExit').onclick = () => App.setPresenting(false);
    $('#btnFullscreen').onclick = () => App.toggleFullscreen();
    App.textMenu = textMenu;
    App.colorEditor = colorEditor;
  };
})();
