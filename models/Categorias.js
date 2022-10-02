const sequelize = require('sequelize')
const Sequelize = require('sequelize') // incluir o sequelize
const db = require('./db.js') // incluir o banco de dados
const Produtos = require('./Produtos')

const Categorias = db.define('categorias', {
    nameCategoria: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    


    }
})

Categorias.associate = function (models) {
    Categorias.belongsTo(models.Produtos, {
        foreignKey: 'idCategoria'
    })
}

//Criar a tabela
//db.sync
//Categorias.sync({ force: true })
//Verificar se há alguma diferença na tabela e realiza a alteração 
//Categorias.sync( {alter:true})
module.exports = Categorias;
