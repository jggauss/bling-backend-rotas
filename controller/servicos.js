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



router.get('/marcas', async (req, res) => {

    const contaMarcas = await Marcas.count()

    await Marcas.findAndCountAll()
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

router.get('/categorias', async (req, res) => {

    const contaCategorias = await Categorias.count()

    await Categorias.findAndCountAll()
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