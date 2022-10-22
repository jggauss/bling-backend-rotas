const express = require('express');
var router = express.Router()
const yup = require("yup")
const { Op } = require("sequelize");
const Produtos = require('../models/Produtos')
const axios = require('axios');
const { eAdmin } = require('../middlewares/auth');
const Categorias = require('../models/Categorias');
const Marcas = require('../models/Marcas');
const Lojas = require('../models/Lojas');

const espera = require('../services/delay');
const PegaTodosProdutos = require('../services/PegaTodosProdutos');
const PegaProduto = require('../services/PegaProduto');

router.get('/', (req, res) => {
    return res.send("Página principal api bling")
})

//busca um produto no bling
router.get('/pegaumproduto/:id', eAdmin, (req, res) => {
    var id = req.params
    var od = id.id
    const apikey = user.apikey

    var urlPegaUmProduto = `https://bling.com.br/Api/v2/produto/${od}/json/&apikey=${apikey}`



    axios.get(urlPegaUmProduto)
        .then((response) => {
            res.status(200).json(response.data.retorno.produtos)
        })
        .catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Nenhum usuário encontrado",
            });
        });
})

//pega um produto no preco certo (diferente do anterior que busca no bling)
router.get('/produto/:id', eAdmin, async (req, res) => {
    const usuario = req.userId
    var ad = req.params
    var od = (ad.id)
    await Produtos.findOne({where:{codigo:od,usuario:usuario}})
        .then((produto) => {

            res.status(200).json(produto)
        })
        .catch(() => {

            return res.status(400).json({

                erro: true,
                mensagem: "Erro: Nenhum produto encontrado",
            });

        });

})

//busca todos os produtos no bling(ativos e inativos)
router.post('/pegatodosprodutos/', eAdmin, async (req, res) => {
    
    const usuario = Number(req.userId)
    const apikey = req.apikey
    const acesso = {
        usuario : usuario,
        apikey : apikey
    }
    await PegaTodosProdutos(acesso)
    console.log("Cheguei no fim.")
})


//pega todos os produtos no arquivo de produtos
router.get('/produtos/:page/:marca/:categoria', eAdmin, async (req, res) => {
    const { page = 1, marca } = req.params;
    const limit = 20;
    var lastPage = 1;
    const usuario = req.userId
    async function mostraTudo() {
        const countProduto = await Produtos.count({where:{usuario:usuario}})
        if (countProduto === null) {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro. Nenhum produto encontrado"
            })
        } else {
            lastPage = Math.ceil(countProduto / limit)
        }


        await Produtos.findAll({
            where:{usuario:usuario},
            attributes: ["codigo", "idBling", "name", "precoCusto", "marca", "situacao", "nameCategoria", "nomeFornecedor","usuario"],
            order: [["name", "ASC"]],
            offset: Number(page * limit - limit),
            limit: limit,

        })
            .then((produtos) => {

                res.json({
                    erro: false,
                    produtos,
                    countProduto,
                    lastPage
                })
            })
            .catch(() => {
                return res.status(400).json({
                    erro: true,
                    mensagem: "Erro. Nenhum produto encontrado"
                })

            });
    }

    async function mostraMarca() {
        const countProduto = await Produtos.count({
            where: {
                usuario:usuario,
                [Op.or]: [{ marca: marca }],
            }
        })


        if (countProduto === null) {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro. Nenhum produto encontrado"
            })
        } else {
            lastPage = Math.ceil(countProduto / limit)
        }


        await Produtos.findAll({
            
            attributes: ["codigo", "idBling", "name", "precoCusto", "marca", "nameCategoria", "nomeFornecedor","usuario"],
            order: [["name", "ASC"]],
            offset: Number(page * limit - limit),
            limit: limit,

            where: {
                usuario:usuario,
                [Op.or]: [{ marca: marca }],
            }

        })
            .then((produtos) => {

                res.json({
                    erro: false,
                    produtos,
                    countProduto,
                    lastPage
                })
            })
            .catch(() => {
                return res.status(400).json({
                    erro: true,
                    mensagem: "Erro. Nenhum produto encontrado"
                })

            });
    }


    (marca != "undefined" && marca != "Selecione Marca") ? mostraMarca() : mostraTudo()


})

router.get('/produtos/:page/:pesquisa', eAdmin, async (req, res) => {
    const { page = 1 } = req.params;
    const limit = 20;
    var lastPage = 1;
    var { pesquisa } = req.params
    const usuario = Number(req.userId)
    const { count, rows } = await Produtos.
        findAndCountAll({
            where: {
                usuario:usuario,
                [Op.or]: [
                    {
                        marca:
                        {
                            [Op.like]: '%' + pesquisa + '%'
                        }
                    },
                    {
                        codigo:
                        {
                            [Op.like]: '%' + pesquisa + '%'
                        }
                    },
                    {
                        name:
                        {
                            [Op.like]: '%' + pesquisa + '%'
                        }
                    },
                ]
            },
        })

    const countProduto = count
    if (countProduto === null) {
        return res.status(400).json({
            erro: true,
            mensagem: "Erro. Nenhum produto encontrado"
        })
    } else {
        lastPage = Math.ceil(countProduto / limit)
    }
    await Produtos.findAll({
        
        attributes: ["codigo", "idBling", "name", "situacao", "preco", "precoCusto", "marca", "nameCategoria", "tipoSimplesComposto", "nomeFornecedor"],
        offset: Number(page * limit - limit),
        limit: limit,

        where: {
            usuario:usuario,
            [Op.or]: [
                {
                    marca:
                    {
                        [Op.like]: '%' + pesquisa + '%'
                    }
                },
                {
                    codigo:
                    {
                        [Op.like]: '%' + pesquisa + '%'
                    }
                },
                {
                    name:
                    {
                        [Op.like]: '%' + pesquisa + '%'
                    }
                },
            ]


        },
        order: [["name", "ASC"]],
    })
        .then((produtosPorLoja) => {
            res.json({
                erro: false,
                produtosPorLoja,
                countProduto,
                lastPage
            }
            )
        }).catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Nenhum produto encontrado para esta loja",
            });

        });


})

//produtos com custo zero
router.get("/zerados", eAdmin, async (req, res, next) => {
    const usuario= Number(req.userId)
    const apikey = req.apikey
    await Produtos.findAll({
        where: { 
            usuario:usuario,
            precoCusto: 0 
        },
        order: [["name", "ASC"]],
    })
        .then((Produtos) => {
            res.status(200).json(Produtos)
        })
        .catch((err) => {
            return res.status(400).json({
                err: true,
                mensagem: "Erro: Nenhuma Loja encontrada",
            });
        });
})

router.post("/precifica/selecionado", eAdmin, async (req, res) => {
    const apikey = req.apikey
    const usuario = Number(req.userId)
    var lista = req.body
    const transfere = {
        apikey:apikey,
        usuario:usuario,
        lista:lista
    }
    
    await PercorreLista(transfere)
    
    async function PercorreLista(transfere) {
        const apikey = transfere.apikey
        const usuario = transfere.usuario
        const lista = transfere.lista
        for (let e = 0; e < lista.length; e++) {
            const acesso = {
                produto : lista[e],
                usuario : usuario,
                apikey :apikey
            }
            await PegaProduto(acesso)
            await espera(1000);
        }
    }
    
})
module.exports = router