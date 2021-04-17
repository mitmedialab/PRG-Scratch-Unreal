# Server-Side Files

This folder contains the files that are used on the server. During testing, they were used on an AWS machine. There are two folders:
1. `pixelStreamingService_JSON`
2. `pixelStreamingService_non-JSON`

They both contain the same type of files:
1. `cirrus.js`
2. `player.htm`

The `cirrus.js` file will be the server file that is ran by the Pixel Streaming Service. This contains the logic that implements a websocket for Scratch to connect to. 

## cirrus.js
Inside of cirrus.js is the server code. For Scratch to be able to connect to Unreal Engine, I tapped into an existing websocket. Around line 300, `playerServer` is created as a WebSocket server. This is used to send player information to Unreal Engine from the player page. I added a couple lines in order for it to also accept incoming data from Scratch. Depending on wether you are looking at the JSON version, or the non-JSON version, the way of implementing Scratch communications varies. 

In general, all incoming messages to the WebSocket are checked to see if they come from Scratch or not. If they do, then we handle those messages accordingly. If they are not messages from Scratch, then the playerServer will continue to operate as if the Scratch code did not exist.

## player.htm
This is the player page that is loaded whenever a user connects to the server. This page opens a websocket connection to the `playerServer` created in `cirrus.js`. 

The way that a message travels from Scratch to Unreal Engine is as follows: 
1. `playerServer` is a WebSocket **server**
2. Scratch and `player.htm` connect to the `playerServer` via a WebSocket **connection**
3. Scratch sends message to `playerServer` via Websocket **connection**
4. `playerServer` forwards message to `player.htm` via the Websocket **connection** opened by `player.htm` in step 2
5. `player.htm` recives message from `playerServer` via Websocket **connection**. This messaege is then sent to Unreal Engine by running the *emmitUIInteraction()* command

Scratch -> Websocket connection to `playerServer` -> `playerServer` recieves message from Scratch -> `player.htm` recieves message from `playerServer` via WebSocket Connection -> Unreal Engine via emmitUIInteraction() command

## Placement of these two files

Navigate to this location inside of whichever Rev of Unreal Engine you are using:

> \Engine\Source\Programs\PixelStreaming\WebServers\SignallingWebServer\

Create a new folder and name it 'old_files'. Move the `cirrus.js` and the `player.htm` files **that come with the Unreal Engine source code** to the 'old_files' folder (its good to keep them just in case something goes wrong). Those work and are great, but do not come with Scratch functionality, so we will not use them.

Then we want to take our versions of `player.htm` and `cirrus.js` **from this repo** and place them in the `SignalingWebServer` folder of the Unreal Engine source code. 

## Extra prep for SignalingWebServer

There are a couple other things that have to be done for Unreal Engine to work remotely.

### Changing IP address inside of player.htm file
Apart from changing the IP adress inside of the files that are normally changed for Unreal Engine, you have to change the IP address inside of `player.htm` as well. After the `</body>` tag in `player.htm`, there will be some JavaScript inside of `<script>` tags. You should see a line in which a new WebSocket connection is created, it should read something like this:
```
let sock = new WebSocket('ws://3.16.157.53');
```
All that needs to be done here is changing the IP adress string inside of the WebSocket's creation. This is needed for changes to appear in Unreal Engine. The `emitUIInteraction()` command will not be run otherwise.

### Setting up the STUN server
https://youtu.be/9V6Iy-OSlc4?t=262
This has to be done, otherwise the remote connection will not work properly and users will not be able to control Unreal Engine from the player page.

### The whole video covers the steps that need to be followed
I just wanted to highlight the STUN server step because it is something that I was stuck on for a while.
