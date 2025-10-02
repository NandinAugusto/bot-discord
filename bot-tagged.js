const { Client, GatewayIntentBits, Events, EmbedBuilder, PermissionsBitField, Partials, ChannelType, ThreadAutoArchiveDuration, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

// Configuração do bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User]
});

// 🛒 SISTEMA DE CARRINHO
const carrinhos = new Map();

// 📊 SISTEMA DE NUMERAÇÃO SEQUENCIAL
const contadorThreads = new Map();

// 🔒 CONTROLE DE ACESSO E THREADS ATIVAS
const threadsFinalizadas = new Map();
const threadsAtivas = new Map(); // userId -> threadId (impede múltiplas threads)
const mensagensOficiais = new Set(); // IDs das mensagens oficiais do bot

// 💳 CONFIGURAÇÃO PIX - USANDO VARIÁVEIS DE AMBIENTE
const PIX_CONFIG = {
    chave: process.env.PIX_CHAVE || 'seuemail@gmail.com',
    nome: process.env.PIX_NOME || 'Seu Nome Completo',
    banco: process.env.PIX_BANCO || 'Nubank'
};

// 📢 CANAIS PARA POSTAGEM AUTOMÁTICA - USANDO VARIÁVEIS DE AMBIENTE
const CANAIS_SERVICOS = process.env.CANAIS_SERVICOS ? 
    process.env.CANAIS_SERVICOS.split(',') : 
    ['serviços'];

// 👑 CARGO PRINCIPAL DE ADMINISTRAÇÃO - USANDO VARIÁVEIS DE AMBIENTE
const CARGO_ADMIN_PRINCIPAL = process.env.CARGO_ADMIN_PRINCIPAL || 'Hellza';

// 👥 OUTROS CARGOS DE SUPORTE - USANDO VARIÁVEIS DE AMBIENTE
const CARGOS_SUPORTE = process.env.CARGOS_SUPORTE ? 
    process.env.CARGOS_SUPORTE.split(',') : 
    [
        'admin',
        'administrador',
        'mod',
        'moderador',
        'staff',
        'suporte',
        'vendas',
        'atendimento'
    ];

// 🎮 SERVIÇOS - COM PREÇOS CONFIGURÁVEIS POR VARIÁVEIS DE AMBIENTE
const servicos = {
    'missao-completa': {
        id: 'missao-completa',
        nome: 'Missão Principal COMPLETA',
        descricao: 'Temp. 1 e 2 COMPLETA [INCLUSO VERSÃO 2.2]',
        preco: parseFloat(process.env.SERVICO_MISSAO_COMPLETA_PRECO) || 90.00,
        tempo: '1-2 dias',
        emoji: '⭐'
    },
    'missao-avulsa': {
        id: 'missao-avulsa',
        nome: 'Missão Principal Avulsa',
        descricao: 'Apenas 1 Capítulo avulso da Missão Principal',
        preco: parseFloat(process.env.SERVICO_MISSAO_AVULSA_PRECO) || 8.00,
        tempo: '2-4 horas',
        emoji: '📜'
    },
    'missao-secundaria': {
        id: 'missao-secundaria',
        nome: 'Missões Secundárias',
        descricao: '1 Missão Secundária completa',
        preco: parseFloat(process.env.SERVICO_MISSAO_SECUNDARIA_PRECO) || 2.00,
        tempo: '30 min - 1 hora',
        emoji: '🎯'
    },
    'todos-eventos': {
        id: 'todos-eventos',
        nome: 'Todos os Eventos v2.2',
        descricao: 'TODOS os Eventos da atualização mais recente [Versão 2.2]',
        preco: parseFloat(process.env.SERVICO_TODOS_EVENTOS_PRECO) || 22.00,
        tempo: '3-5 horas',
        emoji: '🎉'
    },
    'evento-especifico': {
        id: 'evento-especifico',
        nome: 'Evento Específico',
        descricao: 'Evento Específico avulso de sua escolha',
        preco: parseFloat(process.env.SERVICO_EVENTO_ESPECIFICO_PRECO) || 7.00,
        tempo: '1-2 horas',
        emoji: '🎪'
    },
    'todas-historias': {
        id: 'todas-historias',
        nome: 'TODAS Histórias de Agentes',
        descricao: 'TODAS as histórias de Agentes [14 Histórias completas]',
        preco: parseFloat(process.env.SERVICO_TODAS_HISTORIAS_PRECO) || 76.00,
        tempo: '1-3 dias',
        emoji: '👥'
    },
    'historia-agente': {
        id: 'historia-agente',
        nome: 'História de Agente Específica',
        descricao: 'História de um Agente Específico de sua escolha',
        preco: parseFloat(process.env.SERVICO_HISTORIA_AGENTE_PRECO) || 6.00,
        tempo: '30 min - 1 hora',
        emoji: '🤖'
    },
    'miau-area': {
        id: 'miau-area',
        nome: 'MIAU-MIAU por Área',
        descricao: 'OFICIAL MIAU-MIAU - POR ÁREA COMPLETA',
        preco: parseFloat(process.env.SERVICO_MIAU_AREA_PRECO) || 12.00,
        tempo: '1-2 horas',
        emoji: '🐱'
    },
    'miau-pagina': {
        id: 'miau-pagina',
        nome: 'MIAU-MIAU 1 Página',
        descricao: 'OFICIAL MIAU-MIAU - APENAS 1 PÁGINA',
        preco: parseFloat(process.env.SERVICO_MIAU_PAGINA_PRECO) || 6.00,
        tempo: '15-30 min',
        emoji: '📄'
    },
    'nodulo-estavel': {
        id: 'nodulo-estavel',
        nome: 'Nódulo Estável',
        descricao: 'Nódulo estável [1° ao 10° nível]',
        preco: parseFloat(process.env.SERVICO_NODULO_ESTAVEL_PRECO) || 8.00,
        tempo: '30-45 min',
        emoji: '⚪'
    },
    'nodulo-azul': {
        id: 'nodulo-azul',
        nome: 'Nódulo Azul',
        descricao: 'Nódulo Azul [1° ao 8° nível]',
        preco: parseFloat(process.env.SERVICO_NODULO_AZUL_PRECO) || 10.00,
        tempo: '45 min - 1 hora',
        emoji: '🔵'
    },
    'nodulo-vermelho': {
        id: 'nodulo-vermelho',
        nome: 'Nódulo Vermelho',
        descricao: 'Nódulo Vermelho [1° ao 7° nível]',
        preco: parseFloat(process.env.SERVICO_NODULO_VERMELHO_PRECO) || 12.00,
        tempo: '1-1.5 horas',
        emoji: '🔴'
    },
    'investida-mortal': {
        id: 'investida-mortal',
        nome: 'Investida Mortal',
        descricao: 'INVESTIDA MORTAL - Endgame',
        preco: parseFloat(process.env.SERVICO_INVESTIDA_MORTAL_PRECO) || 14.00,
        tempo: '1-2 horas',
        emoji: '⚔️'
    },
    'farm-diario': {
        id: 'farm-diario',
        nome: 'Farm Diário',
        descricao: 'FARM DIÁRIO - Cuidado da conta',
        preco: parseFloat(process.env.SERVICO_FARM_DIARIO_PRECO) || 2.00,
        tempo: '30 min/dia',
        emoji: '📅'
    },
    'farm-semanal': {
        id: 'farm-semanal',
        nome: 'Farm Semanal',
        descricao: 'FARM SEMANAL - Cuidado da conta',
        preco: parseFloat(process.env.SERVICO_FARM_SEMANAL_PRECO) || 16.00,
        tempo: '7 dias',
        emoji: '🗓️'
    },
    'farm-mensal': {
        id: 'farm-mensal',
        nome: 'Farm Mensal',
        descricao: 'FARM MENSAL - Cuidado da conta',
        preco: parseFloat(process.env.SERVICO_FARM_MENSAL_PRECO) || 62.00,
        tempo: '30 dias',
        emoji: '📆'
    }
};

