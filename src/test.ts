import { WebSocketServer } from 'ws';

// TODO
// Replay button??

const PORT = 8082

console.log(`[ITWI] Listening on port ${PORT}`)

const ws = new WebSocketServer({port: PORT})

ws.on("connection", (client)=>{
    console.log("[WEBSOCKET_CONNECTION] Client Connected!")

    client.send("ping")

    client.onmessage = (msg) => {
        if (msg.data == "ping") {
            client.send("pong")
        } 

        console.log(`[WEBSOCKET_MESSAGE] Recieved message "${msg.data}" from a client!`)
    }
})