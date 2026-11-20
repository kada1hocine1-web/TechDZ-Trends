// أدوات الواجهة: القوائم المنبثقة، النوافذ، الإشعارات
window.App = window.App || {};
(function () {
  const $ = s => document.querySelector(s);
  App.$ = $;
  App.$$ = s => Array.from(document.querySelectorAll(s));
  App.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- قائمة منبثقة مرتبطة بزر ----------
  let openPop = null;
  App.closePopover = function () {
    if (openPop) { openPop.el.remove(); openPop.anchor && openPop.anchor.classList.remove('menu-open'); openPop = null; }
  };
  App.popover = function (anchor, html, opts = {}) {
    if (openPop && openPop.anchor === anchor) { App.closePopover(); return null; }
    App.closePopover();
    const el = document.createElement('div');
    el.className = 'popover';
    if (opts.width) el.style.width = opts.width + 'px';
    el.innerHTML = html;
    $('#popovers').appendChild(el);
    renderIcons(el);
    const r = anchor.getBoundingClientRect();
    const w = el.offsetWidth, h = el.offsetHeight;
    let left = opts.alignLeft ? r.left : r.right - w;
    left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
    let top = opts.above ? r.top - h - 8 : r.bottom + 8;
    if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 8);
    el.style.left = left + 'px';
    el.style.top = top + 'px';
    anchor.classList.add('menu-open');
    openPop = { el, anchor };
    return el;
  };
  document.addEventListener('pointerdown', e => {
    if (openPop && !openPop.el.contains(e.target) && !openPop.anchor.contains(e.target)) App.closePopover();
  }, true);

  // ---------- نافذة ----------
  App.modal = function ({ title, body, foot, wide, onClose }) {
    const back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML = `<div class="modal ${wide ? 'wide' : ''}" role="dialog">
      <div class="modal-head"><h3>${App.esc(title)}</h3><button class="icon-btn" data-close data-icon="close" title="إغلاق"></button></div>
      <div class="modal-body"></div>${foot ? '<div class="modal-foot"></div>' : ''}</div>`;
    const bodyEl = back.querySelector('.modal-body');
    if (typeof body === 'string') bodyEl.innerHTML = body; else if (body) bodyEl.appendChild(body);
    if (foot) back.querySelector('.modal-foot').innerHTML = foot;
    $('#modalRoot').appendChild(back);
    renderIcons(back);
    const close = () => { back.remove(); document.removeEventListener('keydown', onKey, true); onClose && onClose(); };
    const onKey = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
    document.addEventListener('keydown', onKey, true);
    back.addEventListener('pointerdown', e => { if (e.target === back) close(); });
    back.querySelector('[data-close]').onclick = close;
    return { el: back, body: bodyEl, close };
  };

  App.confirm = function (message, okLabel = 'تأكيد', danger = true) {
    return new Promise(resolve => {
      let done = false;
      const m = App.modal({
        title: 'تأكيد', body: `<p style="margin:0;font-size:14px;line-height:1.7">${App.esc(message)}</p>`,
        foot: `<button class="btn ${danger ? 'danger' : 'primary'}" data-ok>${App.esc(okLabel)}</button><button class="btn" data-cancel>إلغاء</button>`,
        onClose: () => { if (!done) resolve(false); }
      });
      m.el.querySelector('[data-ok]').onclick = () => { done = true; m.close(); resolve(true); };
      m.el.querySelector('[data-cancel]').onclick = () => m.close();
      m.el.querySelector('[data-ok]').focus();
    });
  };

  App.prompt = function (title, label, value = '') {
    return new Promise(resolve => {
      let done = false;
      const m = App.modal({
        title, body: `<label class="field">${App.esc(label)}<input type="text" value="${App.esc(value)}"></label>`,
        foot: `<button class="btn primary" data-ok>موافق</button><button class="btn" data-cancel>إلغاء</button>`,
        onClose: () => { if (!done) resolve(null); }
      });
      const inp = m.el.querySelector('input');
      const ok = () => { done = true; const v = inp.value; m.close(); resolve(v); };
      m.el.querySelector('[data-ok]').onclick = ok;
      m.el.querySelector('[data-cancel]').onclick = () => m.close();
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') ok(); });
      setTimeout(() => { inp.focus(); inp.select(); }, 0);
    });
  };

  let toastTimer = null;
  App.toast = function (msg, ms = 2200) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add('hidden'), ms);
  };

  App.dataUrlToBytes = function (dataUrl) {
    const bin = atob(dataUrl.split(',')[1]);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  };
  App.safeName = s => (s || 'درس').replace(/[\\/:*?"<>|]+/g, '_').trim() || 'درس';
})();
