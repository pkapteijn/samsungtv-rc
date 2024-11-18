const upnp = require('node-upnp-utils');

class SSDPDiscover {
    constructor(win, wsw) {
        this.win = win
        this.wsw = wsw
        this.host = "Samsung.lan"
        this.name = "My Samsung TV"   
    }

    start() {
        // Set an event listener for 'added' event
        upnp.on('added', this.addDeviceHandler.bind(this));

        // Set an event listener for 'deleted' event
        upnp.on('deleted', this.deleteDeviceHandler.bind(this));

        // Start the discovery process
        upnp.startDiscovery();
    }

    addDeviceHandler(device) {
        let name = ""
        // This callback function will be called whenever a device or a service is found.
        console.log('[added] ------------------------------------');
        console.log(' * ' + device['address']);
        if (device['description']) {
            name = device['description']['device']['friendlyName']
            console.log(' * ' + name);
        }
        console.log(' * ' + device['headers']['USN']);
        if ((name.toLowerCase().includes('samsung')) &&
            (name.toLowerCase().includes('tv'))) {
                console.log('Samsung TV found!')
                this.host = device['address']
                this.name = name
                this.wsw.name = this.name
                this.wsw.host = this.host
                this.win.webContents.send('send-m2r-state', {hostname: this.host, 
                    title: this.name
                })
        }

    }

    deleteDeviceHandler(device) {
        // This callback function will be called whenever an device was deleted.
        console.log('[deleted] ------------------------------------');
        console.log(' * ' + device['address']);
        if (device['description']) {
            console.log(' * ' + device['description']['device']['friendlyName']);
        }
        console.log(' * ' + device['headers']['USN']);
    }
   
    getHost() {
        return this.host
    }

    getTVName() {
        return this.name
    }
}

module.exports = SSDPDiscover