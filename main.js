const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('node:path')
const WsWrapper = require('./wswrapper')
const SSDPDiscover = require('./ssdpdiscover')

let win

const myname = "Paul's Samsung TV RC"
const IP = "Samsung.lan"
const PORT = 8002



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
    
  win.loadFile('index.html')
  .then(() => { win.show(); })

  return win;
}

app.whenReady().then(() => {

  console.log("App ready, creating window")
  win = createWindow()

  // Websoket wrapper object, connect in 3s
  let wsw = new WsWrapper(IP, PORT, myname, win)
  setTimeout(() => {wsw.connect()}, 3000)

  // Start SSDP discovery to listen for Samsung tv and get the IP
  // The ws connection starts ogff with default hostname and retries when failed. 
  // The SSDP service sets the IP address when found.  
  const ssdp = new SSDPDiscover(win, wsw)
  ssdp.start()
  
  // Add eventlistener for send-rc-key events sent from renderer
  ipcMain.on('send-r2m-key', wsw.sendKeyHandler.bind(wsw))


  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
  })