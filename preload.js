// جسر آمن بين الواجهة والعملية الرئيسية (contextIsolation: true)
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  autosaveWrite: json => ipcRenderer.invoke('autosave:write', json),
  autosaveRead: () => ipcRenderer.invoke('autosave:read'),
  pendingFile: () => ipcRenderer.invoke('file:pending'),
  saveAs: (json, suggested) => ipcRenderer.invoke('file:saveAs', { json, suggested }),
  writeFile: (filePath, json) => ipcRenderer.invoke('file:write', { filePath, json }),
  openFile: () => ipcRenderer.invoke('file:open'),
  readFile: filePath => ipcRenderer.invoke('file:read', filePath),
  recentFiles: () => ipcRenderer.invoke('file:recent'),
  saveBinary: (data, suggested, ext, label) => ipcRenderer.invoke('file:saveBinary', { data, suggested, ext, label }),
  saveMany: files => ipcRenderer.invoke('file:saveMany', { files }),
  showItem: p => ipcRenderer.invoke('file:showItem', p),
  copyImage: data => ipcRenderer.invoke('clipboard:image', data),
  captureWindow: () => ipcRenderer.invoke('window:capture'),
  setRecordSource: kind => ipcRenderer.invoke('record:source', kind),
  fullscreen: on => ipcRenderer.invoke('window:fullscreen', on),
  setTitle: t => ipcRenderer.invoke('window:setTitle', t),
  closeReady: () => ipcRenderer.invoke('window:closeReady'),
  getPrefs: () => ipcRenderer.invoke('prefs:get'),
  setPrefs: patch => ipcRenderer.invoke('prefs:set', patch),
  on: (channel, cb) => {
    const ok = ['before-close', 'open-path', 'fullscreen'];
    if (ok.includes(channel)) ipcRenderer.on(channel, (_e, v) => cb(v));
  }
});
