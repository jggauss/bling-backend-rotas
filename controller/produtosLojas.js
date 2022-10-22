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
const api = require('../api');
const moment = require('moment');
const Produtos = require('../models/Produtos');
const FazUmProduto = require('../services/fazUmProduto');


//envia todos  os preços de uma loja para o bling
router.post('/precificaloja/:id', eAdmin, async (req, res) => {
    const { id } = req.params
    const usuario = req.userId
    const apikey = req.apikey
    const acesso = {
        usuario: usuario,
        apikey: apikey
    }

    await PegaTodosProdutos(acesso)

    const transfere = {
        codigoBling: id,
        usuario: usuario,
        apikey: apikey
    }
    await PrecificaProdutoLoja(transfere)
    console.log("Processo finalizado")
})
//envia o preço de um produtos para uma determinada loja

router.put('/enviaumproduto/:id/:loja', eAdmin, async (req, res) => {
    console.log("cheguei aqui")
    const { id, loja } = req.params
    const usuario = req.userId
    const apikey = req.apikey
    async function enviaProdutoBling(transporta) {
        
        await axios.put(transporta.urlPost, transporta.body, transporta.headerBling)
            .then((response) => { "deu certo " + response.data })
            .catch((erro) => { console.log("de errado  ===== " + erro) })
        res.end()

    }

    await TabelaLojaProduto.findOne({ where: { produtoid: id, idLojaVirtual: loja, usuario: usuario } })
        .then((produto) => {
            console.log("a bosta do produto")
            console.log(produto)
            let entrada = `<?xml version="1.0" encoding="UTF-8"?><produtosLoja><produtoLoja><idLojaVirtual>${produto.idProdutoLoja}</idLojaVirtual><preco><preco>${(produto.precoVenda)}</preco><precoPromocional>${produto.precoOferta}</precoPromocional></preco></produtoLoja></produtosLoja>`
            const headerBling = {
                headers: {
                    'Content-Type': 'text/xml',
                    'x-api-key': apikey,
                },
            };
            var urlPost = `https://bling.com.br/Api/v2/produtoLoja/${produto.idLojaVirtual}/${produto.produtoid}/json?xml=${encodeURI(entrada)}&apikey=${apikey}`
            let transporta = {
                urlPost: urlPost,
                body: "",
                headerBling: headerBling
            }

            enviaProdutoBling(transporta)
        })
        .catch(() => { })
})
//pega todos os produtos por loja
router.get('/produtosloja/:page/:loja/:marca/:tipo/:promocao/:situacao/:desconto', eAdmin, async (req, res) => {
    const { page = 1 } = req.params;
    const limit = 20;
    var lastPage = 1;
    var { marca } = req.params
    const { loja } = req.params
    const { tipo } = req.params
    const { situacao } = req.params
    const { desconto } = req.params
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

    let situacao1 = ""
    let situacao2 = ""

    if (situacao === "Todos") {
        situacao1 = "Ativo"
        situacao2 = "Inativo"
    }
    if (situacao === "Ativo") {
        situacao1 = "Ativo"
        situacao2 = "Ativo"
    }
    if (situacao === "Inativo") {
        situacao1 = "Inativo"
        situacao2 = "Inativo"
    }
    async function exibeMarca() {

        const { count, rows } = await TabelaLojaProduto.findAndCountAll({
            where: {
                idLojaVirtual: loja,
                marca: marca,
                usuario: usuario,

                [Op.and]: [
                    {
                        [Op.or]: [
                            { tipoSimplesComposto: tipo1 },
                            { tipoSimplesComposto: tipo2 },

                        ],
                    },
                    {
                        [Op.or]: [
                            { situacao: situacao1 },
                            { situacao: situacao2 }
                        ]
                    }
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
            attributes: ["name", "usuario", "produtoid", "situacao", "marca", "nameCategoria", "precoVenda", "precoOferta", "descontoPercent", "descontoValor", "acrescimoPercent", "acrescimoValor", "inicioOferta", "fimOferta", "inicioOfertaHora", "fimOfertaHora", "tipoSimplesComposto"],
            offset: Number(page * limit - limit),
            limit: limit,
            where: {
                idLojaVirtual: loja,
                marca: marca,
                usuario: usuario,

                [Op.and]: [
                    {
                        [Op.or]: [
                            { tipoSimplesComposto: tipo1 },
                            { tipoSimplesComposto: tipo2 },

                        ],
                    },
                    {
                        [Op.or]: [
                            { situacao: situacao1 },
                            { situacao: situacao2 }
                        ]
                    }
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
                usuario: usuario,

                [Op.and]: [
                    {
                        [Op.or]: [
                            { tipoSimplesComposto: tipo1 },
                            { tipoSimplesComposto: tipo2 },

                        ],
                    },
                    {
                        [Op.or]: [
                            { situacao: situacao1 },
                            { situacao: situacao2 }
                        ]
                    }
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
            attributes: ["name", "usuario", "produtoid", "marca", "situacao", "nameCategoria", "precoVenda", "precoOferta", "descontoPercent", "descontoValor", "acrescimoPercent", "acrescimoValor", "inicioOferta", "fimOferta", "inicioOfertaHora", "fimOfertaHora", "tipoSimplesComposto"],
            offset: Number(page * limit - limit),
            limit: limit,
            where: {
                idLojaVirtual: loja,
                usuario: usuario,
                [Op.and]: [
                    {
                        [Op.or]: [
                            { tipoSimplesComposto: tipo1 },
                            { tipoSimplesComposto: tipo2 },

                        ],
                    },
                    {
                        [Op.or]: [
                            { situacao: situacao1 },
                            { situacao: situacao2 }
                        ]
                    }
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
                usuario: usuario,

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
            attributes: ["name", "usuario", "produtoid", "marca", "situacao", "nameCategoria", "precoVenda", "precoOferta", "inicioOferta", "fimOferta", "inicioOfertaHora", "fimOfertaHora", "tipoSimplesComposto"],
            offset: Number(page * limit - limit),
            limit: limit,
            where: {
                idLojaVirtual: loja,
                usuario: usuario,

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
    async function exibeDesconto() {

        const { count, rows } = await TabelaLojaProduto.findAndCountAll({
            where: {
                idLojaVirtual: loja,
                usuario: usuario,
                [Op.or]:
                [
                    {descontoPercent: {
                    [Op.gt]: 0
                }},
                {descontoValor: {
                    [Op.gt]: 0
                }},
                {acrescimoPercent: {
                    [Op.gt]: 0
                }},
                {acrescimoValor: {
                    [Op.gt]: 0
                }},
            ],
                
                
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
            attributes: ["name", "usuario", "produtoid", "marca", "situacao", "nameCategoria", "precoVenda", "precoOferta","descontoPercent","descontoValor","acrescimoPercent","acrescimoValor", "inicioOferta", "fimOferta", "inicioOfertaHora", "fimOfertaHora", "tipoSimplesComposto"],
            offset: Number(page * limit - limit),
            limit: limit,
            where: {
                idLojaVirtual: loja,
                usuario: usuario,
                [Op.or]:
                [
                    {descontoPercent: {
                    [Op.gt]: 0
                }},
                {descontoValor: {
                    [Op.gt]: 0
                }},
                {acrescimoPercent: {
                    [Op.gt]: 0
                }},
                {acrescimoValor: {
                    [Op.gt]: 0
                }},
            ],

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
    desconto=="Desconto"?exibeDesconto():(promocao == "Promocao" ? exibePromocao() : (marca != "undefined" && marca != "Selecione Marca") ? exibeMarca() : exibeTudo())

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
            usuario: usuario,
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
        attributes: ["name", "usuario", "produtoid", "situacao", "marca", "nameCategoria", "precoVenda", "precoOferta", "inicioOferta", "fimOferta", "inicioOfertaHora", "fimOfertaHora", "tipoSimplesComposto"],
        offset: Number(page * limit - limit),
        limit: limit,

        where: {
            idLojaVirtual: loja,
            usuario: usuario,
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
router.get('/produtoloja/:loja/:id/:name', eAdmin, async (req, res) => {

    const { loja, id } = req.params
    const usuario = Number(req.userId)
    await TabelaLojaProduto.findOne(
        { where: { lojaid: loja, produtoid: id, usuario: usuario } }
    )
        .then((produto) => {
            return res.json(produto)
        })
        .catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Produto não foi encontrado na loja!",
            });
        });


})
//apaga/inclui/altera promoção
router.put('/produtoloja/:loja/:id', eAdmin, async (req, res) => {
    const { loja, id } = req.params
    const dadosOferta = req.body
    const usuario = Number(req.userId)
    await TabelaLojaProduto.update(dadosOferta, { where: { idLojaVirtual: loja, produtoid: id, usuario: usuario } })
        .then(() => {
            return res.json({
                erro: false,
                mensagem: "Promoção na loja alterado com sucesso!",
            });
        })
        .catch((erro) => {
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
            usuario: usuario,
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
    var usuario = Number(req.userId)
    const apikey = req.apikey
    const acesso = {
        usuario: usuario,
        apikey: apikey
    }

    await PegaTodosProdutos(acesso)

    //calcula os preços por cada loja e salva no mysql
    for (i = 0; i < lista.length; i++) {
        var id = lista[i].codigoBling
        var loja = await Lojas.findOne({ where: { codigoBling: id } })
        var codigoBling = loja.codigoBling

        var usuario = req.userId
        const transfere = {
            codigoBling: codigoBling,
            usuario: usuario,
            apikey: apikey
        }
        //pega todos os produtos que foram salvos no mysql para trabalhar cada loja
        await PrecificaProdutoLoja(transfere)
        await espera(350)
        console.log("Processo finalizado +++++++++++------------------8888888888888888888888888888888888888888888888888888888")
    }
})

//precifica um produto
router.post('/precificaumproduto/:produtoid/:loja',eAdmin, async (req,res)=>{
    const usuario = req.userId
    const apikey = req.apikey
    const {produtoid, loja}= req.params

    var dadosLoja = await Lojas.findOne({ where: { codigoBling: loja, usuario:usuario } })
    await Produtos.findOne({where:{ codigo:produtoid ,usuario:usuario}})
    .then((response)=>{
        const produtoCompleto = response
        let parametros = {
            produto:produtoid,
            codigoBling:loja,
            loja:dadosLoja,
            produtoCompleto : produtoCompleto,
            usuario : usuario,
            apikey:apikey
        }
        FazUmProduto(parametros)
        
    
        const transfere = {
            codigoBling:loja
        }
        
    })
    .catch((erro)=>{console.log("não há produtos"+erro)})
    await espera(1000)

})


module.exports = router