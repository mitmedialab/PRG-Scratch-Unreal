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
Both of these files should be renamed to `cirrus.js` and `player.htm`. Then they should be placed in the `SignalingWebServer` folder of the PixelStreaming folder for the Unreal Engine source code. Create a new folder and move the `cirrus.js` and the `player.htm` files that come with the source code to your new folder (its good to keep them just in case something goes wrong). Those work and are great, but do not come with Scratch functionality, so we will not use them.

## Extra prep for SignalingWebServer

There are a couple other things that have to be done for Unreal Engine to work remotely.

### Setting up the STUN server
https://youtu.be/9V6Iy-OSlc4?t=262
This has to be done, otherwise the remote connection will not work properly and users will not be able to control Unreal Engine from the player page.

### The whole video covers the steps that need to be followed
I just wanted to highlight the STUN server step because it is something that I was stuck on for a while.
