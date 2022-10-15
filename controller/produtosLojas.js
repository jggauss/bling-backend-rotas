const express = require('express');
var router = express.Router()

const { Op } = require("sequelize");

const Lojas = require('../models/Lojas')
const axios = require('axios');
const TabelaLojaProduto = require('../models/TabelaLojaProduto');
const { eAdmin } = require('../middlewares/auth');

const espera = require('../services/delay');
const PrecificaProdutoLoja = require('../services/precificaProdutoLoja');
const PegaTodosProdutos = require('../services/PegaTodosProdutos');


//envia todos  os preços de uma loja para o bling
router.post('/precos/:id', eAdmin, async (req, res) => {
    const { id } = req.params
    var usuario = req.userId
    const transfere = {
        codigoBling:id,
        usuario:usuario
    }
    console.log(transfere)
    console.log("vou entrar no precificaprodutoloja")
    await PrecificaProdutoLoja(transfere)
    console.log("Processo finalizado")
})
//envia o preço de um produtos para uma determinada loja

router.put('/enviaumproduto/:id/:loja', eAdmin, async (req, res) => {
    const { id, loja } = req.params
    const usuario = req.userId
    async function enviaProdutoBling(transporta) {
        await axios.put(transporta.urlPost, transporta.body, transporta.headerBling)
            .then((response) => { "deu certo " + response.data })
            .catch((erro) => { console.log("de errado  ===== " + erro) })
        res.end()

    }

    await TabelaLojaProduto.findOne({ where: { produtoid: id, idLojaVirtual: loja, usuario:usuario} })
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

            enviaProdutoBling(transporta)
        })
        .catch(() => { })
})
router.get('/produtosloja/:page/:loja/:marca/:tipo/:promocao', eAdmin, async (req, res) => {
    const { page = 1 } = req.params;
    const limit = 20;
    var lastPage = 1;
    var { marca } = req.params
    const { loja } = req.params
    const { tipo } = req.params
    const usuario = Number(req.userId)
    //const { pesquisa } = req.params

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
                idLojaVirtual: loja,
                marca: marca,
                usuario:usuario,
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
            attributes: ["name","usuario", "produtoid", "marca", "nameCategoria", "precoVenda", "precoOferta", "inicioOferta", "fimOferta", "inicioOfertaHora", "fimOfertaHora", "tipoSimplesComposto"],
            offset: Number(page * limit - limit),
            limit: limit,
            where: {
                idLojaVirtual: loja,
                marca: marca,
                usuario:usuario,
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
                idLojaVirtual: loja,
                usuario:usuario,
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
            attributes: ["name","usuario" ,"produtoid", "marca", "nameCategoria", "precoVenda", "precoOferta", "inicioOferta", "fimOferta", "inicioOfertaHora", "fimOfertaHora", "tipoSimplesComposto"],
            offset: Number(page * limit - limit),
            limit: limit,
            where: {
                idLojaVirtual: loja,
                usuario:usuario,
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
                idLojaVirtual: loja,
                usuario:usuario,
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
            attributes: ["name","usuario", "produtoid", "marca", "nameCategoria", "precoVenda", "precoOferta", "inicioOferta", "fimOferta", "inicioOfertaHora", "fimOfertaHora", "tipoSimplesComposto"],
            offset: Number(page * limit - limit),
            limit: limit,
            where: {
                idLojaVirtual: loja,
                usuario:usuario,
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
    //exibeTudo()
    promocao == "Promocao" ? exibePromocao() : (marca != "undefined" && marca != "Selecione Marca") ? exibeMarca() : exibeTudo()

})

router.get('/produtosloja/:page/:loja/:pesquisa', eAdmin, async (req, res) => {
    const { page = 1 } = req.params;
    const limit = 20;
    var lastPage = 1;
    const { loja } = req.params
    const { pesquisa } = req.params
    const usuario = Number(req.userId)
    const { count, rows } = await TabelaLojaProduto.findAndCountAll({
        where: {
            idLojaVirtual: loja,
            usuario:usuario,
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
        attributes: ["name","usuario", "produtoid", "marca", "nameCategoria", "precoVenda", "precoOferta", "inicioOferta", "fimOferta", "inicioOfertaHora", "fimOfertaHora", "tipoSimplesComposto"],
        offset: Number(page * limit - limit),
        limit: limit,

        where: {
            idLojaVirtual: loja,
            usuario:usuario,
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

//busca um produto de uma loja
router.get('/produtoloja/:loja/:id', eAdmin, async (req, res) => {

    const { loja, id } = req.params
    const usuario = Number(req.userId)
    await TabelaLojaProduto.findOne(
        { where: { lojaid: loja, produtoid: id, usuario:usuario } }
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
//apaga promoção
router.put('/produtoloja/:loja/:id', eAdmin, async (req, res) => {

    const { loja, id } = req.params
    const dados = req.body
    const usuario = Number(req.userId)

    await TabelaLojaProduto.update(dados, { where: { lojaid: loja, produtoid: id, usuario:usuario } })
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


router.get('/produtosloja/pesquisa/:loja', eAdmin, async (req, res) => {
    const { pesquisa } = req.params
    const { loja } = req.params
    const usuario = Number(req.userId)
    await TabelaLojaProduto.findAll({
        where: {
            idLojaVirtual: loja,
            usuario:usuario,
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

router.post('/precifica', eAdmin, async (req, res) => {

    var lista = req.body
    console.log("Este é o usuário")
    var usuario = Number(req.userId)
    console.log(usuario)
    await PegaTodosProdutos(usuario)
    
    //calcula os preços por cada loja e salva no mysql
    for (i = 0; i < lista.length; i++) {
        var id = lista[i].codigoBling
       console.log("olha o número da loja ")
       console.log(id)
        console.log(i)
        var loja = await Lojas.findOne({ where: { codigoBling: id } })
        var codigoBling = loja.codigoBling
        
        var usuario = req.userId
       const transfere = {
        codigoBling : codigoBling,
        usuario : usuario
       }
        //pega todos os produtos que foram salvos no mysql para trabalhar cada loja
        await PrecificaProdutoLoja(transfere)
        await espera(350)
        console.log("Processo finalizado +++++++++++------------------8888888888888888888888888888888888888888888888888888888")
    }
})



module.exports = router