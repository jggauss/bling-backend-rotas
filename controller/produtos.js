const express = require('express');
var router = express.Router()
const yup = require("yup")
const { Op } = require("sequelize");
const Produtos = require('../models/Produtos')
const axios = require('axios')

router.get('/', (req, res) => {
    return res.send("Página principal api bling")
})

//busca um produto no bling
router.get('/pegaumproduto/:id', (req, res) => {
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
router.get('/produto/:id', async (req, res) => {

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
router.post('/pegatodosprodutos/', async (req, res) => {
    var situacao = ""
    const dataHoje = new Date()
    var todosProdutos = 0
    for (let sit = 0; sit < 2; sit++) {

        if (sit === 0) situacao = "A"
        if (sit === 1) situacao = "I"
        console.log("vou começar ativos e inativos 9999999999999999999999999999999999999")
        for (var i = 1; i <= 100; i++) {
            console.log(situacao)
            console.log(i)
            const urlPegaTodosProdutos = `https://bling.com.br/Api/v2/produtos/page=${i}/json/&filters=situacao[${situacao}]/&apikey=${process.env.APIKEY}`
            console.log("/////////////////////////////////////////////////////////////" + i)
            axios.get(urlPegaTodosProdutos,(req,res))
                .then((response) => {
                    todosProdutos = response.data.retorno.produtos
                    todosProdutos.map(async (produto) => {
                        console.log("vai dar errado na próxima linha")
                        const existe = await Produtos.findOne({
                            where: {
                                idBling: produto.produto.id
                            }
                        })
                        console.log("cheguei aqui")
                        produto.produto.estrutura ? simplesComposto = "Composto" : simplesComposto = "Simples"

                        const dadosMarca = {
                            marca: produto.produto.marca
                        }

                        const dadosCategoria = {

                            nameCategoria: produto.produto.categoria.descricao,
                        }
                        console.log("cheguei aqui 0")
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

                        }
                        console.log("cheguei aqui 1")
                        if (!existe) {
                            await Produtos.create(dados)
                                .then(() => { console.log("criou produto") })
                                .catch(() => { res.status(400) })
                            if (dadosCategoria !== '') {
                                await Categorias.create(dadosCategoria)
                                    .then(() => { console.log("criei a categoria") })
                                    .catch(() => { res.status(400) })

                            }
                            if (dadosMarca.length !== '') {
                                await Marcas.create(dadosMarca)
                                    .then(() => { console.log("criei a porra da marca") })
                                    .catch(() => { res.status(400) })

                            }


                        }
                        console.log("cheguei aqui 2")
                        if (existe) {
                            await Produtos.update(dados, { where: { idBling: produto.produto.id } })
                            await Categorias.create(dadosCategoria)
                                .then(() => { console.log("update no produto") })
                                .catch((err) => { res.status(400) })
                                
                            await Marcas.create(dadosMarca)
                                .then(() => { console.log("criei a marca") })
                                .catch((err) => { res.status(400) })
                               
                        }
                        console.log("cheguei aqui 3")
                    })
                    console.log("cheguei aqui 3.1")
                })
                .catch((err) => {
                    console.log(err)
                    res.status(400)})
                res.end()
            await sleep(3000);
            function sleep(ms) {
                return new Promise((resolve) => {
                    setTimeout(resolve, ms);
                });

            }
            console.log("cheguei aqui 4")
            console.log(todosProdutos.length)

            if (todosProdutos.length < 99) {break}
        }
        console.log("Cheguei aqui rapaz")
        await Produtos.findAll()
            .then((todosProdutos) => {
                console.log(todosProdutos)
                todosProdutos.map(async (produto) => {
                    if (produto.updatedAt < dataHoje) {
                        await Produtos.destroy({ where: { codigo: produto.codigo } })
                            .then(() => { console.log("oi eu aqui") })
                            .catch(() => { console.log("deu errado") });
                        res.end()
                    }
                    console.log("sai aqui 1")
                })
                console.log("sai aqui 2")
            })
            .catch((err) => {
                return res.status(400).json({
                    err: true,
                    mensagem: "Erro: Não existem produtos no arquivo",
                });
            })
           
        console.log("então cheguei aqui. Não entendi nada 1")
    }
    console.log("então cheguei aqui. Não entendi nada 2")
})


//pega todos os produtos no arquivo de produtos
router.get('/produtos/:page/:marca/:categoria', async (req, res) => {
    const { page = 1, marca } = req.params;
    const limit = 20;
    var lastPage = 1;

    async function mostraTudo() {
        const countProduto = await Produtos.count()
        if (countProduto === null) {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro. Nenhum produto encontrado"
            })
        } else {
            lastPage = Math.ceil(countProduto / limit)
        }


        await Produtos.findAll({
            attributes: ["codigo", "idBling", "name", "precoCusto", "marca", "situacao", "nameCategoria", "nomeFornecedor"],
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
            attributes: ["codigo", "idBling", "name", "precoCusto", "marca", "nameCategoria", "nomeFornecedor"],
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



router.get('/produtos/:page/:pesquisa', async (req, res) => {
    const { page = 1 } = req.params;
    const limit = 20;
    var lastPage = 1;
    var { pesquisa } = req.params
    const { count, rows } = await Produtos.
        findAndCountAll({
            where: {
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
router.get("/produtos/zerados", async (req, res) => {
    await Produtos.findAll({
        where: { precoCusto: 0 },
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



module.exports = router