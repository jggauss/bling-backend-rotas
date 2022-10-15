const sequelize = require('sequelize')
const Sequelize = require('sequelize') // incluir o sequelize
const db = require('./db.js') // incluir o banco de dados
const TabelaLojaProduto = require('./TabelaLojaProduto.js')

const Lojas =  db.define('lojas',{
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    codigoBling: {
        type: Sequelize.STRING
    },
    comissao: {
        type: Sequelize.DECIMAL(6,2),
        default:0
    },
    valorAcrescAbaixoMinimo: {
        type: Sequelize.DECIMAL(6,2)
    },
    percentAcrescAbaixoMinimo: {
        type: Sequelize.DECIMAL(6,2)
    },
    valorFixoFreteAbaixo: {
        type: Sequelize.DECIMAL(6,2)
    },
    valorPercentFreteAbaixo: {
        type: Sequelize.DECIMAL(6,2)
    },
    valorFreteGratis: {
        type: Sequelize.DECIMAL(6,2)
    },
    valorAcresAcimaMinimo: {
        type: Sequelize.DECIMAL(6,2)
    },
    percentAcrescAcimaMinimo: {
        type: Sequelize.DECIMAL(6,2)
    },
    valorFixoFreteAcima: {
        type: Sequelize.DECIMAL(6,2)
    },
    valorPercentFreteAcima: {
        type: Sequelize.DECIMAL(6,2)
    },
    aumentaValorPedidoMinimo:{
        type:Sequelize.BOOLEAN
    },
    valorAcimaAumentaParaPedidoMinimo: {
        type:Sequelize.DECIMAL(6,2)
    },


})

Lojas.associate = function(models){
    Lojas.hasMany(models.TabelaLojaProduto,{
        foreignKey:'lojaid'
    })
}

//Criar a tabela
//db.sync
//Lojas.sync({force:true})
//Verificar se há alguma diferença na tabela e realiza a alteração 
//Lojas.sync( {alter:true})
module.exports = Lojas;