// 🔍 FUNÇÕES UTILITÁRIAS
function isHellzaAdmin(member) {
    return member.roles.cache.some(role =>
        role.name.toLowerCase() === CARGO_ADMIN_PRINCIPAL.toLowerCase()
    );
}

function isSuporteAdmin(member) {
    return member.roles.cache.some(role =>
        CARGOS_SUPORTE.some(cargo => role.name.toLowerCase().includes(cargo.toLowerCase()))
    );
}

function getProximoNumeroThread(userId) {
    if (!contadorThreads.has(userId)) {
        contadorThreads.set(userId, 1);
        return 1;
    } else {
        const novoNumero = contadorThreads.get(userId) + 1;
        contadorThreads.set(userId, novoNumero);
        return novoNumero;
    }
}

function isThreadFinalizada(threadId) {
    return threadsFinalizadas.has(threadId);
}

function finalizarThread(threadId, adminId) {
    threadsFinalizadas.set(threadId, {
        finalizada: true,
        adminResponsavel: adminId,
        dataFinalizacao: new Date().toISOString()
    });
}

function temThreadAtiva(userId) {
    return threadsAtivas.has(userId);
}

function getThreadAtiva(userId) {
    return threadsAtivas.get(userId);
}

function marcarThreadAtiva(userId, threadId) {
    threadsAtivas.set(userId, threadId);
    console.log(`🔒 Thread ${threadId} marcada como ativa para ${userId}`);
}

function removerThreadAtiva(userId) {
    threadsAtivas.delete(userId);
    console.log(`🔓 Thread ativa removida para ${userId}`);
}

// 🧹 LIMPEZA
async function limparMensagensGuild(guild) {
    console.log(`🧹 Limpando servidor: ${guild.name}`);
    try {
        const channels = guild.channels.cache.filter(c => c.isTextBased() && !c.isThread());
        let totalDeleted = 0;

        for (const [channelId, channel] of channels) {
            try {
                if (!channel.permissionsFor(guild.members.me)?.has(PermissionsBitField.Flags.ReadMessageHistory)) {
                    continue;
                }

                const messages = await channel.messages.fetch({ limit: 50 });
                const botMessages = messages.filter(msg =>
                    msg.author.id === client.user.id &&
                    msg.createdTimestamp < Date.now() - 30000
                );

                for (const [msgId, message] of botMessages) {
                    try {
                        await message.delete();
                        totalDeleted++;
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } catch (error) {
                        // Ignora erros
                    }
                }
            } catch (error) {
                console.error(`❌ Erro no canal ${channel.name}:`, error.message);
            }
        }
        console.log(`✅ ${totalDeleted} mensagens antigas removidas de ${guild.name}`);
    } catch (error) {
        console.error('❌ Erro na limpeza:', error);
    }
}

