const express = require('express');
var router = express.Router()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
require("dotenv").config();
const yup = require("yup")
const nodemailer = require("nodemailer")
const Users = require('../models/Users');
const api = require('../api');
const { eAdmin } = require('../middlewares/auth')

router.post('/cadastrar', async (req, res) => {
    var dados = req.body
    const user = await Users.findOne({
        where: {
            email: dados.email,

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
        password: dados.password,
        apikey: dados.apikey
    })
        .then((response) => {
            return response
        })
        .catch((err) => { res.status(400) })
    res.end()
})

router.put('/user', eAdmin, async (req, res) => {
    var dados = req.body
    const usuario = req.userId
    await Users.update(dados, {
        where: { id: usuario }
    })
        .then((response) => {
            return res.status(200).json({
                erro: false,
                mensagem: "Usuário alterado com sucesso"
            })
        })


        .catch((err) => { res.status(400) })
    res.end()


})

router.put('/senha', eAdmin, async (req, res) => {
    const usuario = req.userId
    const user = req.body
    const newPassword = await bcrypt.hash(user.password, 12)
    await Users.update({
        name: user.name,
        email: user.email,
        password: newPassword,
        apikey: user.apikey

    },
        { where: { id: usuario } })
})


router.post('/', async (req, res) => {
    const user = await Users.findOne({
        attributes: ["id", "name", "email", "apikey", "password"],
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

    var token = jwt.sign({ id: user.id, apikey: user.apikey }, process.env.PAYLOAD, {
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
    const usuario = req.userId
    const user = await Users.findOne({
        attributes: ["id", "name", "email", "apikey", "password"],
        where: {
            id: usuario,
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

router.get('/val-token', eAdmin, async (req, res) => {
    await Users.findByPk(req.userId, { attributes: ["id", "name", "apikey", "plano"] })
        .then((user) => {
            return res.json({
                erro: false,
                user
            })
        })
        .catch((erro) => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro. Nescessário realizar o login"
            })
        })
})

router.post('/recover-password', async (req, res) => {
    var dados = req.body
    const user = await Users.findOne({
        attributes: ["id", "name", "email"],
        where: { email: dados.email }
    })
    if (user === null) {
        return res.status(400).json({
            erro: true,
            mensagem: "Erro. Usuário não encontrado"
        })
    }
    dados.recover_password = (await bcrypt.hash(user.id + user.emai + user.name, 8)).replace(/\./g, "").replace(/\//g, "")

    await Users.update(dados, { where: { id: user.id } })
        .then(() => {
            var transport = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_APP_PASS
                },
                tls:{
                    rejectUnauthorized:false
                }
            });
            var message = {
                from: process.env.EMAIL_FROM,
                to: dados.email,
                subject: "Instrução para recuperação de senha",
                text: `Prezado(a) ${user.name}.\n\nVocê fez uma solicitação para alterar sua senha. Para continuar o processo de recuperação de sua senha, clique no link abaixo ou copie e cole no seu navegador :\n\n ${process.env.URL_RECUPERA_SENHA}${dados.recover_password}\n\n Se você não fez esta solicitação, nenhuma ação é nescessária, pois sua senha permanecerá a mesma até que você ative este código.\n\n"`,
                html: `Prezado(a) cliente.<br><br>Você fez uma solicitação para alterar sua senha. Para continuar o processo de recuperação de sua senha, clique no link abaixo ou copie e cole no seu navegador :<br><br> <a href=${process.env.URL_RECUPERA_SENHA}${dados.recover_password}>${process.env.URL_RECUPERA_SENHA}${dados.recover_password}</a><br><br>Se você não fez esta solicitação, nenhuma ação é nescessária, pois sua senha permanecerá a mesma até que você ative este código.<br><br>`
            };

            transport.sendMail(message, function (err) {
                if (err) return res.status(400).json({
                    erro: true,
                    mensagem: "Erro. Email não foi enviado. Tente novamente. Verifique se está enviando o email cadastrado"
                })
                return res.json({
                    erro: false,
                    mensagem: "Email de recuperação de senha enviado com sucesso. Consulte sua caixa de email."
                })
            })


        })
        .catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro. Email para recuperar a senha não enviado. Verifique o email e tente novamente"
            })
        })
})

router.get('/val-key-recover-password/:key', async (req, res) => {
    const { key } = req.params
    const user = await Users.findOne({
            attributes: ['id'],
            where: { recover_password: key }
    })
    if(user === null){
        return res.status(400).json({
            erro:true,
            mensagem:"Erro. Link inválido"
        })
    }

    return res.json({
        erro: false,
        mensagem: "Chave é válida"
    })
})

router.put('/update-password/:key', async (req,res)=>{
    const { key }=req.params
    const {password} = req.body
    const newPassword = await bcrypt.hash(password,12)
    await Users.update({password:newPassword, recover_password:null},{ where: { recover_password: key } })
    .then(()=>{
        return res.json({
            erro:false,
            mensagem:"Senha editada com sucesso"
        })
    })
    .catch(()=>{
        return res.status(400).json({
            erro:false,
            mensagem:"Erro. Senha não foi editada com sucesso"
        })
    })




    


})

module.exports = router