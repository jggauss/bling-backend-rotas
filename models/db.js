const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
  });

  //testando a conexão
  sequelize.authenticate()
  .then(function(){
      console.log("Conexão com o banco de dados na porta "+process.env.PORT)
    }).catch(function(){
      console.log("Erro. Conexão com o banco de dados falhou")
    })
    
  module.exports = sequelize