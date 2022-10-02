const sequelize = require('sequelize')
const Sequelize = require('sequelize') // incluir o sequelize
const db = require('./db.js') // incluir o banco de dados
const Produtos = require('./Produtos')

const Marcas =  db.define('marcas',{
       marca: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        
    },
})

Marcas.associate = function(models){
    Marcas.belongsTo(models.Produtos,{
        foreignKey:'marca'
    })
}

//Criar a tabela
//db.sync
//Marcas.sync({force:true})
//Verificar se há alguma diferença na tabela e realiza a alteração 
//Marcas.sync( {alter:true})
module.exports = Marcas;
