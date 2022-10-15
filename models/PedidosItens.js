const {Sequelize,DataTypes,Model} = require('sequelize') // incluir o sequelize
const db = require('./db.js') // incluir o banco de dados
const Pedidos = require('./Pedidos.js')
const Produtos = require('./Produtos')


const PedidosItens =  db.define('pedidositens',{
   
    numeroPedidoLoja: {
         type: Sequelize.STRING,
         allowNull: false,
         primaryKey: true,
        //  references:{
        //     model:"pedidos",
        //     foreignKey:"numeroPedidoLoja"
        // },
        // onDelete:"CASCADE"
     },
     usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },     
    codigo: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        // references:{
        //     model:{"produtos": { codigo}},
        //     foreignKey:"codigo"
        // },
        // onDelete:"CASCADE"
    },
    descricao: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    quantidade: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    valorUnidade: {
        type: Sequelize.DECIMAL(9,2),
        allowNull: true,
    },
    precoCusto: {
        type: Sequelize.DECIMAL(9,2),
        allowNull: true,
    },
    descontoItem: {
        type: Sequelize.DECIMAL(9,2),
        allowNull: true,

    }
    
   
})
// Produtos.PedidosItens = Produtos.belongsTo(PedidosItens)
// PedidosItens.Produtos = PedidosItens.hasMany(Produtos)

//   PedidosItens.associate = function(models){
//      Produtos.belongsTo(models.PedidosItens,{
//          foreignKey:'codigo'
//      })
//      PedidosItens.hasMany(models.Produtos,{
//          foreignKey:'codigo'})

//  }


//Criar a tabela
//db.sync
//PedidosItens.sync({force:true})
//Verificar se há alguma diferença na tabela e realiza a alteração 
//PedidosItens.sync( {alter:true})
module.exports = PedidosItens;
