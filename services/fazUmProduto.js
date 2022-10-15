const axios = require('axios');
const calculaPrecoFinal = require('./calculaPrecoFinal');

const espera = require('./delay');
const EncontraSalvaProdutoLoja = require('./encontraSalvaProdutoLoja');
async function FazUmProduto(parametros) {
    console.log("cheguei aqui dentro do fazum produto")
    //console.log(parametros)
    const urlPesquisaLoja = `https://bling.com.br/Api/v2/produto/${parametros.produto}/json/&loja=${parametros.codigoBling}&apikey=${process.env.APIKEY}`
    await axios.get(urlPesquisaLoja)
        .then((response) => {
            
            var todosProdutosLoja = (response.data.retorno)
            var idProdutoLoja = [todosProdutosLoja.produtos[0].produto.produtoLoja.idProdutoLoja]
            console.log("olha aqui o diprodutoloja")
            console.log(idProdutoLoja)
            //var simplesComposto = todosProdutosLoja.produtos[0].produto.produtoLoja.tipoSimplesComposto
            if (idProdutoLoja != "") {
                A = Number(parametros.produtoCompleto.precoCusto)
                if (A > 0) {

                    var dadosCalculo = {
                        loja: parametros.loja,
                        A: Number(parametros.produtoCompleto.precoCusto),
                    }
                    //pega os dados da loja o preco de custo e calcula o  preço final.
                     console.log("olhao dadoscauculo")
                     console.log(dadosCalculo)
                    var precoFinal = calculaPrecoFinal(dadosCalculo)
                    console.log("passei do calculaprecofinal")
                } else {
                    precoFinal = 0
                }


                
                //junta os dados do produto NA LOJA, junta o preço para salvar.
                // console.log("oia cheguei aqui no dadosproduto")
                // console.log(Number(parametros.loja.codigoBling))
                // console.log(parametros.produto)
                // console.log(parametros.produtoCompleto.name)
                // console.log(parametros.produtoCompleto.marca)
                // console.log(precoFinal)
                // console.log(parametros.loja.codigoBling)
                // console.log(parametros.loja.usuario)// parou aqui
                // console.log(parametros.produtoCompleto.nameCategoria)
                // console.log(idProdutoLoja[0])
                // console.log(parametros.produtoCompleto.tipoSimplesComposto)
                console.log("***************************************************************************")
                const dadosProduto = {
                    lojaid: Number(parametros.loja.codigoBling),
                    produtoid: parametros.produto,
                    name: parametros.produtoCompleto.name,
                    marca: parametros.produtoCompleto.marca,
                    precoVenda: precoFinal,
                    idLojaVirtual: parametros.loja.codigoBling,
                    usuario: parametros.usuario,
                    nameCategoria: parametros.produtoCompleto.nameCategoria,
                    idProdutoLoja: idProdutoLoja[0],
                    tipoSimplesComposto: parametros.produtoCompleto.tipoSimplesComposto
                }
                console.log("oi estou no fazum produto e o dados produto é esse" )
                
                //procura pelo produto: se existe na loja salva atualizando, senão cria.
                EncontraSalvaProdutoLoja(dadosProduto)

            }

        })
        .catch(() => {
        });
        await espera(350)
}

module.exports = FazUmProduto
