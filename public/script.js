const canvas = document.querySelector("canvas");
const dpr = window.devicePixelRatio || 1;
canvas.width = innerWidth * dpr;
canvas.height = innerHeight * dpr;
let c = canvas.getContext("2d");
const socket = io();
class Player {
    constructor({position, size, color}) {
        this.position = position;
        this.size = {
            width: size.width * dpr,
            height: size.height * dpr
        }
        this.color = color;
        //Associated with playerInputs
    }
    draw() {
        c.fillStyle = this.color;
        c.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
    }
    update() {
        this.draw();
        this.x += this.dx;
        this.y += this.dy;
    }
}
const frontendPlayers = {};
socket.on("updatePlayers", (backendPlayers) => {
    for (const id in backendPlayers) {
      const backendPlayer = backendPlayers[id];
  
      if (!frontendPlayers[id]) {
        frontendPlayers[id] = new Player({
            position: {
                x: backendPlayer.position.x,
                y: backendPlayer.position.y
            },
            size: {
                width: backendPlayer.size.width,
                height: backendPlayer.size.height
            },
            color: backendPlayer.color
        })
      } else {
        frontendPlayers[id].target = {
            x: backendPlayer.position.x,
            y: backendPlayer.position.y
        }
        if (id === socket.id) {
            const lastBackendInputIndex = playerInputs.findIndex(input => {
                return backendPlayer.sequenceNumber === input.sequenceNumber;
            })
            if (lastBackendInputIndex > -1) {
                playerInputs.splice(0, lastBackendInputIndex + 1);
            }
            playerInputs.forEach(input => {
                frontendPlayers[id].target.x += input.velocity.x;
                frontendPlayers[id].target.y += input.velocity.y;
            })
        }
        // else {
        //     // for all other players
        //     gsap.to(frontendPlayers[id].position, {
        //         x: backendPlayer.position.x,
        //         y: backendPlayer.position.y,
        //         duration: 0.015,
        //         ease: "linear"
        //     })
        // }
      }
    }
    for (const id in frontendPlayers) {
      if (!backendPlayers[id]) {
        delete frontendPlayers[id];
      }
    }
})
function run() {
    requestAnimationFrame(run);
    c.clearRect(0, 0, canvas.width, canvas.height);
    for (const id in frontendPlayers) {
        const frontendPlayer = frontendPlayers[id];
        if (frontendPlayer.target) {
            frontendPlayer.position.x += (frontendPlayers[id].target.x - frontendPlayers[id].position.x) * 0.5;
            frontendPlayer.position.y += (frontendPlayers[id].target.y - frontendPlayers[id].position.y) * 0.5;
        }
        frontendPlayer.update();
    }
}
run();
const keys = {
    w: {pressed: false},
    a: {pressed: false},
    s: {pressed: false},
    d: {pressed: false}
}
const playerInputs = [];
let sequenceNumber = 0;
setInterval(() => {
    if (keys.w.pressed) {
        sequenceNumber ++;
        playerInputs.push({
            sequenceNumber,
            velocity: {
                x: 0,
                y: 0
            }
        })

        // frontendPlayers[socket.id].position.y -= 10;
        socket.emit("keydown", {key: "w", sequenceNumber});
    }
    if (keys.s.pressed) {
        frontendPlayers[socket.id].sequenceNumber ++;
        playerInputs.push({
            sequenceNumber,
            velocity: {
                x: 0,
                y: 0
            }
        })

        // frontendPlayers[socket.id].position.y += 10;
        socket.emit("keydown", {key: "s", sequenceNumber});
    }
    if (keys.a.pressed) {
        frontendPlayers[socket.id].sequenceNumber ++;
        playerInputs.push({
            sequenceNumber,
            velocity: {
                x: 0,
                y: 0
            }
        })

        // frontendPlayers[socket.id].position.x -= 10;
        socket.emit("keydown", {key: "a", sequenceNumber});
    }
    if (keys.d.pressed) {
        frontendPlayers[socket.id].sequenceNumber ++;
        playerInputs.push({
            sequenceNumber,
            velocity: {
                x: 0,
                y: 0
            }
        })

        // frontendPlayers[socket.id].position.x += 10;
        socket.emit("keydown", {key: "d", sequenceNumber});
    }
}, 15)
window.addEventListener("keydown", ev => {
    if (!frontendPlayers[socket.id]) return;
    switch (ev.key) {
        case ("w"):
            keys.w.pressed = true;
            break;
        case ("a"):
            keys.a.pressed = true;
            break;
        case ("s"):
            keys.s.pressed = true;
            break;
        case ("d"):
            keys.d.pressed = true;
            break;
    }
})
window.addEventListener("keyup", ev => {
    if (!frontendPlayers[socket.id]) return;
    switch (ev.key) {
        case ("w"):
            keys.w.pressed = false;
            break;
        case ("a"):
            keys.a.pressed = false;
            break;
        case ("s"):
            keys.s.pressed = false;
            break;
        case ("d"):
            keys.d.pressed = false;
            break;
    }
})