async function limparThread(thread, excludeLastN = 0) {
    console.log(`🧹 Limpando thread: ${thread.name}`);
    try {
        let totalDeleted = 0;
        let hasMore = true;

        while (hasMore) {
            const messages = await thread.messages.fetch({ limit: 100 });
            if (messages.size === 0) break;

            const messagesToDelete = Array.from(messages.values())
                .slice(excludeLastN)
                .filter(msg => msg.deletable);

            if (messagesToDelete.length === 0) break;

            for (const message of messagesToDelete) {
                try {
                    await message.delete();
                    totalDeleted++;
                    await new Promise(resolve => setTimeout(resolve, 300));
                } catch (error) {
                    // Ignora erros
                }
            }

            if (messagesToDelete.length < 100) break;
        }
        console.log(`✅ ${totalDeleted} mensagens removidas da thread ${thread.name}`);
    } catch (error) {
        console.error('❌ Erro ao limpar thread:', error);
    }
}

// 📢 POSTAGEM AUTOMÁTICA
async function postarServicosAutomatico(guild) {
    console.log(`📢 Postando serviços em: ${guild.name}`);

    const embed = new EmbedBuilder()
        .setTitle('🎮 SERVIÇOS GAMING v2.2 (Orpheus/Evellyn)')
        .setDescription(
            '**❗ NÃO USO HACK - CHEATS! ❗**\n\n' +
            '🛒 **Sistema Profissional com Controle Total:**\n' +
            '• Clique em 🛒 para abrir sua loja privada\n' +
            '• Uma thread por cliente (sem duplicatas)\n' +
            '• Numeração sequencial automática\n' +
            '• Sistema de quantidade inteligente\n' +
            '• Controle administrativo Hellza\n\n' +

            '**🎯 PRINCIPAIS SERVIÇOS:**\n' +
            '⭐ Missão Principal COMPLETA - **R$ 90,00**\n' +
            '👥 TODAS Histórias de Agentes - **R$ 76,00**\n' +
            '📆 Farm Mensal - **R$ 62,00**\n' +
            '🎉 Todos os Eventos v2.2 - **R$ 22,00**\n' +
            '⚔️ Investida Mortal - **R$ 14,00**\n' +
            '🔴 Nódulo Vermelho - **R$ 12,00**\n\n' +

            '**💡 Diferenciais Exclusivos:**\n' +
            '✅ Atendimento privado numerado\n' +
            '✅ Controle anti-duplicação\n' +
            '✅ Sistema Hellza de finalização\n' +
            '✅ Organização total dos pedidos\n' +
            '✅ Pagamento PIX seguro e rápido\n\n' +

            '**🚨 IMPORTANTE:**\n' +
            '• Apenas 1 thread ativa por cliente\n' +
            '• Reaja apenas nas mensagens oficiais\n' +
            '• Aguarde finalização antes de novo pedido\n\n' +

            '**🚀 CLIQUE EM 🛒 PARA COMEÇAR SEU ATENDIMENTO!**'
        )
        .setColor(0x00AE86)
        .setFooter({ 
            text: 'Sistema Anti-Duplicação v2.2 • Controle Hellza • Mensagem Fixada',
            iconURL: guild.iconURL()
        })
        .setTimestamp();

    for (const nomeCanal of CANAIS_SERVICOS) {
        const canal = guild.channels.cache.find(c => 
            c.name.toLowerCase().includes(nomeCanal.toLowerCase()) && 
            c.isTextBased() && 
            !c.isThread()
        );

        if (canal) {
            try {
                const mensagem = await canal.send({ embeds: [embed] });
                await mensagem.react('🛒');

                // FIXA A MENSAGEM AUTOMATICAMENTE
                try {
                    await mensagem.pin();
                    console.log(`📌 Mensagem fixada em: ${canal.name}`);
                } catch (pinError) {
                    console.error(`❌ Erro ao fixar mensagem em ${canal.name}:`, pinError.message);
                }

                // REGISTRA COMO MENSAGEM OFICIAL
                mensagensOficiais.add(mensagem.id);
                console.log(`✅ Mensagem oficial registrada: ${mensagem.id} em ${canal.name}`);

                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error(`❌ Erro ao postar em ${canal.name}:`, error.message);
            }
        } else {
            console.log(`⚠️ Canal '${nomeCanal}' não encontrado em ${guild.name}`);
        }
    }
}

