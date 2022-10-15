const axios = require('axios');
const bodyParser = require('body-parser');
const espera = require('./delay');
async function enviaProdutoBling(trans) {
    console.log("entrei no enviaprodutobling")
    contaTempo = false
    await espera(800)
    
    await axios.put(trans.urlPost, trans.body, trans.headerBling)
        .then((response) => {
            console.log(response.status)

            if (response.status == 200) {
                console.log("salvei o produto == " + JSON.stringify(response.data))
                contaTempo = true
            }
        })

        .catch((erro) => { 
            console.log("olha o status do erro aguardo o 429 //////////////////////////////////////")
            console.log(erro.response.status)
            console.log(erro) })

}


module.exports = enviaProdutoBling