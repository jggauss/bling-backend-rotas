const axios = require('axios');
const espera = require('./delay');
async function enviaProdutoBling(trans) {
    await espera(350)

    await axios.put(trans.urlPost, trans.body, trans.headerBling)
    .then(()=>{})
    .catch(()=>{})
    
    
}

module.exports = enviaProdutoBling