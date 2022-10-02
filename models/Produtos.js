const { DATE } = require('sequelize')
const {Sequelize,DataTypes,Model} = require('sequelize') // incluir o sequelize
const db = require('./db.js') // incluir o banco de dados
const PedidosItens = require('./PedidosItens.js')
const Categorias = require('./Categorias')
const Marcas = require('./Marcas')
const TabelaLojaProduto = require('./TabelaLojaProduto.js')

const Produtos =  db.define('Produtos',{
    codigo: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    },
    idBling: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    codigo: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    },
    situacao: {
        type: Sequelize.STRING
    },
    preco: {
        type: Sequelize.DECIMAL(9,2)
    },
    precoCusto: {
        type: Sequelize.DECIMAL(9,2)
    },
    marca: {
        type: Sequelize.STRING
    },
    nameCategoria: {
        type: Sequelize.STRING
    },
    tipoSimplesComposto:{
        type: Sequelize.STRING(10)
    },
    nomeFornecedor: {
        type: Sequelize.STRING
    },
})
// {
//     indexes:[
//         {
//             unique:true,
//             fields:['name','codigo']
//         }
//     ]
// }

Produtos.associate = function(models){
    Produtos.hasMany(models.TabelaLojaProduto,{
        foreignKey:'produtoid'
    })
    Produtos.hasOne(models.Marcas,{
        foreignKey:'marca'
    })
    Produtos.hasOne(models.Categorias,{
        foreignKey:'nameCategoria'
    })
    
}

//Criar a tabela
//db.sync
//Produtos.sync({force:true})
//Verificar se há alguma diferença na tabela e realiza a alteração 
//Produtos.sync( {alter:true})
module.exports = Produtos;
