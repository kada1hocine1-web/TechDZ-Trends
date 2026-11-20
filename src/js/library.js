// مكتبة «العناصر العلمية»
(function () {
  const $ = App.$;
  const CATS = [
    { id: 'chem', name: 'الكيمياء', icon: 'flask' }, { id: 'mech', name: 'الميكانيكا', icon: 'gear' },
    { id: 'astro', name: 'الفلك', icon: 'planet' }, { id: 'elec', name: 'الكهرباء', icon: 'bolt' },
    { id: 'energy', name: 'الطاقة', icon: 'sun' }, { id: 'magnet', name: 'المغناطيسية', icon: 'magnet' },
    { id: 'lab', name: 'المخبر', icon: 'beaker' }, { id: 'measure', name: 'القياسات', icon: 'measure' },
    { id: 'optics', name: 'البصريات', icon: 'eye' }, { id: 'waves', name: 'الموجات', icon: 'wave' },
    { id: 'sims', name: 'تجارب ومحاكاة', icon: 'sim' }
  ];
  let items = [], cat = 'chem', levels = new Set(['CEM', 'LYC']), query = '';
  const svgCache = {};

  App.openLibrary = function (on) {
    const open = on === undefined ? $('#libPanel').classList.contains('hidden') : on;
    $('#libPanel').classList.toggle('hidden', !open);
    $('#libTab').classList.toggle('hidden', open);
  };

  function render() {
    const grid = $('#libGrid');
    const q = query.trim();
    const list = items.filter(it => (q ? (it.name.includes(q) || (it.kw || '').toLowerCase().includes(q.toLowerCase())) : it.cat === cat) && it.levels.some(l => levels.has(l)));
    $('#libCount').textContent = `${items.length} عنصر`;
    App.$$('#libCats .cat').forEach(b => b.classList.toggle('active', !q && b.dataset.cat === cat));
    if (!list.length) { grid.innerHTML = '<div class="lib-empty">لا توجد عناصر مطابقة</div>'; return; }
    grid.innerHTML = list.map(it => `
      <div class="card" draggable="true" data-id="${it.id}" title="${App.esc(it.name)}">
        <div class="thumb"><img src="assets/elements/${it.id}.svg" alt="" loading="lazy"></div>
        <div class="name">${App.esc(it.name)}</div>
        ${it.sim ? '<span class="tag sim">▶ محاكاة</span>' : ''}
      </div>`).join('');
  }

  async function getSvg(id) {
    if (!svgCache[id]) svgCache[id] = await (await fetch(`assets/elements/${id}.svg`)).text();
    return svgCache[id];
  }

  // يحمّل ملف SVG ويحوّله إلى مجموعة Fabric
  App.svgToObject = async function (id, width) {
    const text = await getSvg(id);
    const { objects, options } = await fabric.loadSVGFromString(text);
    const obj = fabric.util.groupSVGElements(objects.filter(Boolean), options);
    if (width) obj.scaleToWidth(width);
    return obj;
  };

  App.insertElement = async function (id, at) {
    const it = items.find(x => x.id === id);
    if (!it) return;
    try {
      let obj;
      if (it.sim) obj = App.makeSim(it.sim);
      else {
        obj = await App.svgToObject(id, it.w || 140);
        obj.elId = id; obj.elName = it.name;
      }
      obj.uid = App.uid();
      App.addObject(obj, at);
    } catch (e) {
      console.error(e);
      App.toast('تعذّر إدراج العنصر');
    }
  };

  App.initLibrary = async function () {
    $('#libCats').innerHTML = CATS.map(c => `<button class="cat" data-cat="${c.id}" title="${c.name}">${icon(c.icon)}<span>${c.name}</span></button>`).join('');
    $('#libCats').onclick = e => { const b = e.target.closest('.cat'); if (!b) return; cat = b.dataset.cat; query = ''; $('#libSearch').value = ''; render(); $('#libGrid').scrollTop = 0; };
    $('#libSearch').oninput = e => { query = e.target.value; render(); };
    App.$$('.lvl').forEach(b => b.onclick = () => {
      const l = b.dataset.level;
      if (levels.has(l) && levels.size > 1) levels.delete(l); else levels.add(l);
      App.$$('.lvl').forEach(x => x.classList.toggle('on', levels.has(x.dataset.level)));
      render();
    });
    $('#libTab').onclick = () => App.openLibrary(true);
    $('#libClose').onclick = () => App.openLibrary(false);

    const grid = $('#libGrid');
    grid.addEventListener('click', e => { const card = e.target.closest('.card'); if (card) App.insertElement(card.dataset.id); });
    grid.addEventListener('dragstart', e => {
      const card = e.target.closest('.card'); if (!card) return;
      e.dataTransfer.setData('application/x-sbourati', card.dataset.id);
      e.dataTransfer.effectAllowed = 'copy';
      const img = card.querySelector('img'); if (img) e.dataTransfer.setDragImage(img, img.width / 2, img.height / 2);
    });
    const board = $('#board');
    board.addEventListener('dragover', e => { if (e.dataTransfer.types.includes('application/x-sbourati') || e.dataTransfer.types.includes('Files')) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; } });
    board.addEventListener('drop', e => {
      e.preventDefault();
      const id = e.dataTransfer.getData('application/x-sbourati');
      const p = App.toScene(e.clientX, e.clientY);
      if (id) App.insertElement(id, p);
      else if (e.dataTransfer.files[0] && e.dataTransfer.files[0].type.startsWith('image/')) App.insertImageFile(e.dataTransfer.files[0], p);
    });

    try { items = await (await fetch('assets/elements/index.json')).json(); } catch (e) { console.error(e); items = []; }
    render();
  };
})();
