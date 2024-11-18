// Exposed protected methods in the render process
const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    sendKey: (key) => ipcRenderer.send('send-r2m-key', key), 
    onUpdateState: (callback) => ipcRenderer.on('send-m2r-state', (_event, value) => callback(value)), 
});