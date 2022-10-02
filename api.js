const axios = require('axios')
const api = axios.create({
    baseURL: "https://bling.com.br/"
    
})

module.exports = api