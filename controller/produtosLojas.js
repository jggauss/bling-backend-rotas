const express = require('express');
var router = express.Router()
const yup = require("yup")
const { Op } = require("sequelize");
const Produtos = require('../models/Produtos')
const Lojas = require('../models/Lojas')
const produtos = require('../controller/produtos.js')
const axios = require('axios');
const TabelaLojaProduto = require('../models/TabelaLojaProduto');

//envia o preço para o bling
router.post('/precos/:id', async (req, res) => {
    const { id } = req.params
    const loja = await Lojas.findByPk(id)
    const codigoBling = loja.codigoBling
    const B = Number(loja.percentAcrescAcimaMinimo) / 100 || 0
    const C = Number(loja.valorPercentFreteAcima) / 100 || 0
    const D = Number(loja.valorFixoFreteAcima)
    valorFreteGratis = Number(loja.valorFreteGratis)
    const bBarato = Number(loja.percentAcrescAbaixoMinimo) / 100 || 0
    const cBarato = Number(loja.valorAcrescAbaixoMinimo)
    const F = Number(loja.valorAcimaAumentaParaPedidoMinimo)
    var precoFinal = 0
    const todosProdutos = await Produtos.findAll()
    var A = 0
    var total = todosProdutos.length

    for (let i = 0; i <= todosProdutos.length - 1; i++) {

        let produto = todosProdutos[i].codigo
        console.log(total)
        console.log(i)
        console.log((((i + 1) / total) * 100).toFixed(1))
        const urlPesquisaLoja = `https://bling.com.br/Api/v2/produto/${produto}/json/&loja=${codigoBling}&apikey=${process.env.APIKEY}`

        axios.get(urlPesquisaLoja)
            .then((response) => {
                var todosProdutosLoja = (response.data.retorno)
                var idProdutoLoja = [todosProdutosLoja.produtos[0].produto.produtoLoja.idProdutoLoja]
                if (idProdutoLoja != "") {
                    A = todosProdutos[i].precoCusto

                    if (A >= 0) {
                        const precoInicial = (A * (1 + B) * (1 + (C)) + D)
                        var precoBarato = (A * (1 + (bBarato)) + (cBarato))
                        precoBarato > F ? precoBarato = valorFreteGratis : precoBarato
                        precoInicial >= valorFreteGratis ? precoFinal = precoInicial : precoFinal = precoBarato
                    } else {
                        precoFinal = 0
                    }
                    const dadosProduto = {
                        lojaid: id,
                        produtoid: todosProdutos[i].codigo,
                        name: todosProdutos[i].name,
                        marca: todosProdutos[i].marca,
                        precoVenda: precoFinal,
                        idLojaVirtual: loja.codigoBling,
                        nameCategoria: todosProdutos[i].nameCategoria,
                        idProdutoLoja: idProdutoLoja[0],
                        tipoSimplesComposto: todosProdutos[i].tipoSimplesComposto
                    }
                    async function encontra(dadosProduto) {
                        const existe = await TabelaLojaProduto.findOne({
                            where: {
                                lojaid: dadosProduto.lojaid,
                                produtoid: dadosProduto.produtoid,
                            }
                        })
                        !existe ? await TabelaLojaProduto.create(dadosProduto) : await TabelaLojaProduto.update(dadosProduto, { where: { lojaid: dadosProduto.lojaid, produtoid: dadosProduto.produtoid } })


                    }

                    encontra(dadosProduto)


                }
            })
            .catch(() => {
            });
        await sleep(350);
        function sleep(ms) {
            return new Promise((resolve) => {
                setTimeout(resolve, ms);
            });

        }
    }
    console.log("Processo finalizado")
})

//envia o preço de um produtos para uma determinada loja
router.put('/enviaumproduto/:id/:loja', async (req, res) => {
    const { id, loja } = req.params
    async function enviaProdutoBling(transporta) {
        await axios.put(transporta.urlPost, transporta.body, transporta.headerBling)
            .then(() => { })
            .catch((erro) => { console.log(erro)})
        res.end()

    }

    await TabelaLojaProduto.findOne({ where: { produtoid: id, idLojaVirtual: loja } })
        .then((produto) => {
            let entrada = `<?xml version="1.0" encoding="UTF-8"?><produtosLoja><produtoLoja><idLojaVirtual>${produto.idProdutoLoja}</idLojaVirtual><preco><preco>${(produto.precoVenda)}</preco><precoPromocional>${produto.precoOferta}</precoPromocional></preco></produtoLoja></produtosLoja>`
            const headerBling = {
                headers: {
                    'Content-Type': 'text/xml',
                    'x-api-key': process.env.APIKEY,
                },
            };
            var urlPost = `https://bling.com.br/Api/v2/produtoLoja/${produto.idLojaVirtual}/${produto.produtoid}/json?xml=${encodeURI(entrada)}&apikey=${process.env.APIKEY}`
            let transporta = {
                urlPost: urlPost,
                body: "",
                headerBling: headerBling
            }
            console.log("oi")
            enviaProdutoBling(transporta)
        })
        .catch(() => { })
})


