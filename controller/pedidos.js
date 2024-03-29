const express = require('express');
var router = express.Router()
const Lojas = require('../models/Lojas')
const axios = require('axios');
const Pedidos = require('../models/Pedidos');
const PedidosItens = require('../models/PedidosItens');
const { eAdmin } = require('../middlewares/auth');
const espera = require('../services/delay');



router.get('/pedido/loja/:id',eAdmin, async (req, res) => {
    const { id } = req.params
    const usuario = Number(req.userId)
    await Lojas.findOne({ where: { codigoBling: id, usuario:usuario} })
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



router.post('/pedidos',eAdmin, async (req, res) => {
    console.log("cheguei nos p")
    const apikey = req.apikey
    const usuario = Number(req.userId)
    for (let volta = 1; volta < 100; volta++) {
        const { inicioIntervalo, fimIntervalo } = req.body
        var qtdRegistros = 0
        const urlPegaPedidos = `https://bling.com.br/Api/v2/pedidos/page=${volta}/json/&filters=dataEmissao[${inicioIntervalo} TO ${fimIntervalo}]/&apikey=${apikey}`
        
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
                    usuario:usuario,
                }
                async function salvaPedidos(dados) {
                    await Pedidos.create(dados)
                        .then(() => {
                             })
                        .catch((err) => { 
                            console.log(err)})
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
                    dados.usuario = usuario
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
                            usuario:usuario,
                        }

                        for (let a = 0; a < tamanhoItens; a++) {
                            dadosItens.numeroPedidoLoja = dados.numeroPedidoLoja
                            dadosItens.codigo = itens[a].item.codigo
                            dadosItens.descricao = itens[a].item.descricao
                            dadosItens.quantidade = itens[a].item.quantidade
                            dadosItens.valorUnidade = itens[a].item.valorunidade
                            dadosItens.precoCusto = itens[a].item.precocusto
                            dadosItens.descontoItem = itens[a].item.descontoItem
                            dadosItens.usuario = usuario
                            somaCusto = Number(somaCusto) + (Number(itens[a].item.precocusto) * itens[a].item.quantidade)
                            const existe = async () => await Pedidos.findOne({ where: { numeroPedidoLoja: dadosItens.numeroPedidoLoja, usuario:usuario } })
                            existe ? salvaItens(dadosItens) : null
                        }
                    }
                    dados.totalCustoProdutos = Number(somaCusto)
                    salvaPedidos(dados)
                }
            })
            .catch(() => { })
        await espera(1015);
        
        if (qtdRegistros <= 99) { break }
    }
}
)


router.get('/pedidos/listar/:loja',eAdmin, async (req, res) => {
    const { loja } = req.params
    const usuario = Number(req.userId)
    await Pedidos.findAll({
        where:
            { idLojaVirtual: loja,
            usuario:usuario
        },
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

router.get('/pedido/:id',eAdmin, async (req, res) => {
    const { id } = req.params
    const usuario = Number(req.userId)
    await Pedidos.findOne({ where: { numeroPedidoLoja: id, usuario:usuario } })
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
router.get('/pedido/itens/:id',eAdmin, async (req, res) => {
    const { id } = req.params
    const usuario = Number(req.userId)
    await PedidosItens.findAll({ where: { numeroPedidoLoja: id, usuario:usuario } })
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

module.exports = router