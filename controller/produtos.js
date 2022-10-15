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

const TabelaLojaProduto = require('../models/TabelaLojaProduto');
const { json } = require('body-parser');
const espera = require('../services/delay');
const FazUmProduto = require('../services/fazUmProduto');
const ProdutoSalva = require('../services/ProdutoSalva');
const PercorreLojas = require('../services/PercorreLojas');
const PegaTodosProdutos = require('../services/PegaTodosProdutos');

router.get('/', (req, res) => {
    return res.send("Página principal api bling")
})

//busca um produto no bling
router.get('/pegaumproduto/:id', eAdmin, (req, res) => {
    var id = req.params
    var od = id.id

    var urlPegaUmProduto = `https://bling.com.br/Api/v2/produto/${od}/json/&apikey=${process.env.APIKEY}`



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

    var ad = req.params
    var od = (ad.id)
    await Produtos.findByPk(od)
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
    
    usuario = Number(req.userId)
    console.log("este aqui é o usuáiro "+usuario)
    await PegaTodosProdutos(usuario)
    console.log("arre. cheguei aqui no fim. Amém")
})


//pega todos os produtos no arquivo de produtos
router.get('/produtos/:page/:marca/:categoria', eAdmin, async (req, res) => {
    const { page = 1, marca } = req.params;
    const limit = 20;
    var lastPage = 1;
    const usuario = Number(req.userId)

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
            where:{usuario:usuario},
            attributes: ["codigo", "idBling", "name", "precoCusto", "marca", "nameCategoria", "nomeFornecedor","usuario"],
            order: [["name", "ASC"]],
            offset: Number(page * limit - limit),
            limit: limit,

            where: {
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
    //pega os produtos selecionados através do req.body
    var lista = req.body
    console.log("carai. não é aqui?")
    //pegando os produtos selecionados
    await aguarda(lista)
    const usuario = Number(req.userId)
    async function aguarda(lista) {
        for (let e = 0; e < lista.length; e++) {
            console.log('cheguei 1')
            console.log(lista[e])
            console.log("olha o tamanho da lista"+lista.length)
            await pegaProduto(lista[e])
            console.log("cheguei 2")
            await espera(1000);
        }
    }
    //pega no bling e salva o produto
    async function pegaProduto(produto) {
        await espera(1000)
            await Produtos.findOne({
                where:{
                    usuario:usuario,
                    codigo:produto
                }
            })
            .then((prod) => {
                console.log("kykyky")
                console.log(prod)               
                console.log(prod.codigo)

                const dados10 = {
                    codigo: prod.codigo,
                    idBling: prod.idBling,
                    name: prod.name,
                    situacao: prod.situacao,
                    preco: 0,
                    precoCusto: prod.precoCusto,
                    marca: prod.marca,
                    nameCategoria: prod.nameCategoria,
                    nomeFornecedor: prod.nomeFornecedor,
                    tipoSimplesComposto:prod.tipoSimplesComposto,
                    usuario:prod.usuario
                }
                console.log("olha isso")
                console.log(dados10)
                ProdutoSalva(dados10)
                PercorreLojas(dados10)
            })
            .catch((error) => { console.log("não deu certo") })
        res.end()
    }
    //pega todas as lojas
})
module.exports = router