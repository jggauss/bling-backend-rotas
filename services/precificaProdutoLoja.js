const Lojas = require('../models/Lojas');
const Produtos = require('../models/Produtos');
const espera = require('./delay');
const FazUmProduto = require('./fazUmProduto');
async function PrecificaProdutoLoja(transfere) {
    const id = transfere.codigoBling
    const usuario = transfere.usuario
    const apikey = transfere.apikey

    var loja = await Lojas.findOne({ where: { codigoBling: id, usuario:usuario } })
    const todosProdutos = await Produtos.findAll({where:{usuario:usuario}})
    var codigoBling = loja.codigoBling
    const tamanho = todosProdutos.length
    for (let i = 0; i < todosProdutos.length; i++) {
        let produto = todosProdutos[i].codigo
        let parametros = {
            produto:produto,
            codigoBling:codigoBling,
            loja:loja,
            produtoCompleto : todosProdutos[i],
            usuario : usuario,
            apikey:apikey
        }
        FazUmProduto(parametros)
        await espera(350);
    }
}

module.exports = PrecificaProdutoLoja