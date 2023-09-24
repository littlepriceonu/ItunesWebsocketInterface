"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const lil_js_it_interface_1 = require("lil-js-it-interface");
const PORT = 8082;
const ws = new ws_1.WebSocketServer({ port: PORT });
const itunes = new lil_js_it_interface_1.default();
var Clients = [];
const DefaultSong = {
    name: "Not Playing",
    album: "Not Playing",
    genre: "None",
    artist: "Play Something",
    year: "",
    time: "0:00",
    duration: 0,
    trackCount: 0,
    trackNumber: 0
};
let lastSong = itunes.PlayerControls.GetSong();
let lastProgress = itunes.PlayerControls.GetPlayerPosition();
let lastVolume = itunes.PlayerControls.GetVolume();
let lastState = itunes.PlayerControls.IsPlaying() ? "PLAYING" : itunes.PlayerControls.IsSongReady() ? "READY_TO_PLAY" : "PAUSED";
ws.on("connection", (client) => {
    console.log("[WEBSOCKET_CONNECTION] CLIENT CONNECTED");
    const STATE = "INITIAL_STATE";
    client.send(`${STATE}||${JSON.stringify(lastSong)}||${lastProgress}||${lastVolume}||${lastState}`);
    client.on("message", () => {
    });
    Clients.push(client);
});
function SendStateUpdate(State, Data) {
    if (typeof Data == "object") {
        Clients.forEach(client => {
            client.send(`UPDATE||${State}||${JSON.stringify(Data)}`);
        });
        return;
    }
    Clients.forEach(client => {
        client.send(`UPDATE||${State}||${Data}`);
    });
}
console.log(`[ITWI] Listening on port ${PORT}`);
function HandleInterval() {
    const currentSong = itunes.PlayerControls.GetSong();
    const currentProgress = itunes.PlayerControls.GetPlayerPosition();
    const currentState = itunes.PlayerControls.IsPlaying() ? "PLAYING" : itunes.PlayerControls.IsSongReady() ? "READY_TO_PLAY" : "PAUSED";
    const currentVolume = itunes.PlayerControls.GetVolume();
    if (lastSong.name != currentSong.name || (lastSong.name == currentSong.name && lastSong.artist != currentSong.artist)) {
        console.log(`Song Changed! Its now: ${currentSong.name} on ${currentSong.album} by ${currentSong.artist}`);
        let dontSetCurrent = false;
        if (!currentSong.artist || !currentSong.album) {
            dontSetCurrent = true;
            SendStateUpdate("SONG_UPDATE", DefaultSong);
            lastSong = DefaultSong;
        }
        if (!dontSetCurrent) {
            SendStateUpdate("SONG_UPDATE", currentSong);
            lastSong = currentSong;
        }
    }
    if (lastProgress != currentProgress) {
        SendStateUpdate("PROGRESS_UPDATE", currentProgress);
        lastProgress = currentProgress;
    }
    if (lastState != currentState) {
        SendStateUpdate("STATE_UPDATE", currentState);
        lastState = currentState;
    }
    if (lastVolume != currentVolume) {
        SendStateUpdate("VOLUME_UPDATE", currentVolume);
        lastVolume = currentVolume;
    }
}
setInterval(HandleInterval, 10);
//# sourceMappingURL=index.js.map