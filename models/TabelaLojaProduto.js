
const Sequelize = require('sequelize') // incluir o sequelize
const db = require('./db.js') // incluir o banco de dados
const Lojas = require('./Lojas.js')
const Produtos = require('./Produtos.js')

const TabelaLojaProduto =  db.define('tabelaLojaProduto',{
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
    situacao: {
        type: Sequelize.STRING
    },
    precoVenda: {
        type: Sequelize.DECIMAL(6,2)
    },
    descontoPercent: {
        type: Sequelize.DECIMAL(6,2)
    },
    descontoValor: {
        type: Sequelize.DECIMAL(6,2)
    },
    acrescimoPercent: {
        type: Sequelize.DECIMAL(6,2)
    },
    acrescimoValor: {
        type: Sequelize.DECIMAL(6,2)
    },
    precoOferta: {
        type: Sequelize.DECIMAL(6,2)
    },
    inicioOferta: {
        type: Sequelize.DATE
    },
    inicioOfertaHora:{
        type: Sequelize.TIME
    },
    fimOferta: {
        type: Sequelize.DATE
    },
    fimOfertaHora:{
        type: Sequelize.TIME
    },
    lojaid: {
        type: Sequelize.INTEGER
    },
    idProdutoLoja: {
        type:Sequelize.STRING
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    marca: {
        type: Sequelize.STRING
    },
    produtoid: {
        type: Sequelize.STRING
    },
    nameCategoria:{
        type: Sequelize.STRING
    },
    idLojaVirtual:{
        type: Sequelize.STRING,
        allowNull:false
    },
    tipoSimplesComposto:{
        type: Sequelize.STRING(10),
        allowNull:false
    }
    
})

TabelaLojaProduto.associate = function(models){
   TabelaLojaProduto.belongsTo(models.Lojas,{
    foreignKey:'lojaid'
   })
   TabelaLojaProduto.belongsTo(models.Produtos,{
    foreignKey:'produtoid'
   }) 
}

//Criar a tabela
//db.sync
//TabelaLojaProduto.sync({force:true})
//Verificar se há alguma diferença na tabela e realiza a alteração 
//TabelaLojaProduto.sync( {alter:true})
//ALTER TABLE tabelalojaprodutos ADD CONSTRAINT FK_PRODUTOS foreign key (produtoid) REFERENCES produtos(codigo) ON DELETE CASCADE;
//ALTER TABLE tabelalojaprodutos ADD CONSTRAINT FK_LOJAS foreign key (lojaid) REFERENCES lojas(id) on delete cascade

module.exports = TabelaLojaProduto;
