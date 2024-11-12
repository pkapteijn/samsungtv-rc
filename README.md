# samsungtv-rc
A Remote Control electron app for recent Samsung TVs

# How it works

I was looking for a Remote Control PC app for my Samsung TV ( model BU8070 -  modelyear 2022). 
A quick search gave me a lot of useful info, like the samsungctl Python project (
https://pypi.org/project/samsungctl/) and the Homebridge Samsung plugin project (
https://tavicu.github.io/homebridge-samsung-tizen/). 
These excellent resources describe very well how to control your Samsung TV via Wifi. 

Unfortunately, the packages seem to be broken, at least for my TV model. So what is happening?  
Just to recap the Samsung interface: 
- the exposes two TCP ports for remote control
    - 8001: non-secure HTTP API
    - 8002: secure HTTPS API
- to send RC ky presses to the TV, it makes use of a websocket connection to URL:  
`<ws|wss>://<ip>:<8001|8002>1!/api/v2/channels/samsung.remote.control?name=<base64 encoded name of your RC>&token=<token as received from first connection>` 
- The keypress is conveyed with the following JSON payload:
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
- to get device information you ca do a HTTP GET on the following resource:  `http://<ip address>:8001/api/v2/` (or `https://<ip address>:8002/api/v2/`) and you will get an output as follows: 

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

# What goes wrong? 

So far, so good. But what goes wrong?  The libs I have seen, all seem to open a non-secure websocket connection on port 8001, but this does not seem to be supported anymore, at least it is not  on my TV. Simple fix! Switch to a secure connection on port 8002... 

And here is where the trouble starts. 

I made a simple web app to try my hypothesis, using the browser's js Websocket API. 
First failure: 
- Websocket does not like it: the server certificate used on the TV set is not considered secure: 
    1. the used SmartviewSDK certificate contains a self-signed part in its cert chain
    2. according to RFC 6066 it is not allowed to bind the server certificate to an IP address

Number 2 can be overcome easily, the TV advertizes itself to the DNS as 'Samsung.lan', or you can put a  hostname for the ip yourself in your local hosts file. 

Number 1 is a bit more tedious. I tried importing the certificate in Windows certificate store as trusted party, but no luck:  still 'Websocket failed' in the console. (Chrome uses the Windows store nowadays)
I turned to the aforementioned libraries and made the changes to set up a secure connection: also here no luck, the TLS stack complains about the self-signed certificate part. Now what? 

After some searching I found a NodeJS websocket library that has among its options `rejectUnauthorized: false`: Bingo!This works like a charm. So I decided to turn my web app into an Electron app, leveraging the NodeJS part for handling the connection and the web app part for the GUI. (never done Electron before, but basics are easy). 

# uPnP SSDP discovery

# Installation


# Running


# TODO

- clean up the code, it's dreadfull
- Add automatic hostname discovery via uPnP SSDP discvery
- beautify the GUI, you can see I am more a backend kind of guy
- package for Windows/Linux/Mac once I am hapy with final version



