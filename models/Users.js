const sequelize = require('sequelize')
const Sequelize = require('sequelize') // incluir o sequelize
const db = require('./db.js') // incluir o banco de dados


const Users =  db.define('users',{
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    },
    apikey: {
        type: Sequelize.STRING
    },
    plano: {
        type: Sequelize.STRING
    },

})

// Users.associate = function(models){
//     Lojas.hasMany(models.TabelaLojaProduto,{
//         foreignKey:'lojaid'
//     })
// }

//Criar a tabela
//db.sync
//Users.sync({force:true})
//Verificar se há alguma diferença na tabela e realiza a alteração 
//User.sync( {alter:true})
module.exports = Users;
