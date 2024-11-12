const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('node:path')
const WebSocket = require('ws');
let ws
let win

const myname = "Paul's Samsung TV RC"
const IP = "Samsung.lan"
const PORT = 8002

function getUrl(ip, port, name) {
  return "wss://" + ip + ":" + port + 
      "/api/v2/channels/samsung.remote.control?name=" + 
      btoa(myname) +
      "&token=40318215"
}

function sendKeyHandler(event, key) {
  console.log("Received key from renderer: " + key)
  ws.send(JSON.stringify({
      "method": "ms.remote.control",
      "params": {
          "Cmd": "Click",
          "DataOfCmd": key,
          "Option": "false",
          "TypeOfRemote": "SendRemoteKey"
      }
    }))
}

function heartbeat() {
  console.log("ping received, updating connection status")
  // if ping received before timeout, timer is cleared to avoid connection to be terminated
  clearTimeout(this.pingTimeout);
  win.webContents.send('send-m2r-connstat', true)
  win.webContents.send('send-m2r-name', myname)

  this.pingTimeout = setTimeout(() => {
    this.terminate();
  }, 30000 + 1000);
}


const createWindow = () => {
    const win = new BrowserWindow({
      width: 1000,
      height: 800, 
      webPreferences: {
        preload: path.join(__dirname, 'preload', 'rc-preload.js')
      }
    })
  
    // const menu = Menu.buildFromTemplate([
    //   {
    //     label: app.name,
    //     submenu: [
    //       {
    //         click: () => win.webContents.send('send-m2r-name', myname),
    //         label: 'Update name'
    //       }
    //     ]
    //   }
    // ])
    // Menu.setApplicationMenu(menu)
    

    //   win.loadFile('index.html')
  win.loadFile('index.html')
  .then(() => { win.show(); });

  return win;
}

app.whenReady().then(() => {
  // Add eventlistener for send-rc-key events sent from renderer
  ipcMain.on('send-r2m-key', sendKeyHandler)


  console.log("App ready, creating window")
  win = createWindow()

  ws = new WebSocket(getUrl(IP, PORT, myname), {
    protocolVersion: 8,
    origin: 'https://localhost:9000',
    rejectUnauthorized: false
  });
  ws.on('open', heartbeat)
  ws.on('ping', heartbeat)
  ws.on('close', function clear() {
    clearTimeout(this.pingTimeout); 
    console.log("Connection to TV closed,  updating connection status");
    win.webContents.send('send-m2r-connstat', false)
  });
  
  ws.onmessage = function (event) {
    console.log(event.data);
  }
  ws.on('error', function(event) {
        console.log(event);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})