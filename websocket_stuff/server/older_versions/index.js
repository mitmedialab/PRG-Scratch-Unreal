// server.js
// CREATES NEW WEBSOCKET SERVER ON PORT 8080  

const WebSocket = require('ws')
 
const wss = new WebSocket.Server({ port: 8080 })
 
wss.on('connection', ws => {
  console.log("Client Connected");
  ws.on('message', message => {
    console.log(`Received message => ${message}`)
  })
  ws.send('Hello! Message From Server!!')
})