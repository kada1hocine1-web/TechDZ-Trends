// المحاكاة: البندول، النابض، القذف المائل، السقوط الحر، الدارة البسيطة
(function () {
  const $ = App.$;
  const DEG = Math.PI / 180;

  App.SIMS = {
    pendulum: {
      name: 'البندول البسيط', w: 300, h: 320,
      defaults: { L: 1, theta0: 30, g: 9.8, damping: false },
      params: [
        { key: 'L', label: 'طول الخيط', unit: 'm', min: 0.1, max: 5, step: 0.1 },
        { key: 'theta0', label: 'زاوية الانطلاق', unit: '°', min: 2, max: 85, step: 1 },
        { key: 'g', label: 'شدة الجاذبية g', unit: 'N/kg', min: 1, max: 25, step: 0.1 },
        { key: 'damping', label: 'تخامد', type: 'bool', on: 'مع احتكاك' }
      ],
      hint: 'الدور الذاتي للتذبذبات الصغيرة: T₀ = 2π√(L/g)'
    },
    spring: {
      name: 'النواس المرن الأفقي', w: 380, h: 200,
      defaults: { k: 20, m: 0.5, x0: 5, damping: false },
      params: [
        { key: 'k', label: 'ثابت المرونة k', unit: 'N/m', min: 1, max: 300, step: 1 },
        { key: 'm', label: 'الكتلة m', unit: 'kg', min: 0.05, max: 5, step: 0.05 },
        { key: 'x0', label: 'المطال الابتدائي', unit: 'cm', min: 1, max: 10, step: 0.5 },
        { key: 'damping', label: 'تخامد', type: 'bool', on: 'مع احتكاك' }
      ],
      hint: 'الدور الذاتي: T₀ = 2π√(m/k)'
    },
    projectile: {
      name: 'القذف المائل', w: 440, h: 280,
      defaults: { v0: 20, alpha: 45, g: 9.8 },
      params: [
        { key: 'v0', label: 'السرعة الابتدائية v₀', unit: 'm/s', min: 1, max: 60, step: 0.5 },
        { key: 'alpha', label: 'زاوية القذف α', unit: '°', min: 5, max: 85, step: 1 },
        { key: 'g', label: 'شدة الجاذبية g', unit: 'N/kg', min: 1, max: 25, step: 0.1 }
      ],
      hint: 'المدى: R = v₀² sin2α / g — الذروة: H = v₀² sin²α / 2g'
    },
    freefall: {
      name: 'السقوط الحر (تصوير متعاقب)', w: 240, h: 380,
      defaults: { h: 20, g: 9.8, strobe: 0.1 },
      params: [
        { key: 'h', label: 'ارتفاع السقوط', unit: 'm', min: 1, max: 200, step: 1 },
        { key: 'g', label: 'شدة الجاذبية g', unit: 'N/kg', min: 1, max: 25, step: 0.1 },
        { key: 'strobe', label: 'المدة بين صورتين τ', unit: 's', min: 0.02, max: 1, step: 0.01 }
      ],
      hint: 'z(t) = ½gt² ، v(t) = gt'
    },
    circuit: {
      name: 'دارة كهربائية بسيطة', w: 340, h: 240,
      defaults: { E: 4.5, R: 10, closed: false },
      params: [
        { key: 'E', label: 'توتر المولد E', unit: 'V', min: 1, max: 24, step: 0.5 },
        { key: 'R', label: 'مقاومة المصباح R', unit: 'Ω', min: 1, max: 200, step: 1 },
        { key: 'closed', label: 'القاطعة', type: 'bool', on: 'مغلقة' }
      ],
      hint: 'انقر مرتين على الدارة لغلق القاطعة أو فتحها. I = E / R'
    }
  };

  const FONT = '"Tajawal", sans-serif';
  const txt = (ctx, s, x, y, size = 12, color = '#334155', align = 'center', weight = 700) => {
    ctx.save(); ctx.fillStyle = color; ctx.font = `${weight} ${size}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = 'middle';
    ctx.direction = 'ltr'; ctx.fillText(s, x, y); ctx.restore();
  };
  const fmt = (v, d = 2) => (Math.round(v * 10 ** d) / 10 ** d).toString();

  // ---------- فئة عنصر المحاكاة ----------
  class SimObject extends fabric.Rect {
    static type = 'SimObject';
    constructor(options = {}) {
      super(options);
      this.objectCaching = false;
      if (!this.sim) this.sim = { ...App.SIMS[this.simType].defaults };
      this.resetState();
    }
    resetState() {
      const s = this.sim;
      this.simT = 0;
      if (this.simType === 'pendulum') this.st = { th: s.theta0 * DEG, w: 0 };
      else if (this.simType === 'spring') this.st = { x: s.x0 / 100, v: 0 };
      else if (this.simType === 'projectile') this.st = { trail: [], done: false };
      else if (this.simType === 'freefall') this.st = { shots: [], nextShot: 0, done: false };
      else this.st = { phase: 0 };
    }
    step(dt) {
      const s = this.sim, st = this.st;
      if (this.simType === 'pendulum') {
        const n = 8, h = dt / n, k = s.g / s.L, c = s.damping ? 0.35 : 0;
        for (let i = 0; i < n; i++) { // RK4
          const f = (th, w) => [w, -k * Math.sin(th) - c * w];
          const [a1, b1] = f(st.th, st.w), [a2, b2] = f(st.th + a1 * h / 2, st.w + b1 * h / 2);
          const [a3, b3] = f(st.th + a2 * h / 2, st.w + b2 * h / 2), [a4, b4] = f(st.th + a3 * h, st.w + b3 * h);
          st.th += h / 6 * (a1 + 2 * a2 + 2 * a3 + a4); st.w += h / 6 * (b1 + 2 * b2 + 2 * b3 + b4);
        }
      } else if (this.simType === 'spring') {
        const n = 8, h = dt / n, c = s.damping ? 0.6 : 0;
        for (let i = 0; i < n; i++) { const a = -(s.k / s.m) * st.x - c * st.v; st.v += a * h; st.x += st.v * h; }
      } else if (this.simType === 'projectile') {
        if (st.done) return;
        const tf = 2 * s.v0 * Math.sin(s.alpha * DEG) / s.g;
        if (this.simT + dt >= tf) { this.simT = tf; st.done = true; return; }
      } else if (this.simType === 'freefall') {
        if (st.done) return;
        const tf = Math.sqrt(2 * s.h / s.g);
        while (st.nextShot <= Math.min(this.simT + dt, tf)) { st.shots.push(st.nextShot); st.nextShot += s.strobe; }
        if (this.simT + dt >= tf) { this.simT = tf; st.done = true; return; }
      } else if (this.simType === 'circuit') {
        if (s.closed) st.phase = (st.phase + dt * (s.E / s.R) * 2.5) % 1;
      }
      this.simT += dt;
    }
    _render(ctx) {
      super._render(ctx);
      const w = this.width, h = this.height, x0 = -w / 2, y0 = -h / 2;
      ctx.save();
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      try { DRAW[this.simType](ctx, this, x0, y0, w, h); } catch (e) { /* ignore */ }
      ctx.restore();
    }
  }
  fabric.classRegistry.setClass(SimObject, 'SimObject');
  App.SimObject = SimObject;

  const DRAW = {
    pendulum(ctx, o, x0, y0, w, h) {
      const s = o.sim, cx = x0 + w / 2, top = y0 + 34;
      txt(ctx, App.SIMS.pendulum.name, x0 + w - 10, y0 + 14, 12, '#0f172a', 'right');
      ctx.fillStyle = '#94a3b8'; ctx.fillRect(cx - 70, top - 8, 140, 8);
      for (let i = -70; i < 70; i += 10) { ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + i, top - 8); ctx.lineTo(cx + i + 8, top - 16); ctx.stroke(); }
      const Lpx = h - 110;
      // المحور الشاقولي وقوس الزاوية
      ctx.setLineDash([4, 4]); ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx, top + Lpx + 20); ctx.stroke(); ctx.setLineDash([]);
      const th = o.st.th;
      const bx = cx + Lpx * Math.sin(th), by = top + Lpx * Math.cos(th);
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.5; ctx.beginPath();
      ctx.arc(cx, top, 46, Math.PI / 2, Math.PI / 2 - th, th > 0); ctx.stroke();
      txt(ctx, `θ = ${fmt(th / DEG, 1)}°`, cx + (th >= 0 ? 52 : -52), top + 58, 11, '#b45309');
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(bx, by); ctx.stroke();
      const g = ctx.createRadialGradient(bx - 5, by - 5, 2, bx, by, 16);
      g.addColorStop(0, '#93c5fd'); g.addColorStop(1, '#1d4ed8');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by, 15, 0, Math.PI * 2); ctx.fill();
      const T0 = 2 * Math.PI * Math.sqrt(s.L / s.g);
      txt(ctx, `L = ${s.L} m   T₀ = ${fmt(T0)} s   t = ${fmt(o.simT, 1)} s`, cx, y0 + h - 16, 11, '#475569');
    },
    spring(ctx, o, x0, y0, w, h) {
      const s = o.sim;
      txt(ctx, App.SIMS.spring.name, x0 + w - 10, y0 + 14, 12, '#0f172a', 'right');
      const floor = y0 + h - 50, wall = x0 + 24, eq = x0 + w * 0.55, pxPerM = (w * 0.3) / 0.1;
      ctx.fillStyle = '#e2e8f0'; ctx.fillRect(x0 + 12, floor, w - 24, 6);
      ctx.fillStyle = '#94a3b8'; ctx.fillRect(wall - 12, floor - 90, 12, 96);
      const bx = eq + o.st.x * pxPerM, bw = 54;
      // نابض متعرّج
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 2; ctx.beginPath();
      const sy = floor - 27, coils = 12, sx1 = wall, sx2 = bx - bw / 2;
      ctx.moveTo(sx1, sy);
      for (let i = 1; i < coils * 2; i++) ctx.lineTo(sx1 + 8 + (sx2 - sx1 - 16) * i / (coils * 2), sy + (i % 2 ? -11 : 11));
      ctx.lineTo(sx2, sy); ctx.stroke();
      ctx.setLineDash([4, 4]); ctx.strokeStyle = '#16a34a'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(eq, floor - 70); ctx.lineTo(eq, floor + 14); ctx.stroke(); ctx.setLineDash([]);
      txt(ctx, 'O', eq, floor + 22, 11, '#16a34a');
      const g = ctx.createLinearGradient(0, floor - 54, 0, floor);
      g.addColorStop(0, '#fb923c'); g.addColorStop(1, '#c2410c');
      ctx.fillStyle = g; ctx.fillRect(bx - bw / 2, floor - 54, bw, 54);
      txt(ctx, 'm', bx, floor - 27, 14, '#fff');
      const T0 = 2 * Math.PI * Math.sqrt(s.m / s.k);
      txt(ctx, `x = ${fmt(o.st.x * 100, 1)} cm   T₀ = ${fmt(T0)} s   t = ${fmt(o.simT, 1)} s`, x0 + w / 2, y0 + h - 16, 11, '#475569');
    },
    projectile(ctx, o, x0, y0, w, h) {
      const s = o.sim, a = s.alpha * DEG;
      txt(ctx, App.SIMS.projectile.name, x0 + w - 10, y0 + 14, 12, '#0f172a', 'right');
      const R = s.v0 ** 2 * Math.sin(2 * a) / s.g, H = (s.v0 * Math.sin(a)) ** 2 / (2 * s.g);
      const ox = x0 + 36, oy = y0 + h - 40;
      const sc = Math.min((w - 70) / Math.max(R, 1e-6), (h - 90) / Math.max(H, 1e-6));
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(x0 + w - 16, oy); ctx.moveTo(ox, oy); ctx.lineTo(ox, y0 + 26); ctx.stroke();
      txt(ctx, 'x', x0 + w - 12, oy + 12, 11); txt(ctx, 'y', ox - 10, y0 + 28, 11);
      // المسار النظري متقطع
      ctx.setLineDash([3, 4]); ctx.strokeStyle = '#cbd5e1'; ctx.beginPath();
      for (let i = 0; i <= 60; i++) { const X = R * i / 60, Y = X * Math.tan(a) - s.g * X * X / (2 * s.v0 ** 2 * Math.cos(a) ** 2); i ? ctx.lineTo(ox + X * sc, oy - Y * sc) : ctx.moveTo(ox, oy); }
      ctx.stroke(); ctx.setLineDash([]);
      const t = o.simT, X = s.v0 * Math.cos(a) * t, Y = s.v0 * Math.sin(a) * t - s.g * t * t / 2;
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2.2; ctx.beginPath();
      const steps = 50;
      for (let i = 0; i <= steps; i++) { const ti = t * i / steps; const xi = s.v0 * Math.cos(a) * ti, yi = s.v0 * Math.sin(a) * ti - s.g * ti * ti / 2; i ? ctx.lineTo(ox + xi * sc, oy - yi * sc) : ctx.moveTo(ox, oy); }
      ctx.stroke();
      const px = ox + X * sc, py = oy - Math.max(Y, 0) * sc;
      // شعاع السرعة
      const vx = s.v0 * Math.cos(a), vy = s.v0 * Math.sin(a) - s.g * t, vs = 2.2;
      arrow(ctx, px, py, px + vx * vs, py - vy * vs, '#dc2626');
      ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill();
      txt(ctx, `v₀=${s.v0} m/s  α=${s.alpha}°  R=${fmt(R, 1)} m  H=${fmt(H, 1)} m  t=${fmt(t, 2)} s`, x0 + w / 2, y0 + h - 14, 11, '#475569');
    },
    freefall(ctx, o, x0, y0, w, h) {
      const s = o.sim;
      txt(ctx, 'السقوط الحر', x0 + w - 10, y0 + 14, 12, '#0f172a', 'right');
      const top = y0 + 40, bottom = y0 + h - 44, sc = (bottom - top) / s.h, cx = x0 + w / 2 + 20;
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0 + 40, top); ctx.lineTo(x0 + 40, bottom); ctx.stroke();
      const step = s.h <= 20 ? 2 : s.h <= 50 ? 5 : s.h <= 100 ? 10 : 20;
      for (let z = 0; z <= s.h + 1e-9; z += step) {
        const y = top + z * sc; ctx.beginPath(); ctx.moveTo(x0 + 34, y); ctx.lineTo(x0 + 46, y); ctx.stroke();
        txt(ctx, `${z}`, x0 + 22, y, 9, '#64748b');
      }
      txt(ctx, 'z (m)', x0 + 40, top - 12, 10, '#64748b');
      ctx.fillStyle = '#e2e8f0'; ctx.fillRect(x0 + 50, bottom + 4, w - 64, 6);
      o.st.shots.forEach(ts => { const y = top + 0.5 * s.g * ts * ts * sc; ctx.fillStyle = 'rgba(37,99,235,.28)'; ctx.beginPath(); ctx.arc(cx, y, 8, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = 'rgba(37,99,235,.5)'; ctx.beginPath(); ctx.moveTo(cx + 12, y); ctx.lineTo(cx + 22, y); ctx.stroke(); });
      const t = o.simT, z = 0.5 * s.g * t * t;
      const y = top + Math.min(z, s.h) * sc;
      ctx.fillStyle = '#1d4ed8'; ctx.beginPath(); ctx.arc(cx, y, 9, 0, Math.PI * 2); ctx.fill();
      txt(ctx, `t = ${fmt(t, 2)} s   v = ${fmt(s.g * t, 1)} m/s`, x0 + w / 2, y0 + h - 16, 11, '#475569');
    },
    circuit(ctx, o, x0, y0, w, h) {
      const s = o.sim, I = s.closed ? s.E / s.R : 0;
      txt(ctx, App.SIMS.circuit.name, x0 + w - 10, y0 + 14, 12, '#0f172a', 'right');
      const L = x0 + 40, R = x0 + w - 40, T = y0 + 50, B = y0 + h - 50, mx = (L + R) / 2;
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 2.5;
      // الأسلاك
      ctx.beginPath();
      ctx.moveTo(L, T + 30); ctx.lineTo(L, T); ctx.lineTo(mx - 30, T);
      ctx.moveTo(mx + 30, T); ctx.lineTo(R, T); ctx.lineTo(R, B); ctx.lineTo(mx + 22, B);
      ctx.moveTo(mx - 22, B); ctx.lineTo(L, B); ctx.lineTo(L, T + 70);
      ctx.stroke();
      // المولد (يسار)
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(L - 16, T + 30); ctx.lineTo(L + 16, T + 30); ctx.stroke();
      ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(L - 8, T + 42); ctx.lineTo(L + 8, T + 42); ctx.stroke();
      ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(L, T + 42); ctx.lineTo(L, T + 70); ctx.stroke();
      txt(ctx, '+', L - 24, T + 28, 13, '#dc2626'); txt(ctx, '−', L - 24, T + 44, 15, '#1d4ed8');
      txt(ctx, `${s.E} V`, L + 30, T + 36, 11, '#475569');
      // القاطعة (أعلى)
      ctx.fillStyle = '#334155';
      ctx.beginPath(); ctx.arc(mx - 30, T, 4, 0, Math.PI * 2); ctx.arc(mx + 30, T, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(mx - 30, T);
      if (s.closed) ctx.lineTo(mx + 30, T); else ctx.lineTo(mx + 24, T - 26);
      ctx.stroke();
      txt(ctx, s.closed ? 'K مغلقة' : 'K مفتوحة', mx, T - 34, 11, s.closed ? '#16a34a' : '#b45309');
      // المصباح (أسفل)
      if (I > 0) {
        const glow = Math.min(1, I / 0.6);
        const g = ctx.createRadialGradient(mx, B, 4, mx, B, 50);
        g.addColorStop(0, `rgba(253,224,71,${0.95 * glow})`); g.addColorStop(1, 'rgba(253,224,71,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mx, B, 50, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = I > 0 ? '#fef9c3' : '#ffffff'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(mx, B, 22, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx - 15, B - 15); ctx.lineTo(mx + 15, B + 15); ctx.moveTo(mx + 15, B - 15); ctx.lineTo(mx - 15, B + 15); ctx.stroke();
      // نقاط التيار الاصطلاحي (من + إلى −)
      if (I > 0 && App.simRunning) {
        const path = [[L, T + 30], [L, T], [R, T], [R, B], [L, B], [L, T + 70]];
        const segs = []; let total = 0;
        for (let i = 0; i < path.length - 1; i++) { const d = Math.hypot(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]); segs.push(d); total += d; }
        ctx.fillStyle = '#f59e0b';
        for (let k = 0; k < 14; k++) {
          let d = ((k / 14 + o.st.phase) % 1) * total, i = 0;
          while (i < segs.length - 1 && d > segs[i]) { d -= segs[i]; i++; }
          const f = d / segs[i], px = path[i][0] + (path[i + 1][0] - path[i][0]) * f, py = path[i][1] + (path[i + 1][1] - path[i][1]) * f;
          ctx.beginPath(); ctx.arc(px, py, 3.2, 0, Math.PI * 2); ctx.fill();
        }
      }
      txt(ctx, `I = ${fmt(I, 3)} A`, x0 + w / 2, y0 + h - 14, 12, I > 0 ? '#16a34a' : '#64748b');
    }
  };

  function arrow(ctx, x1, y1, x2, y2, color) {
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 9 * Math.cos(a - .4), y2 - 9 * Math.sin(a - .4)); ctx.lineTo(x2 - 9 * Math.cos(a + .4), y2 - 9 * Math.sin(a + .4)); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  App.makeSim = function (type) {
    const d = App.SIMS[type];
    return new SimObject({ simType: type, sim: { ...d.defaults }, width: d.w, height: d.h, fill: '#ffffff', stroke: '#cbd5e1', strokeWidth: 1.2, rx: 14, ry: 14, strokeUniform: true });
  };

  // ---------- التحكم في التشغيل ----------
  App.simRunning = false;
  let raf = null, last = 0;
  const simObjects = () => App.canvas.getObjects().filter(o => o.simType);

  App.updateSimButtons = function () {
    const has = simObjects().length > 0;
    $('#btnSimPlay').disabled = !has; $('#btnSimReset').disabled = !has; $('#btnSimSpeed').disabled = !has;
    if (!has && App.simRunning) App.stopSim();
  };
  function setPlayIcon() {
    const b = $('#btnSimPlay');
    b.innerHTML = App.simRunning ? `<svg class="ic" viewBox="0 0 24 24" fill="currentColor"><rect x="6.5" y="5" width="4" height="14" rx="1"/><rect x="13.5" y="5" width="4" height="14" rx="1"/></svg>` : icon('play');
    b.title = App.simRunning ? 'إيقاف المحاكاة مؤقتاً' : 'تشغيل المحاكاة';
    b.classList.toggle('on', App.simRunning);
  }
  function loop(ts) {
    const dt = Math.min(0.05, (ts - last) / 1000) * App.state.simSpeed;
    last = ts;
    simObjects().forEach(o => o.step(dt));
    App.canvas.requestRenderAll();
    raf = requestAnimationFrame(loop);
  }
  App.startSim = function () {
    if (App.simRunning || !simObjects().length) return;
    App.simRunning = true; last = performance.now();
    raf = requestAnimationFrame(loop); setPlayIcon();
  };
  App.stopSim = function () {
    App.simRunning = false; cancelAnimationFrame(raf); setPlayIcon();
    App.canvas && App.canvas.requestRenderAll();
  };
  App.resetSim = function () {
    simObjects().forEach(o => o.resetState());
    App.canvas.requestRenderAll();
  };
  App.simResetObject = o => o.resetState && o.resetState();
  App.toggleCircuitSwitch = function (o) {
    o.sim = { ...o.sim, closed: !o.sim.closed };
    App.canvas.requestRenderAll(); App.changed(); App.refreshProps();
  };

  App.initSim = function () {
    $('#btnSimPlay').onclick = () => App.simRunning ? App.stopSim() : App.startSim();
    $('#btnSimReset').onclick = () => App.resetSim();
    $('#btnSimSpeed').onclick = () => {
      const speeds = [0.5, 1, 2];
      App.state.simSpeed = speeds[(speeds.indexOf(App.state.simSpeed) + 1) % speeds.length];
      $('#btnSimSpeed').textContent = App.state.simSpeed + '×';
    };
  };
})();