// Event: Bot conectado
client.once(Events.ClientReady, async () => {
    console.log(`🤖 Bot ANTI-DUPLICAÇÃO online: ${client.user.tag}!`);
    console.log(`👑 Cargo principal: ${CARGO_ADMIN_PRINCIPAL}`);
    console.log(`📊 ${Object.keys(servicos).length} serviços configurados`);
    console.log(`🔒 Sistema anti-duplicação ativo`);

    client.user.setActivity('🛒 Sistema Único v2.2', { type: 'PLAYING' });

    setTimeout(async () => {
        console.log('🧹 Iniciando configuração automática...');

        for (const [guildId, guild] of client.guilds.cache) {
            try {
                await limparMensagensGuild(guild);
                await new Promise(resolve => setTimeout(resolve, 3000));
                await postarServicosAutomatico(guild);
                console.log(`✅ Servidor ${guild.name} configurado com mensagens fixadas!`);
            } catch (error) {
                console.error(`❌ Erro no servidor ${guild.name}:`, error);
            }
        }

        console.log('🚀 Sistema anti-duplicação totalmente ativo!');
    }, 5000);
});

// 🛒 FUNÇÕES DO CARRINHO
function getCarrinho(userId) {
    if (!carrinhos.has(userId)) {
        carrinhos.set(userId, { items: [], total: 0 });
    }
    return carrinhos.get(userId);
}

function adicionarItem(userId, servicoId, quantidade = 1) {
    const carrinho = getCarrinho(userId);
    const servico = servicos[servicoId];

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

// 🎮 INTERFACES
function criarDropdownServicos() {
    const servicosArray = Object.values(servicos).slice(0, 25);

    const options = servicosArray.map(servico => 
        new StringSelectMenuOptionBuilder()
            .setLabel(`${servico.nome}`)
            .setDescription(`R$ ${servico.preco.toFixed(2).replace('.', ',')} • ${servico.tempo}`)
            .setValue(servico.id)
            .setEmoji(servico.emoji)
    );

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_servico')
        .setPlaceholder('🎮 Escolha um serviço para adicionar ao carrinho')
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
                .setDescription(`Adicionar ${i} ${i === 1 ? 'unidade' : 'unidades'}`)
                .setValue(`${servicoId}_${i}`)
        );
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_quantidade')
        .setPlaceholder('📦 Escolha a quantidade')
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(options);

    return new ActionRowBuilder().addComponents(selectMenu);
}

function criarCarrinhoEmbed(userId, user) {
    const carrinho = getCarrinho(userId);

    if (carrinho.items.length === 0) {
        return new EmbedBuilder()
            .setTitle('🛒 Carrinho - ' + user.displayName)
            .setDescription('**Carrinho vazio**\n\n🎮 Selecione serviços no menu para começar!')
            .addFields([
                { name: '💰 Total', value: 'R$ 0,00', inline: true },
                { name: '📦 Itens', value: '0', inline: true },
                { name: '⏱️ Status', value: 'Aguardando', inline: true }
            ])
            .setColor(0x5865F2)
            .setTimestamp();
    }

    const itensLista = carrinho.items.map((item, index) => 
        `**${index + 1}.** ${item.emoji} **${item.nome}** (**${item.quantidade}x**)\n` +
        `💰 R$ ${item.subtotal.toFixed(2).replace('.', ',')} • ⏱️ ${item.tempo}`
    ).join('\n\n');

    return new EmbedBuilder()
        .setTitle(`🛒 Carrinho - ${user.displayName}`)
        .setDescription(`🎉 **Seus serviços selecionados:**\n\n${itensLista}`)
        .addFields([
            { name: '💰 VALOR TOTAL', value: `**R$ ${carrinho.total.toFixed(2).replace('.', ',')}**`, inline: true },
            { name: '📦 Total de Itens', value: carrinho.items.reduce((sum, item) => sum + item.quantidade, 0).toString(), inline: true },
            { name: '⏱️ Status', value: 'Pronto para finalizar', inline: true }
        ])
        .setColor(0x00D4AA)
        .setFooter({ text: `${carrinho.items.length} tipos de serviços • Use os botões para gerenciar` })
        .setTimestamp();
}

function criarPagamentoEmbed(userId, user, threadId) {
    const carrinho = getCarrinho(userId);

    const resumoDetalhado = carrinho.items.map((item, index) => 
        `**${index + 1}.** ${item.emoji} **${item.nome}** (**${item.quantidade}x**)\n` +
        `    💰 R$ ${item.subtotal.toFixed(2).replace('.', ',')} • ⏱️ ${item.tempo}`
    ).join('\n\n');

    const totalItens = carrinho.items.reduce((sum, item) => sum + item.quantidade, 0);

    return new EmbedBuilder()
        .setTitle('💳 🎉 PEDIDO FINALIZADO!')
        .setDescription(
            `**Parabéns ${user.displayName}!**\n\n` +
            `**📋 RESUMO DO PEDIDO:**\n\n${resumoDetalhado}\n\n` +
            `📦 **TOTAL DE SERVIÇOS:** ${totalItens}\n` +
            `💰 **VALOR TOTAL:** R$ ${carrinho.total.toFixed(2).replace('.', ',')}`
        )
        .addFields([
            { 
                name: '💳 Dados PIX', 
                value: `**Chave:** ${PIX_CONFIG.chave}\n**Nome:** ${PIX_CONFIG.nome}\n**Banco:** ${PIX_CONFIG.banco}`,
                inline: false 
            },
            { 
                name: '📱 Instruções', 
                value: 
                    `1️⃣ Faça PIX: **R$ ${carrinho.total.toFixed(2).replace('.', ',')}**\n` +
                    `2️⃣ Envie comprovante aqui\n` +
                    `3️⃣ Aguarde confirmação Hellza\n` +
                    `4️⃣ Serviços iniciados após confirmação`,
                inline: false 
            },
            { 
                name: '🔄 Próximo Passo', 
                value: 'Aguardando comprovante e confirmação administrativa Hellza.',
                inline: false 
            }
        ])
        .setColor(0x32CD32)
        .setFooter({ text: '⚠️ Thread única • Aguardando Hellza • NÃO usamos hack/cheats' })
        .setTimestamp();
}

