const api = require("./api")
var cors = require("cors");
const yup = require("yup")
const express = require('express');
const axios = require('axios')
const bodyParser = require('body-parser')
require('body-parser-xml')(bodyParser);
require("dotenv").config();
const app = express()

const path = require("path")
const Lojas = require('./models/Lojas')
const Produtos = require('./models/Produtos')
const TabelaLojaProduto = require('./models/TabelaLojaProduto');
const Marcas = require("./models/Marcas")
const Categorias = require("./models/Categorias")
const Pedidos = require("./models/Pedidos")
const PedidosItens = require("./models/PedidosItens")
var convert = require('xml-js');
const { Op } = require("sequelize");






app.use(express.json())
app.use(bodyParser.json())

app.use('/files', express.static(path.resolve(__dirname, "public", 'upload')))
app.use((req, res, next) => {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header(" Access-Control-Allow-Methods", "GET", "PUT", "POST", "DELETE");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept",
        "X-PINGOTHER,Content-Type, Authorization",
        "Access-Control-Max-Age, 46000"
    );
    app.use(cors());
    next();
});
app.use(bodyParser.xml());
app.use(
    bodyParser.xml({
        limit: '1MB', // Reject payload bigger than 1 MB
        xmlParseOptions: {
            normalize: true, // Trim whitespace inside text nodes
            normalizeTags: true, // Transform tags to lowercase
            explicitArray: false, // Only put nodes in array if >1
        },
    }),
);


app.listen(8001, () => {
    //console.log(`Servidor rodando na porta ${process.env.PORT}`)
})

var urlPegaPedidos = `https://bling.com.br/Api/v2/pedidos/json/&apikey=${process.env.APIKEY}`
axios.get(urlPegaPedidos)
    .then(() => { })
    .catch(() => { })


app.get('/', (req, res) => {
    return res.send("Página principal api bling")
})



//envia o preço para o bling
app.post('/precos/:id', async (req, res) => {
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


app.put('/enviaumproduto/:id/:loja', async (req, res) => {
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




app.get('/pedido/loja/:id', async (req, res) => {
    const { id } = req.params

    await Lojas.findOne({ where: { codigoBling: id } })
        .then((loja) => {
            res.status(200).json(loja)
        })
        .catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Nenhuma Loja encontrada",
            });

        });


})


//pega todos os produtos no arquivo de produtos
app.get('/produtos/:page/:marca/:categoria', async (req, res) => {
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

app.get('/produtos/:page/:pesquisa', async (req, res) => {
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


app.get('/marcas', async (req, res) => {

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

app.get('/categorias', async (req, res) => {

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


app.get('/produtosloja/:page/:loja/:marca/:tipo/:promocao', async (req, res) => {
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


app.get('/produtosloja/:page/:loja/:pesquisa', async (req, res) => {
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


app.get('/produtoloja/:loja/:id', async (req, res) => {
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

app.put('/produtoloja/:loja/:id', async (req, res) => {
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


app.get('/produtosloja/pesquisa/:loja', async (req, res) => {
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



app.post('/pedidos', async (req, res) => {

    for (let volta = 1; volta < 100; volta++) {


        const { inicioIntervalo, fimIntervalo } = req.body
        var qtdRegistros = 0
        const urlPegaPedidos = `https://bling.com.br/Api/v2/pedidos/page=${volta}/json/&filters=dataEmissao[${inicioIntervalo} TO ${fimIntervalo}]/&apikey=${process.env.APIKEY}`
        axios.get(urlPegaPedidos)
            .then((response) => {
                qtdRegistros = response.data.retorno.pedidos.length
                let dados = {
                    cpfCnpj: '',
                    nomeCliente: '',
                    data: null,
                    valorFrete: 0,
                    outrasDespesas: 0,
                    totalProdutos: 0,
                    totalDesconto: '',
                }
                async function salvaPedidos(dados) {
                    await Pedidos.create(dados)
                        .then(() => { })
                        .catch(() => { })
                }
                async function salvaItens(dadosItens) {
                    await PedidosItens.create(dadosItens)
                        .then(() => { })
                        .catch(() => { })
                }
                for (let i = 0; i <= qtdRegistros; i++) {
                    let dado = response.data.retorno.pedidos[i]
                    let itens = response.data.retorno.pedidos[i].pedido.itens
                    let tamanhoItens = itens.length
                    dados.numeroPedidoLoja = dado.pedido.loja + "-" + dado.pedido.numeroPedidoLoja
                    dados.cpfCnpj = dado.pedido.cliente.cnpj
                    dados.nomeCliente = dado.pedido.cliente.nome
                    dados.data = dado.pedido.data
                    dados.valorFrete = Number(dado.pedido.valorfrete)
                    dados.outrasDespesas = Number(dado.pedido.outrasdespesas)
                    dados.totalProdutos = Number(dado.pedido.totalprodutos)
                    dados.totalVenda = Number(dado.pedido.totalvenda)
                    dados.totalDesconto = dado.pedido.desconto.replace(",", ".")
                    dados.situacao = dado.pedido.situacao
                    dados.idLojaVirtual = dado.pedido.loja
                    var somaCusto = 0
                    if (tamanhoItens > 0) {
                        let dadosItens = {
                            numeroPedidoLoja: '',
                            codigo: '',
                            descricao: '',
                            quantidade: '',
                            valorPorUnidade: '',
                            precoCusto: '',
                            descontoItem: '',
                            totalCustoProdutos: 0,
                        }

                        for (let a = 0; a < tamanhoItens; a++) {
                            dadosItens.numeroPedidoLoja = dados.numeroPedidoLoja
                            dadosItens.codigo = itens[a].item.codigo
                            dadosItens.descricao = itens[a].item.descricao
                            dadosItens.quantidade = itens[a].item.quantidade
                            dadosItens.valorUnidade = itens[a].item.valorunidade
                            dadosItens.precoCusto = itens[a].item.precocusto
                            dadosItens.descontoItem = itens[a].item.descontoItem
                            somaCusto = Number(somaCusto) + (Number(itens[a].item.precocusto) * itens[a].item.quantidade)
                            const existe = async () => await Pedidos.findOne({ where: { numeroPedidoLoja: dadosItens.numeroPedidoLoja } })
                            existe ? salvaItens(dadosItens) : null
                        }
                    }
                    dados.totalCustoProdutos = Number(somaCusto)
                    salvaPedidos(dados)
                }
            })
            .catch(() => { })
        await sleep(1015);
        function sleep(ms) {
            return new Promise((resolve) => {
                setTimeout(resolve, ms);
            });

        }



        if (qtdRegistros <= 99) { break }
    }
}
)


app.get('/pedidos/listar/:loja', async (req, res) => {
    const { loja } = req.params
    await Pedidos.findAll({
        where:
            { idLojaVirtual: loja },
        order: [["data", "DESC"]]
    })
        .then((produto) => {

            return res.json(produto)
        })
        .catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Não foram encontrados pedidos!",
            });
        });
})

app.get('/pedido/:id', async (req, res) => {
    const { id } = req.params
    await Pedidos.findOne({ where: { numeroPedidoLoja: id } })
        .then((pedido) => {
            return res.json(pedido)
        })
        .catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Promoção não foi alterado na loja!",
            });
        });
})
app.get('/pedido/itens/:id', async (req, res) => {
    const { id } = req.params
    await PedidosItens.findAll({ where: { numeroPedidoLoja: id } })
        .then((pedidoItens) => {
            return res.json(pedidoItens)
        })
        .catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Promoção não foi alterado na loja!",
            });
        });
})