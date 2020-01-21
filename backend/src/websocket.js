const socketio = require('socket.io')
const parseStringAsArray = require('./utils/parseStringAsArray')
const calculateDistance = require('./utils/calculateDistance')

let io;
const connections = []; // poderia salvar no banco mas aqui está sendo salvo nessa variável

exports.setupWebSocket = (server) => {    
    io = socketio(server)
    
    io.on('connection', socket => {
        const { latitude, longitude, techs } = socket.handshake.query;

        connections.push({
            id: socket.id,
            coordinates: {
                latitude: Number(latitude),                
                longitude: Number(longitude),                
            },
            techs: parseStringAsArray(techs),
        })
    })
}

exports.findConnections = (coordinates, techs) => {
    return connections.filter(connection => {
        return calculateDistance(coordinates, connection.coordinates) < 10
         && connection.techs.some(item => techs.includes(item))// pega cada 1 das tecnologias digitadas e ve se pelo menos 1 delas tem no dev cadastrado
    })
}

exports.sendMessage = (to, message,  data) => {
    to.forEach(connection => {
        io.to(connection.id).emit(message,data) //id do setupWebSocket
    })
}