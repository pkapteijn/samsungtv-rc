const upnp = require('node-upnp-utils');

class SSDPDiscover {
    constructor(win) {
        this.win = win    
    }

    start() {
        // Set an event listener for 'added' event
        upnp.on('added', this.addDeviceHandler.bind(this));

        // Set an event listener for 'deleted' event
        upnp.on('deleted', this.deleteDeviceHandler. bind(this));

        // Start the discovery process
        upnp.startDiscovery();
    }

    addDeviceHandler(device) {
        // This callback function will be called whenever a device or a service is found.
        console.log('[added] ------------------------------------');
        console.log(' * ' + device['address']);
        if (device['description']) {
            console.log(' * ' + device['description']['device']['friendlyName']);
        }
        console.log(' * ' + device['headers']['USN']);
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
    
}

module.exports = SSDPDiscover