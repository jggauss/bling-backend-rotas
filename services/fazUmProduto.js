const axios = require('axios');
const calculaPrecoFinal = require('./calculaPrecoFinal');
const espera = require('./delay');
const EncontraSalvaProdutoLoja = require('./encontraSalvaProdutoLoja');
async function FazUmProduto(parametros) {


    const usuario = parametros.usuario
    const apikey = parametros.apikey
    const urlPesquisaLoja = `https://bling.com.br/Api/v2/produto/${parametros.produto}/json/&loja=${parametros.codigoBling}&apikey=${apikey}`
    await axios.get(urlPesquisaLoja)
        .then((response) => {
            var todosProdutosLoja = (response.data.retorno)
            var idProdutoLoja = [todosProdutosLoja.produtos[0].produto.produtoLoja.idProdutoLoja]
            if (idProdutoLoja != "") {
                A = Number(parametros.produtoCompleto.precoCusto)
                if (A > 0) {
                    var dadosCalculo = {
                        loja: parametros.loja,
                        A: Number(parametros.produtoCompleto.precoCusto),
                    }
                    //pega os dados da loja o preco de custo e calcula o  preço final.
                    var precoFinal = calculaPrecoFinal(dadosCalculo)
                } else {
                    precoFinal = 0
                }
                //junta os dados do produto NA LOJA, junta o preço para salvar.
                const dadosProduto = {
                    lojaid: Number(parametros.loja.codigoBling),
                    produtoid: parametros.produto,
                    name: parametros.produtoCompleto.name,
                    marca: parametros.produtoCompleto.marca,
                    precoVenda: precoFinal,
                    idLojaVirtual: parametros.loja.codigoBling,
                    usuario: usuario,
                    nameCategoria: parametros.produtoCompleto.nameCategoria,
                    idProdutoLoja: idProdutoLoja[0],
                    tipoSimplesComposto: parametros.produtoCompleto.tipoSimplesComposto
                }
                const tranportaDados = {
                    dadosProduto:dadosProduto,
                    apikey:apikey,
                    usuario:usuario
                }

                //procura pelo produto: se existe na loja salva atualizando, senão cria.
                EncontraSalvaProdutoLoja(tranportaDados)
            }
        })
        .catch(() => {
        });
        await espera(350)
}

module.exports = FazUmProduto
