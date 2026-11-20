// تصوير الشاشة وتسجيل الدرس فيديو
(function () {
  const $ = App.$;
  const api = window.api || null;
  let rec = null; // { recorder, chunks, streams, timer, raf, start }
  let withMic = true;

  const stamp = () => new Date().toISOString().slice(0, 16).replace('T', ' ').replace(':', '-');

  // ---------- لقطات ----------
  function boardComposite() {
    const c = App.canvas;
    const lower = c.lowerCanvasEl, upper = c.upperCanvasEl, bg = document.getElementById('bgCanvas');
    const out = document.createElement('canvas');
    out.width = lower.width; out.height = lower.height;
    const ctx = out.getContext('2d');
    ctx.drawImage(bg, 0, 0, out.width, out.height);
    ctx.drawImage(lower, 0, 0);
    ctx.drawImage(upper, 0, 0);
    return out;
  }
  async function snapBoard() {
    App.canvas.discardActiveObject(); App.canvas.renderAll();
    const cv = boardComposite();
    const bytes = App.dataUrlToBytes(cv.toDataURL('image/png'));
    if (api) {
      await api.copyImage(bytes);
      const p = await api.saveBinary(bytes, `لقطة السبورة ${stamp()}.png`, 'png', 'صورة PNG');
      App.toast(p ? 'تم حفظ اللقطة ونسخها إلى الحافظة ✓' : 'نُسخت اللقطة إلى الحافظة ✓');
    }
  }
  async function snapWindow() {
    App.closePopover();
    await new Promise(r => setTimeout(r, 150));
    const bytes = await api.captureWindow();
    await api.copyImage(bytes);
    const p = await api.saveBinary(bytes, `لقطة البرنامج ${stamp()}.png`, 'png', 'صورة PNG');
    App.toast(p ? 'تم حفظ لقطة البرنامج ونسخها ✓' : 'نُسخت لقطة البرنامج إلى الحافظة ✓');
  }

  // ---------- التسجيل ----------
  async function micStream() {
    if (!withMic) return null;
    try { return await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); }
    catch (e) { App.toast('تعذّر الوصول إلى الميكروفون — يستمر التسجيل دون صوت', 3000); return null; }
  }
  function pickMime() {
    const types = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    return types.find(t => MediaRecorder.isTypeSupported(t)) || '';
  }

  async function startRecording(kind) {
    App.closePopover();
    if (rec) return;
    const streams = [];
    let videoTrack, raf = null, systemAudio = [];
    try {
      if (kind === 'board') {
        const out = document.createElement('canvas');
        const draw = () => {
          const src = boardComposite();
          if (out.width !== src.width || out.height !== src.height) { out.width = src.width; out.height = src.height; }
          out.getContext('2d').drawImage(src, 0, 0);
          raf = requestAnimationFrame(draw);
        };
        draw();
        const cs = out.captureStream(30);
        streams.push(cs);
        videoTrack = cs.getVideoTracks()[0];
      } else {
        await api.setRecordSource(kind);
        const isWin = /Windows/.test(navigator.userAgent);
        const ds = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: isWin });
        streams.push(ds);
        videoTrack = ds.getVideoTracks()[0];
        systemAudio = ds.getAudioTracks();
      }
      const mic = await micStream();
      if (mic) streams.push(mic);
      // دمج مصادر الصوت
      let audioTracks = [];
      const sources = [...systemAudio, ...(mic ? mic.getAudioTracks() : [])];
      let actx = null;
      if (sources.length > 1) {
        actx = new AudioContext();
        const dest = actx.createMediaStreamDestination();
        sources.forEach(t => actx.createMediaStreamSource(new MediaStream([t])).connect(dest));
        audioTracks = dest.stream.getAudioTracks();
      } else audioTracks = sources;
      const stream = new MediaStream([videoTrack, ...audioTracks]);
      const recorder = new MediaRecorder(stream, { mimeType: pickMime(), videoBitsPerSecond: 5_000_000 });
      const chunks = [];
      recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      recorder.onstop = () => finish(chunks, recorder.mimeType);
      videoTrack.addEventListener('ended', () => stopRecording());
      recorder.start(1000);
      rec = { recorder, streams, raf, actx, start: Date.now(), timer: setInterval(tick, 500), kind };
      $('#recIndicator').classList.remove('hidden');
      $('#btnRecord').classList.add('recording');
      $('#recLabel').textContent = 'إيقاف';
      tick();
    } catch (e) {
      console.error(e);
      if (raf) cancelAnimationFrame(raf);
      streams.forEach(s => s.getTracks().forEach(t => t.stop()));
      App.toast('تعذّر بدء التسجيل: ' + (e.message || e), 3500);
    }
  }
  function tick() {
    if (!rec) return;
    const s = Math.floor((Date.now() - rec.start) / 1000);
    $('#recTime').textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }
  function stopRecording() {
    if (!rec) return;
    const r = rec; rec = null;
    clearInterval(r.timer);
    if (r.raf) cancelAnimationFrame(r.raf);
    if (r.recorder.state !== 'inactive') r.recorder.stop();
    r.streams.forEach(s => s.getTracks().forEach(t => t.stop()));
    if (r.actx) r.actx.close();
    $('#recIndicator').classList.add('hidden');
    $('#btnRecord').classList.remove('recording');
    $('#recLabel').textContent = 'تسجيل';
  }
  async function finish(chunks, mime) {
    const blob = new Blob(chunks, { type: mime || 'video/webm' });
    const bytes = new Uint8Array(await blob.arrayBuffer());
    if (api) {
      const p = await api.saveBinary(bytes, `تسجيل الدرس ${stamp()}.webm`, 'webm', 'فيديو WebM');
      if (p) App.toast('تم حفظ التسجيل ✓');
    }
  }

  function recordMenu(anchor) {
    if (rec) { stopRecording(); return; }
    const pop = App.popover(anchor, `<h5>تصوير الشاشة</h5>
      <button class="menu-item" data-a="snapBoard">${icon('camera')}<span>لقطة للسبورة<span class="desc">صورة PNG + نسخ إلى الحافظة</span></span></button>
      <button class="menu-item" data-a="snapWindow">${icon('screen')}<span>لقطة لنافذة البرنامج</span></button>
      <div class="menu-sep"></div><h5>تسجيل الدرس فيديو</h5>
      <button class="menu-item" data-a="board">${icon('record')}<span>تسجيل السبورة مباشرة<span class="desc">الرسم والشرح فقط، دون الأشرطة</span></span></button>
      <button class="menu-item" data-a="window">${icon('present')}<span>تسجيل نافذة البرنامج</span></button>
      <button class="menu-item" data-a="screen">${icon('screen')}<span>تسجيل الشاشة كاملة</span></button>
      <div class="toggle-row" data-mic><span>${icon('mic')}</span><span style="flex:1">تسجيل صوت الميكروفون</span><i class="switch ${withMic ? 'on' : ''}"></i></div>
      <div class="hint" style="padding:0 10px">يُحفظ الفيديو بصيغة WebM ويُفتح في المتصفح أو VLC.</div>`, { width: 300 });
    if (!pop) return;
    pop.onclick = e => {
      if (e.target.closest('[data-mic]')) { withMic = !withMic; pop.querySelector('[data-mic] .switch').classList.toggle('on', withMic); return; }
      const a = e.target.closest('[data-a]'); if (!a) return;
      const k = a.dataset.a;
      if (k === 'snapBoard') { App.closePopover(); snapBoard(); }
      else if (k === 'snapWindow') snapWindow();
      else startRecording(k);
    };
  }

  App.initRecord = function () {
    $('#btnRecord').onclick = e => recordMenu(e.currentTarget);
    $('#btnRecStop').onclick = () => stopRecording();
    App.isRecording = () => !!rec;
    App.stopRecording = stopRecording;
  };
})();
