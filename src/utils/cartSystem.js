const { SERVICOS } = require("../../config");

const carrinhos = new Map();

function getCarrinho(userId) {
    if (!carrinhos.has(userId)) {
        carrinhos.set(userId, { items: [], total: 0 });
    }
    return carrinhos.get(userId);
}

function adicionarItem(userId, servicoId, quantidade = 1) {
    const carrinho = getCarrinho(userId);
    const servico = SERVICOS[servicoId];

    if (!servico) return false;

    const itemExistente = carrinho.items.find(item => item.id === servicoId);

    if (itemExistente) {
        itemExistente.quantidade += quantidade;
        itemExistente.subtotal = itemExistente.preco * itemExistente.quantidade;
    } else {
        carrinho.items.push({
            id: servicoId,
            nome: servico.nome,
            preco: servico.preco,
            quantidade: quantidade,
            subtotal: servico.preco * quantidade,
            emoji: servico.emoji,
            tempo: servico.tempo
        });
    }

    carrinho.total = carrinho.items.reduce((sum, item) => sum + item.subtotal, 0);
    return true;
}

function removerItem(userId, servicoId) {
    const carrinho = getCarrinho(userId);
    carrinho.items = carrinho.items.filter(item => item.id !== servicoId);
    carrinho.total = carrinho.items.reduce((sum, item) => sum + item.subtotal, 0);
}

function limparCarrinho(userId) {
    carrinhos.set(userId, { items: [], total: 0 });
}

module.exports = {
    getCarrinho,
    adicionarItem,
    removerItem,
    limparCarrinho
};
