const axios = require('axios');
const espera = require('./delay');
async function PegaCemProdutos(acesso) {
    const apikey = acesso.apikey
    const situacao = acesso.situacao
    const i = acesso.i
            await espera(3000)
            const urlPegaTodosProdutos = `https://bling.com.br/Api/v2/produtos/page=${i}/json/&filters=situacao[${situacao}]/&apikey=${apikey}`
            const response = await axios.get(urlPegaTodosProdutos)
            return response.data
}
module.exports = PegaCemProdutos