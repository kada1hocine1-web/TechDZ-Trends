// خلفيات السبورة الثمانية + حدود «ورقتي»
(function () {
  const MM = 96 / 25.4; // بكسل لكل مليمتر

  App.BACKGROUNDS = {
    grid:    { name: 'شبكة مربعات كلاسيكية', tag: 'كلاسيك', desc: 'شبكة مربعات رمادية قياسية للسبورة البيضاء', short: 'شبكة', color: '#f8fbfd', dark: false,
               lines: [{ s: 20, c: '#edf2f8', w: 1 }, { s: 100, c: '#e2eaf3', w: 1 }] },
    white:   { name: 'لوح أبيض ناصع', tag: 'أبيض نقي', desc: 'سبورة بيضاء صافية فارغة', short: 'أبيض', color: '#ffffff', dark: false, lines: [] },
    green:   { name: 'السبورة الخضراء المدرسية', tag: 'مدرسي كلاسيكي', desc: 'سبورة خضراء ناعمة بدون خطوط', short: 'خضراء', color: '#1f4b3b', dark: true, lines: [] },
    black:   { name: 'السبورة السوداء الداكنة', tag: 'ليلي أنيق', desc: 'لوح أسود داكن بدون خطوط', short: 'سوداء', color: '#16191f', dark: true, lines: [] },
    mm:      { name: 'الورق الميليمتري الهندسي', tag: 'هندسي علمي', desc: 'شبكة دقيقة (1mm, 5mm, 10mm) للرسم البياني والفيزياء', short: 'ميليمتري', color: '#fffdf9', dark: false,
               lines: [{ s: MM, c: '#f8e3d3', w: .6 }, { s: 5 * MM, c: '#f1c6a5', w: .9 }, { s: 10 * MM, c: '#e79a66', w: 1.2 }] },
    seyes:   { name: 'تسطير الكراس المدرسي (Seyès)', tag: 'كراس جزائري', desc: 'تسطير الدفتر بخطوط أفقية وعمودية منظمة', short: 'كراس', color: '#ffffff', dark: false, seyes: true },
    squares: { name: 'ورقة رسم مربعات', tag: 'مربعات', desc: 'ورقة رسم هندسية خفيفة', short: 'مربعات', color: '#ffffff', dark: false,
               lines: [{ s: 25, c: '#dde6f0', w: 1 }] },
    dots:    { name: 'شبكة نقاط تنقيط', tag: 'نقاط', desc: 'تنقيط خفيف متناسق', short: 'نقاط', color: '#fbfcfe', dark: false, dots: 24 }
  };

  App.PAPER_SIZES = { A4: [794, 1123], A5: [559, 794], A3: [1123, 1587], '16:9': [1280, 720] };

  App.paperRect = function () {
    const p = App.state.paper;
    let [w, h] = App.PAPER_SIZES[p.size] || App.PAPER_SIZES.A4;
    if (p.size !== '16:9' && p.orient === 'landscape') [w, h] = [h, w];
    if (p.size === '16:9' && p.orient === 'portrait') [w, h] = [h, w];
    return { left: 0, top: 0, width: w, height: h };
  };

  // يرسم نمط الخلفية للمنطقة (sx, sy, sw, sh) من فضاء السبورة على ctx بمقياس z مع إزاحة (ox, oy)
  function drawPattern(ctx, bg, z, ox, oy, W, H) {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, W, H);
    const sx0 = -ox / z, sy0 = -oy / z, sx1 = (W - ox) / z, sy1 = (H - oy) / z;
    const lines = (s, color, w, vertical = true, horizontal = true) => {
      if (s * z < 4) return;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = w;
      if (vertical) for (let x = Math.floor(sx0 / s) * s; x <= sx1; x += s) { const px = Math.round(x * z + ox) + .5; ctx.moveTo(px, 0); ctx.lineTo(px, H); }
      if (horizontal) for (let y = Math.floor(sy0 / s) * s; y <= sy1; y += s) { const py = Math.round(y * z + oy) + .5; ctx.moveTo(0, py); ctx.lineTo(W, py); }
      ctx.stroke();
    };
    if (bg.lines) bg.lines.forEach(l => lines(l.s, l.c, l.w));
    if (bg.seyes) {
      lines(2 * MM, '#d6e2f5', .7, false, true);
      lines(8 * MM, '#9db9e6', 1.1, false, true);
      lines(8 * MM, '#d6e2f5', .7, true, false);
      // خط الهامش الأحمر
      const mx = Math.round(-30 * MM * z + ox) + .5;
      if (mx >= 0 && mx <= W) { ctx.beginPath(); ctx.strokeStyle = '#e8828a'; ctx.lineWidth = 1.4; ctx.moveTo(mx, 0); ctx.lineTo(mx, H); ctx.stroke(); }
    }
    if (bg.dots) {
      const s = bg.dots;
      if (s * z >= 6) {
        ctx.fillStyle = '#c3cfdc';
        const r = Math.max(.8, 1.3 * Math.min(z, 1.6));
        for (let x = Math.floor(sx0 / s) * s; x <= sx1; x += s)
          for (let y = Math.floor(sy0 / s) * s; y <= sy1; y += s) {
            ctx.beginPath(); ctx.arc(x * z + ox, y * z + oy, r, 0, Math.PI * 2); ctx.fill();
          }
      }
    }
  }

  // رسم خلفية العرض الحالي على bgCanvas
  App.renderBackground = function () {
    const cv = document.getElementById('bgCanvas');
    const canvas = App.canvas;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.getWidth(), H = canvas.getHeight();
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
    }
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const vt = canvas.viewportTransform;
    const z = vt[0];
    const bg = App.BACKGROUNDS[App.state.bg] || App.BACKGROUNDS.grid;
    drawPattern(ctx, bg, z, vt[4], vt[5], W, H);

    if (App.state.paper.on) {
      const p = App.paperRect();
      const x = p.left * z + vt[4], y = p.top * z + vt[5], w = p.width * z, h = p.height * z;
      // تظليل خارج الورقة
      ctx.save();
      ctx.fillStyle = bg.dark ? 'rgba(0,0,0,.35)' : 'rgba(100,116,139,.14)';
      ctx.beginPath();
      ctx.rect(0, 0, W, H);
      ctx.rect(x + w, y, -w, h);
      ctx.fill('evenodd');
      ctx.restore();
      ctx.strokeStyle = '#0ea5e9'; ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, w, h);
      if (App.state.paper.margins) {
        const m = 10 * MM * z;
        ctx.setLineDash([6, 5]); ctx.strokeStyle = 'rgba(14,165,233,.6)'; ctx.lineWidth = 1;
        ctx.strokeRect(x + m, y + m, w - 2 * m, h - 2 * m);
        ctx.setLineDash([]);
      }
      ctx.fillStyle = '#0284c7';
      ctx.font = '700 12px Tajawal';
      ctx.textAlign = 'right';
      const label = `📄 ${App.state.paper.size} · ${App.state.paper.orient === 'landscape' ? 'أفقي' : 'عمودي'}`;
      ctx.fillText(label, x + w, y - 8);
    }
  };

  // رسم الخلفية لمنطقة من السبورة بمقياس معيّن (للتصدير)
  App.drawBackgroundRegion = function (ctx, rect, scale, W, H) {
    const bg = App.BACKGROUNDS[App.state.bg] || App.BACKGROUNDS.grid;
    drawPattern(ctx, bg, scale, -rect.left * scale, -rect.top * scale, W, H);
  };

  App.isDarkBg = () => (App.BACKGROUNDS[App.state.bg] || {}).dark;
})();
