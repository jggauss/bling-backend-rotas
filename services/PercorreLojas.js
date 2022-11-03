const Lojas = require('../models/Lojas');
const Produtos = require('../models/Produtos');
const FazUmProduto = require('./fazUmProduto');

async function PercorreLojas(dados10) {
    const usuario = dados10.usuario

    await Lojas.findAll({
        where: { usuario: dados10.usuario },
        order: [["name", "ASC"]]
    })
        .then((lojas) => {
            for (let a = 0; a < lojas.length; a++) {
                let parametros = {
                    produto: dados10.codigo,
                    codigoBling: lojas[a].codigoBling,
                    loja: lojas[a],
                    produtoCompleto: dados10,
                    usuario: usuario,
                    apikey: dados10.apikey
                }
                espera(1000);
                function espera(ms) {
                    return new Promise((resolve) => {
                        setTimeout(resolve, ms);
                    });
                }
                FazUmProduto(parametros)
                
            }
        })
        .catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Nenhuma loja cadastrada."
            })
        })

        espera(1000);
        function espera(ms) {
            return new Promise((resolve) => {
                setTimeout(resolve, ms);
            });
        }
       
}



module.exports = PercorreLojas