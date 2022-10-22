const Produtos = require('../models/Produtos');
const espera = require('./delay');
 
    async function ProdutoSalva(dados10) {
        await espera(350)
        await Produtos.update(dados10, { where: { idBling: dados10.codigo, usuario:dados10.usuario } })
        
    }  
   
    
module.exports = ProdutoSalva