import express from "express";
const app = express();

// socket.io setup
import http from "http";
const server = http.createServer(app);
import {Server} from "socket.io";
const io = new Server(server, {pingInterval: 2000, pingTimeout: 5000});
const port = 5500;

const backendPlayers = {}

io.on("connection", socket => {
    backendPlayers[socket.id] = {
        position: {
            x: Math.random() * 50,
            y: Math.random() * 50
        },
        size: {
            width: 50,
            height: 50
        },
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        sequenceNumber: 0
    }
    io.emit("updatePlayers", backendPlayers);
    socket.on("disconnect", (reason) => {
        // console.log(reason);
        delete backendPlayers[socket.id];
        io.emit("updatePlayers", backendPlayers);
    })
    socket.on("keydown", ({key, sequenceNumber}) => {
        if (!backendPlayers[socket.id]) return;
        const backendPlayer = backendPlayers[socket.id];
        backendPlayers[socket.id].sequenceNumber = sequenceNumber;
        switch (key) {
            case ("w"):
                backendPlayer.position.y -= 10;
                break;
            case ("a"):
                backendPlayer.position.x -= 10;
                break;
            case ("s"):
                backendPlayer.position.y += 10;
                break;
            case ("d"):
                backendPlayer.position.x += 10;
                break;
        }
    })
    // console.log(backendPlayers);
})
setInterval(() => {
    io.emit("updatePlayers", backendPlayers);
}, 15)
app.use(express.static("public"))

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

server.listen(port, () => {
    // console.log(`Example app listening on port ${port}`)
})