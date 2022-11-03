const api = require("../api")
const TabelaLojaProduto = require("../models/TabelaLojaProduto")
const espera = require("./delay")
const enviaProdutoBling = require("./enviaProdutoBling")
const montaUrlSalvarBling = require("./montaUrlSalvarBling")

async function EncontraSalvaProdutoLoja(tranportaDados) {
    
    const usuario = tranportaDados.usuario
    var dadosProduto = tranportaDados.dadosProduto
    const apikey = tranportaDados.apikey
    const tranfere = {
        dadosProduto : dadosProduto,
        apikey :apikey
    }
    const existe = await TabelaLojaProduto.findOne({
        where: {
            lojaid: dadosProduto.lojaid,
            produtoid: dadosProduto.produtoid,
            usuario:usuario
        }
    })
    if(dadosProduto.precoVenda >0){
        !existe ? await TabelaLojaProduto.create(dadosProduto) : await TabelaLojaProduto.update(dadosProduto, { where: { lojaid: dadosProduto.lojaid, produtoid: dadosProduto.produtoid, usuario:usuario } })
        //monta a url, body e header para salvar no bling
        var transporta =   montaUrlSalvarBling(tranfere)
        var trans = {
            urlPost: transporta.urlPost,
            body: transporta.body,
            headerBling: transporta.headerBling
        }
    
        //salva o preço do produto no bling
        await espera(350)

        await enviaProdutoBling(trans)
    }
    
}

module.exports = EncontraSalvaProdutoLoja
