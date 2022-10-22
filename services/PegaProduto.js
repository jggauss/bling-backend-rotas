const Produtos = require("../models/Produtos")
const espera = require("./delay")
const PercorreLojas = require("./PercorreLojas")
const ProdutoSalva = require("./ProdutoSalva")


async function PegaProduto(acesso) {

    const produto = acesso.produto
    const usuario = acesso.usuario
    const apikey = acesso.apikey
    await espera(1000)
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
                precoCusto: prod.precoCusto,
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
        .catch((error) => { console.log("não deu certo") })
    
}
module.exports = PegaProduto