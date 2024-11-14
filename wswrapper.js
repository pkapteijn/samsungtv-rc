const fs = require('node:fs')
const ws = require('ws')

class WsWrapper {
    constructor(host, port, name, win) {
        this.host = host || 'Samsung.lan'
        this.port = port || 8002
        this.name = name || 'Samsung TV RC'
        this.win = win
        this.token = this.readToken()
        this.url = this.getUrl()
        this.ws = undefined
        this.connected = false
        this.pingtimeout  = undefined
        this.deviceid = ""
    }

    getUrl() {
        return "wss://" + this.host + ":" + this.port +
            "/api/v2/channels/samsung.remote.control?name=" +
            btoa(this.name) +
            "&token=" +
            this.token
    }

    readToken() {
      try {
          let token = fs.readFileSync('token.txt', 'utf-8')
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
        console.log("ping received, updating connection status")
        // if ping received before timeout, timer is cleared to avoid connection to be terminated
        clearTimeout(this.pingtimeout);
        this.connected = true
        this.win.webContents.send('send-m2r-connstat', this.connected)
        this.win.webContents.send('send-m2r-name', this.name)
      
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
        this.ws.on('close', () => {
            clearTimeout(this.pingtimeout); 
            console.log("Connection to TV closed,  updating connection status");
            this.connected = false
        })
        this.win.webContents.send('send-m2r-connstat', this.connected)
        this.ws.on('message', this.messageHandler.bind(this))
        this.ws.on('error', (event) => {
            console.log(event);
          })

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
        this.token = msg.data.clients[0].attributes.token
        this.writeToken()
        this.connected = true
        this.deviceid = msg.data.id
      }
    }

    sendKeyHandler(event, key) {
      console.log("Received key from renderer: " + key)
      console.log("keyhandler. this.conected: ", this.connected)
      if (this.connected) {
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