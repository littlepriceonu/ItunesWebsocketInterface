import { WebSocket, WebSocketServer } from 'ws';
import ItunesInterface from 'lil-js-it-interface';
import { Itunes } from 'lil-js-it-interface';
import { WebSocketCommunicationType, UpdateCommunicationType, PlayingStates } from './types';

// TODO
// Replay button??

const PORT = 8082

const ws = new WebSocketServer({port: PORT})
const itunes = new ItunesInterface()

var Clients: WebSocket[] = []

const DefaultSong: Itunes.Song = {
    name: "Not Playing",
    album: "Not Playing",
    genre: "None",
    artist: "Play Something",
    year: "",
    time: "0:00",
    duration: 0,
    trackCount: 0,
    trackNumber: 0
}

let lastSong: Itunes.Song = itunes.PlayerControls.GetSong()

let lastProgress: number = itunes.PlayerControls.GetPlayerPosition()

let lastVolume: number = itunes.PlayerControls.GetVolume()

let lastState = itunes.PlayerControls.IsPlaying() ? "PLAYING" : itunes.PlayerControls.IsSongReady() ? "READY_TO_PLAY" : "PAUSED"

ws.on("connection", (client)=>{
    console.log("[WEBSOCKET_CONNECTION] CLIENT CONNECTED")

    const STATE: WebSocketCommunicationType = "INITIAL_STATE"

    client.send(`${STATE}||${JSON.stringify(lastSong)}||${lastProgress}||${lastVolume}||${lastState}`)
    
    client.on("message", () => {

    })

    Clients.push(client)
})

/* const StateHandlers: {[UpdateState: string]: Function} = {
    "SONG_UPDATE": (SongData: Itunes.Song) => {
        Clients.forEach(client => {
            console.log("Sending Data...")
            client.send(`UPDATE||SONG_UPDATE||${JSON.stringify(SongData)}`)
        })
    },
    "PROGRESS_UPDATE": (Progress: number) => {
        Clients.forEach(client => {
            client.send(`UPDATE||PROGRESS_UPDATE||${Progress}`)
        })
    },
    "STATE_UPDATE": (State: PlayingStates) => {
        Clients.forEach(client => {
            client.send(`UPDATE||STATE_UPDATE||${State}`)
        })
    },
    "VOLUME_UPDATE": (Volume: number) => {
        Clients.forEach(client => {
            client.send(`UPDATE||VOLUME_UPDATE||${Volume}`)
        })
    }
} as const */

function SendStateUpdate(State: string, Data: any) {
    if (typeof Data == "object") {
        Clients.forEach(client => {
            client.send(`UPDATE||${State}||${JSON.stringify(Data)}`)
        })

        return
    }

    Clients.forEach(client => {
        client.send(`UPDATE||${State}||${Data}`)
    })

}

console.log(`[ITWI] Listening on port ${PORT}`)

function HandleInterval()  {
    const currentSong = itunes.PlayerControls.GetSong()
    const currentProgress = itunes.PlayerControls.GetPlayerPosition()
    const currentState = itunes.PlayerControls.IsPlaying() ? "PLAYING" : itunes.PlayerControls.IsSongReady() ? "READY_TO_PLAY" : "PAUSED"
    const currentVolume = itunes.PlayerControls.GetVolume()

    // TODO
    // check if song is not ready then update if so
    // check for progress update

    if (lastSong.name != currentSong.name || (lastSong.name == currentSong.name && lastSong.artist != currentSong.artist)) {
        console.log(`Song Changed! Its now: ${currentSong.name} on ${currentSong.album} by ${currentSong.artist}`)

        let dontSetCurrent = false

        if ( !currentSong.artist || !currentSong.album ) {
            dontSetCurrent = true
            
            SendStateUpdate("SONG_UPDATE", DefaultSong)

            lastSong = DefaultSong
        }

        if (!dontSetCurrent) {
            SendStateUpdate("SONG_UPDATE", currentSong)

            lastSong = currentSong
        }
    }

    if (lastProgress != currentProgress) {
        SendStateUpdate("PROGRESS_UPDATE", currentProgress)

        lastProgress = currentProgress
    }

    if (lastState != currentState) {
        SendStateUpdate("STATE_UPDATE", currentState)

        lastState = currentState
    }

    if (lastVolume != currentVolume) {
        SendStateUpdate("VOLUME_UPDATE", currentVolume)

        lastVolume = currentVolume
    }
}

setInterval(HandleInterval, 10)