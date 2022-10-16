const axios = require('axios');
const Categorias = require("../models/Categorias")
const Marcas = require("../models/Marcas")
const Produtos = require("../models/Produtos");
const espera = require('./delay');


async function PegaTodosProdutos(acesso) {
    console.log(acesso)
    var usuario = acesso.usuario
    const apikey = acesso.apikey
    console.log(usuario)
    console.log(typeof (usuario))
    var situacao = ""
    const dataHoje = new Date()
    var todosProdutos = 0
    var tamanho = 0
    for (let sit = 0; sit < 2; sit++) {

        if (sit === 0) situacao = "A"
        if (sit === 1) situacao = "I"

        for (var i = 1; i < 100; i++) {

            const urlPegaTodosProdutos = `https://bling.com.br/Api/v2/produtos/page=${i}/json/&filters=situacao[${situacao}]/&apikey=${apikey}`

            await axios.get(urlPegaTodosProdutos)
                .then((response) => {
                    todosProdutos = response.data.retorno.produtos
                    tamanho = todosProdutos.length
                    todosProdutos.map(async (produto) => {

                        const existe = await Produtos.findOne({
                            where: {
                                codigo: produto.produto.codigo,
                                usuario: usuario
                            }
                        })
                        //console.log(existe)
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
                            console.log("Não existe e estou salvando o usuário " + usuario)
                            //console.log(existe)
                            await Produtos.create(dados)
                                .then(() => { console.log("olha os dados " + dados.codigo + " " + dados.name + " " + dados.precoCusto) })
                                .catch(() => { console.log("não deu certo produtos") })
                            console.log("vou entrar no salvacategoria")
                            await Categorias.create(dadosCategoria)
                                .then(() => { })
                                .catch(() => { })
                            console.log("vou entrar no salvamarcas")
                            await Marcas.create(dadosMarca)
                                .then(() => { })
                                .catch(() => { })
                            console.log("salvei marca e categoria")

                        }

                        if (existe) {
                            console.log("existe e estou salvando o usuário " + usuario)
                            //console.log(existe)

                            await Produtos.update(dados, { where: { codigo: dados.codigo, usuario: usuario } })
                            // await Categorias.create(dadosCategoria)
                            //     .then(() => {})
                            //     .catch((err) => {})

                            // await Marcas.create(dadosMarca)
                            //     .then(() => {})
                            //     .catch((err) => {})
                        }
                    })
                })
                .catch((err) => {
                    console.log(err)
                })

            await espera(3000)
            console.log("olha o tamanho*******************************************")
            console.log(tamanho)
            if (tamanho < 99) { console.log("Processo finalizado") }
            if (tamanho < 99) { break }
        }
        // await Produtos.findAll()
        //     .then((todosProdutos) => {
        //         todosProdutos.map(async (produto) => {
        //             if (produto.updatedAt < dataHoje) {
        //                 await Produtos.destroy({ where: { codigo: produto.codigo,usuario:usuario } })
        //                     .then(() => { })
        //                     .catch(() => { });
        //             }
        //         })
        //     })
        //     .catch((err) => {
        //         return res.status(400).json({
        //             err: true,
        //             mensagem: "Erro: Não existem produtos no arquivo",
        //         });
        //     })
    }

}







module.exports = PegaTodosProdutos