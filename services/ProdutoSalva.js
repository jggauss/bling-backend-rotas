const Produtos = require('../models/Produtos');
const espera = require('./delay');
 
    async function ProdutoSalva(dados10) {
        console.log("cheguei no produtosalva e salvei")
        //console.log(dados10)
        await Produtos.update(dados10, { where: { idBling: dados10.codigo, usuario:dados10.usuario } })
        await espera(350)
    }  
   
    
module.exports = ProdutoSalva