const Lojas = require('../models/Lojas');
const Produtos = require('../models/Produtos');
const espera = require('./delay');
const FazUmProduto = require('./fazUmProduto');
 
async function PercorreLojas(dados10){
    console.log("olha os dados 10 dentro do percorrelojas")
    //console.log(dados10)
    await Lojas.findAll({
        where: {usuario:usuario},
        order: [["name", "ASC"]]
    })
        .then((lojas) => {
            for(let a = 0; a <lojas.length; a++){
                let parametros = {
                    produto:dados10.codigo,
                    codigoBling:lojas[0].codigoBling,
                    loja: lojas[a],
                    produtoCompleto : dados10
                }
                console.log("olha os parametros")
                //console.log(parametros)
                FazUmProduto(parametros)
               
            }

        })
        .catch((erro) => {
            console.log("Não há lojas cadastradas")
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Nenhuma loja cadastrada."
            })
        })
        await espera(350);

}
       
       
    
module.exports = PercorreLojas