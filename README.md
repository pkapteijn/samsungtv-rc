# Index
 - [samsungtv-rc](#samsungtv-rc)
 - [How it works](#how-it-works)
 - [What goes wrong? ](#what-goes-wrong)
 - [uPnP SSDP discovery](#upnp-ssdp-discovery)
 - [Installation](#installation)
 - [Running](#running)
 - [TODO](#todo)

# samsungtv-rc
[Index](#index)
 
A Remote Control electron app for recent Samsung TVs

# How it works
[Index](#index)
 

I was looking for a Remote Control PC app for my Samsung TV ( model BU8070 -  modelyear 2022). 
A quick search gave me a lot of useful info, like the samsungctl Python project (
https://pypi.org/project/samsungctl/) and the Homebridge Samsung plugin project (
https://tavicu.github.io/homebridge-samsung-tizen/). 
These excellent resources describe very well how to control your Samsung TV via Wifi. 

Unfortunately, the packages seem to be broken, at least for my TV model. So what is happening?

## Remote control

Just to recap the Samsung interface: 
- the TV exposes two TCP ports for remote control
    - 8001: non-secure HTTP API
    - 8002: secure HTTPS API
- to send RC ky presses to the TV, it makes use of a websocket connection to URL:  
`<ws|wss>://<ip>:<8001|8002>1!/api/v2/channels/samsung.remote.control?name=<base64 encoded name of your RC>&token=<token as received from first connection>` 
- The keypress is conveyed to your TV set with the following JSON payload:
````
{
      "method": "ms.remote.control",
      "params": {
          "Cmd": "Click",
          "DataOfCmd": key,
          "Option": "false",
          "TypeOfRemote": "SendRemoteKey"
      }
} 
````
- the token query paraemeter in th connection URL can be left with an empty value for the first connection. You will be asked with a dialogue popup on the TV screen to consent the access for the  device name you entered in the URL. If confirmed, you receive a response on your websocket connection that contains the token value. Use this value in successive connection setups to avoid the consent popup. (you will then find your device in the trusted device list under the device configuration menu on your TV )
- to get device information you can do a HTTP GET on the following resource:  `http://<ip address>:8001/api/v2/` (or `https://<ip address>:8002/api/v2/`) and you will get an output as follows: 

````
{
  "device": {
    "EdgeBlendingSupport": "false",
    "EdgeBlendingSupportGroup": "0",
    "FrameTVSupport": "false",
    "GamePadSupport": "true",
    "ImeSyncedSupport": "true",
    "Language": "it_IT",
    "OS": "Tizen",
    "PowerState": "on",
    "TokenAuthSupport": "true",
    "VoiceSupport": "true",
    "WallScreenRatio": "-1",
    "WallService": "false",
    "countryCode": "IT",
    "description": "Samsung DTV RCR",
    "developerIP": "0.0.0.0",
    "developerMode": "0",
    "duid": "uuid:4815273f-7307-420d-a185-b19f2f3e5b13",
    "firmwareVersion": "Unknown",
    "id": "uuid:4815273f-7307-420d-a185-b19f2f3e5b13",
    "ip": "192.168.1.158",
    "model": "22_KANTSU2E_UB2",
    "modelName": "UE43BU8070UXZT",
    "name": "Samsung BU8070 43 TV",
    "networkType": "wireless",
    "resolution": "3840x2160",
    "smartHubAgreement": "true",
    "ssid": "a4:91:b1:b7:35:39",
    "type": "Samsung SmartTV",
    "udn": "uuid:4815273f-7307-420d-a185-b19f2f3e5b13",
    "wifiMac": "E0:9D:13:52:1E:38"
  },
  "id": "uuid:4815273f-7307-420d-a185-b19f2f3e5b13",
  "isSupport": "{\"DMP_DRM_PLAYREADY\":\"false\",\"DMP_DRM_WIDEVINE\":\"false\",\"DMP_available\":\"true\",\"EDEN_available\":\"true\",\"FrameTVSupport\":\"false\",\"ImeSyncedSupport\":\"true\",\"TokenAuthSupport\":\"true\",\"remote_available\":\"true\",\"remote_fourDirections\":\"true\",\"remote_touchPad\":\"true\",\"remote_voiceControl\":\"true\"}\n",
  "name": "Samsung BU8070 43 TV",
  "remote": "1.0",
  "type": "Samsung SmartTV",
  "uri": "http://192.168.1.158:8001/api/v2/",
  "version": "2.0.25"
}
````

## Power on

If your TV is in standby, there is no websocket connection to convey a power on command. For this, Samsung uses the Wake-On-Lan feature with the MAC address of the TV set. You can find this address from the aforementioned device information API. 

> **Errata Corrige**: Apparently the newer models keep the websocket connection open. This allows to simply send the `KEY_POWER` key. 

# What goes wrong? 
[Index](#index)
 

So far, so good. But what goes wrong?  The libs I have seen, all seem to open a non-secure websocket connection on port 8001, but this does not seem to be supported anymore, at least it is not  on my TV. Simple fix! Switch to a secure connection on port 8002... 

And here is where the trouble starts. 

I first tried the secure websocket connection in Postman, and it worked perfectly. 
Knowing Postman doe not care too much about security, 
I made a simple web app to try my hypothesis, using the browser's js Websocket API. 
First failure: 
- Chrome does not like it: the server certificate used on the TV set is not considered secure: 
    1. the used SmartviewSDK certificate contains a self-signed part in its cert chain
    2. according to RFC 6066 it is not allowed to bind the server certificate to an IP address

Number 2 can be overcome easily, the TV advertizes itself to the DNS as 'Samsung.lan', or you can put a  hostname for the ip yourself in your local hosts file. 

Number 1 is a bit more tedious. I tried importing the certificate in Windows certificate store as trusted party, but no luck:  still 'Websocket failed' in the console. (Chrome uses the Windows store nowadays)
I turned to the aforementioned libraries and made the changes to set up a secure connection: also here no luck, the TLS stack complains about the self-signed certificate part. Now what? 

After some searching I found the NodeJS websocket library 'ws' that has among its connection options `rejectUnauthorized: false`: Bingo! This works like a charm. So I decided to turn my web app into an Electron app, leveraging the NodeJS part for handling the connection and the web app part for the GUI. (never done Electron before, but basics are easy). 

# uPnP SSDP discovery
[Index](#index)
 
 How to get the ip address for your TV?  Samsung supports uPnP SSDP discovery.  This UDP protocol exists of two LAN broadcast messages:
 - A Discovery broadcast to all devices on the LAN
 - a Notify response broadcast from all uPnP devices. This response contains the host ip, short description, and a URL to the uPnP supported services (in XML, on port 9197/DMR)
From the Notify response you can take ip address (and evdentually do a reverse DNS lookup for the hostname).

This how the Notify looks like: 
````
    '$': 'NOTIFY * HTTP/1.1',
    HOST: '239.255.255.250:1900',
    'CACHE-CONTROL': 'max-age=1800',
    DATE: 'gio, 14 nov 2024 15:46:42 GMT',
    LOCATION: 'http://192.168.1.158:9197/dmr',
    NT: 'upnp:rootdevice',
    NTS: 'ssdp:alive',
    SERVER: 'SHP, UPnP/1.0, Samsung UPnP SDK/1.0',
    USN: 'uuid:bd50ada8-da36-49b2-9363-7fbe8a747b1d::upnp:rootdevice'
````

A quick Wireshark trace showed however that Samsung does not respond to the Discovery request. Fortunately, they broadcast the Notify message when you power on the TV ('alive' Notify), and send a 'byebye' Notify when you power off. The Notify message is also broadcast at regular intervals (every few minutes). This means that for automatic configuration of the ip address, you will have to start the app before you power on the TV the first time. 

> **NOTE for Windows and WSL:** 
> - Windows already runs its own SSDP Discovery service. This service 'drains' all the Notify messages and herefore you will never see the message in your own discovery service. To make it work on Windows, stop the SSDP Discovery from the Service manager (service.msc)
> - WSL does not receive UDP messages from the Windows host, so SSDP won't work on WSL.  Might be a wsl kernel or some fancy routing stup issue, but I might look into that later ;-)

# Installation
[Index](#index)

## Prerequisites

I used the current LTS version on NodeJS, which at the moment of writing is v22. 
 
## Install npm libraries

Install the following npm pakages: 
````
npm install --save-dev electron
npm install --save-dev path
npm install --save-dev ws
npm install --save-dev fs
npm install --save-dev xml2js
npm install --save-dev node-upnp-utils
````

# Running
[Index](#index)
In development mode, just run: 
````
npm start
````
> **NOTE for WSL:** 
> - Electron is known to have some issues with WSL. You are likely to see some dbus errors. Generally, it works though, although it happened to me in a few occassions that the window froze ( and no way of killing it... ).  Be aware!

# TODO
[Index](#index)
 

- Add automatic hostname discovery via uPnP SSDP discvery
- beautify the GUI, you can see I am more a backend kind of guy
- package executables for Windows/Linux/Mac once it is in acceptable state



