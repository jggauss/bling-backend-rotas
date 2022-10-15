const Lojas = require('../models/Lojas');
const Produtos = require('../models/Produtos');
const espera = require('./delay');
const FazUmProduto = require('./fazUmProduto');
async function PrecificaProdutoLoja(transfere) {
    console.log("entrei no precificaprodutoloja")
    console.log(transfere)
    const id = transfere.codigoBling
    
    const usuario = transfere.usuario
    //var A = 0
    var loja = await Lojas.findOne({ where: { codigoBling: id, usuario:usuario } })
    const todosProdutos = await Produtos.findAll({where:{usuario:usuario}})
    var codigoBling = loja.codigoBling

    for (let i = 0; i <= todosProdutos.length - 1; i++) {
        let produto = todosProdutos[i].codigo
        let parametros = {
            produto:produto,
            codigoBling:codigoBling,
            loja:loja,
            produtoCompleto : todosProdutos[i],
            usuario : usuario
        }
        console.log("olha a bosta dosos parametros")
        // console.log(parametros)
        FazUmProduto(parametros)
        await espera(350);
    }
}

module.exports = PrecificaProdutoLoja