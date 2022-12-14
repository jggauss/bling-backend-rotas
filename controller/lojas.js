const express = require('express');
var router = express.Router()
const yup = require("yup");
const { eAdmin } = require('../middlewares/auth');
const Lojas = require('../models/Lojas.js');
const TabelaLojaProduto = require('../models/TabelaLojaProduto.js');

//criar loja
router.post('/lojas',eAdmin, async (req, res) => {
    
    var dados = req.body
    const usuario = Number(req.userId)
    let schema = yup.object().shape({
        percentAcrescAcimaMinimo: yup.string("Erro. Margem Bruta deve ser preenchida").required("Erro. Margem Bruta deve ser preenchida"),
        comissao: yup.string("Erro. Comissão deve ser entre 0 e 40%").required("Erro. Comissão deve ser entre 0 e 40%"),
        codigo: yup.string("Erro. O código da loja no Bling dev ser preenchido. Você pode pegá-lo na configuração da loja no Bling")
            .required("Erro. O código da loja no Bling deve ser preenchido. Você pode pegá-lo na configuração da loja no Bling"),
        name: yup.string("Erro. O nome deve ser preenchido.").required("Erro. O nome deve ser preenchido."),
    })

    try {
        await schema.validate(dados)
    } catch (err) {
        return res.status(400).json({
            erro: true,
            mensagem: err.errors
        })
    }


    const user = await Lojas.findOne({
        where: {
            codigoBling: dados.codigo,
            usuario:usuario,
        },
    });
    if (user) {
        return res.status(400).json({
            erro: true,
            mensagem: "Erro: Este Loja já está cadastrada",
        });
    }

    await Lojas.create({
        name: dados.name,
        codigoBling: dados.codigo,
        comissao: Number(dados.comissao.replace(",", ".")),
        valorAcrescAbaixoMinimo: Number(dados.valorAcrescAbaixoMinimo.replace(",", ".")),
        percentAcrescAbaixoMinimo: Number(dados.percentAcrescAbaixoMinimo.replace(",", ".")),
        valorFixoFreteAbaixo: Number(dados.valorFixoFreteAbaixo.replace(",", ".")),
        valorPercentFreteAbaixo: Number(dados.valorPercentFreteAbaixo.replace(",", ".")),
        valorFreteGratis: Number(dados.valorFreteGratis.replace(",", ".")),
        valorAcresAcimaMinimo: Number(dados.valorAcresAcimaMinimo.replace(",", ".")),
        percentAcrescAcimaMinimo: Number(dados.percentAcrescAcimaMinimo.replace(",", ".")),
        valorFixoFreteAcima: Number(dados.valorFixoFreteAcima.replace(",", ".")),
        valorPercentFreteAcima: Number(dados.valorPercentFreteAcima.replace(",", ".")),
        aumentaValorPedidoMinimo: dados.aumentaValorPedidoMinimo,
        valorAcimaAumentaParaPedidoMinimo: Number(dados.valorAcimaAumentaParaPedidoMinimo.replace(",", ".")),
        usuario:usuario
    })
        .then(() => {
            return res.json({
                erro: false,
                mensagem: "Loja cadastrada com sucesso!",
            });
        })
        .catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Loja não foi cadastrada com sucesso!",
            });
        });
    res.end()
})

router.put('/loja/:id',eAdmin, async (req, res) => {
    var { id } = req.params
    const dados = req.body
    const usuario = Number(req.userId)
    let schema = yup.object().shape({
        percentAcrescAcimaMinimo: yup.string("Erro. Margem Bruta deve ser preenchida").required("Erro. Margem Bruta deve ser preenchida"),
        comissao: yup.string("Erro. Comissão deve ser entre 0 e 40%").required("Erro. Comissão deve ser entre 0 e 40%"),
        codigo: yup.string("Erro. O código da loja no Bling dev ser preenchido. Você pode pegá-lo na configuração da loja no Bling")
            .required("Erro. O código da loja no Bling deve ser preenchido. Você pode pegá-lo na configuração da loja no Bling"),
        name: yup.string("Erro. O nome deve ser preenchido.").required("Erro. O nome deve ser preenchido."),
    })

    try {
        await schema.validate(dados)
    } catch (err) {
        return res.status(400).json({
            erro: true,
            mensagem: err.errors
        })
    }


    await Lojas.update(dados, { where: { codigoBling: Number(id), usuario:usuario } })
        .then(() => {
            return res.json({
                erro: false,
                mensagem: "Loja alterada com sucesso!",
            });
        })
        .catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Loja não foi alterada com sucesso!",
            });
        });
})

//apaga a loja e TODOS OS PRODUTOS E PEDIDOS DA LOJA ***IRRECUPERAVEL
router.delete('/loja/:codigoBling',eAdmin, async (req, res) => {
    const { codigoBling } = req.params
    const usuario = Number(req.userId)
    await Lojas.destroy({ where: { codigoBling, usuario:usuario } })
        .then(() => {
        })
        .catch((err) => {
        });
        
        await TabelaLojaProduto.destroy({ where: { lojaid:codigoBling, usuario:usuario } })
        .then((response) => {
            return res.json({
                erro: false,
                mensagem: "Loja deletada com sucesso!",
            });
        })
        .catch((err) => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Loja não foi cadastrada com sucesso!",
            });
        });

})
router.get('/lojas',eAdmin, async (req, res) => {
    const usuario = Number(req.userId)
    await Lojas.findAll({
        where:{usuario:usuario},
        order: [["name", "ASC"]]
    })
        .then((Lojas) => {
            res.status(200).json(Lojas)
        })
        .catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Nenhuma Loja encontrada",
            });

        });
})

router.get('/lojas/:page',eAdmin, async (req, res) => {

    const { page = 1 } = req.params;
    const limit = 20;
    var lastPage = 1;
    const usuario = Number(req.userId)

    const countLojas = await Lojas.count({where:{usuario:usuario}})
    if (countLojas === null) {
        return res.status(400).json({
            erro: true,
            mensagem: "Erro. Nenhum produto encontrado"
        })
    } else {
        lastPage = Math.ceil(countLojas / limit)
    }


    await Lojas.findAll({
        where:{usuario:usuario},
        attributes: ["id", "name", "codigoBling", "comissao","usuario"],
        order: [["name", "DESC"]],
        offset: Number(page * limit - limit),
        limit: limit,

    })
        .then((lojas) => {
            res.json({
                erro: false,
                lojas,
                countLojas,
                lastPage
            })
        })
        .catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Nenhuma Loja encontrada",
            });

        });


})


router.get('/loja/:id',eAdmin, async (req, res) => {
    const { id } = req.params
    const usuario = Number(req.userId)
    await Lojas.findOne({where:{codigoBling:id, usuario:usuario}})
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

//dados da loja pelo código bling da loja e usuário
router.get('/lojabling/:id',eAdmin, async (req, res) => {
    const { id } = req.params
    const usuario = Number(req.userId)
    await Lojas.findOne({ where: { codigoBling: id,usuario:usuario } })
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


module.exports = router