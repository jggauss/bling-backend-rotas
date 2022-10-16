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
        var transporta =  montaUrlSalvarBling(tranfere)
        var trans = {
            urlPost: (await transporta).urlPost,
            body: (await transporta).body,
            headerBling: (await transporta).headerBling
        }
    
        //salva o preço do produto no bling
        await espera(350)
        await enviaProdutoBling(trans)
        
    }else{
        console.log("não entrei porque é zero ou menor***************************************************************************"+dadosProduto.precoVenda)
    }
    
}

module.exports = EncontraSalvaProdutoLoja
