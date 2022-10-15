const express = require('express');
var router = express.Router()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
require("dotenv").config();
const yup = require("yup")
const Users = require('../models/Users');
const api = require('../api');
const { eAdmin } = require('../middlewares/auth')

router.post('/cadastrar', async (req, res) => {
    var dados = req.body

    const user = await Users.findOne({
        where: {
            email: dados.email
        }
    })
    if (user) {

        return res.status(400).json({
            erro: true,
            mensagem: "Erro. Este usuário já existe"
        })
    }

    dados.password = await bcrypt.hash(dados.password, 12)

    await Users.create({
        name: dados.name,
        email: dados.email,
        password: dados.password
    })
        .then((response) => {
            return response
        })
        .catch((err) => { res.status(400) })
    res.end()
})

router.put('/user',eAdmin, async (req, res) => {
    var dados = req.body
    await Users.update(dados, {
        where: { email: dados.email }
    })
        .then((response) => {
            return response
        })
        .catch((err) => { res.status(400) })
    res.end()


})

router.post('/', async (req, res) => {
    const user = await Users.findOne({
        attributes: ["id", "name", "email", "password"],
        where: { email: req.body.email }
    })
    if (user === null) {
        return res.status(400).json({
            erro: true,
            mensagem: "Erro. Usuário e senha inválidos"
        })
    }

    if (!(await bcrypt.compare(req.body.password, user.password))) {

        return res.status(400).json({
            erro: true,
            mensagem: "Erro. Usuário e senha inválidos"
        })

    }

    var token = jwt.sign({ id: user.id }, process.env.PAYLOAD, {
        expiresIn: '7d' //7 dias
    })


    return res.json({
        erro: false,
        mensagem: "Login efetuado com sucesso",
        token
    })
})

router.get('/user', eAdmin, async (req, res) => {
    var dados = req.body
    const user = await Users.findOne({
        attributes: ["id", "name", "email", "password"],
        where: {
            email: req.body.email
        }
    })
        .then((response) => {
            res.json(response)
        })
        .catch((err) => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro. Nescessário fazer o login"
            })
        })
})

router.get('/val-token',eAdmin,  async (req, res)=>{
    await Users.findByPk(req.userId, {attributes:["id","name","apikey","plano"]})
    .then((user)=>{
        return res.json({
            erro:false,
            user
        })
    })
    .catch((erro)=>{
        return res.status(400).json({
            erro:true,
            mensagem:"Erro. Nescessário realizar o login"
        })
    })
    
})


module.exports = router