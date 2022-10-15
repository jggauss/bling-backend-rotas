async function montaUrlSalvarBling(dadosProduto) {
    let entrada = `<?xml version="1.0" encoding="UTF-8"?><produtosLoja><produtoLoja><idLojaVirtual>${dadosProduto.idProdutoLoja}</idLojaVirtual><preco><preco>${(dadosProduto.precoVenda)}</preco><precoPromocional>${dadosProduto.precoOferta}</precoPromocional></preco></produtoLoja></produtosLoja>`
    const headerBling = {
        headers: {
            'Content-Type': 'text/xml',
            'x-api-key': process.env.APIKEY,
        },
    };
    var urlPost = `https://bling.com.br/Api/v2/produtoLoja/${dadosProduto.idLojaVirtual}/${dadosProduto.produtoid}/json?xml=${encodeURI(entrada)}&apikey=${process.env.APIKEY}`
    let transporta = {
        urlPost: urlPost,
        body: "",
        headerBling: headerBling
    }
    return (transporta)
    
}

module.exports = montaUrlSalvarBling