// سبورتي — العملية الرئيسية لـ Electron
const { app, BrowserWindow, ipcMain, dialog, protocol, net, session, desktopCapturer, clipboard, nativeImage, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const SRC = path.join(__dirname, 'src');
const USER = () => app.getPath('userData');
const AUTOSAVE = () => path.join(USER(), 'autosave.sboard');
const PREFS = () => path.join(USER(), 'prefs.json');

let win = null;
let pendingOpen = null;          // ملف .sboard مُمرَّر عند التشغيل (نقر مزدوج)
let displaySourceKind = 'window'; // 'window' | 'screen' — للتسجيل
let allowClose = false;

// بروتوكول محلي app:// لتعمل fetch على ملفات SVG دون إنترنت
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }
]);

function fileArg(argv) {
  return argv.find(a => /\.sboard$/i.test(a) && fs.existsSync(a)) || null;
}

function readPrefs() {
  try { return JSON.parse(fs.readFileSync(PREFS(), 'utf8')); } catch { return {}; }
}
function writePrefs(p) {
  try { fs.writeFileSync(PREFS(), JSON.stringify(p, null, 1)); } catch { /* ignore */ }
}
function addRecent(file) {
  const p = readPrefs();
  p.recent = [file, ...(p.recent || []).filter(f => f !== file)].slice(0, 8);
  writePrefs(p);
}

