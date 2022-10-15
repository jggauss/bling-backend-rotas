const TabelaLojaProduto = require("../models/TabelaLojaProduto")
const espera = require("./delay")

const enviaProdutoBling = require("./enviaProdutoBling")
const montaUrlSalvarBling = require("./montaUrlSalvarBling")

async function EncontraSalvaProdutoLoja(dadosProduto) {
    console.log("entrei no encontrasalvaprodutoloja")
    
    const existe = await TabelaLojaProduto.findOne({
        where: {
            lojaid: dadosProduto.lojaid,
            produtoid: dadosProduto.produtoid,
        }
    })
    console.log("este é o que eu procuro")
    
    console.log(dadosProduto.precoVenda)
    if(dadosProduto.precoVenda >0){
        console.log("entrei aqui pois é maior que zero")
        !existe ? await TabelaLojaProduto.create(dadosProduto) : await TabelaLojaProduto.update(dadosProduto, { where: { lojaid: dadosProduto.lojaid, produtoid: dadosProduto.produtoid, usuario:dadosProduto.usuario } })
        console.log("Salvei")
        //monta a url, body e header para salvar no bling
        var transporta =  montaUrlSalvarBling(dadosProduto)
        var trans = {
            urlPost: (await transporta).urlPost,
            body: (await transporta).body,
            headerBling: (await transporta).headerBling
        }
    
        //salva o preço do produto no bling
        console.log("vou entrar no enviaprodutobling")
        await espera(350)
        await enviaProdutoBling(trans)
        
    }else{
        console.log("não entrei porque é zero ou menor***************************************************************************"+dadosProduto.precoVenda)
    }
    
}

module.exports = EncontraSalvaProdutoLoja