function criarBotoesCarrinho() {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('atualizar_carrinho')
                .setLabel('🔄')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('remover_item')
                .setLabel('➖ Remover')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('limpar_carrinho')
                .setLabel('🧹 Limpar')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('finalizar_pedido')
                .setLabel('💳 Finalizar')
                .setStyle(ButtonStyle.Success)
        );
}

function criarBotaoAdminFinalizar(threadId) {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`admin_finalizar_${threadId}`)
                .setLabel('👑 Finalizar Serviço')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('✅')
        );
}

function criarDropdownRemover(userId) {
    const carrinho = getCarrinho(userId);

    if (carrinho.items.length === 0) return null;

    const options = carrinho.items.map(item => 
        new StringSelectMenuOptionBuilder()
            .setLabel(`${item.nome} (${item.quantidade}x)`)
            .setDescription(`R$ ${item.subtotal.toFixed(2).replace('.', ',')}`)
            .setValue(item.id)
            .setEmoji(item.emoji)
    );

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('confirmar_remocao')
        .setPlaceholder('🗑️ Escolha o item para remover')
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(options);

    return new ActionRowBuilder().addComponents(selectMenu);
}

// Event: Reações com CONTROLE ANTI-DUPLICAÇÃO
client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (user.bot) return;

    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            return;
        }
    }

    if (reaction.emoji.name === '🛒') {
        try {
            // 🚨 VERIFICA SE É MENSAGEM OFICIAL DO BOT
            if (!mensagensOficiais.has(reaction.message.id)) {
                console.log(`🚫 Reação em mensagem não oficial ignorada: ${reaction.message.id} por ${user.tag}`);
                await reaction.users.remove(user.id);

                // Avisa o usuário
                try {
                    await user.send(
                        `🚫 **Atenção ${user.displayName}!**\n\n` +
                        `Você reagiu com 🛒 em uma mensagem não oficial.\n\n` +
                        `✅ **Para criar sua loja privada:**\n` +
                        `• Reaja 🛒 apenas nas **mensagens fixadas** do bot\n` +
                        `• Procure por mensagens com título "SERVIÇOS GAMING v2.2"\n` +
                        `• São as mensagens **oficiais** e **fixadas** nos canais\n\n` +
                        `🔍 Volte aos canais e procure pela mensagem oficial fixada!`
                    );
                } catch (dmError) {
                    console.log(`❌ Não foi possível enviar DM para ${user.tag}`);
                }

                return;
            }

            // 🚨 VERIFICA SE JÁ TEM THREAD ATIVA
            if (temThreadAtiva(user.id)) {
                const threadAtivaId = getThreadAtiva(user.id);
                const guild = reaction.message.guild;
                const threadAtiva = guild.channels.cache.get(threadAtivaId);

                console.log(`🚫 ${user.tag} tentou criar nova thread tendo uma ativa: ${threadAtivaId}`);

                await reaction.users.remove(user.id);

                let mensagemAviso = `🚫 **${user.displayName}, você já tem uma thread ativa!**\n\n`;

                if (threadAtiva && !threadAtiva.archived) {
                    mensagemAviso += `📍 **Sua thread ativa:** ${threadAtiva.name}\n`;
                    mensagemAviso += `🔗 Acesse sua thread existente para continuar suas compras.\n\n`;
                } else {
                    // Thread foi removida/arquivada, limpa o controle
                    removerThreadAtiva(user.id);
                    mensagemAviso += `🔄 **Thread anterior não encontrada.** Tente reagir novamente.\n\n`;
                }

                mensagemAviso += `⚠️ **Regra:** Apenas 1 thread por cliente.\n`;
                mensagemAviso += `✅ **Aguarde a finalização** pela equipe Hellza antes de criar nova thread.`;

                try {
                    await user.send(mensagemAviso);
                } catch (dmError) {
                    const confirmMsg = await reaction.message.channel.send(
                        `🚫 ${user}, você já tem uma thread ativa! Finalize-a antes de criar outra.`
                    );
                    setTimeout(() => confirmMsg.delete().catch(() => {}), 10000);
                }

                return;
            }

            const guild = reaction.message.guild;

            // Gera número sequencial
            const numeroThread = getProximoNumeroThread(user.id);
            const nomeThread = `🛒-loja-${user.username}-${numeroThread}`;

            console.log(`🔢 Criando thread ${numeroThread} para ${user.tag}: ${nomeThread}`);

            const thread = await reaction.message.channel.threads.create({
                name: nomeThread,
                type: ChannelType.PrivateThread,
                autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
                reason: `Loja ${numeroThread} para ${user.tag}`,
                invitable: false
            });

            // MARCA THREAD COMO ATIVA PARA O USUÁRIO
            marcarThreadAtiva(user.id, thread.id);

            await thread.members.add(user.id);
            console.log(`👤 ${user.tag} adicionado à thread ${numeroThread}`);

            // Adiciona cargo Hellza
            let hellzaAdmins = 0;
            const hellzaRole = guild.roles.cache.find(role => 
                role.name.toLowerCase() === CARGO_ADMIN_PRINCIPAL.toLowerCase()
            );

            if (hellzaRole) {
                const hellzaMembers = guild.members.cache.filter(member => 
                    member.roles.cache.has(hellzaRole.id) && !member.user.bot
                );

                for (const [memberId, hellzaMember] of hellzaMembers) {
                    try {
                        await thread.members.add(hellzaMember.id);
                        console.log(`👑 Hellza Admin ${hellzaMember.user.tag} adicionado`);
                        hellzaAdmins++;
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } catch (error) {
                        console.error(`❌ Erro ao adicionar Hellza ${hellzaMember.user.tag}:`, error.message);
                    }
                }
            }

            // Adiciona outros cargos de suporte
            let suporteAdmins = 0;
            for (const cargoNome of CARGOS_SUPORTE) {
                const roles = guild.roles.cache.filter(role => 
                    role.name.toLowerCase().includes(cargoNome.toLowerCase())
                );

                for (const [roleId, role] of roles) {
                    const membersWithRole = guild.members.cache.filter(member => 
                        member.roles.cache.has(role.id) && !member.user.bot
                    );

                    for (const [memberId, supportMember] of membersWithRole) {
                        try {
                            await thread.members.add(supportMember.id);
                            console.log(`👥 Suporte ${supportMember.user.tag} adicionado (cargo: ${role.name})`);
                            suporteAdmins++;
                            await new Promise(resolve => setTimeout(resolve, 500));
                        } catch (error) {
                            console.error(`❌ Erro ao adicionar suporte ${supportMember.user.tag}:`, error.message);
                        }
                    }
                }
            }

            const totalAdmins = hellzaAdmins + suporteAdmins;
            console.log(`✅ Thread ${numeroThread}: ${hellzaAdmins} Hellza + ${suporteAdmins} suporte = ${totalAdmins} admins`);

            await new Promise(resolve => setTimeout(resolve, 2000));

            const welcomeEmbed = new EmbedBuilder()
                .setTitle(`🎉 Loja Privada Única #${numeroThread} - ${user.displayName}`)
                .setDescription(
                    `**Bem-vindo à sua loja privada exclusiva!** 🛒✨\n\n` +
                    `**🔢 Thread Número:** ${numeroThread}\n` +
                    `**🔒 Status:** Thread única ativa\n` +
                    `**👑 Hellza Admins:** ${hellzaAdmins}\n` +
                    `**👥 Equipe Suporte:** ${suporteAdmins}\n` +
                    `**📊 Total da Equipe:** ${totalAdmins}\n\n` +
                    '**🎯 Sistema Anti-Duplicação:**\n' +
                    '• Apenas 1 thread ativa por cliente\n' +
                    '• Numeração sequencial automática\n' +
                    '• Controle Hellza de finalização\n' +
                    '• Sistema de quantidade avançado\n\n' +
                    '**🛡️ Conversa privada e protegida**\n' +
                    'Thread única com controle total da administração\n\n' +
                    '**⚠️ IMPORTANTE:**\n' +
                    '• NÃO usamos hack/cheats - Serviços legítimos\n' +
                    '• Aguarde finalização Hellza para nova thread\n' +
                    '• Esta é sua thread exclusiva até finalização'
                )
                .setColor(0x00AE86)
                .setThumbnail(user.displayAvatarURL())
                .setFooter({ text: `Sistema Único v2.2 • Thread ${numeroThread} • Controle Hellza • Anti-Duplicação` })
                .setTimestamp();

            const dropdown = criarDropdownServicos();
            const buttons = criarBotoesCarrinho();
            const carrinhoEmbed = criarCarrinhoEmbed(user.id, user);

            await thread.send({ embeds: [welcomeEmbed] });
            await new Promise(resolve => setTimeout(resolve, 1500));
            await thread.send({ 
                embeds: [carrinhoEmbed],
                components: [dropdown, buttons]
            });

            console.log(`🛒 Loja ${numeroThread} aberta para ${user.tag} com ${totalAdmins} admins`);
            await reaction.users.remove(user.id);

            const confirmMsg = await reaction.message.channel.send(
                `✅ ${user}, loja privada única **#${numeroThread}** criada! 🛒🔒\n` +
                `👑 **${hellzaAdmins} Hellza** + **${suporteAdmins} suporte** = **${totalAdmins} total** na equipe!`
            );
            setTimeout(() => confirmMsg.delete().catch(() => {}), 12000);

        } catch (error) {
            console.error(`❌ Erro crítico para ${user.tag}:`, error);
            // Remove da lista de threads ativas se houve erro
            removerThreadAtiva(user.id);
        }
    }
});