router.get('/produtosloja/:page/:loja/:marca/:tipo/:promocao', async (req, res) => {
    const { page = 1 } = req.params;
    const limit = 20;
    var lastPage = 1;
    var { marca } = req.params
    const { loja } = req.params
    const { tipo } = req.params
    const { pesquisa } = req.params
    
    const { promocao } = req.params

    let tipo2 = ""
    let tipo1 = ""

    if (tipo === "Todos") {
        tipo1 = "Simples"
        tipo2 = "Composto"
    }
    if (tipo === "Simples") {
        tipo1 = "Simples"
        tipo2 = "Simples"
    }
    if (tipo === "Composto") {
        tipo1 = "Composto"
        tipo2 = "Composto"
    }


    async function exibeMarca() {

        const { count, rows } = await TabelaLojaProduto.findAndCountAll({
            where: {
                lojaid: Number(loja),
                marca: marca,
                [Op.or]: [
                    { tipoSimplesComposto: tipo1 },
                    { tipoSimplesComposto: tipo2 }
                ]

            }
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

        await TabelaLojaProduto.findAll({
            attributes: ["name", "produtoid", "marca", "nameCategoria", "precoVenda", "precoOferta", "inicioOferta", "fimOferta", "inicioOfertaHora", "fimOfertaHora", "tipoSimplesComposto"],
            offset: Number(page * limit - limit),
            limit: limit,
            where: {
                lojaid: Number(loja),
                marca: marca,
                [Op.or]: [
                    { tipoSimplesComposto: tipo1 },
                    { tipoSimplesComposto: tipo2 }
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
    }

   

    async function exibeTudo() {
        const { count, rows } = await TabelaLojaProduto.findAndCountAll({
            where: {
                lojaid: Number(loja),
                [Op.or]: [
                    { tipoSimplesComposto: tipo1 },
                    { tipoSimplesComposto: tipo2 }
                ]
            }
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
        await TabelaLojaProduto.findAll({
            attributes: ["name", "produtoid", "marca", "nameCategoria", "precoVenda", "precoOferta", "inicioOferta", "fimOferta", "inicioOfertaHora", "fimOfertaHora", "tipoSimplesComposto"],
            offset: Number(page * limit - limit),
            limit: limit,
            where: {
                lojaid: Number(loja),
                [Op.or]: [
                    { tipoSimplesComposto: tipo1 },
                    { tipoSimplesComposto: tipo2 }
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
    }
    async function exibePromocao() {

        const { count, rows } = await TabelaLojaProduto.findAndCountAll({
            where: {
                lojaid: Number(loja),
                precoOferta: {
                    [Op.gt]: 0
                }
            }
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

        await TabelaLojaProduto.findAll({
            attributes: ["name", "produtoid", "marca", "nameCategoria", "precoVenda", "precoOferta", "inicioOferta", "fimOferta", "inicioOfertaHora", "fimOfertaHora", "tipoSimplesComposto"],
            offset: Number(page * limit - limit),
            limit: limit,
            where: {
                lojaid: Number(loja),
                precoOferta: {
                    [Op.gt]: 0
                }

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
    }


    promocao == "Promocao" ? exibePromocao() : (marca != "undefined" && marca != "Selecione Marca") ? exibeMarca() :  exibeTudo()

})


router.get('/produtosloja/:page/:loja/:pesquisa', async (req, res) => {
    const { page = 1 } = req.params;
    const limit = 20;
    var lastPage = 1;
    const { loja } = req.params
    const { pesquisa } = req.params
    const { count, rows } = await TabelaLojaProduto.findAndCountAll({
        where: {
            lojaid: Number(loja),
            [Op.or]: [
                {
                    marca:
                    {
                        [Op.like]: '%' + pesquisa + '%'
                    }
                },
                {
                    produtoid:
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
    await TabelaLojaProduto.findAll({
        attributes: ["name", "produtoid", "marca", "nameCategoria", "precoVenda", "precoOferta", "inicioOferta", "fimOferta", "inicioOfertaHora", "fimOfertaHora", "tipoSimplesComposto"],
        offset: Number(page * limit - limit),
        limit: limit,

        where: {
            lojaid: Number(loja),
            [Op.or]: [
                {
                    marca:
                    {
                        [Op.like]: '%' + pesquisa + '%'
                    }
                },
                {
                    produtoid:
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


router.get('/produtoloja/:loja/:id', async (req, res) => {
    const { loja, id } = req.params
    await TabelaLojaProduto.findOne(
        { where: { idLojaVirtual: loja, produtoid: id } }
    )
        .then((produto) => {
            return res.json(produto)
        })
        .catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Promoção não foi encontrado na loja!",
            });
        });


})

router.put('/produtoloja/:loja/:id', async (req, res) => {
    const { loja, id } = req.params
    const dados = req.body
    await TabelaLojaProduto.update(dados, { where: { idLojaVirtual: loja, produtoid: id } })
        .then(() => {

            return res.json({
                erro: false,
                mensagem: "Promoção na loja alterado com sucesso!",
            });
        })
        .catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Promoção não foi alterada na loja!",
            });
        });

})


router.get('/produtosloja/pesquisa/:loja', async (req, res) => {
    const { pesquisa } = req.params
    const { loja } = req.params
    await TabelaLojaProduto.findAll({
        where: {
            idLojaVirtual: loja,
        },

    })
        .then((produto) => {

            return res.json(produto)
        })
        .catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Não foram encontrdos produtos nesta loja",
            });
        });


})




module.exports = router