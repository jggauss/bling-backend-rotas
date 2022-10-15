const express = require('express');
var router = express.Router()
const yup = require("yup")
const { Op } = require("sequelize");
const Produtos = require('../models/Produtos')
const Lojas = require('../models/Lojas')
const produtos = require('../controller/produtos.js')
const axios = require('axios');
const Marcas = require('../models/Marcas');
const Categorias = require('../models/Categorias');
const { eAdmin } = require('../middlewares/auth');



router.get('/marcas',eAdmin, async (req, res) => {
    const usuario = Number(req.userId)
    const contaMarcas = await Marcas.count()

    await Marcas.findAndCountAll({where:{usuario:usuario}})
        .then((marcas) => {

            res.json({
                contaMarcas,
                marcas
            })
        })
        .catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Nenhuma marca encontrada",
            });

        });
})

router.get('/categorias',eAdmin, async (req, res) => {
    const usuario = Number(req.userId)
    const contaCategorias = await Categorias.count()

    await Categorias.findAndCountAll({where:{usuario:usuario}})
        .then((categorias) => {

            res.json({
                contaCategorias,
                categorias
            })
        })
        .catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Nenhuma marca encontrada",
            });

        });
})



module.exports = router