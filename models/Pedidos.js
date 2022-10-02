const { Sequelize, DataTypes, Model } = require('sequelize') // incluir o sequelize
const db = require('./db.js') // incluir o banco de dados
const PedidosItens = require('./PedidosItens')

const Pedidos = db.define('pedidos', {
    numeroPedidoLoja: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    },

    idLojaVirtual: {
        type: Sequelize.STRING,
        allowNull: true,
    },

    cpfCnpj: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    nomeCliente: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    data: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    valorFrete: {
        type: Sequelize.DECIMAL(9, 2),
        allowNull: true,
    },
    outrasDespesas: {
        type: Sequelize.DECIMAL(9, 2),
        allowNull: true,

    },
    totalProdutos: {
        type: Sequelize.DECIMAL(9, 2),
        allowNull: true,

    },
    totalVenda: {
        type: Sequelize.DECIMAL(9, 2),
        allowNull: true,

    },
    totalDesconto: {
        type: Sequelize.DECIMAL(9, 2),
        allowNull: true,

    },
    totalCustoProdutos: {
        type: Sequelize.DECIMAL(9, 2),
        allowNull: true,

    },
    situacao: {
        type: Sequelize.STRING,
        allowNull: true,

    },
    
})
  Pedidos.associate = function (models) {
      Pedidos.hasMany(models.PedidoItens, {
          foreignKey: 'numeroPedidoLoja'
      })
      PedidosItens.belongsTo(models.Pedidos,{
         foreignKey:'numeroPedidoLoja'
        })
  }





//Criar a tabela
//db.sync
//Pedidos.sync({force:true})
//Verificar se há alguma diferença na tabela e realiza a alteração 
//Pedidos.sync( {alter:true})
//ALTER TABLE pedidositens ADD CONSTRAINT FK_PEDIDOS foreign key (numeroPedidoLoja) REFERENCES Pedidos(numeroPedidoLoja) on delete cascade;
module.exports = Pedidos;
