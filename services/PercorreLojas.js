const Lojas = require('../models/Lojas');
const Produtos = require('../models/Produtos');
const espera = require('./delay');
const FazUmProduto = require('./fazUmProduto');
 
async function PercorreLojas(dados10){
    const usuario = dados10.usuario
    
    await Lojas.findAll({
        where: {usuario:dados10.usuario},
        order: [["name", "ASC"]]
    })
        .then((lojas) => {
            for(let a = 0; a <lojas.length; a++){
                let parametros = {
                    produto:dados10.codigo,
                    codigoBling:lojas[0].codigoBling,
                    loja: lojas[a],
                    produtoCompleto : dados10,
                    usuario :usuario,
                    apikey:dados10.apikey
                }
                FazUmProduto(parametros)
            }
        })
        .catch((erro) => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Nenhuma loja cadastrada."
            })
        })
        await espera(350);

}
       
       
    
module.exports = PercorreLojas