// Event: Thread deletada/arquivada - Remove do controle
client.on(Events.ThreadDelete, (thread) => {
    // Remove thread do controle quando é deletada
    for (const [userId, threadId] of threadsAtivas.entries()) {
        if (threadId === thread.id) {
            removerThreadAtiva(userId);
            console.log(`🗑️ Thread ${thread.name} deletada, controle removido para usuário ${userId}`);
            break;
        }
    }
});

client.on(Events.ThreadUpdate, (oldThread, newThread) => {
    // Remove thread do controle quando é arquivada
    if (newThread.archived && !oldThread.archived) {
        for (const [userId, threadId] of threadsAtivas.entries()) {
            if (threadId === newThread.id) {
                removerThreadAtiva(userId);
                console.log(`📦 Thread ${newThread.name} arquivada, controle removido para usuário ${userId}`);
                break;
            }
        }
    }
});

// Event: Interações
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isStringSelectMenu() && !interaction.isButton()) return;

    const userId = interaction.user.id;
    const user = interaction.user;
    const member = interaction.member;
    const threadId = interaction.channel?.id;

    try {
        // Verifica se a thread foi finalizada
        if (isThreadFinalizada(threadId) && !isHellzaAdmin(member) && !isSuporteAdmin(member)) {
            await interaction.reply({
                content: '🔒 **Thread Finalizada pela Administração**\n\nEsta thread foi finalizada por um administrador Hellza. Apenas a equipe administrativa pode interagir aqui.\n\n✅ **Para novos serviços:** Volte ao canal público e reaja 🛒 na mensagem fixada oficial.',
                ephemeral: true
            });
            return;
        }

        if (interaction.customId === 'select_servico') {
            const servicoId = interaction.values[0];
            const servico = servicos[servicoId];

            if (!servico) {
                await interaction.reply({ content: '❌ Serviço não encontrado.', ephemeral: true });
                return;
            }

            const quantidadeDropdown = criarDropdownQuantidade(servicoId);

            await interaction.reply({
                content: `**${servico.emoji} ${servico.nome}**\nPreço unitário: R$ ${servico.preco.toFixed(2).replace('.', ',')}\n\n**Escolha quantas unidades quer:**`,
                components: [quantidadeDropdown],
                ephemeral: true
            });

        } else if (interaction.customId === 'select_quantidade') {
            const [servicoId, quantidade] = interaction.values[0].split('_');
            const servico = servicos[servicoId];
            const qtd = parseInt(quantidade);

            const sucesso = adicionarItem(userId, servicoId, qtd);

            if (sucesso) {
                const carrinho = criarCarrinhoEmbed(userId, user);
                const dropdown = criarDropdownServicos();
                const buttons = criarBotoesCarrinho();

                const channel = interaction.channel;
                const messages = await channel.messages.fetch({ limit: 5 });
                const carrinhoMessage = messages.find(msg => 
                    msg.author.id === client.user.id && 
                    msg.embeds.length > 0 && 
                    msg.embeds[0].title?.includes('Carrinho')
                );

                if (carrinhoMessage) {
                    await carrinhoMessage.edit({
                        embeds: [carrinho],
                        components: [dropdown, buttons]
                    });
                }

                await interaction.update({
                    content: `✅ **${qtd}x ${servico.nome}** adicionado!\nSubtotal: R$ ${(servico.preco * qtd).toFixed(2).replace('.', ',')}`,
                    components: []
                });

                console.log(`🛒 Thread ${threadId}: ${user.tag} +${qtd}x ${servico.nome}`);
            } else {
                await interaction.update({
                    content: '❌ Erro ao adicionar ao carrinho.',
                    components: []
                });
            }

        } else if (interaction.customId === 'finalizar_pedido') {
            const carrinho = getCarrinho(userId);

            if (carrinho.items.length === 0) {
                await interaction.reply({
                    content: '❌ Carrinho vazio! Adicione serviços primeiro.',
                    ephemeral: true
                });
                return;
            }

            const pagamentoEmbed = criarPagamentoEmbed(userId, user, threadId);
            const adminButton = criarBotaoAdminFinalizar(threadId);

            await interaction.reply({
                embeds: [pagamentoEmbed],
                components: [adminButton],
                ephemeral: false
            });

            const totalItens = carrinho.items.reduce((sum, item) => sum + item.quantidade, 0);
            console.log(`💰 PEDIDO Thread ${threadId}: ${user.tag} - R$ ${carrinho.total.toFixed(2)} - ${totalItens} serviços`);

            limparCarrinho(userId);

        } else if (interaction.customId.startsWith('admin_finalizar_')) {
            // Botão exclusivo para admins Hellza
            if (!isHellzaAdmin(member)) {
                await interaction.reply({
                    content: `❌ **Acesso Negado**\n\nApenas membros com cargo **${CARGO_ADMIN_PRINCIPAL}** podem finalizar serviços administrativamente.`,
                    ephemeral: true
                });
                return;
            }

            const threadIdFromButton = interaction.customId.replace('admin_finalizar_', '');

            // Finaliza a thread
            finalizarThread(threadIdFromButton, user.id);

            // Remove acesso do cliente
            const thread = interaction.channel;
            const clienteUsername = thread.name.split('-')[2];

            let clienteRemovido = false;
            const clienteMember = thread.guild.members.cache.find(member => 
                member.user.username === clienteUsername
            );

            if (clienteMember) {
                try {
                    await thread.members.remove(clienteMember.id);
                    console.log(`🔒 Cliente ${clienteMember.user.tag} removido da thread ${threadIdFromButton}`);
                    clienteRemovido = true;

                    // Remove thread ativa do controle
                    removerThreadAtiva(clienteMember.user.id);

                } catch (error) {
                    console.error(`❌ Erro ao remover cliente:`, error);
                }
            }

            const finalizadoEmbed = new EmbedBuilder()
                .setTitle('✅ SERVIÇO FINALIZADO PELA ADMINISTRAÇÃO HELLZA')
                .setDescription(
                    `**🎉 Serviço concluído com sucesso!**\n\n` +
                    `**👑 Finalizado por:** ${user.displayName} (${CARGO_ADMIN_PRINCIPAL})\n` +
                    `**📅 Data/Hora:** ${new Date().toLocaleString('pt-BR')}\n` +
                    `**🔒 Status:** Thread restrita à administração\n` +
                    `**👤 Cliente:** ${clienteRemovido ? 'Removido da thread' : 'Não encontrado'}\n\n` +
                    `**📋 Ações realizadas:**\n` +
                    `• ✅ Pagamento confirmado\n` +
                    `• ✅ Serviço executado completamente\n` +
                    `• ✅ Cliente satisfeito\n` +
                    `• 🔒 Thread finalizada administrativamente\n` +
                    `• 🔓 Cliente liberado para novas threads\n\n` +
                    `**👥 Acesso atual:** Apenas equipe administrativa Hellza\n` +
                    `O cliente foi removido da thread e pode criar nova thread se necessário.`
                )
                .setColor(0x00FF00)
                .setFooter({ text: `Finalizado por ${CARGO_ADMIN_PRINCIPAL} • Sistema Único v2.2 • Anti-Duplicação` })
                .setTimestamp();

            await interaction.update({
                embeds: [finalizadoEmbed],
                components: []
            });

            console.log(`✅ Thread ${threadIdFromButton} finalizada por ${user.tag} (Hellza)`);

            // Renomeia a thread
            try {
                const novoNome = thread.name + '-FINALIZADA';
                await thread.setName(novoNome);
                console.log(`🏷️ Thread renomeada para: ${novoNome}`);
            } catch (error) {
                console.error(`❌ Erro ao renomear thread:`, error);
            }

        } else if (interaction.customId === 'atualizar_carrinho') {
            const carrinho = criarCarrinhoEmbed(userId, user);
            const dropdown = criarDropdownServicos();
            const buttons = criarBotoesCarrinho();

            await interaction.update({
                embeds: [carrinho],
                components: [dropdown, buttons]
            });

        } else if (interaction.customId === 'remover_item') {
            const dropdownRemover = criarDropdownRemover(userId);

            if (dropdownRemover) {
                const carrinho = criarCarrinhoEmbed(userId, user);
                const dropdown = criarDropdownServicos();
                const buttons = criarBotoesCarrinho();

                await interaction.update({
                    embeds: [carrinho],
                    components: [dropdown, dropdownRemover, buttons]
                });
            } else {
                await interaction.reply({
                    content: '❌ Carrinho vazio!',
                    ephemeral: true
                });
            }

        } else if (interaction.customId === 'confirmar_remocao') {
            const servicoId = interaction.values[0];
            const servico = servicos[servicoId];

            removerItem(userId, servicoId);

            const carrinho = criarCarrinhoEmbed(userId, user);
            const dropdown = criarDropdownServicos();
            const buttons = criarBotoesCarrinho();

            await interaction.update({
                embeds: [carrinho],
                components: [dropdown, buttons]
            });

            await interaction.followUp({
                content: `🗑️ **${servico.nome}** removido!`,
                ephemeral: true
            });

        } else if (interaction.customId === 'limpar_carrinho') {
            limparCarrinho(userId);

            const carrinho = criarCarrinhoEmbed(userId, user);
            const dropdown = criarDropdownServicos();
            const buttons = criarBotoesCarrinho();

            await interaction.update({
                embeds: [carrinho],
                components: [dropdown, buttons]
            });

            await interaction.followUp({
                content: '🧹 Carrinho limpo!',
                ephemeral: true
            });
        }

    } catch (error) {
        console.error('❌ Erro na interação:', error);

        try {
            const errorMsg = '❌ Erro inesperado. Tente novamente.';
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMsg, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMsg, ephemeral: true });
            }
        } catch (replyError) {
            console.error('❌ Erro ao responder:', replyError);
        }
    }
});

client.on(Events.Error, (error) => {
    console.error('❌ Erro crítico:', error);
});

// 🔑 USA VARIÁVEL DE AMBIENTE PARA O TOKEN
client.login(process.env.DISCORD_TOKEN);