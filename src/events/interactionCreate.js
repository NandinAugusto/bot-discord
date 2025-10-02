const { Events, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { getCarrinho, adicionarItem, removerItem, limparCarrinho } = require("../utils/cartSystem");
const { isHellzaAdmin, isSuporteAdmin } = require("../utils/permissions");
const { isThreadFinalizada, finalizarThread, removerThreadAtiva } = require("../utils/threadManager");
const { 
    criarDropdownServicos, 
    criarDropdownQuantidade, 
    criarCarrinhoEmbed, 
    criarPagamentoEmbed, 
    criarBotoesCarrinho, 
    criarBotaoAdminFinalizar, 
    criarDropdownRemover 
} = require("../utils/uiComponents");
const { SERVICOS, CARGO_CLIENTE_COMPROU, CARGO_SERVICO_EM_ANDAMENTO } = require("../../config");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.isStringSelectMenu() && !interaction.isButton()) return;

        const userId = interaction.user.id;
        const user = interaction.user;
        const member = interaction.member;
        const thread = interaction.channel;
        const threadId = thread?.id;

        try {
            // Verifica se a thread foi finalizada
            if (isThreadFinalizada(threadId) && !isHellzaAdmin(member) && !isSuporteAdmin(member)) {
                await interaction.reply({
                    content: '🔒 **Thread Finalizada pela Administração**\n\nEsta thread foi finalizada por um administrador Hellza. Apenas a equipe administrativa pode interagir aqui.\n\n✅ **Para novos serviços:** Volte ao canal público e reaja 🛒 na mensagem fixada oficial.',
                    ephemeral: true
                });
                return;
            }

            // Lógica para seleção de serviço (dropdown)
            if (interaction.customId === 'select_servico') {
                const servicoId = interaction.values[0];
                const servico = SERVICOS[servicoId];

                if (!servico) {
                    await interaction.reply({ content: 'Serviço não encontrado.', ephemeral: true });
                    return;
                }

                // Se o serviço já estiver no carrinho, permite alterar a quantidade
                const carrinho = getCarrinho(userId);
                const itemExistente = carrinho.items.find(item => item.id === servicoId);

                if (itemExistente) {
                    await interaction.reply({
                        content: `📦 **${servico.nome}** já está no seu carrinho. Escolha a nova quantidade:`, 
                        components: [criarDropdownQuantidade(servicoId)],
                        ephemeral: true
                    });
                } else {
                    // Adiciona 1 unidade por padrão e pergunta se quer mais
                    adicionarItem(userId, servicoId, 1);
                    const carrinhoEmbed = criarCarrinhoEmbed(userId, user);
                    const dropdown = criarDropdownServicos();
                    const buttons = criarBotoesCarrinho();

                    await interaction.update({
                        embeds: [carrinhoEmbed],
                        components: [dropdown, buttons]
                    });

                    await interaction.followUp({
                        content: `✅ **${servico.nome}** adicionado ao carrinho. Deseja adicionar mais unidades?`, 
                        components: [criarDropdownQuantidade(servicoId)],
                        ephemeral: true
                    });
                }
            }

            // Lógica para seleção de quantidade (dropdown)
            if (interaction.customId === 'select_quantidade') {
                const [servicoId, quantidadeStr] = interaction.values[0].split('_');
                const quantidade = parseInt(quantidadeStr);

                const servico = SERVICOS[servicoId];
                if (!servico) {
                    await interaction.reply({ content: 'Serviço não encontrado.', ephemeral: true });
                    return;
                }

                // Remove o item existente e adiciona com a nova quantidade
                removerItem(userId, servicoId);
                adicionarItem(userId, servicoId, quantidade);

                const carrinhoEmbed = criarCarrinhoEmbed(userId, user);
                const dropdown = criarDropdownServicos();
                const buttons = criarBotoesCarrinho();

                await interaction.update({
                    embeds: [carrinhoEmbed],
                    components: [dropdown, buttons]
                });

                await interaction.followUp({ content: `📦 Quantidade de **${servico.nome}** atualizada para **${quantidade}x**.`, ephemeral: true });
            }

            // Lógica para botões do carrinho
            if (interaction.customId === 'atualizar_carrinho') {
                const carrinhoEmbed = criarCarrinhoEmbed(userId, user);
                const dropdown = criarDropdownServicos();
                const buttons = criarBotoesCarrinho();

                await interaction.update({
                    embeds: [carrinhoEmbed],
                    components: [dropdown, buttons]
                });
            }

            if (interaction.customId === 'remover_item') {
                const carrinho = getCarrinho(userId);
                if (carrinho.items.length === 0) {
                    await interaction.reply({ content: 'Seu carrinho já está vazio!', ephemeral: true });
                    return;
                }
                const dropdownRemover = criarDropdownRemover(userId);
                await interaction.reply({
                    content: '🗑️ Escolha qual item deseja remover:',
                    components: [dropdownRemover],
                    ephemeral: true
                });
            }

            if (interaction.customId === 'confirmar_remocao') {
                const servicoId = interaction.values[0];
                const servico = SERVICOS[servicoId];

                removerItem(userId, servicoId);

                const carrinhoEmbed = criarCarrinhoEmbed(userId, user);
                const dropdown = criarDropdownServicos();
                const buttons = criarBotoesCarrinho();

                await interaction.update({
                    embeds: [carrinhoEmbed],
                    components: [dropdown, buttons]
                });

                await interaction.followUp({ content: `🗑️ **${servico.nome}** removido do carrinho.`, ephemeral: true });
            }

            if (interaction.customId === 'limpar_carrinho') {
                limparCarrinho(userId);
                const carrinhoEmbed = criarCarrinhoEmbed(userId, user);
                const dropdown = criarDropdownServicos();
                const buttons = criarBotoesCarrinho();

                await interaction.update({
                    embeds: [carrinhoEmbed],
                    components: [dropdown, buttons]
                });

                await interaction.followUp({ content: '🧹 Seu carrinho foi limpo!', ephemeral: true });
            }

            if (interaction.customId === 'finalizar_pedido') {
                const carrinho = getCarrinho(userId);
                if (carrinho.items.length === 0) {
                    await interaction.reply({ content: 'Seu carrinho está vazio. Adicione itens antes de finalizar!', ephemeral: true });
                    return;
                }

                const pagamentoEmbed = criarPagamentoEmbed(userId, user);
                const adminButton = criarBotaoAdminFinalizar(threadId);

                await interaction.update({
                    embeds: [pagamentoEmbed],
                    components: [adminButton]
                });

                // Adiciona o cargo 

                // Adiciona o cargo 'Serviço em Andamento' ao cliente
                const clienteMember = interaction.member;
                const cargoEmAndamento = interaction.guild.roles.cache.find(role => role.name === CARGO_SERVICO_EM_ANDAMENTO);
                if (cargoEmAndamento && clienteMember) {
                    if (!clienteMember.roles.cache.has(cargoEmAndamento.id)) {
                        await clienteMember.roles.add(cargoEmAndamento);
                        console.log(`[Cargo] Adicionado '${CARGO_SERVICO_EM_ANDAMENTO}' para ${clienteMember.user.tag}`);
                    }
                }

                await thread.send(`✅ ${user}, seu pedido foi finalizado! A equipe Hellza já foi notificada e aguarda seu comprovante de PIX. Você recebeu o cargo '${CARGO_SERVICO_EM_ANDAMENTO}'.`);

                // Envia notificação para os admins
                const adminChannel = interaction.guild.channels.cache.find(c => c.name.toLowerCase().includes('logs') || c.name.toLowerCase().includes('admin'));
                if (adminChannel && adminChannel.isTextBased()) {
                    await adminChannel.send(`🔔 **NOVO PEDIDO!** O usuário ${user} (ID: ${userId}) finalizou um pedido na thread ${thread.name} (${thread.url}). Ele recebeu o cargo '${CARGO_SERVICO_EM_ANDAMENTO}'.`);
                }
            }

            // Lógica para o botão de finalização do administrador
            if (interaction.customId.startsWith('admin_finalizar_')) {
                if (!isHellzaAdmin(member) && !isSuporteAdmin(member)) {
                    await interaction.reply({ content: '🚫 Você não tem permissão para finalizar serviços.', ephemeral: true });
                    return;
                }

                const clienteMember = await thread.guild.members.fetch(thread.ownerId);

                // 1. ADICIONA CARGO "Já comprou" ao cliente
                const cargoComprador = thread.guild.roles.cache.find(role => role.name === CARGO_CLIENTE_COMPROU);
                if (cargoComprador && clienteMember) {
                    if (!clienteMember.roles.cache.has(cargoComprador.id)) {
                        await clienteMember.roles.add(cargoComprador);
                        console.log(`[Cargo] Adicionado '${CARGO_CLIENTE_COMPROU}' para ${clienteMember.user.tag}`);
                    }
                }

                // 2. REMOVE CARGO "Serviço em Andamento" do cliente
                const cargoEmAndamento = thread.guild.roles.cache.find(role => role.name === CARGO_SERVICO_EM_ANDAMENTO);
                if (cargoEmAndamento && clienteMember) {
                    if (clienteMember.roles.cache.has(cargoEmAndamento.id)) {
                        await clienteMember.roles.remove(cargoEmAndamento);
                        console.log(`[Cargo] Removido '${CARGO_SERVICO_EM_ANDAMENTO}' de ${clienteMember.user.tag}`);
                    }
                }

                // Finaliza a thread no sistema de controle
                finalizarThread(threadId, member.id);
                removerThreadAtiva(clienteMember.id);
                limparCarrinho(clienteMember.id);

                // Remove o cliente da thread
                try {
                    await thread.members.remove(clienteMember.id);
                    console.log(`👤 Cliente ${clienteMember.user.tag} removido da thread ${thread.name}`);
                } catch (error) {
                    console.error(`❌ Erro ao remover cliente da thread:`, error.message);
                }

                // Renomeia a thread e a arquiva
                const oldName = thread.name;
                const newName = `✅-finalizado-${oldName.replace("🛒-loja-", "")}`;
                await thread.setName(newName);
                await thread.setArchived(true);

                await interaction.update({
                    content: `✅ Serviço finalizado por ${member.displayName}. Cliente ${clienteMember.user.tag} recebeu o cargo '${CARGO_CLIENTE_COMPROU}' e teve o cargo '${CARGO_SERVICO_EM_ANDAMENTO}' removido. A thread foi arquivada.`, 
                    embeds: [], 
                    components: []
                });

                // Envia notificação para o cliente por DM
                try {
                    await clienteMember.send(
                        `🎉 **Seu serviço na loja privada ${oldName} foi finalizado pela equipe Hellza!**\n\n` +
                        `Você recebeu o cargo '${CARGO_CLIENTE_COMPROU}' e o cargo '${CARGO_SERVICO_EM_ANDAMENTO}' foi removido.\n\n` +
                        `A thread foi arquivada. Sinta-se à vontade para criar uma nova loja privada reagindo 🛒 na mensagem fixada oficial para futuros serviços!`
                    );
                } catch (dmError) {
                    console.error(`❌ Não foi possível enviar DM de finalização para ${clienteMember.user.tag}:`, dmError.message);
                }

                // Envia notificação para o canal de logs/admin
                const adminChannel = interaction.guild.channels.cache.find(c => c.name.toLowerCase().includes('logs') || c.name.toLowerCase().includes('admin'));
                if (adminChannel && adminChannel.isTextBased()) {
                    await adminChannel.send(`✅ **SERVIÇO FINALIZADO!** O administrador ${member.user.tag} finalizou o serviço do usuário ${clienteMember.user.tag} (ID: ${clienteMember.id}) na thread ${thread.name}. O cliente recebeu o cargo '${CARGO_CLIENTE_COMPROU}' e teve o cargo '${CARGO_SERVICO_EM_ANDAMENTO}' removido.`);
                }
            }

        } catch (error) {
            console.error(`❌ Erro na interação ${interaction.customId} por ${user.tag}:`, error);
            if (interaction.deferred || interaction.replied) {
                await interaction.followUp({ content: 'Ocorreu um erro ao processar sua solicitação.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Ocorreu um erro ao processar sua solicitação.', ephemeral: true });
            }
        }
    },
};
