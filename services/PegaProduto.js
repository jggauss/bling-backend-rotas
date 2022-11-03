const Produtos = require("../models/Produtos")
const axios = require('axios');
const PercorreLojas = require("./PercorreLojas")
const ProdutoSalva = require("./ProdutoSalva")


async function PegaProduto(acesso) {

    const produto = acesso.produto
    const usuario = acesso.usuario
    const apikey = acesso.apikey
    await espera(1000);
    function espera(ms) {
        return  new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    } 
    var urlPegaUmProduto = `https://bling.com.br/Api/v2/produto/${produto}/json/&apikey=${apikey}`
    const produtoTempCusto = await axios.get(urlPegaUmProduto)
    const temp1 = produtoTempCusto.data.retorno.produtos[0].produto.precoCusto

    await Produtos.findOne({
            where:{
                usuario:usuario,
                codigo:produto
            }
        })
        .then((prod) => {
            const dados10 = {
                codigo: prod.codigo,
                idBling: prod.idBling,
                name: prod.name,
                situacao: prod.situacao,
                preco: 0,
                precoCusto: produtoTempCusto.data.retorno.produtos[0].produto.precoCusto,
                marca: prod.marca,
                nameCategoria: prod.nameCategoria,
                nomeFornecedor: prod.nomeFornecedor,
                tipoSimplesComposto:prod.tipoSimplesComposto,
                usuario:usuario,
                apikey:apikey
            }
            ProdutoSalva(dados10)
            PercorreLojas(dados10)
        })
        .catch(() => { })
}
module.exports = PegaProduto