function createWindow() {
  win = new BrowserWindow({
    width: 1600, height: 900, minWidth: 1024, minHeight: 640,
    title: 'سبورتي', backgroundColor: '#fbfdff', show: false,
    autoHideMenuBar: true,
    icon: path.join(SRC, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  });
  win.setMenu(null);
  win.loadURL('app://sbourati/index.html');
  win.once('ready-to-show', () => { win.maximize(); win.show(); });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', e => e.preventDefault());
  win.on('enter-full-screen', () => win.webContents.send('fullscreen', true));
  win.on('leave-full-screen', () => win.webContents.send('fullscreen', false));
  // قبل الإغلاق: نطلب من الواجهة إنهاء الحفظ التلقائي
  win.on('close', e => {
    if (allowClose) return;
    e.preventDefault();
    win.webContents.send('before-close');
    setTimeout(() => { allowClose = true; if (win && !win.isDestroyed()) win.close(); }, 1500);
  });
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();
app.on('second-instance', (_e, argv) => {
  const f = fileArg(argv);
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
    if (f) win.webContents.send('open-path', f);
  }
});

app.whenReady().then(() => {
  protocol.handle('app', req => {
    const u = new URL(req.url);
    let rel = decodeURIComponent(u.pathname).replace(/^\/+/, '');
    if (!rel) rel = 'index.html';
    const full = path.normalize(path.join(SRC, rel));
    if (!full.startsWith(SRC)) return new Response('forbidden', { status: 403 });
    return net.fetch(pathToFileURL(full).toString());
  });

  // الميكروفون والكاميرا مسموحان (لتسجيل الدرس فقط)
  session.defaultSession.setPermissionRequestHandler((_wc, perm, cb) => cb(['media', 'display-capture', 'fullscreen', 'clipboard-sanitized-write'].includes(perm)));

  // تسجيل الشاشة: getDisplayMedia في الواجهة يُوجَّه إلى نافذة البرنامج أو الشاشة كاملة
  session.defaultSession.setDisplayMediaRequestHandler(async (_req, cb) => {
    try {
      const types = displaySourceKind === 'screen' ? ['screen'] : ['window', 'screen'];
      const sources = await desktopCapturer.getSources({ types });
      let src = null;
      if (displaySourceKind === 'window' && win) {
        const id = win.getMediaSourceId();
        src = sources.find(s => s.id === id) || sources.find(s => s.name === win.getTitle());
      }
      if (!src) src = sources.find(s => s.id.startsWith('screen')) || sources[0];
      const opts = { video: src };
      if (process.platform === 'win32') opts.audio = 'loopback';
      cb(opts);
    } catch (err) { cb({}); }
  });

  pendingOpen = fileArg(process.argv);
  createWindow();
});

app.on('window-all-closed', () => app.quit());

// ---------------- IPC ----------------
const lessonFilters = [{ name: 'درس سبورتي', extensions: ['sboard'] }];

ipcMain.handle('autosave:write', async (_e, json) => {
  const tmp = AUTOSAVE() + '.tmp';
  await fs.promises.writeFile(tmp, json, 'utf8');
  await fs.promises.rename(tmp, AUTOSAVE());
  return true;
});
ipcMain.handle('autosave:read', async () => {
  try { return await fs.promises.readFile(AUTOSAVE(), 'utf8'); } catch { return null; }
});

ipcMain.handle('file:pending', () => { const f = pendingOpen; pendingOpen = null; return f; });

ipcMain.handle('file:saveAs', async (_e, { json, suggested }) => {
  const r = await dialog.showSaveDialog(win, { title: 'حفظ الدرس', defaultPath: (suggested || 'درس') + '.sboard', filters: lessonFilters });
  if (r.canceled || !r.filePath) return null;
  await fs.promises.writeFile(r.filePath, json, 'utf8');
  addRecent(r.filePath);
  return r.filePath;
});
ipcMain.handle('file:write', async (_e, { filePath, json }) => {
  await fs.promises.writeFile(filePath, json, 'utf8');
  return filePath;
});
ipcMain.handle('file:open', async () => {
  const r = await dialog.showOpenDialog(win, { title: 'فتح درس', properties: ['openFile'], filters: lessonFilters });
  if (r.canceled || !r.filePaths[0]) return null;
  const filePath = r.filePaths[0];
  addRecent(filePath);
  return { filePath, json: await fs.promises.readFile(filePath, 'utf8') };
});
ipcMain.handle('file:read', async (_e, filePath) => {
  addRecent(filePath);
  return { filePath, json: await fs.promises.readFile(filePath, 'utf8') };
});
ipcMain.handle('file:recent', () => (readPrefs().recent || []).filter(f => fs.existsSync(f)));

// حفظ ملف ثنائي (PNG / PDF / WebM)
ipcMain.handle('file:saveBinary', async (_e, { data, suggested, ext, label }) => {
  const r = await dialog.showSaveDialog(win, { defaultPath: suggested, filters: [{ name: label || ext.toUpperCase(), extensions: [ext] }] });
  if (r.canceled || !r.filePath) return null;
  await fs.promises.writeFile(r.filePath, Buffer.from(data));
  return r.filePath;
});
// حفظ عدة صور PNG في مجلد (تصدير الدرس كاملاً)
ipcMain.handle('file:saveMany', async (_e, { files }) => {
  const r = await dialog.showOpenDialog(win, { title: 'اختر مجلد التصدير', properties: ['openDirectory', 'createDirectory'] });
  if (r.canceled || !r.filePaths[0]) return null;
  for (const f of files) await fs.promises.writeFile(path.join(r.filePaths[0], f.name), Buffer.from(f.data));
  return r.filePaths[0];
});
ipcMain.handle('file:showItem', (_e, p) => shell.showItemInFolder(p));

ipcMain.handle('clipboard:image', (_e, data) => {
  clipboard.writeImage(nativeImage.createFromBuffer(Buffer.from(data)));
  return true;
});
ipcMain.handle('window:capture', async () => {
  const img = await win.webContents.capturePage();
  return img.toPNG();
});
ipcMain.handle('record:source', (_e, kind) => { displaySourceKind = kind === 'screen' ? 'screen' : 'window'; return true; });

ipcMain.handle('window:fullscreen', (_e, on) => { win.setFullScreen(on === undefined ? !win.isFullScreen() : !!on); return win.isFullScreen(); });
ipcMain.handle('window:setTitle', (_e, t) => { win.setTitle(t ? `${t} — سبورتي` : 'سبورتي'); });
ipcMain.handle('window:closeReady', () => { allowClose = true; if (win && !win.isDestroyed()) win.close(); });
ipcMain.handle('prefs:get', () => readPrefs());
ipcMain.handle('prefs:set', (_e, patch) => { writePrefs({ ...readPrefs(), ...patch }); return true; });
