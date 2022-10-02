const api = require("./api")
const express = require('express');
var cors = require("cors");
const axios = require('axios')
require("dotenv").config();
const app = express()
const path = require("path")
const produtos = require('./controller/produtos.js');
const lojas = require("./controller/lojas.js");
const produtosLojas = require('./controller/produtosLojas')
const pedidos = require('./controller/pedidos')
const servicos = require('./controller/servicos')
app.use(express.json())
app.use('/files', express.static(path.resolve(__dirname, "public", 'upload')))
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "X-PINGOTHER, Content-Type, Authorization")
    app.use(cors());
    next();
});



app.use('/produtos',produtos)
app.use('/lojas',lojas)
app.use('/produtoslojas',produtosLojas)
app.use('/pedidos',pedidos)
app.use('/servicos',servicos)


app.listen(8001, () => {
    //console.log(`Servidor rodando na porta ${process.env.PORT}`)
})