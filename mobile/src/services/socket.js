import socketio from 'socket.io-client'

const socket = socketio('http://192.168.1.104:3333', {
    autoConnect: false,
})

function subscribeToNewDevs(subscribeFunction) {
    socket.on('new-dev', subscribeFunction) // vai ouvir o evendo 'new-dev' disparado no back - devcontroller (sendMessage(sendSocketMessageTo, 'new-dev', dev))
    // e dispara subscribeFunction
}

function connect(latitude, longitude, techs) {
    socket.io.opts.query = {
        latitude, 
        longitude, 
        techs,
    }
     
    socket.connect()
 
}

function disconnect() {
    if(socket.connected) {
        socket.disconnect()
    }
}

export { //p/ poder usar em outros lugares como no Main.js Ln 8
    connect,
    disconnect,
    subscribeToNewDevs
}