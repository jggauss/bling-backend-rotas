const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
  });

  //testando a conexão
  sequelize.authenticate()
  .then(function(){
      console.log("Conexão com banco de dados realizada com sucesso")
    }).catch(function(){
        console.log("Erro: Conexão falhou")
    })
    
  module.exports = sequelize