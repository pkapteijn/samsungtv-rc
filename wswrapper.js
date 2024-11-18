const fs = require('node:fs')
const ws = require('ws')

const NRKEYS = ["KEY_1", "KEY_2", "KEY_3", "KEY_4", "KEY_5", "KEY_6", "KEY_7", "KEY_8", "KEY_9", "KEY_0"]

class WsWrapper {
    constructor(host, port, name, win) {
        this.host = host || 'Samsung.lan'
        this.port = port || 8002
        this.devicename = name || 'Samsung TV RC'
        this.name = 'Samsung TV'
        this.win = win
        this.token = this.readToken()
        this.url = this.getUrl()
        this.ws = undefined
        this.connected = false
        this.pingtimeout  = undefined
        this.deviceid = ""
        this.nrkeys = []
        this.nrkeyTimeout = 0
        this.NRKEYINTERVAL = parseInt(process.env.RC_NRKEY_INTERVAL) || 0
    }

    getUrl() {
        return "wss://" + this.host + ":" + this.port +
            "/api/v2/channels/samsung.remote.control?name=" +
            btoa(this.devicename) +
            "&token=" +
            this.token
    }

    readToken() {
      try {
          let token = fs.readFileSync('token.txt', 'utf-8')
          console.log("token read: ",  token)
          return token
      }
      catch (err) {
          console.error(`Error writing token.txt: ${err}`);
          return ""
      }
    }

    writeToken() {
      try {
        console.log("token write: ",  this.token)
          fs.writeFileSync('token.txt', this.token)
          return 
      }
      catch (err) {
          console.error(`Error writing token.txt: ${err}`);
          return 
      }
    }

    heartbeat() {
        // if ping received before timeout, timer is cleared to avoid connection to be terminated
        clearTimeout(this.pingtimeout);
        this.connected = true
        this.win.webContents.send('send-m2r-state', { 
          devicename: this.devicename, 
          hostname: this.host, 
          title: this.name, 
          connected: this.connected
        })
        this.pingtimeout = setTimeout(() => {
          this.ws.terminate();
        }, 30000 + 1000);
      }

    connect() {
        this.ws = new ws(this.url, {
            origin: 'https://localhost:9000',
            rejectUnauthorized: false
          })
        this.ws.on('open', this.heartbeat.bind(this))
        this.ws.on('ping', this.heartbeat.bind(this))
        this.ws.on('close', this.closeHandler.bind(this))
        this.ws.on('message', this.messageHandler.bind(this))
        this.ws.on('error', this.errorHandler.bind(this))
    }

    errorHandler(event) {
      console.error("Error on websocket connection: ", event);
    }

    closeHandler() {
      clearTimeout(this.pingtimeout); 
      console.log("Connection to TV closed,  updating connection status");
      this.connected = false
      this.win.webContents.send('send-m2r-state', {connected: this.connected})
      // Try reconnect in 5s
      setTimeout(() => {
        this.connect()
      }, 5000);
     }

    messageHandler(event) {

      let msg = JSON.parse(event)
      console.log("Json event: ", JSON.stringify(msg))
      // if no valid token was sent, the user has to confirm consent on TV. 
      // A new token is then sent in a ms.channel.connect event that has the
      // new token as data.token
      if (( msg.event === 'ms.channel.connect') && 
          (msg.data.hasOwnProperty('token'))) 
      {
        this.token = msg.data.token
        this.writeToken()
        this.connected = true
        this.deviceid = msg.data.id
      }
      if (msg.event === 'ms.channel.timeOut') {
        // if device access consent is not given in time, this event comes
        console.log("ms.channel.timeout event received,  closing connection")
        this.ws.terminate()
        
      }
    }

    sendKeyHandler(event, key) {
      console.log("Received key from renderer: " + key)

      if (this.connected) {

        if (NRKEYS.includes(key)) {
          // Allow for multiple number key prsses with interval between them max.  x seconds
          // when you are not quick enough wrt to allowed interval on TV 
          this.nrkeys.push(key)
          clearTimeout(this.nrkeyTimeout)
          this.nrkeyTimeout = setTimeout(() => {
            for(let i=0; i<this.nrkeys. length; i++) {
              console.log("Sending number key: ", this.nrkeys[i])
              this.ws.send(JSON.stringify({
                "method": "ms.remote.control",
                "params": {
                    "Cmd": "Click",
                    "DataOfCmd": this.nrkeys[i],
                    "Option": "false",
                    "TypeOfRemote": "SendRemoteKey"
                }
              }))
            }
            this.nrkeys = []
          }, this.NRKEYINTERVAL) // TODO: make interval a config item il, 0 for immediate sending
        }
        else {

            this.ws.send(JSON.stringify({
                "method": "ms.remote.control",
                "params": {
                    "Cmd": "Click",
                    "DataOfCmd": key,
                    "Option": "false",
                    "TypeOfRemote": "SendRemoteKey"
                }
              }))
          }
        }
        else {
          console.error("Key NOT sent to TV, disconnected")
        }
     }
     
}

module.exports = WsWrapper

// response msg after device consent confirmation
//   {
//     "data": {
//         "clients": [
//             {
//                 "attributes": {
//                     "name": "c2Ftc3VuZ3R2cmM=",
//                     "token": ""
//                 },
//                 "connectTime": 1731510156304,
//                 "deviceName": "c2Ftc3VuZ3R2cmM=",
//                 "id": "bfb0e8d0-7c17-43f7-9ec3-254e7de550a8",
//                 "isHost": false
//             }
//         ],
//         "id": "bfb0e8d0-7c17-43f7-9ec3-254e7de550a8",
//         "token": "42516532"
//     },
//     "event": "ms.channel.connect"
// }