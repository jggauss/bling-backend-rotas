async function montaUrlSalvarBling(transfere) {
    const dadosProduto = transfere.dadosProduto
    const apikey = transfere.apikey
    console.log(transfere)

    let entrada = `<?xml version="1.0" encoding="UTF-8"?><produtosLoja><produtoLoja><idLojaVirtual>${dadosProduto.idProdutoLoja}</idLojaVirtual><preco><preco>${(dadosProduto.precoVenda)}</preco><precoPromocional>${dadosProduto.precoOferta}</precoPromocional></preco></produtoLoja></produtosLoja>`
    const headerBling = {
        headers: {
            'Content-Type': 'text/xml',
            'x-api-key': apikey,
        },
    };
    var urlPost = `https://bling.com.br/Api/v2/produtoLoja/${dadosProduto.idLojaVirtual}/${dadosProduto.produtoid}/json?xml=${encodeURI(entrada)}&apikey=${apikey}`
    let transporta = {
        urlPost: urlPost,
        body: "",
        headerBling: headerBling
    }
    
    return (transporta)
    
}

module.exports = montaUrlSalvarBling