const express = require('express');
const path = require('path');
const app = express();
const WebSocket = require('ws'); 

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
const port = 8765;
app.listen(port, () => {
  console.log(`listening http://localhost:${port}`);
});

const socketServer = new WebSocket.Server({port: 8882});

socketServer.on('connection', (socketClient) => {
    console.log('Connected!');
    //console.log(socketServer.clients)

    socketClient.on('close', (socketClient) => {
        console.log('closed!');
    });

    socketClient.onmessage = function(e){
        let msg = e.data;
        console.log(msg);
        let test = msg.slice(0, 7)
        
        if (test == 'scratch'){     // if its a message from scratch then send it to all clients
            socketServer.clients.forEach((client) => {
                client.send(msg);
            });
            console.log('scratch received');
        }
    };
}); 

socketServer.onmessage = function(e){
    let msg = e.data; 
    console.log(e);
}