const axios = require('axios');
const bodyParser = require('body-parser');
const espera = require('./delay');
async function enviaProdutoBling(trans) {

    contaTempo = false
    await espera(800)
    await axios.put(trans.urlPost, trans.body, trans.headerBling)
        .then((response) => {
            if (response.status == 200) {
                contaTempo = true
            }
        })

        .catch((erro) => { 
            console.log("olha o status do erro aguardo o 429 //////////////////////////////////////")
            console.log(erro.response.status)
            console.log(erro) })
}

module.exports = enviaProdutoBling