
function calculaPrecoFinal(dadosCalculo){

    var B = Number(dadosCalculo.loja.percentAcrescAcimaMinimo) / 100 || 0
    var C = Number(dadosCalculo.loja.valorPercentFreteAcima) / 100 || 0
    var D = Number(dadosCalculo.loja.valorFixoFreteAcima)
    var valorFreteGratis = Number(dadosCalculo.loja.valorFreteGratis)
    var bBarato = Number(dadosCalculo.loja.percentAcrescAbaixoMinimo) / 100 || 0
    var cBarato = Number(dadosCalculo.loja.valorAcrescAbaixoMinimo)
    var F = Number(dadosCalculo.loja.valorAcimaAumentaParaPedidoMinimo)
    var A = Number(dadosCalculo.A)
    var precoInicial = Number(A * (1 + B) * (1 + (C)) + D)

    var precoFinal = Number(precoInicial)

    if ((precoInicial < Number(valorFreteGratis))) {

        Number(bBarato === 0) ? bBarato = Number(B) : bBarato

        var precoBarato = Number(A * (1 + (bBarato)) + (cBarato))

        if (Number(precoBarato) === 0) {
            precoBarato = Number(valorFreteGratis)

        }
        if ((Number(precoBarato) > Number(F)) && (Number(precoBarato < valorFreteGratis))) {
            precoBarato = (Number(valorFreteGratis))
        }

        precoFinal = Number(precoBarato)
    }


    return precoFinal

}

module.exports = calculaPrecoFinal