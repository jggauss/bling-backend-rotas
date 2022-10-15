const jwt = require('jsonwebtoken')

const { promisify } = require("util")
require('dotenv').config()


module.exports ={ 
    eAdmin: async function(req,res,next) {
        const authHeader = req.headers.authorization
        const [ bearer, token ] = authHeader.split(" ")
        if (!token) {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro. Login não autorizado"
            })
        }
    
        try {

            const decoded =  await promisify(jwt.verify)(token, process.env.PAYLOAD)
            req.userId = decoded.id
            console.log(req.userId)
            return next()
        } catch (error) {
            return res.status(400).json({
                error: true,
                mensagem: "Erro. Nescessário fazer o login"
            })
        }
    }
}