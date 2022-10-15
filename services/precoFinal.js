const TabelaLojaProduto = require("../models/TabelaLojaProduto")

const  PrecoFinal = async  function (todosProdutosLoja) {
    // var idProdutoLoja = [todosProdutosLoja.produtos[0].produto.produtoLoja.idProdutoLoja]
    // if (idProdutoLoja != "") {

    //     A = Number(todosProdutos[i].precoCusto)
    //     if (A > 0) {

    //         var precoInicial = Number(A * (1 + B) * (1 + (C)) + D)

    //         precoFinal = Number(precoInicial)

    //         if ((precoInicial < Number(valorFreteGratis))) {

    //             Number(bBarato === 0) ? bBarato = Number(B) : bBarato

    //             var precoBarato = Number(A * (1 + (bBarato)) + (cBarato))

    //             if (Number(precoBarato) === 0) {
    //                 precoBarato = Number(valorFreteGratis)

    //             }
    //             if ((Number(precoBarato) > Number(F)) && (Number(precoBarato < valorFreteGratis))) {
    //                 precoBarato = (Number(valorFreteGratis))
    //             }

    //             precoFinal = Number(precoBarato)
    //         }

    //     } else {
    //         precoFinal = 0
    //     }
    //     const dadosProduto = {
    //         lojaid: id,
    //         produtoid: todosProdutos[i].codigo,
    //         name: todosProdutos[i].name,
    //         marca: todosProdutos[i].marca,
    //         precoVenda: precoFinal,
    //         idLojaVirtual: loja.codigoBling,
    //         nameCategoria: todosProdutos[i].nameCategoria,
    //         idProdutoLoja: idProdutoLoja[0],
    //         tipoSimplesComposto: todosProdutos[i].tipoSimplesComposto
    //     }
    //     async function encontra(dadosProduto) {
    //         const existe = await TabelaLojaProduto.findOne({
    //             where: {
    //                 lojaid: dadosProduto.lojaid,
    //                 produtoid: dadosProduto.produtoid,
    //                 usuario:dadosProduto.usuario
    //             }
    //         })
    //         !existe ? await TabelaLojaProduto.create(dadosProduto) : await TabelaLojaProduto.update(dadosProduto, { where: { lojaid: dadosProduto.lojaid, produtoid: dadosProduto.produtoid } })


    //     }

    //     await encontra(dadosProduto)


    // }
}
module.exports = PrecoFinal

