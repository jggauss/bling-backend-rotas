const express = require('express');
var router = express.Router()

const { Op } = require("sequelize");
const Produtos = require('../models/Produtos')
const axios = require('axios');
const { eAdmin } = require('../middlewares/auth');
const Categorias = require('../models/Categorias');
const Marcas = require('../models/Marcas');



const PegaTodosProdutos = require('../services/PegaTodosProdutos');
const PegaProduto = require('../services/PegaProduto');
const PegaCemProdutos = require('../services/PegaCemProdutos');


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
    await Produtos.findOne({ where: { codigo: od, usuario: usuario } })
        .then((produto) => {
            console.log(produto)
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
        usuario: usuario,
        apikey: apikey
    }
    await PegaTodosProdutos(acesso)
    console.log("Cheguei no fim.")
})
router.post('/buscaprodutosbling', eAdmin, async (req, res) => {
    const dados = req.body
    const usuario = Number(req.userId)
    const apikey = req.apikey
    const acesso = {
        usuario: usuario,
        apikey: apikey,
        i: dados.i,
        situacao: dados.situacao
    }
    
        const response = await PegaCemProdutos(acesso)
        res.json(response.retorno.produtos)
            
    
})
router.post('/encontraesalva', eAdmin, async (req,res) =>{
    const usuario = req.userId
    const produto = req.body
    
    //daqui encontra e salva o produto
    const existe = await Produtos.findOne({
        where: {
            codigo: produto.produto.codigo,
            usuario: usuario
        }
    })
    console.log("olha o existe")

        produto.produto.estrutura ? simplesComposto = "Composto" : simplesComposto = "Simples"
        const dadosMarca = {
            marca: produto.produto.marca,
            usuario: usuario
        }
        const dadosCategoria = {
            nameCategoria: produto.produto.categoria.descricao,
            usuario: usuario
        }
        
        const dados = {
            codigo: produto.produto.codigo,
            idBling: produto.produto.id,
            name: produto.produto.descricao,
            situacao: produto.produto.situacao,
            preco: 0,
            precoCusto: Number(produto.produto.precoCusto),
            marca: produto.produto.marca,
            nameCategoria: produto.produto.categoria.descricao,
            tipoSimplesComposto: simplesComposto,
            nomeFornecedor: produto.produto.nomeFornecedor,
            usuario: usuario

        }
        
        if (!existe) {
            await Produtos.create(dados)
                .then(() => {})
                .catch(() => {})
            await Categorias.create(dadosCategoria)
                .then(() => {
                    
                })
                .catch(() => {})
            await Marcas.create(dadosMarca)
                .then(() => {})
                .catch(() => {})
        }

        if (existe) {
            await Produtos.update(dados, { where: { codigo: dados.codigo, usuario: usuario } })
            .then(()=>{})
            .catch(()=>{
            })
            // await Categorias.create(dadosCategoria)
            //     .then(() => {})
            //     .catch((err) => {})

            // await Marcas.create(dadosMarca)
            //     .then(() => {})
            //     .catch((err) => {})
        }
    
        console.log("sai aqui porque terminou")
        res.end()

})

//pega todos os produtos no arquivo de produtos
router.get('/produtos/:page/:marca/:categoria', eAdmin, async (req, res) => {
    const { page = 1, marca } = req.params;
    const limit = 20;
    var lastPage = 1;
    const usuario = req.userId
    async function mostraTudo() {
        const countProduto = await Produtos.count({ where: { usuario: usuario } })
        if (countProduto === null) {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro. Nenhum produto encontrado"
            })
        } else {
            lastPage = Math.ceil(countProduto / limit)
        }


        await Produtos.findAll({
            where: { usuario: usuario },
            attributes: ["codigo", "idBling", "name", "precoCusto", "marca", "situacao", "nameCategoria", "nomeFornecedor", "usuario"],
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
                usuario: usuario,
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

            attributes: ["codigo", "idBling", "name", "precoCusto", "marca", "nameCategoria", "nomeFornecedor", "usuario"],
            order: [["name", "ASC"]],
            offset: Number(page * limit - limit),
            limit: limit,

            where: {
                usuario: usuario,
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
                usuario: usuario,
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
            usuario: usuario,
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
    const usuario = Number(req.userId)
    const apikey = req.apikey
    await Produtos.findAll({
        where: {
            usuario: usuario,
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
    const lista = req.body
    
    
    //console.log(transfere)
    for(let i=0 ; i<lista.length;i++){
        var transfere = {
            apikey: apikey,
            usuario: usuario,
            lista: lista[i]
        }
        await PercorreLista(transfere)
    }
    async function PercorreLista(transfere) {
        const apikey = transfere.apikey
        const usuario = transfere.usuario
        const lista = transfere.lista
        const acesso = {
            produto: lista,
            usuario: usuario,
            apikey: apikey
        }
        await PegaProduto(acesso)
        await espera(1000);
        function espera(ms) {
            return  new Promise((resolve) => {
                setTimeout(resolve, ms);
            });
        }
    }
})



//pega todos os produtos de um usário
router.get("/produtos", eAdmin, async (req,res)=>{
    const usuario = Number(req.userId)
    await Produtos.findAll({where:{usuario:usuario}})
    .then((response)=>{
        
        res.json(response)
    })
    .catch((err)=>{
        res.status(400).json({
            type:"Error",
            mensagem:"Não há produtos cadastrados"
        })
    })
})
module.exports = router