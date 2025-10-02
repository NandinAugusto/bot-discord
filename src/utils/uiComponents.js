const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const { SERVICOS, PIX_CONFIG } = require("../../config");
const { getCarrinho } = require("./cartSystem");

function criarDropdownServicos() {
    const servicosArray = Object.values(SERVICOS).slice(0, 25);

    const options = servicosArray.map(servico => 
        new StringSelectMenuOptionBuilder()
            .setLabel(`${servico.nome}`)
            .setDescription(`R$ ${servico.preco.toFixed(2).replace(".", ",")} • ${servico.tempo}`)
            .setValue(servico.id)
            .setEmoji(servico.emoji)
    );

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("select_servico")
        .setPlaceholder("🎮 Escolha um serviço para adicionar ao carrinho")
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(options);

    return new ActionRowBuilder().addComponents(selectMenu);
}

function criarDropdownQuantidade(servicoId) {
    const options = [];
    for (let i = 1; i <= 10; i++) {
        options.push(
            new StringSelectMenuOptionBuilder()
                .setLabel(`${i}x`)
                .setDescription(`Adicionar ${i} ${i === 1 ? "unidade" : "unidades"}`)
                .setValue(`${servicoId}_${i}`)
        );
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("select_quantidade")
        .setPlaceholder("📦 Escolha a quantidade")
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(options);

    return new ActionRowBuilder().addComponents(selectMenu);
}

function criarCarrinhoEmbed(userId, user) {
    const carrinho = getCarrinho(userId);

    if (carrinho.items.length === 0) {
        return new EmbedBuilder()
            .setTitle("🛒 Carrinho - " + user.displayName)
            .setDescription("**Carrinho vazio**\n\n🎮 Selecione serviços no menu para começar!")
            .addFields([
                { name: "💰 Total", value: "R$ 0,00", inline: true },
                { name: "📦 Itens", value: "0", inline: true },
                { name: "⏱️ Status", value: "Aguardando", inline: true }
            ])
            .setColor(0x5865F2)
            .setTimestamp();
    }

    const itensLista = carrinho.items.map((item, index) => 
        `**${index + 1}.** ${item.emoji} **${item.nome}** (**${item.quantidade}x**)\n` +
        `💰 R$ ${item.subtotal.toFixed(2).replace(".", ",")} • ⏱️ ${item.tempo}`
    ).join("\n\n");

    return new EmbedBuilder()
        .setTitle(`🛒 Carrinho - ${user.displayName}`)
        .setDescription(`🎉 **Seus serviços selecionados:**\n\n${itensLista}`)
        .addFields([
            { name: "💰 VALOR TOTAL", value: `**R$ ${carrinho.total.toFixed(2).replace(".", ",")}**`, inline: true },
            { name: "📦 Total de Itens", value: carrinho.items.reduce((sum, item) => sum + item.quantidade, 0).toString(), inline: true },
            { name: "⏱️ Status", value: "Pronto para finalizar", inline: true }
        ])
        .setColor(0x00D4AA)
        .setFooter({ text: `${carrinho.items.length} tipos de serviços • Use os botões para gerenciar` })
        .setTimestamp();
}

function criarPagamentoEmbed(userId, user) {
    const carrinho = getCarrinho(userId);

    const resumoDetalhado = carrinho.items.map((item, index) => 
        `**${index + 1}.** ${item.emoji} **${item.nome}** (**${item.quantidade}x**)\n` +
        `    💰 R$ ${item.subtotal.toFixed(2).replace(".", ",")} • ⏱️ ${item.tempo}`
    ).join("\n\n");

    const totalItens = carrinho.items.reduce((sum, item) => sum + item.quantidade, 0);

    return new EmbedBuilder()
        .setTitle("💳 🎉 PEDIDO FINALIZADO!")
        .setDescription(
            `**Parabéns ${user.displayName}!**\n\n` +
            `**📋 RESUMO DO PEDIDO:**\n\n${resumoDetalhado}\n\n` +
            `📦 **TOTAL DE SERVIÇOS:** ${totalItens}\n` +
            `💰 **VALOR TOTAL:** R$ ${carrinho.total.toFixed(2).replace(".", ",")}`
        )
        .addFields([
            { 
                name: "💳 Dados PIX", 
                value: `**Chave:** ${PIX_CONFIG.chave}\n**Nome:** ${PIX_CONFIG.nome}\n**Banco:** ${PIX_CONFIG.banco}`,
                inline: false 
            },
            { 
                name: "📱 Instruções", 
                value: 
                    `1️⃣ Faça PIX: **R$ ${carrinho.total.toFixed(2).replace(".", ",")}**\n` +
                    `2️⃣ Envie comprovante aqui\n` +
                    `3️⃣ Aguarde confirmação Hellza\n` +
                    `4️⃣ Serviços iniciados após confirmação`,
                inline: false 
            },
            { 
                name: "🔄 Próximo Passo", 
                value: "Aguardando comprovante e confirmação administrativa Hellza.",
                inline: false 
            }
        ])
        .setColor(0x32CD32)
        .setFooter({ text: "⚠️ Thread única • Aguardando Hellza • NÃO usamos hack/cheats" })
        .setTimestamp();
}

function criarBotoesCarrinho() {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("atualizar_carrinho")
                .setLabel("🔄")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("remover_item")
                .setLabel("➖ Remover")
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId("limpar_carrinho")
                .setLabel("🧹 Limpar")
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId("finalizar_pedido")
                .setLabel("💳 Finalizar")
                .setStyle(ButtonStyle.Success)
        );
}

function criarBotaoAdminFinalizar(threadId) {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`admin_finalizar_${threadId}`)
                .setLabel("👑 Finalizar Serviço")
                .setStyle(ButtonStyle.Primary)
                .setEmoji("✅")
        );
}

function criarDropdownRemover(userId) {
    const carrinho = getCarrinho(userId);

    if (carrinho.items.length === 0) return null;

    const options = carrinho.items.map(item => 
        new StringSelectMenuOptionBuilder()
            .setLabel(`${item.nome} (${item.quantidade}x)`)
            .setDescription(`R$ ${item.subtotal.toFixed(2).replace(".", ",")}`)
            .setValue(item.id)
            .setEmoji(item.emoji)
    );

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("confirmar_remocao")
        .setPlaceholder("🗑️ Escolha o item para remover")
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(options);

    return new ActionRowBuilder().addComponents(selectMenu);
}

module.exports = {
    criarDropdownServicos,
    criarDropdownQuantidade,
    criarCarrinhoEmbed,
    criarPagamentoEmbed,
    criarBotoesCarrinho,
    criarBotaoAdminFinalizar,
    criarDropdownRemover
};
