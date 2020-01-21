const axios = require('axios')
const Dev = require('../models/Dev')
const parseStringAsArray = require('../utils/parseStringAsArray')
const { findConnections } = require('../websocket')
const { sendMessage } = require('../websocket')

module.exports = {
    async index(request, response) {
        const devs = await Dev.find()
            // como é p/ trazer tudo, fica assim, mas poderia passar parâmetros no find()
        return response.json(devs)
    },

    async store(request, response) {
        const { github_username, techs, latitude, longitude } = request.body

        let dev = await Dev.findOne({ github_username })

        if(!dev){
            const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`)
    
            const { name = login, avatar_url, bio } = apiResponse.data;
            //aqui pega esses campos que vem do apiResponse.
            // o nome ñ é obrigatório no git, então com o [name = login] se ñ tem nome, pega o login
            
            const techsArray = parseStringAsArray(techs)
        
            const location = {
                type: 'Point',
                coordinates: [longitude, latitude],
            }
        
            dev = await Dev.create({
                github_username,
                name,
                avatar_url,
                bio,
                techs: techsArray,
                location,
            })

            // filtrar as conexões q estão há no máximo 10km de distância e q o dev tenha ao menos 1 das tecnologias filtradas
            const sendSocketMessageTo = findConnections(
                { latitude, longitude },
                techsArray,
            )
            
            sendMessage(sendSocketMessageTo, 'new-dev', dev)
        } 

        return response.json(dev);
    },

    /* async update(request, response) {

    }

    async destroy(request, response) {

    } */
}