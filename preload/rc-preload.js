
// Exposed protected methods in the render process
const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    sendKey: (key) => ipcRenderer.send('send-r2m-key', key), 
    onUpdateName: (callback) => ipcRenderer.on('send-m2r-name', (_event, value) => callback(value)), 
    onUpdateConnStatus: (callback) => ipcRenderer.on('send-m2r-connstat', (_event, value) => callback(value)), 
});