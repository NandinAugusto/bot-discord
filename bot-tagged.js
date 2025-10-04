const { Client, GatewayIntentBits, Events, EmbedBuilder, PermissionsBitField, Partials, ChannelType, ThreadAutoArchiveDuration, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

// ================================================
// 🌍 CONFIGURAÇÕES VIA VARIÁVEIS DE AMBIENTE
// ================================================

const PIX_CONFIG = {
    chave: process.env.PIX_CHAVE || 'seuemail@gmail.com',
    nome: process.env.PIX_NOME || 'Seu Nome Completo',
    banco: process.env.PIX_BANCO || 'Nubank'
};

const CANAIS_SERVICOS = process.env.CANAIS_SERVICOS ? 
    process.env.CANAIS_SERVICOS.split(',').map(c => c.trim()) : 
    ['serviços'];

const CANAL_LOG_FINALIZADOS = process.env.CANAL_LOG_FINALIZADOS || 'servicos-finalizados';
const CARGO_ADMIN_PRINCIPAL = process.env.CARGO_ADMIN_PRINCIPAL || 'Hellza';

const CARGOS_SUPORTE = process.env.CARGOS_SUPORTE ? 
    process.env.CARGOS_SUPORTE.split(',').map(c => c.trim()) : 
    ['admin', 'administrador', 'mod', 'moderador', 'staff', 'suporte', 'vendas', 'atendimento'];

const CARGO_CLIENTE_COMPROU = process.env.CARGO_CLIENTE_COMPROU || 'Já comprou';
const CARGO_SERVICO_EM_ANDAMENTO = process.env.CARGO_SERVICO_EM_ANDAMENTO || 'Serviço em Andamento';

// 📁 ARQUIVOS PARA SISTEMA MULTI-JOGOS
const JOGOS_FILE = './jogos_disponiveis.json';
const SERVICOS_FILE = './servicos_multi_jogos.json';

// 🎮 JOGOS INICIAIS (será movido para JSON)
const jogosIniciais = {
    'zenless-zone-zero': {
        id: 'zenless-zone-zero',
        nome: 'Zenless Zone Zero',
        emoji: '⚡',
        descricao: 'Serviços para Zenless Zone Zero - Orpheus/Evellyn',
        ativo: true,
        ordem: 1
    },
    'honkai-star-rail': {
        id: 'honkai-star-rail',
        nome: 'Honkai Star Rail',
        emoji: '🌟',
        descricao: 'Serviços para Honkai Star Rail',
        ativo: true,
        ordem: 2
    },
    'genshin-impact': {
        id: 'genshin-impact',
        nome: 'Genshin Impact',
        emoji: '🗡️',
        descricao: 'Serviços para Genshin Impact',
        ativo: true,
        ordem: 3
    }
};

// 🎮 SERVIÇOS INICIAIS COM IDENTIFICAÇÃO DE JOGO
const servicosIniciais = {
    // ========== ZENLESS ZONE ZERO ==========
    'zzz-missao-completa': {
        id: 'zzz-missao-completa',
        jogo_id: 'zenless-zone-zero',
        nome: 'Missão Principal COMPLETA',
        descricao: 'Temp. 1 e 2 COMPLETA [INCLUSO VERSÃO 2.2]',
        preco: parseFloat(process.env.SERVICO_ZZZ_MISSAO_COMPLETA_PRECO) || 90.00,
        tempo: '1-2 dias',
        emoji: '⭐',
        destaque: true,
        ordem: 1
    },
    'zzz-todas-historias': {
        id: 'zzz-todas-historias',
        jogo_id: 'zenless-zone-zero',
        nome: 'TODAS Histórias de Agentes',
        descricao: 'TODAS as histórias de Agentes [14 Histórias completas]',
        preco: parseFloat(process.env.SERVICO_ZZZ_TODAS_HISTORIAS_PRECO) || 76.00,
        tempo: '1-3 dias',
        emoji: '👥',
        destaque: true,
        ordem: 2
    },
    'zzz-farm-mensal': {
        id: 'zzz-farm-mensal',
        jogo_id: 'zenless-zone-zero',
        nome: 'Farm Mensal',
        descricao: 'FARM MENSAL - Cuidado da conta',
        preco: parseFloat(process.env.SERVICO_ZZZ_FARM_MENSAL_PRECO) || 62.00,
        tempo: '30 dias',
        emoji: '📆',
        destaque: true,
        ordem: 3
    },
    'zzz-todos-eventos': {
        id: 'zzz-todos-eventos',
        jogo_id: 'zenless-zone-zero',
        nome: 'Todos os Eventos v2.2',
        descricao: 'TODOS os Eventos da atualização mais recente [Versão 2.2]',
        preco: parseFloat(process.env.SERVICO_ZZZ_TODOS_EVENTOS_PRECO) || 22.00,
        tempo: '3-5 horas',
        emoji: '🎉',
        destaque: true,
        ordem: 4
    },
    'zzz-investida-mortal': {
        id: 'zzz-investida-mortal',
        jogo_id: 'zenless-zone-zero',
        nome: 'Investida Mortal',
        descricao: 'INVESTIDA MORTAL - Endgame',
        preco: parseFloat(process.env.SERVICO_ZZZ_INVESTIDA_MORTAL_PRECO) || 14.00,
        tempo: '1-2 horas',
        emoji: '⚔️',
        destaque: true,
        ordem: 5
    },
    'zzz-nodulo-vermelho': {
        id: 'zzz-nodulo-vermelho',
        jogo_id: 'zenless-zone-zero',
        nome: 'Nódulo Vermelho',
        descricao: 'Nódulo Vermelho [1° ao 7° nível]',
        preco: parseFloat(process.env.SERVICO_ZZZ_NODULO_VERMELHO_PRECO) || 12.00,
        tempo: '1-1.5 horas',
        emoji: '🔴',
        destaque: true,
        ordem: 6
    },
    'zzz-missao-avulsa': {
        id: 'zzz-missao-avulsa',
        jogo_id: 'zenless-zone-zero',
        nome: 'Missão Principal Avulsa',
        descricao: 'Apenas 1 Capítulo avulso da Missão Principal',
        preco: parseFloat(process.env.SERVICO_ZZZ_MISSAO_AVULSA_PRECO) || 8.00,
        tempo: '2-4 horas',
        emoji: '📜',
        destaque: false,
        ordem: 10
    },
    'zzz-farm-diario': {
        id: 'zzz-farm-diario',
        jogo_id: 'zenless-zone-zero',
        nome: 'Farm Diário',
        descricao: 'FARM DIÁRIO - Cuidado da conta',
        preco: parseFloat(process.env.SERVICO_ZZZ_FARM_DIARIO_PRECO) || 2.00,
        tempo: '30 min/dia',
        emoji: '📅',
        destaque: false,
        ordem: 15
    },

    // ========== HONKAI STAR RAIL ==========
    'hsr-historia-principal': {
        id: 'hsr-historia-principal',
        jogo_id: 'honkai-star-rail',
        nome: 'História Principal Completa',
        descricao: 'História principal completa de Honkai Star Rail',
        preco: parseFloat(process.env.SERVICO_HSR_HISTORIA_PRINCIPAL_PRECO) || 85.00,
        tempo: '1-2 dias',
        emoji: '📖',
        destaque: true,
        ordem: 1
    },
    'hsr-farm-reliquia': {
        id: 'hsr-farm-reliquia',
        jogo_id: 'honkai-star-rail',
        nome: 'Farm de Relíquias',
        descricao: 'Farm completo de relíquias de alta qualidade',
        preco: parseFloat(process.env.SERVICO_HSR_FARM_RELIQUIA_PRECO) || 45.00,
        tempo: '3-5 horas',
        emoji: '💎',
        destaque: true,
        ordem: 2
    },
    'hsr-caverna-simulada': {
        id: 'hsr-caverna-simulada',
        jogo_id: 'honkai-star-rail',
        nome: 'Universo Simulado',
        descricao: 'Completo do Universo Simulado todas as dificuldades',
        preco: parseFloat(process.env.SERVICO_HSR_CAVERNA_SIMULADA_PRECO) || 25.00,
        tempo: '2-3 horas',
        emoji: '🌌',
        destaque: true,
        ordem: 3
    },

    // ========== GENSHIN IMPACT ==========
    'gi-historia-archon': {
        id: 'gi-historia-archon',
        jogo_id: 'genshin-impact',
        nome: 'História dos Archons Completa',
        descricao: 'Todas as histórias dos Archons disponíveis',
        preco: parseFloat(process.env.SERVICO_GI_HISTORIA_ARCHON_PRECO) || 95.00,
        tempo: '2-3 dias',
        emoji: '👑',
        destaque: true,
        ordem: 1
    },
    'gi-farm-artefato': {
        id: 'gi-farm-artefato',
        jogo_id: 'genshin-impact',
        nome: 'Farm de Artefatos',
        descricao: 'Farm completo de artefatos 5 estrelas',
        preco: parseFloat(process.env.SERVICO_GI_FARM_ARTEFATO_PRECO) || 50.00,
        tempo: '4-6 horas',
        emoji: '⚱️',
        destaque: true,
        ordem: 2
    },
    'gi-abismo-espiral': {
        id: 'gi-abismo-espiral',
        jogo_id: 'genshin-impact',
        nome: 'Abismo Espiral 36★',
        descricao: 'Completo do Abismo Espiral com 36 estrelas',
        preco: parseFloat(process.env.SERVICO_GI_ABISMO_ESPIRAL_PRECO) || 35.00,
        tempo: '1-2 horas',
        emoji: '⭐',
        destaque: true,
        ordem: 3
    }
};

// ================================================
// 🔧 CONFIGURAÇÃO DO BOT
// ================================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User]
});

// 🛒 SISTEMA DE CONTROLE
const carrinhos = new Map();
const contadorThreads = new Map();
const threadsFinalizadas = new Map();
const threadsAtivas = new Map();
const mensagensOficiais = new Set();

// ================================================
// 💾 SISTEMA MULTI-JOGOS 100% DINÂMICO
// ================================================

async function inicializarJogos() {
    try {
        const data = await fs.readFile(JOGOS_FILE, 'utf8');
        const jogosExistentes = JSON.parse(data);
        console.log(`🎮 Arquivo de jogos encontrado: ${Object.keys(jogosExistentes).length} jogos`);
        return jogosExistentes;
    } catch (error) {
        console.log('🎮 Criando arquivo inicial de jogos...');
        await salvarJogos(jogosIniciais);
        console.log(`✅ Arquivo inicial de jogos criado: ${Object.keys(jogosIniciais).length} jogos`);
        return jogosIniciais;
    }
}

async function salvarJogos(jogos) {
    try {
        await fs.writeFile(JOGOS_FILE, JSON.stringify(jogos, null, 2), 'utf8');
        console.log('💾 Jogos salvos com sucesso');
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar jogos:', error);
        return false;
    }
}

async function inicializarServicos() {
    try {
        const data = await fs.readFile(SERVICOS_FILE, 'utf8');
        const servicosExistentes = JSON.parse(data);
        console.log(`📁 Arquivo de serviços encontrado: ${Object.keys(servicosExistentes).length} serviços`);
        return servicosExistentes;
    } catch (error) {
        console.log('📝 Criando arquivo inicial de serviços...');
        await salvarServicos(servicosIniciais);
        console.log(`✅ Arquivo inicial de serviços criado: ${Object.keys(servicosIniciais).length} serviços`);
        return servicosIniciais;
    }
}

async function salvarServicos(servicos) {
    try {
        await fs.writeFile(SERVICOS_FILE, JSON.stringify(servicos, null, 2), 'utf8');
        console.log('💾 Serviços salvos com sucesso');
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar serviços:', error);
        return false;
    }
}

async function obterTodosJogos() {
    return global.jogosDisponiveis || await inicializarJogos();
}

async function obterJogosAtivos() {
    const jogos = await obterTodosJogos();
    return Object.values(jogos)
        .filter(j => j.ativo === true)
        .sort((a, b) => (a.ordem || 999) - (b.ordem || 999));
}

async function obterTodosServicos() {
    return global.servicosCompletos || await inicializarServicos();
}

async function getServico(servicoId) {
    const servicos = await obterTodosServicos();
    return servicos[servicoId];
}

async function getJogo(jogoId) {
    const jogos = await obterTodosJogos();
    return jogos[jogoId];
}

async function obterServicosPorJogo(jogoId) {
    const servicos = await obterTodosServicos();
    return Object.values(servicos)
        .filter(s => s.jogo_id === jogoId)
        .sort((a, b) => (a.ordem || 999) - (b.ordem || 999));
}

async function obterServicosDestaquePorJogo(jogoId) {
    const servicos = await obterServicosPorJogo(jogoId);
    return servicos.filter(s => s.destaque === true).slice(0, 6);
}

// ================================================
// 🔍 FUNÇÕES UTILITÁRIAS (mantidas iguais)
// ================================================

function isHellzaAdmin(member) {
    if (!member || !member.roles || !member.roles.cache) return false;
    return member.roles.cache.some(role =>
        role.name.toLowerCase() === CARGO_ADMIN_PRINCIPAL.toLowerCase()
    );
}

function isSuporteAdmin(member) {
    if (!member || !member.roles || !member.roles.cache) return false;
    return member.roles.cache.some(role =>
        CARGOS_SUPORTE.some(cargo => role.name.toLowerCase().includes(cargo.toLowerCase()))
    );
}

function isQualquerAdmin(member) {
    if (!member) return false;
    return isHellzaAdmin(member) || isSuporteAdmin(member);
}

function isAdminNaGuild(userId, guild) {
    try {
        const member = guild.members.cache.get(userId);
        if (!member) return false;
        return isQualquerAdmin(member);
    } catch (error) {
        console.error(`❌ Erro ao verificar admin ${userId}:`, error);
        return false;
    }
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
    if (threadsAtivas.has(userId)) {
        threadsAtivas.delete(userId);
        console.log(`🔓 Thread ativa removida para ${userId}`);
        return true;
    }
    return false;
}

// ================================================
// 🧹 FUNÇÃO DE LIMPEZA (mantida igual)
// ================================================

async function limparMensagensGuild(guild) {
    console.log(`🧹 Limpando mensagens antigas no servidor: ${guild.name}`);
    try {
        const channels = guild.channels.cache.filter(c => c.isTextBased() && !c.isThread());
        let totalDeleted = 0;

        for (const [channelId, channel] of channels) {
            try {
                if (channel.name.toLowerCase().includes(CANAL_LOG_FINALIZADOS.toLowerCase())) {
                    console.log(`🛡️ Protegido: Pulando limpeza no canal ${channel.name} (canal de logs)`);
                    continue;
                }

                if (!channel.permissionsFor(guild.members.me)?.has(PermissionsBitField.Flags.ReadMessageHistory)) {
                    console.log(`⚠️ Bot sem permissão de leitura em ${channel.name}. Ignorando limpeza.`);
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
                        mensagensOficiais.delete(msgId);
                        totalDeleted++;
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } catch (error) {
                        console.error(`❌ Erro ao deletar mensagem ${msgId} em ${channel.name}:`, error.message);
                    }
                }
            } catch (error) {
                console.error(`❌ Erro ao buscar mensagens no canal ${channel.name}:`, error.message);
            }
        }
        console.log(`✅ ${totalDeleted} mensagens antigas removidas de ${guild.name} (${CANAL_LOG_FINALIZADOS} protegido)`);
    } catch (error) {
        console.error('❌ Erro geral na limpeza de mensagens:', error);
    }
}

// ================================================
// 📢 POSTAGEM AUTOMÁTICA MULTI-JOGOS DINÂMICA
// ================================================

async function postarServicosAutomatico(guild) {
    console.log(`📢 Postando serviços multi-jogos em: ${guild.name}`);

    await limparMensagensGuild(guild);

    // 🎮 OBTÉM TODOS OS JOGOS ATIVOS
    const jogosAtivos = await obterJogosAtivos();

    // 🌟 MONTA SEÇÃO DE PRINCIPAIS SERVIÇOS DE TODOS OS JOGOS
    let secaoPrincipais = '';
    let totalDestaques = 0;

    for (const jogo of jogosAtivos) {
        const servicosDestaque = await obterServicosDestaquePorJogo(jogo.id);
        if (servicosDestaque.length > 0) {
            secaoPrincipais += `\n**${jogo.emoji} ${jogo.nome}:**\n`;
            secaoPrincipais += servicosDestaque.slice(0, 3).map(s => 
                `${s.emoji} ${s.nome} - **R$ ${s.preco.toFixed(2).replace('.', ',')}**`
            ).join('\n');
            secaoPrincipais += '\n';
            totalDestaques += servicosDestaque.length;
        }
    }

    const embed = new EmbedBuilder()
        .setTitle('🎮 SERVIÇOS GAMING MULTI-JOGOS v2.2')
        .setDescription(
            '**❗ NÃO USO HACK - CHEATS! ❗**\n\n' +
            '🛒 **Sistema Profissional Multi-Jogos:**\n' +
            '• Clique em 🛒 para abrir sua loja privada\n' +
            '• Sistema de seleção por jogo\n' +
            '• Uma thread por cliente (sem duplicatas)\n' +
            '• Numeração sequencial automática\n' +
            '• Controle administrativo Hellza\n\n' +

            '**🎯 PRINCIPAIS SERVIÇOS:**' + secaoPrincipais + '\n' +

            '**🎮 JOGOS DISPONÍVEIS:**\n' +
            jogosAtivos.map(j => `${j.emoji} ${j.nome}`).join(' • ') + '\n\n' +

            '**💡 Diferenciais Exclusivos:**\n' +
            '✅ Atendimento privado numerado\n' +
            '✅ Sistema multi-jogos organizado\n' +
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
            text: `Sistema Multi-Jogos v2.2 • ${jogosAtivos.length} Jogos • ${totalDestaques} Serviços • Controle Hellza`,
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
                const mensagem = await canal.send({ content: '@everyone', embeds: [embed] });
                await mensagem.react('🛒');

                try {
                    await mensagem.pin();
                    console.log(`📌 Mensagem multi-jogos fixada em: ${canal.name}`);
                } catch (pinError) {
                    console.error(`❌ Erro ao fixar mensagem em ${canal.name}:`, pinError.message);
                }

                mensagensOficiais.add(mensagem.id);
                console.log(`✅ Mensagem oficial multi-jogos registrada: ${mensagem.id} em ${canal.name}`);

                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error(`❌ Erro ao postar em ${canal.name}:`, error.message);
            }
        } else {
            console.log(`⚠️ Canal '${nomeCanal}' não encontrado em ${guild.name}`);
        }
    }
}

// ================================================
// 🛒 FUNÇÕES DO CARRINHO MULTI-JOGOS
// ================================================

function getCarrinho(userId) {
    if (!carrinhos.has(userId)) {
        carrinhos.set(userId, { items: [], total: 0, jogoSelecionado: null });
    }
    return carrinhos.get(userId);
}

async function adicionarItem(userId, servicoId, quantidade = 1) {
    const carrinho = getCarrinho(userId);
    const servico = await getServico(servicoId);

    if (!servico) return false;

    const itemExistente = carrinho.items.find(item => item.id === servicoId);

    if (itemExistente) {
        itemExistente.quantidade += quantidade;
        itemExistente.subtotal = itemExistente.preco * itemExistente.quantidade;
    } else {
        carrinho.items.push({
            id: servicoId,
            jogo_id: servico.jogo_id,
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
    carrinhos.set(userId, { items: [], total: 0, jogoSelecionado: null });
}

function selecionarJogo(userId, jogoId) {
    const carrinho = getCarrinho(userId);
    carrinho.jogoSelecionado = jogoId;
    // Limpa itens se mudou de jogo
    const itensDoJogo = carrinho.items.filter(item => item.jogo_id === jogoId);
    carrinho.items = itensDoJogo;
    carrinho.total = carrinho.items.reduce((sum, item) => sum + item.subtotal, 0);
}

// ================================================
// 📊 LOG DE SERVIÇOS (mantido igual)
// ================================================

async function logarServicoFinalizado(guild, clienteMember, adminMember, threadName, carrinho) {
    try {
        const canalLog = guild.channels.cache.find(c => 
            c.name.toLowerCase().includes(CANAL_LOG_FINALIZADOS.toLowerCase()) && 
            c.isTextBased() && 
            !c.isThread()
        );

        if (!canalLog) {
            console.log(`⚠️ Canal de log '${CANAL_LOG_FINALIZADOS}' não encontrado`);
            return false;
        }

        const totalValor = carrinho.total.toFixed(2).replace('.', ',');
        const totalItens = carrinho.items.reduce((sum, item) => sum + item.quantidade, 0);

        // 🎮 AGRUPA SERVIÇOS POR JOGO
        const servicosPorJogo = {};
        for (const item of carrinho.items) {
            if (!servicosPorJogo[item.jogo_id]) {
                servicosPorJogo[item.jogo_id] = [];
            }
            servicosPorJogo[item.jogo_id].push(item);
        }

        let listaServicos = '';
        for (const [jogoId, itens] of Object.entries(servicosPorJogo)) {
            const jogo = await getJogo(jogoId);
            listaServicos += `**${jogo ? jogo.emoji + ' ' + jogo.nome : jogoId}:**\n`;
            listaServicos += itens.map(item => 
                `${item.emoji} **${item.nome}** (${item.quantidade}x) - R$ ${item.subtotal.toFixed(2).replace('.', ',')}`
            ).join('\n') + '\n\n';
        }

        const embedLog = new EmbedBuilder()
            .setTitle('✅ SERVIÇO MULTI-JOGOS FINALIZADO')
            .setDescription(
                `**📋 RESUMO DA TRANSAÇÃO**\n\n` +
                `👤 **Cliente:** ${clienteMember.user.tag} (\`${clienteMember.id}\`)\n` +
                `👑 **Admin:** ${adminMember.user.tag} (\`${adminMember.id}\`)\n` +
                `🧵 **Thread:** ${threadName}\n` +
                `📅 **Data:** ${new Date().toLocaleString('pt-BR')}\n` +
                `🕐 **Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`
            )
            .addFields([
                { 
                    name: '🎮 Serviços Realizados', 
                    value: listaServicos || 'Nenhum serviço encontrado', 
                    inline: false 
                },
                { 
                    name: '📊 Total de Itens', 
                    value: `${totalItens} itens`, 
                    inline: true 
                },
                { 
                    name: '💰 Valor Total', 
                    value: `R$ ${totalValor}`, 
                    inline: true 
                },
                { 
                    name: '🏷️ Status', 
                    value: 'Finalizado ✅', 
                    inline: true 
                }
            ])
            .setColor(0x00FF00)
            .setThumbnail(clienteMember.user.displayAvatarURL())
            .setFooter({ 
                text: `Sistema Multi-Jogos Hellza • ID: ${Date.now()}`, 
                iconURL: guild.iconURL() 
            })
            .setTimestamp();

        await canalLog.send({ embeds: [embedLog] });
        console.log(`📊 Log multi-jogos enviado para ${canalLog.name}: ${clienteMember.user.tag} | R$ ${totalValor}`);
        return true;

    } catch (error) {
        console.error('❌ Erro ao enviar log de serviço finalizado:', error);
        return false;
    }
}

// ================================================
// 🎮 INTERFACES DINÂMICAS MULTI-JOGOS
// ================================================

async function criarDropdownJogos() {
    const jogosAtivos = await obterJogosAtivos();

    const options = jogosAtivos.map(jogo => 
        new StringSelectMenuOptionBuilder()
            .setLabel(jogo.nome)
            .setDescription(jogo.descricao)
            .setValue(jogo.id)
            .setEmoji(jogo.emoji)
    );

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_jogo')
        .setPlaceholder('🎮 Primeiro, escolha o jogo')
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(options);

    return new ActionRowBuilder().addComponents(selectMenu);
}

async function criarDropdownServicos(jogoId) {
    const servicosDoJogo = await obterServicosPorJogo(jogoId);
    const servicosArray = servicosDoJogo.slice(0, 25); // Máximo 25 opções

    if (servicosArray.length === 0) {
        return null;
    }

    const options = servicosArray.map(servico => 
        new StringSelectMenuOptionBuilder()
            .setLabel(`${servico.nome}`)
            .setDescription(`R$ ${servico.preco.toFixed(2).replace('.', ',')} • ${servico.tempo}`)
            .setValue(servico.id)
            .setEmoji(servico.emoji)
    );

    const jogo = await getJogo(jogoId);
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_servico')
        .setPlaceholder(`${jogo.emoji} Escolha um serviço de ${jogo.nome}`)
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

async function criarCarrinhoEmbed(userId, user) {
    const carrinho = getCarrinho(userId);

    if (carrinho.items.length === 0) {
        const jogoSelecionado = carrinho.jogoSelecionado ? await getJogo(carrinho.jogoSelecionado) : null;

        return new EmbedBuilder()
            .setTitle('🛒 Carrinho Multi-Jogos - ' + user.displayName)
            .setDescription(
                jogoSelecionado ? 
                `**Jogo selecionado:** ${jogoSelecionado.emoji} ${jogoSelecionado.nome}\n\n**Carrinho vazio**\n\n🎮 Selecione serviços no menu para começar!` :
                '**Carrinho vazio**\n\n🎮 Primeiro escolha um jogo, depois selecione os serviços!'
            )
            .addFields([
                { name: '💰 Total', value: 'R$ 0,00', inline: true },
                { name: '📦 Itens', value: '0', inline: true },
                { name: '⏱️ Status', value: 'Aguardando', inline: true }
            ])
            .setColor(0x5865F2)
            .setTimestamp();
    }

    // 🎮 AGRUPA ITENS POR JOGO
    const itensPorJogo = {};
    for (const item of carrinho.items) {
        if (!itensPorJogo[item.jogo_id]) {
            itensPorJogo[item.jogo_id] = [];
        }
        itensPorJogo[item.jogo_id].push(item);
    }

    let itensLista = '';
    for (const [jogoId, itens] of Object.entries(itensPorJogo)) {
        const jogo = await getJogo(jogoId);
        itensLista += `**${jogo ? jogo.emoji + ' ' + jogo.nome : jogoId}:**\n`;
        itensLista += itens.map((item, index) => 
            `${index + 1}. ${item.emoji} **${item.nome}** (**${item.quantidade}x**)\n` +
            `   💰 R$ ${item.subtotal.toFixed(2).replace('.', ',')} • ⏱️ ${item.tempo}`
        ).join('\n') + '\n\n';
    }

    return new EmbedBuilder()
        .setTitle(`🛒 Carrinho Multi-Jogos - ${user.displayName}`)
        .setDescription(`🎉 **Seus serviços selecionados:**\n\n${itensLista}`)
        .addFields([
            { name: '💰 VALOR TOTAL', value: `**R$ ${carrinho.total.toFixed(2).replace('.', ',')}**`, inline: true },
            { name: '📦 Total de Itens', value: carrinho.items.reduce((sum, item) => sum + item.quantidade, 0).toString(), inline: true },
            { name: '⏱️ Status', value: 'Pronto para finalizar', inline: true }
        ])
        .setColor(0x00D4AA)
        .setFooter({ text: `${carrinho.items.length} tipos de serviços • Sistema Multi-Jogos` })
        .setTimestamp();
}

async function criarPagamentoEmbed(userId, user) {
    const carrinho = getCarrinho(userId);

    // 🎮 AGRUPA ITENS POR JOGO PARA RESUMO
    const itensPorJogo = {};
    for (const item of carrinho.items) {
        if (!itensPorJogo[item.jogo_id]) {
            itensPorJogo[item.jogo_id] = [];
        }
        itensPorJogo[item.jogo_id].push(item);
    }

    let resumoDetalhado = '';
    let contador = 1;
    for (const [jogoId, itens] of Object.entries(itensPorJogo)) {
        const jogo = await getJogo(jogoId);
        resumoDetalhado += `**${jogo ? jogo.emoji + ' ' + jogo.nome : jogoId}:**\n`;
        resumoDetalhado += itens.map(item => 
            `**${contador++}.** ${item.emoji} **${item.nome}** (**${item.quantidade}x**)\n` +
            `    💰 R$ ${item.subtotal.toFixed(2).replace('.', ',')} • ⏱️ ${item.tempo}`
        ).join('\n') + '\n\n';
    }

    const totalItens = carrinho.items.reduce((sum, item) => sum + item.quantidade, 0);

    return new EmbedBuilder()
        .setTitle('💳 🎉 PEDIDO MULTI-JOGOS FINALIZADO!')
        .setDescription(
            `**Parabéns ${user.displayName}!**\n\n` +
            `**📋 RESUMO DO PEDIDO:**\n\n${resumoDetalhado}` +
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
        .setFooter({ text: '⚠️ Thread única • Sistema Multi-Jogos • Botão exclusivo para Administradores' })
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
                .setCustomId('trocar_jogo')
                .setLabel('🎮 Trocar Jogo')
                .setStyle(ButtonStyle.Primary),
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
                .setLabel('👑 FINALIZAR SERVIÇO')
                .setStyle(ButtonStyle.Danger)
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


// ================================================
// 🎛️ COMANDOS ADMINISTRATIVOS MULTI-JOGOS + TUTORIAL
// ================================================

const comandos = [
    // 📚 TUTORIAL DE COMANDOS
    new SlashCommandBuilder()
        .setName('tutorial')
        .setDescription('👑 [ADMIN] Tutorial completo de todos os comandos administrativos'),

    // 🎮 GERENCIAR JOGOS
    new SlashCommandBuilder()
        .setName('addjogo')
        .setDescription('👑 [ADMIN] Adicionar novo jogo')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID único do jogo (ex: valorant)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('nome')
                .setDescription('Nome do jogo (ex: Valorant)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('Emoji do jogo (ex: 🎯)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('descricao')
                .setDescription('Descrição do jogo')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('ativo')
                .setDescription('Jogo ativo? (padrão: true)')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('ordem')
                .setDescription('Ordem de exibição (menor número = aparece primeiro)')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('editjogo')
        .setDescription('👑 [ADMIN] Editar jogo existente')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID do jogo para editar')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('campo')
                .setDescription('Campo a editar')
                .setRequired(true)
                .addChoices(
                    { name: 'Nome', value: 'nome' },
                    { name: 'Emoji', value: 'emoji' },
                    { name: 'Descrição', value: 'descricao' },
                    { name: 'Ativo', value: 'ativo' },
                    { name: 'Ordem', value: 'ordem' }
                ))
        .addStringOption(option =>
            option.setName('valor')
                .setDescription('Novo valor para o campo')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('removejogo')
        .setDescription('👑 [ADMIN] Remover jogo (cuidado: remove TODOS os serviços)')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID do jogo para remover')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('listjogos')
        .setDescription('👑 [ADMIN] Listar todos os jogos'),

    // 🛠️ GERENCIAR SERVIÇOS
    new SlashCommandBuilder()
        .setName('addservico')
        .setDescription('👑 [ADMIN] Adicionar novo serviço')
        .addStringOption(option =>
            option.setName('jogo')
                .setDescription('ID do jogo (ex: zenless-zone-zero)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID único do serviço (ex: farm-premium)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('nome')
                .setDescription('Nome do serviço (ex: Farm Premium)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('descricao')
                .setDescription('Descrição detalhada do serviço')
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('preco')
                .setDescription('Preço em reais (ex: 50.00)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('tempo')
                .setDescription('Tempo estimado (ex: 2-3 horas)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('Emoji para o serviço (ex: 🆕)')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('destaque')
                .setDescription('Aparece nos PRINCIPAIS SERVIÇOS? (padrão: false)')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('ordem')
                .setDescription('Ordem de exibição (número menor = aparece primeiro)')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('editservico')
        .setDescription('👑 [ADMIN] Editar serviço existente')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID do serviço para editar')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('campo')
                .setDescription('Campo a editar')
                .setRequired(true)
                .addChoices(
                    { name: 'Nome', value: 'nome' },
                    { name: 'Descrição', value: 'descricao' },
                    { name: 'Preço', value: 'preco' },
                    { name: 'Tempo', value: 'tempo' },
                    { name: 'Emoji', value: 'emoji' },
                    { name: 'Destaque', value: 'destaque' },
                    { name: 'Ordem', value: 'ordem' },
                    { name: 'Jogo', value: 'jogo_id' }
                ))
        .addStringOption(option =>
            option.setName('valor')
                .setDescription('Novo valor para o campo')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('removeservico')
        .setDescription('👑 [ADMIN] Remover serviço')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID do serviço para remover')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('listservicos')
        .setDescription('👑 [ADMIN] Listar serviços')
        .addStringOption(option =>
            option.setName('jogo')
                .setDescription('Filtrar por jogo (opcional)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('filtro')
                .setDescription('Filtrar por tipo')
                .setRequired(false)
                .addChoices(
                    { name: 'Todos', value: 'todos' },
                    { name: 'Em Destaque', value: 'destaque' },
                    { name: 'Padrão', value: 'padrao' }
                )),

    // 💰 GERENCIAR PREÇOS
    new SlashCommandBuilder()
        .setName('precoservico')
        .setDescription('👑 [ADMIN] Alterar preço de um serviço')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID do serviço')
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('preco')
                .setDescription('Novo preço em reais')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('destacarservico')
        .setDescription('👑 [ADMIN] Colocar/tirar serviço do destaque')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID do serviço')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('destaque')
                .setDescription('Destacar? (true/false)')
                .setRequired(true)),

    // 📊 SISTEMA
    new SlashCommandBuilder()
        .setName('recarregarmensagens')
        .setDescription('👑 [ADMIN] Recarregar mensagens com jogos e serviços atualizados'),

    new SlashCommandBuilder()
        .setName('estatisticas')
        .setDescription('👑 [ADMIN] Ver estatísticas do sistema')
];

// ================================================
// 🌟 EVENT: BOT CONECTADO MULTI-JOGOS
// ================================================

client.once(Events.ClientReady, async () => {
    console.log(`🤖 Bot MULTI-JOGOS online: ${client.user.tag}!`);
    console.log(`👑 Cargo principal: ${CARGO_ADMIN_PRINCIPAL}`);
    console.log(`👥 Cargos suporte: ${CARGOS_SUPORTE.join(', ')}`);
    console.log(`📊 Canal de log: ${CANAL_LOG_FINALIZADOS}`);

    console.log('⚙️ Variáveis PIX:', {
        chave: process.env.PIX_CHAVE || 'NÃO CONFIGURADA',
        nome: process.env.PIX_NOME || 'NÃO CONFIGURADA',
        banco: process.env.PIX_BANCO || 'NÃO CONFIGURADA'
    });

    console.log('🎛️ Registrando comandos administrativos multi-jogos...');
    try {
        const data = await client.application.commands.set(comandos);
        console.log(`✅ ${data.size} comandos administrativos registrados!`);
    } catch (error) {
        console.error('❌ Erro ao registrar comandos:', error);
    }

    console.log('🎮 Inicializando sistema multi-jogos...');
    global.jogosDisponiveis = await inicializarJogos();
    global.servicosCompletos = await inicializarServicos();

    const totalJogos = Object.keys(global.jogosDisponiveis).length;
    const jogosAtivos = await obterJogosAtivos();
    const totalServicos = Object.keys(global.servicosCompletos).length;

    console.log(`🎮 ${totalJogos} jogos carregados (${jogosAtivos.length} ativos)`);
    console.log(`📊 ${totalServicos} serviços carregados`);
    console.log(`🔒 Sistema anti-duplicação ativo`);

    client.user.setActivity(`🎮 ${jogosAtivos.length} Jogos • ${totalServicos} Serviços`, { type: 'PLAYING' });

    setTimeout(async () => {
        console.log('🧹 Iniciando configuração automática multi-jogos...');

        for (const [guildId, guild] of client.guilds.cache) {
            try {
                await postarServicosAutomatico(guild);
                console.log(`✅ Servidor ${guild.name} configurado com sistema multi-jogos!`);
            } catch (error) {
                console.error(`❌ Erro ao configurar o servidor ${guild.name}:`, error);
            }
        }

        console.log('🚀 Sistema multi-jogos totalmente ativo!');
    }, 5000);
});

// ================================================
// 🛒 EVENT: REAÇÕES MULTI-JOGOS
// ================================================

client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (user.bot) return;

    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Erro ao buscar reação parcial:', error);
            return;
        }
    }

    if (reaction.emoji.name === '🛒') {
        if (!mensagensOficiais.has(reaction.message.id)) {
            console.log(`🚫 Reação em mensagem não oficial ignorada: ${reaction.message.id} por ${user.tag}`);
            await reaction.users.remove(user.id);

            try {
                await user.send(
                    `🚫 **Atenção ${user.displayName}!**\n\n` +
                    `Você reagiu com 🛒 em uma mensagem não oficial.\n\n` +
                    `✅ **Para criar sua loja privada:**\n` +
                    `• Reaja 🛒 apenas nas **mensagens fixadas** do bot\n` +
                    `• Procure por mensagens com título "SERVIÇOS GAMING MULTI-JOGOS"\n` +
                    `• São as mensagens **oficiais** e **fixadas** nos canais\n\n` +
                    `🔍 Volte aos canais e procure pela mensagem oficial fixada!`
                );
            } catch (dmError) {
                console.log(`❌ Não foi possível enviar DM para ${user.tag}:`, dmError.message);
            }

            return;
        }

        const guild = reaction.message.guild;
        const member = guild.members.cache.get(user.id);

        if (member && isQualquerAdmin(member)) {
            console.log(`👑 Admin ${user.tag} reagiu ao carrinho - permitindo acesso especial`);
            await reaction.users.remove(user.id);

            try {
                await user.send(
                    `👑 **Acesso Administrativo Multi-Jogos - ${user.displayName}**\n\n` +
                    `Você é um administrador e reagiu ao sistema de carrinho.\n\n` +
                    `⚠️ **Nota:** Administradores não precisam criar threads de cliente.\n` +
                    `📊 **Função:** Vocês gerenciam as threads criadas pelos clientes.\n\n` +
                    `🎛️ **Comandos disponíveis:** /tutorial para ver todos os comandos\n` +
                    `🔧 **Para testes:** Se quiser testar como cliente, peça para alguém sem cargo admin reagir ao 🛒.\n\n` +
                    `✅ **Sistema multi-jogos funcionando normalmente!**`
                );
            } catch (dmError) {
                console.log(`❌ Não foi possível enviar DM para admin ${user.tag}:`, dmError.message);
            }

            return;
        }

        if (temThreadAtiva(user.id)) {
            const threadAtivaId = getThreadAtiva(user.id);
            const threadAtiva = guild.channels.cache.get(threadAtivaId);

            console.log(`🚫 ${user.tag} tentou criar nova thread tendo uma ativa: ${threadAtivaId}`);

            await reaction.users.remove(user.id);

            let mensagemAviso = `🚫 **${user.displayName}, você já tem uma thread ativa!**\n\n`;

            if (threadAtiva && !threadAtiva.archived) {
                mensagemAviso += `📍 **Sua thread ativa:** ${threadAtiva.name}\n`;
                mensagemAviso += `🔗 Acesse sua thread existente para continuar suas compras.\n\n`;
            } else {
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

        const numeroThread = getProximoNumeroThread(user.id);
        const nomeThread = `🛒-loja-${user.username}-${numeroThread}`;

        console.log(`🔢 Criando thread multi-jogos ${numeroThread} para ${user.tag}: ${nomeThread}`);

        try {
            const thread = await reaction.message.channel.threads.create({
                name: nomeThread,
                type: ChannelType.PublicThread,
                autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
                reason: `Loja multi-jogos ${numeroThread} para ${user.tag}`,
                invitable: false
            });

            await thread.permissionOverwrites.edit(thread.guild.roles.everyone, {
                ViewChannel: false,
                SendMessages: false,
                ReadMessageHistory: false
            });

            await thread.permissionOverwrites.edit(user.id, {
                ViewChannel: true,
                SendMessages: true,
                AttachFiles: true,
                ReadMessageHistory: true,
                UseExternalEmojis: true,
                AddReactions: true
            });

            marcarThreadAtiva(user.id, thread.id);
            await thread.members.add(user.id);
            console.log(`👤 ${user.tag} adicionado à thread multi-jogos ${numeroThread} com permissões completas`);

            let hellzaAdmins = 0;
            let suporteAdmins = 0;

            try {
                await guild.members.fetch();
            } catch (fetchError) {
                console.log('⚠️ Erro ao buscar membros, usando cache atual');
            }

            const hellzaRole = guild.roles.cache.find(role => 
                role.name.toLowerCase() === CARGO_ADMIN_PRINCIPAL.toLowerCase()
            );

            if (hellzaRole) {
                await thread.permissionOverwrites.edit(hellzaRole, {
                    ViewChannel: true,
                    SendMessages: true,
                    AttachFiles: true,
                    ReadMessageHistory: true,
                    ManageMessages: true,
                    ManageThreads: true
                });

                const hellzaMembers = guild.members.cache.filter(member => 
                    member.roles.cache.has(hellzaRole.id) && !member.user.bot
                );

                for (const [memberId, hellzaMember] of hellzaMembers) {
                    try {
                        await thread.members.add(hellzaMember.id);
                        console.log(`👑 Hellza Admin ${hellzaMember.user.tag} adicionado`);
                        hellzaAdmins++;
                        await new Promise(resolve => setTimeout(resolve, 300));
                    } catch (error) {
                        console.error(`❌ Erro ao adicionar Hellza ${hellzaMember.user.tag}:`, error.message);
                    }
                }
            }

            for (const cargoNome of CARGOS_SUPORTE) {
                const cargoSuporte = guild.roles.cache.find(role =>
                    role.name.toLowerCase().includes(cargoNome.toLowerCase())
                );

                if (cargoSuporte && cargoSuporte.id !== hellzaRole?.id) {
                    await thread.permissionOverwrites.edit(cargoSuporte, {
                        ViewChannel: true,
                        SendMessages: true,
                        AttachFiles: true,
                        ReadMessageHistory: true
                    });

                    const suporteMembers = guild.members.cache.filter(member => 
                        member.roles.cache.has(cargoSuporte.id) && !member.user.bot
                    );

                    for (const [memberId, supportMember] of suporteMembers) {
                        try {
                            await thread.members.add(supportMember.id);
                            console.log(`👥 Suporte ${supportMember.user.tag} adicionado (cargo: ${cargoSuporte.name})`);
                            suporteAdmins++;
                            await new Promise(resolve => setTimeout(resolve, 300));
                        } catch (error) {
                            console.error(`❌ Erro ao adicionar suporte ${supportMember.user.tag}:`, error.message);
                        }
                    }
                }
            }

            const totalAdmins = hellzaAdmins + suporteAdmins;
            const jogosAtivos = await obterJogosAtivos();
            const totalServicos = Object.keys(global.servicosCompletos).length;

            console.log(`✅ Thread multi-jogos ${numeroThread}: ${hellzaAdmins} Hellza + ${suporteAdmins} suporte = ${totalAdmins} admins`);

            await new Promise(resolve => setTimeout(resolve, 2000));

            const welcomeEmbed = new EmbedBuilder()
                .setTitle(`🎉 Loja Multi-Jogos Exclusiva #${numeroThread} - ${user.displayName}`)
                .setDescription(
                    `**Bem-vindo à sua loja multi-jogos exclusiva!** 🛒✨\n\n` +
                    `**🔢 Thread Número:** ${numeroThread}\n` +
                    `**🔒 Status:** Thread única ativa\n` +
                    `**👑 Hellza Admins:** ${hellzaAdmins}\n` +
                    `**👥 Equipe Suporte:** ${suporteAdmins}\n` +
                    `**📊 Total da Equipe:** ${totalAdmins}\n` +
                    `**🎮 Jogos Disponíveis:** ${jogosAtivos.length}\n` +
                    `**🛠️ Total de Serviços:** ${totalServicos}\n\n` +

                    '**🎯 Sistema Multi-Jogos:**\n' +
                    '• Primeiro escolha o jogo\n' +
                    '• Depois selecione os serviços\n' +
                    '• Sistema de dropdown em cascata\n' +
                    '• Controle por jogo organizado\n\n' +

                    '**🛡️ Conversa privada e protegida**\n' +
                    'Thread exclusiva com controle total da administração\n\n' +

                    '**💬 AGORA VOCÊ PODE:**\n' +
                    '✅ Enviar mensagens de texto\n' +
                    '✅ Enviar comprovantes PIX (imagens)\n' +
                    '✅ Tirar dúvidas com a equipe\n' +
                    '✅ Usar todos os botões e menus\n\n' +

                    '**⚠️ IMPORTANTE:**\n' +
                    '• NÃO usamos hack/cheats - Serviços legítimos\n' +
                    '• Aguarde finalização Hellza para nova thread\n' +
                    '• Esta é sua thread exclusiva até finalização'
                )
                .setColor(0x00AE86)
                .setThumbnail(user.displayAvatarURL())
                .setFooter({ text: `Sistema Multi-Jogos v2.2 • Thread ${numeroThread} • ${jogosAtivos.length} Jogos • Cliente pode falar!` })
                .setTimestamp();

            // 🎮 COMEÇA COM DROPDOWN DE JOGOS
            const dropdownJogos = await criarDropdownJogos();
            const buttonsCarrinho = criarBotoesCarrinho();
            const carrinhoEmbed = await criarCarrinhoEmbed(user.id, user);

            await thread.send({ embeds: [welcomeEmbed] });
            await new Promise(resolve => setTimeout(resolve, 1500));
            await thread.send({ 
                embeds: [carrinhoEmbed],
                components: [dropdownJogos, buttonsCarrinho]
            });

            console.log(`🛒 Loja multi-jogos ${numeroThread} aberta para ${user.tag} com ${totalAdmins} admins`);
            await reaction.users.remove(user.id);

            const confirmMsg = await reaction.message.channel.send(
                `✅ ${user}, loja multi-jogos exclusiva **#${numeroThread}** criada! 🛒🎮\n` +
                `👑 **${hellzaAdmins} Hellza** + **${suporteAdmins} suporte** = **${totalAdmins} total** na equipe!\n` +
                `🎮 **${jogosAtivos.length} jogos** e **${totalServicos} serviços** disponíveis!\n` +
                `💬 **Agora você pode conversar normalmente na thread!**`
            );
            setTimeout(() => confirmMsg.delete().catch(() => {}), 15000);

        } catch (error) {
            console.error(`❌ Erro crítico ao criar thread multi-jogos para ${user.tag}:`, error);
            removerThreadAtiva(user.id);

            try {
                await user.send(
                    `❌ **Ocorreu um erro ao criar sua loja multi-jogos.** Por favor, tente novamente mais tarde ou contate um administrador.`
                );
            } catch (dmError) {
                console.error(`❌ Não foi possível enviar DM de erro para ${user.tag}:`, dmError.message);
            }
        }
    }
});

// ================================================
// 🗑️ EVENT: THREAD DELETADA/ARQUIVADA
// ================================================

client.on(Events.ThreadDelete, (thread) => {
    for (const [userId, threadId] of threadsAtivas.entries()) {
        if (threadId === thread.id) {
            removerThreadAtiva(userId);
            console.log(`🗑️ Thread multi-jogos ${thread.name} deletada, controle removido para usuário ${userId}`);
            break;
        }
    }
});

client.on(Events.ThreadUpdate, (oldThread, newThread) => {
    if (newThread.archived && !oldThread.archived) {
        for (const [userId, threadId] of threadsAtivas.entries()) {
            if (threadId === newThread.id) {
                removerThreadAtiva(userId);
                console.log(`📦 Thread multi-jogos ${newThread.name} arquivada, controle removido para usuário ${userId}`);
                break;
            }
        }
    }
});


// ================================================
// 🎛️ EVENT: INTERAÇÕES COMPLETAS MULTI-JOGOS
// ================================================

client.on(Events.InteractionCreate, async (interaction) => {
    // ================================================
    // 🎛️ COMANDOS ADMINISTRATIVOS MULTI-JOGOS
    // ================================================
    if (interaction.isChatInputCommand()) {
        const { commandName, member, options } = interaction;

        if (!isQualquerAdmin(member)) {
            await interaction.reply({
                content: '🚫 **ACESSO NEGADO**\n\n❌ Apenas administradores podem usar comandos de gerenciamento.\n\n👑 **Cargos autorizados:** Hellza, Admin, Moderador, Staff, Suporte.\n\n💡 **Dica:** Use /tutorial para ver todos os comandos (apenas admins).',
                ephemeral: true
            });
            return;
        }

        try {
            // 📚 TUTORIAL COMPLETO
            if (commandName === 'tutorial') {
                const tutorialEmbed = new EmbedBuilder()
                    .setTitle('📚 TUTORIAL COMPLETO - COMANDOS ADMINISTRATIVOS')
                    .setDescription('**Sistema Multi-Jogos v2.2 - Guia Completo para Administradores** 👑')
                    .addFields([
                        {
                            name: '🎮 **GERENCIAR JOGOS**',
                            value: 
                                '`/addjogo` - Adicionar novo jogo\n' +
                                '`/editjogo` - Editar jogo existente\n' +
                                '`/removejogo` - Remover jogo (cuidado!)\n' +
                                '`/listjogos` - Listar todos os jogos',
                            inline: false
                        },
                        {
                            name: '🛠️ **GERENCIAR SERVIÇOS**',
                            value: 
                                '`/addservico` - Adicionar serviço (precisa do jogo)\n' +
                                '`/editservico` - Editar serviço existente\n' +
                                '`/removeservico` - Remover serviço\n' +
                                '`/listservicos` - Listar serviços (filtros por jogo)',
                            inline: false
                        },
                        {
                            name: '💰 **PREÇOS E DESTAQUES**',
                            value: 
                                '`/precoservico` - Alterar preço rapidamente\n' +
                                '`/destacarservico` - Colocar/tirar do destaque',
                            inline: false
                        },
                        {
                            name: '📊 **SISTEMA**',
                            value: 
                                '`/recarregarmensagens` - Atualizar mensagens\n' +
                                '`/estatisticas` - Ver stats do sistema\n' +
                                '`/tutorial` - Este tutorial',
                            inline: false
                        },
                        {
                            name: '✨ **EXEMPLOS PRÁTICOS**',
                            value: 
                                '**Novo jogo:**\n' +
                                '`/addjogo id:valorant nome:Valorant emoji:🎯 descricao:Serviços Valorant`\n\n' +
                                '**Novo serviço:**\n' +
                                '`/addservico jogo:valorant id:boost-rank nome:Boost de Rank preco:80.00 tempo:2-3 dias emoji:⬆️ destaque:true`\n\n' +
                                '**Alterar preço:**\n' +
                                '`/precoservico id:boost-rank preco:90.00`\n\n' +
                                '**Destacar serviço:**\n' +
                                '`/destacarservico id:boost-rank destaque:true`',
                            inline: false
                        },
                        {
                            name: '🚨 **IMPORTANTES**',
                            value: 
                                '• **IDs devem ser únicos** (sem espaços)\n' +
                                '• **Preços em formato 99.99** (ponto, não vírgula)\n' +
                                '• **Destaque = aparece na mensagem principal**\n' +
                                '• **Ordem menor = aparece primeiro**\n' +
                                '• **Sempre usar /recarregarmensagens** após mudanças\n' +
                                '• **Remover jogo = remove TODOS seus serviços**',
                            inline: false
                        }
                    ])
                    .setColor(0x0099FF)
                    .setFooter({ 
                        text: 'Sistema Multi-Jogos • Apenas Administradores • Use com responsabilidade 👑',
                        iconURL: interaction.guild.iconURL()
                    })
                    .setTimestamp();

                await interaction.reply({ embeds: [tutorialEmbed], ephemeral: true });
                return;
            }

            // 🎮 ADICIONAR JOGO
            if (commandName === 'addjogo') {
                const id = options.getString('id').toLowerCase().replace(/\s+/g, '-');
                const nome = options.getString('nome');
                const emoji = options.getString('emoji');
                const descricao = options.getString('descricao');
                const ativo = options.getBoolean('ativo') !== false; // Padrão true
                const ordem = options.getInteger('ordem') || 999;

                const jogos = await obterTodosJogos();

                if (jogos[id]) {
                    await interaction.reply({
                        content: `❌ **Jogo já existe!**\n\n🆔 **ID:** ${id}\n🎮 **Nome atual:** ${jogos[id].nome}\n\n💡 **Dica:** Use \`/editjogo\` para modificar ou escolha outro ID.`,
                        ephemeral: true
                    });
                    return;
                }

                jogos[id] = {
                    id: id,
                    nome: nome,
                    emoji: emoji,
                    descricao: descricao,
                    ativo: ativo,
                    ordem: ordem
                };

                const salvou = await salvarJogos(jogos);

                if (salvou) {
                    const embed = new EmbedBuilder()
                        .setTitle('✅ JOGO ADICIONADO COM SUCESSO!')
                        .setDescription(`**${emoji} ${nome}** foi adicionado ao sistema!`)
                        .addFields([
                            { name: '🆔 ID', value: id, inline: true },
                            { name: '🎮 Nome', value: nome, inline: true },
                            { name: '😀 Emoji', value: emoji, inline: true },
                            { name: '📝 Descrição', value: descricao, inline: false },
                            { name: '🟢 Ativo', value: ativo ? 'Sim' : 'Não', inline: true },
                            { name: '🔢 Ordem', value: ordem.toString(), inline: true },
                            { name: '📊 Status', value: 'Disponível', inline: true }
                        ])
                        .setColor(0x00FF00)
                        .setFooter({ text: 'Jogo disponível! Agora você pode adicionar serviços para ele.' })
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed], ephemeral: true });

                    global.jogosDisponiveis = jogos;
                } else {
                    await interaction.reply({
                        content: '❌ **Erro ao salvar jogo!** Tente novamente mais tarde.',
                        ephemeral: true
                    });
                }
            }

            // 🎮 EDITAR JOGO
            if (commandName === 'editjogo') {
                const id = options.getString('id').toLowerCase();
                const campo = options.getString('campo');
                const valor = options.getString('valor');

                const jogos = await obterTodosJogos();

                if (!jogos[id]) {
                    await interaction.reply({
                        content: `❌ **Jogo não encontrado!**\n\n🆔 **ID procurado:** ${id}\n\n💡 **Dica:** Use \`/listjogos\` para ver todos os IDs disponíveis.`,
                        ephemeral: true
                    });
                    return;
                }

                const valorOriginal = jogos[id][campo];

                if (campo === 'ativo') {
                    const novoAtivo = valor.toLowerCase() === 'true';
                    jogos[id][campo] = novoAtivo;
                } else if (campo === 'ordem') {
                    const novaOrdem = parseInt(valor);
                    if (isNaN(novaOrdem)) {
                        await interaction.reply({
                            content: '❌ **Ordem inválida!** Informe um número inteiro (ex: 5)',
                            ephemeral: true
                        });
                        return;
                    }
                    jogos[id][campo] = novaOrdem;
                } else {
                    jogos[id][campo] = valor;
                }

                const salvou = await salvarJogos(jogos);

                if (salvou) {
                    const embed = new EmbedBuilder()
                        .setTitle('✅ JOGO EDITADO COM SUCESSO!')
                        .setDescription(`**${jogos[id].emoji} ${jogos[id].nome}** foi atualizado!`)
                        .addFields([
                            { name: '🆔 ID', value: id, inline: true },
                            { name: '🔧 Campo Editado', value: campo, inline: true },
                            { name: '📊 Status', value: 'Atualizado', inline: true },
                            { name: '⬅️ Valor Anterior', value: String(valorOriginal), inline: true },
                            { name: '➡️ Novo Valor', value: valor, inline: true },
                            { name: '⚡ Efeito', value: 'Imediato', inline: true }
                        ])
                        .setColor(0x0099FF)
                        .setFooter({ text: 'Use /recarregarmensagens para atualizar mensagens públicas!' })
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed], ephemeral: true });

                    global.jogosDisponiveis = jogos;
                } else {
                    await interaction.reply({
                        content: '❌ **Erro ao salvar alterações!** Tente novamente mais tarde.',
                        ephemeral: true
                    });
                }
            }

            // 🎮 REMOVER JOGO
            if (commandName === 'removejogo') {
                const id = options.getString('id').toLowerCase();
                const jogos = await obterTodosJogos();
                const servicos = await obterTodosServicos();

                if (!jogos[id]) {
                    await interaction.reply({
                        content: `❌ **Jogo não encontrado!**\n\n🆔 **ID procurado:** ${id}`,
                        ephemeral: true
                    });
                    return;
                }

                // Conta serviços do jogo
                const servicosDoJogo = Object.values(servicos).filter(s => s.jogo_id === id);
                const jogoInfo = jogos[id];

                // Remove jogo
                delete jogos[id];

                // Remove todos os serviços do jogo
                for (const servico of servicosDoJogo) {
                    delete servicos[servico.id];
                }

                const salvouJogos = await salvarJogos(jogos);
                const salvouServicos = await salvarServicos(servicos);

                if (salvouJogos && salvouServicos) {
                    const embed = new EmbedBuilder()
                        .setTitle('🗑️ JOGO REMOVIDO!')
                        .setDescription(`**${jogoInfo.emoji} ${jogoInfo.nome}** foi removido do sistema.`)
                        .addFields([
                            { name: '🆔 ID Removido', value: id, inline: true },
                            { name: '🛠️ Serviços Afetados', value: `${servicosDoJogo.length} removidos`, inline: true },
                            { name: '📊 Status', value: 'Removido', inline: true }
                        ])
                        .setColor(0xFF0000)
                        .setFooter({ text: 'Jogo e todos os serviços removidos! Use /recarregarmensagens.' })
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed], ephemeral: true });

                    global.jogosDisponiveis = jogos;
                    global.servicosCompletos = servicos;
                } else {
                    await interaction.reply({
                        content: '❌ **Erro ao remover jogo!** Tente novamente.',
                        ephemeral: true
                    });
                }
            }

            // 🎮 LISTAR JOGOS
            if (commandName === 'listjogos') {
                const jogos = await obterTodosJogos();
                const lista = Object.values(jogos).sort((a, b) => (a.ordem || 999) - (b.ordem || 999));

                if (lista.length === 0) {
                    await interaction.reply({
                        content: '🎮 **Nenhum jogo encontrado!**',
                        ephemeral: true
                    });
                    return;
                }

                const servicos = await obterTodosServicos();

                const embed = new EmbedBuilder()
                    .setTitle(`🎮 LISTA DE JOGOS (${lista.length} total)`)
                    .setDescription(
                        lista.map(j => {
                            const servicosCount = Object.values(servicos).filter(s => s.jogo_id === j.id).length;
                            const servicosDestaque = Object.values(servicos).filter(s => s.jogo_id === j.id && s.destaque).length;

                            return `**${j.emoji} ${j.nome}** (\`${j.id}\`)\n` +
                                `${j.ativo ? '🟢 **ATIVO**' : '🔴 **INATIVO**'} • 🔢 Ordem: ${j.ordem || 999}\n` +
                                `📊 ${servicosCount} serviços (${servicosDestaque} em destaque)\n` +
                                `📝 ${j.descricao}\n`;
                        }).join('\n')
                    )
                    .setColor(0x5865F2)
                    .setFooter({ text: `Total: ${lista.length} jogos • Use /addjogo para adicionar mais` })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // 🛠️ ADICIONAR SERVIÇO
            if (commandName === 'addservico') {
                const jogoId = options.getString('jogo').toLowerCase();
                const id = options.getString('id').toLowerCase().replace(/\s+/g, '-');
                const nome = options.getString('nome');
                const descricao = options.getString('descricao');
                const preco = options.getNumber('preco');
                const tempo = options.getString('tempo');
                const emoji = options.getString('emoji');
                const destaque = options.getBoolean('destaque') || false;
                const ordem = options.getInteger('ordem') || 999;

                const jogos = await obterTodosJogos();
                const servicos = await obterTodosServicos();

                if (!jogos[jogoId]) {
                    await interaction.reply({
                        content: `❌ **Jogo não encontrado!**\n\n🎮 **ID procurado:** ${jogoId}\n\n💡 **Dica:** Use \`/listjogos\` para ver os jogos disponíveis.`,
                        ephemeral: true
                    });
                    return;
                }

                if (servicos[id]) {
                    await interaction.reply({
                        content: `❌ **Serviço já existe!**\n\n🆔 **ID:** ${id}\n📝 **Nome atual:** ${servicos[id].nome}\n\n💡 **Dica:** Use \`/editservico\` para modificar ou escolha outro ID.`,
                        ephemeral: true
                    });
                    return;
                }

                const jogo = jogos[jogoId];
                servicos[id] = {
                    id: id,
                    jogo_id: jogoId,
                    nome: nome,
                    descricao: descricao,
                    preco: preco,
                    tempo: tempo,
                    emoji: emoji,
                    destaque: destaque,
                    ordem: ordem
                };

                const salvou = await salvarServicos(servicos);

                if (salvou) {
                    const embed = new EmbedBuilder()
                        .setTitle('✅ SERVIÇO ADICIONADO COM SUCESSO!')
                        .setDescription(`**${emoji} ${nome}** foi adicionado ao **${jogo.emoji} ${jogo.nome}**!`)
                        .addFields([
                            { name: '🆔 ID', value: id, inline: true },
                            { name: '🎮 Jogo', value: `${jogo.emoji} ${jogo.nome}`, inline: true },
                            { name: '💰 Preço', value: `R$ ${preco.toFixed(2).replace('.', ',')}`, inline: true },
                            { name: '⏱️ Tempo', value: tempo, inline: true },
                            { name: '⭐ Destaque', value: destaque ? 'Sim' : 'Não', inline: true },
                            { name: '🔢 Ordem', value: ordem.toString(), inline: true },
                            { name: '📝 Descrição', value: descricao, inline: false }
                        ])
                        .setColor(0x00FF00)
                        .setFooter({ text: 'Serviço disponível! Use /recarregarmensagens para atualizar mensagens.' })
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed], ephemeral: true });

                    global.servicosCompletos = servicos;
                } else {
                    await interaction.reply({
                        content: '❌ **Erro ao salvar serviço!** Tente novamente mais tarde.',
                        ephemeral: true
                    });
                }
            }

            // 🛠️ EDITAR SERVIÇO
            if (commandName === 'editservico') {
                const id = options.getString('id').toLowerCase();
                const campo = options.getString('campo');
                const valor = options.getString('valor');

                const servicos = await obterTodosServicos();

                if (!servicos[id]) {
                    await interaction.reply({
                        content: `❌ **Serviço não encontrado!**\n\n🆔 **ID procurado:** ${id}\n\n💡 **Dica:** Use \`/listservicos\` para ver todos os IDs disponíveis.`,
                        ephemeral: true
                    });
                    return;
                }

                const valorOriginal = servicos[id][campo];

                if (campo === 'preco') {
                    const novoPreco = parseFloat(valor);
                    if (isNaN(novoPreco) || novoPreco <= 0) {
                        await interaction.reply({
                            content: '❌ **Preço inválido!** Informe um valor numérico positivo (ex: 25.50)',
                            ephemeral: true
                        });
                        return;
                    }
                    servicos[id][campo] = novoPreco;
                } else if (campo === 'destaque') {
                    const novoDestaque = valor.toLowerCase() === 'true';
                    servicos[id][campo] = novoDestaque;
                } else if (campo === 'ordem') {
                    const novaOrdem = parseInt(valor);
                    if (isNaN(novaOrdem)) {
                        await interaction.reply({
                            content: '❌ **Ordem inválida!** Informe um número inteiro (ex: 5)',
                            ephemeral: true
                        });
                        return;
                    }
                    servicos[id][campo] = novaOrdem;
                } else if (campo === 'jogo_id') {
                    const jogos = await obterTodosJogos();
                    const novoJogoId = valor.toLowerCase();
                    if (!jogos[novoJogoId]) {
                        await interaction.reply({
                            content: `❌ **Jogo não encontrado!** ID: ${novoJogoId}\n\n💡 Use \`/listjogos\` para ver jogos disponíveis.`,
                            ephemeral: true
                        });
                        return;
                    }
                    servicos[id][campo] = novoJogoId;
                } else {
                    servicos[id][campo] = valor;
                }

                const salvou = await salvarServicos(servicos);

                if (salvou) {
                    const jogo = await getJogo(servicos[id].jogo_id);
                    const embed = new EmbedBuilder()
                        .setTitle('✅ SERVIÇO EDITADO COM SUCESSO!')
                        .setDescription(`**${servicos[id].emoji} ${servicos[id].nome}** foi atualizado!`)
                        .addFields([
                            { name: '🆔 ID', value: id, inline: true },
                            { name: '🎮 Jogo', value: jogo ? `${jogo.emoji} ${jogo.nome}` : servicos[id].jogo_id, inline: true },
                            { name: '🔧 Campo Editado', value: campo, inline: true },
                            { name: '⬅️ Valor Anterior', value: String(valorOriginal), inline: true },
                            { name: '➡️ Novo Valor', value: valor, inline: true },
                            { name: '⚡ Efeito', value: 'Imediato', inline: true }
                        ])
                        .setColor(0x0099FF)
                        .setFooter({ text: 'Use /recarregarmensagens para atualizar mensagens públicas!' })
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed], ephemeral: true });

                    global.servicosCompletos = servicos;
                } else {
                    await interaction.reply({
                        content: '❌ **Erro ao salvar alterações!** Tente novamente mais tarde.',
                        ephemeral: true
                    });
                }
            }

            // 🛠️ REMOVER SERVIÇO
            if (commandName === 'removeservico') {
                const id = options.getString('id').toLowerCase();
                const servicos = await obterTodosServicos();

                if (!servicos[id]) {
                    await interaction.reply({
                        content: `❌ **Serviço não encontrado!**\n\n🆔 **ID procurado:** ${id}`,
                        ephemeral: true
                    });
                    return;
                }

                const servicoInfo = servicos[id];
                const jogo = await getJogo(servicoInfo.jogo_id);
                delete servicos[id];

                const salvou = await salvarServicos(servicos);

                if (salvou) {
                    const embed = new EmbedBuilder()
                        .setTitle('🗑️ SERVIÇO REMOVIDO!')
                        .setDescription(`**${servicoInfo.emoji} ${servicoInfo.nome}** foi removido do sistema.`)
                        .addFields([
                            { name: '🆔 ID Removido', value: id, inline: true },
                            { name: '🎮 Jogo', value: jogo ? `${jogo.emoji} ${jogo.nome}` : servicoInfo.jogo_id, inline: true },
                            { name: '💰 Preço Era', value: `R$ ${servicoInfo.preco.toFixed(2).replace('.', ',')}`, inline: true }
                        ])
                        .setColor(0xFF0000)
                        .setFooter({ text: 'Serviço removido! Use /recarregarmensagens para atualizar.' })
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed], ephemeral: true });

                    global.servicosCompletos = servicos;
                } else {
                    await interaction.reply({
                        content: '❌ **Erro ao remover serviço!** Tente novamente.',
                        ephemeral: true
                    });
                }
            }

            // 🛠️ LISTAR SERVIÇOS
            if (commandName === 'listservicos') {
                const jogoFiltro = options.getString('jogo')?.toLowerCase();
                const filtroTipo = options.getString('filtro') || 'todos';

                const servicos = await obterTodosServicos();
                const jogos = await obterTodosJogos();

                let lista = Object.values(servicos);

                // Filtro por jogo
                if (jogoFiltro) {
                    lista = lista.filter(s => s.jogo_id === jogoFiltro);
                }

                // Filtro por tipo
                if (filtroTipo === 'destaque') {
                    lista = lista.filter(s => s.destaque === true);
                } else if (filtroTipo === 'padrao') {
                    lista = lista.filter(s => s.destaque === false);
                }

                lista.sort((a, b) => (a.ordem || 999) - (b.ordem || 999));

                if (lista.length === 0) {
                    await interaction.reply({
                        content: '📋 **Nenhum serviço encontrado com os filtros aplicados!**',
                        ephemeral: true
                    });
                    return;
                }

                // Agrupa por jogo
                const servicosPorJogo = {};
                for (const servico of lista) {
                    if (!servicosPorJogo[servico.jogo_id]) {
                        servicosPorJogo[servico.jogo_id] = [];
                    }
                    servicosPorJogo[servico.jogo_id].push(servico);
                }

                let descricao = '';
                for (const [jogoId, servicosDoJogo] of Object.entries(servicosPorJogo)) {
                    const jogo = jogos[jogoId];
                    descricao += `**${jogo ? jogo.emoji + ' ' + jogo.nome : jogoId}:**\n`;

                    descricao += servicosDoJogo.map(s => 
                        `${s.emoji} **${s.nome}** (\`${s.id}\`)\n` +
                        `💰 R$ ${s.preco.toFixed(2).replace('.', ',')} • ⏱️ ${s.tempo}\n` +
                        `${s.destaque ? '⭐ **EM DESTAQUE**' : '🔸 Padrão'} • 🔢 Ordem: ${s.ordem || 999}\n`
                    ).join('\n') + '\n\n';
                }

                const embed = new EmbedBuilder()
                    .setTitle(`📋 LISTA DE SERVIÇOS (${lista.length} encontrados)`)
                    .setDescription(descricao)
                    .setColor(0x5865F2)
                    .setFooter({ 
                        text: `Filtros: ${jogoFiltro ? 'Jogo: ' + jogoFiltro : 'Todos os jogos'} • ${filtroTipo} • Total: ${lista.length}`,
                    })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // 💰 PREÇO SERVIÇO
            if (commandName === 'precoservico') {
                const id = options.getString('id').toLowerCase();
                const novoPreco = options.getNumber('preco');

                const servicos = await obterTodosServicos();

                if (!servicos[id]) {
                    await interaction.reply({
                        content: `❌ **Serviço não encontrado!**\n\n🆔 **ID:** ${id}`,
                        ephemeral: true
                    });
                    return;
                }

                if (novoPreco <= 0) {
                    await interaction.reply({
                        content: '❌ **Preço inválido!** O valor deve ser maior que zero.',
                        ephemeral: true
                    });
                    return;
                }

                const precoAntigo = servicos[id].preco;
                servicos[id].preco = novoPreco;

                const salvou = await salvarServicos(servicos);

                if (salvou) {
                    const jogo = await getJogo(servicos[id].jogo_id);
                    const embed = new EmbedBuilder()
                        .setTitle('💰 PREÇO ATUALIZADO!')
                        .setDescription(`**${servicos[id].emoji} ${servicos[id].nome}**`)
                        .addFields([
                            { name: '🎮 Jogo', value: jogo ? `${jogo.emoji} ${jogo.nome}` : servicos[id].jogo_id, inline: true },
                            { name: '⬅️ Preço Anterior', value: `R$ ${precoAntigo.toFixed(2).replace('.', ',')}`, inline: true },
                            { name: '➡️ Novo Preço', value: `R$ ${novoPreco.toFixed(2).replace('.', ',')}`, inline: true },
                            { name: '📈 Variação', value: `${novoPreco > precoAntigo ? '+' : ''}${((novoPreco - precoAntigo) / precoAntigo * 100).toFixed(1)}%`, inline: true }
                        ])
                        .setColor(novoPreco > precoAntigo ? 0xFF0000 : 0x00FF00)
                        .setFooter({ text: 'Preço atualizado! Use /recarregarmensagens para atualizar mensagens.' })
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed], ephemeral: true });

                    global.servicosCompletos = servicos;
                } else {
                    await interaction.reply({
                        content: '❌ **Erro ao atualizar preço!** Tente novamente.',
                        ephemeral: true
                    });
                }
            }

            // ⭐ DESTACAR SERVIÇO
            if (commandName === 'destacarservico') {
                const id = options.getString('id').toLowerCase();
                const destaque = options.getBoolean('destaque');

                const servicos = await obterTodosServicos();

                if (!servicos[id]) {
                    await interaction.reply({
                        content: `❌ **Serviço não encontrado!**\n\n🆔 **ID:** ${id}`,
                        ephemeral: true
                    });
                    return;
                }

                const statusAnterior = servicos[id].destaque;
                servicos[id].destaque = destaque;

                const salvou = await salvarServicos(servicos);

                if (salvou) {
                    const jogo = await getJogo(servicos[id].jogo_id);
                    const embed = new EmbedBuilder()
                        .setTitle(destaque ? '⭐ SERVIÇO EM DESTAQUE!' : '🔸 SERVIÇO REMOVIDO DO DESTAQUE')
                        .setDescription(`**${servicos[id].emoji} ${servicos[id].nome}**`)
                        .addFields([
                            { name: '🆔 ID', value: id, inline: true },
                            { name: '🎮 Jogo', value: jogo ? `${jogo.emoji} ${jogo.nome}` : servicos[id].jogo_id, inline: true },
                            { name: '⬅️ Status Anterior', value: statusAnterior ? 'Em Destaque' : 'Padrão', inline: true },
                            { name: '➡️ Novo Status', value: destaque ? 'Em Destaque' : 'Padrão', inline: true },
                            { name: '📊 Efeito', value: destaque ? 'Aparecerá em PRINCIPAIS SERVIÇOS' : 'Removido da mensagem principal', inline: false }
                        ])
                        .setColor(destaque ? 0xFFD700 : 0x808080)
                        .setFooter({ text: 'Use /recarregarmensagens para aplicar mudanças nas mensagens!' })
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed], ephemeral: true });

                    global.servicosCompletos = servicos;
                } else {
                    await interaction.reply({
                        content: '❌ **Erro ao atualizar destaque!** Tente novamente.',
                        ephemeral: true
                    });
                }
            }

            // 📊 ESTATÍSTICAS
            if (commandName === 'estatisticas') {
                const jogos = await obterTodosJogos();
                const servicos = await obterTodosServicos();

                const jogosAtivos = await obterJogosAtivos();
                const totalServicos = Object.keys(servicos).length;
                const servicosDestaque = Object.values(servicos).filter(s => s.destaque).length;

                // Estatísticas por jogo
                const statsPorJogo = {};
                for (const jogo of Object.values(jogos)) {
                    const servicosDoJogo = Object.values(servicos).filter(s => s.jogo_id === jogo.id);
                    const servicosDestaqueDoJogo = servicosDoJogo.filter(s => s.destaque);

                    statsPorJogo[jogo.id] = {
                        nome: jogo.nome,
                        emoji: jogo.emoji,
                        ativo: jogo.ativo,
                        totalServicos: servicosDoJogo.length,
                        servicosDestaque: servicosDestaqueDoJogo.length,
                        precoMedio: servicosDoJogo.length > 0 ? 
                            (servicosDoJogo.reduce((sum, s) => sum + s.preco, 0) / servicosDoJogo.length) : 0
                    };
                }

                const embed = new EmbedBuilder()
                    .setTitle('📊 ESTATÍSTICAS DO SISTEMA MULTI-JOGOS')
                    .addFields([
                        {
                            name: '🎮 **RESUMO GERAL**',
                            value: 
                                `**Jogos:** ${Object.keys(jogos).length} total (${jogosAtivos.length} ativos)\n` +
                                `**Serviços:** ${totalServicos} total (${servicosDestaque} em destaque)\n` +
                                `**Threads ativas:** ${threadsAtivas.size}\n` +
                                `**Threads finalizadas:** ${threadsFinalizadas.size}`,
                            inline: false
                        },
                        {
                            name: '🎯 **ESTATÍSTICAS POR JOGO**',
                            value: Object.values(statsPorJogo).map(stat => 
                                `**${stat.emoji} ${stat.nome}** ${stat.ativo ? '🟢' : '🔴'}\n` +
                                `📊 ${stat.totalServicos} serviços (${stat.servicosDestaque} destaque)\n` +
                                `💰 Preço médio: R$ ${stat.precoMedio.toFixed(2).replace('.', ',')}`
                            ).join('\n\n'),
                            inline: false
                        },
                        {
                            name: '💾 **SISTEMA**',
                            value: 
                                `**Carrinhos ativos:** ${carrinhos.size}\n` +
                                `**Mensagens oficiais:** ${mensagensOficiais.size}\n` +
                                `**Uptime:** ${Math.floor(client.uptime / 60000)} minutos\n` +
                                `**Versão:** Multi-Jogos v2.2`,
                            inline: false
                        }
                    ])
                    .setColor(0x00D4AA)
                    .setFooter({ 
                        text: `Sistema Multi-Jogos • Atualizado em ${new Date().toLocaleString('pt-BR')}`,
                        iconURL: interaction.guild.iconURL()
                    })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // 🔄 RECARREGAR MENSAGENS
            if (commandName === 'recarregarmensagens') {
                await interaction.reply({
                    content: '🔄 **Recarregando mensagens multi-jogos com serviços atualizados...**',
                    ephemeral: true
                });

                try {
                    await postarServicosAutomatico(interaction.guild);

                    const jogosAtivos = await obterJogosAtivos();
                    const totalServicos = Object.keys(global.servicosCompletos).length;

                    await interaction.followUp({
                        content: `✅ **Mensagens recarregadas com sucesso!**\n\n📊 **Estatísticas atualizadas:**\n🎮 ${jogosAtivos.length} jogos ativos\n🛠️ ${totalServicos} serviços disponíveis\n⭐ Destaques organizados por jogo`,
                        ephemeral: true
                    });
                } catch (error) {
                    console.error('❌ Erro ao recarregar mensagens multi-jogos:', error);
                    await interaction.followUp({
                        content: '❌ **Erro ao recarregar mensagens!** Verifique os logs.',
                        ephemeral: true
                    });
                }
            }

        } catch (error) {
            console.error(`❌ Erro no comando ${commandName}:`, error);
            await interaction.reply({
                content: `❌ **Erro interno!** Contate o desenvolvedor.\n\`\`\`${error.message}\`\`\``,
                ephemeral: true
            });
        }
        return;
    }

    // ================================================
    // 🛒 INTERAÇÕES DO CARRINHO MULTI-JOGOS
    // ================================================
    if (!interaction.isStringSelectMenu() && !interaction.isButton()) return;

    const userId = interaction.user.id;
    const user = interaction.user;
    const member = interaction.member;
    const thread = interaction.channel;
    const threadId = thread?.id;

    try {
        if (!member) {
            console.error(`❌ Member não encontrado para ${user.tag}`);
            return;
        }

        if (isThreadFinalizada(threadId) && !isQualquerAdmin(member)) {
            await interaction.reply({
                content: '🔒 **Thread Finalizada pela Administração**\n\nEsta thread foi finalizada por um administrador Hellza. Apenas a equipe administrativa pode interagir aqui.\n\n✅ **Para novos serviços:** Volte ao canal público e reaja 🛒 na mensagem fixada oficial.',
                flags: [4096]
            });
            return;
        }

        // 🎮 SELEÇÃO DE JOGO (PRIMEIRO DROPDOWN)
        if (interaction.customId === 'select_jogo') {
            const jogoId = interaction.values[0];
            const jogo = await getJogo(jogoId);

            if (!jogo) {
                await interaction.reply({ 
                    content: 'Jogo não encontrado.', 
                    flags: [4096]
                });
                return;
            }

            // Seleciona o jogo no carrinho
            selecionarJogo(userId, jogoId);

            // Cria dropdown de serviços para o jogo selecionado
            const dropdownServicos = await criarDropdownServicos(jogoId);

            if (!dropdownServicos) {
                await interaction.reply({
                    content: `❌ **${jogo.emoji} ${jogo.nome}** não possui serviços disponíveis ainda.\n\n💡 **Dica:** Escolha outro jogo ou aguarde novos serviços serem adicionados.`,
                    flags: [4096]
                });
                return;
            }

            const carrinhoEmbed = await criarCarrinhoEmbed(userId, user);
            const buttonsCarrinho = criarBotoesCarrinho();

            await interaction.update({
                embeds: [carrinhoEmbed],
                components: [dropdownServicos, buttonsCarrinho]
            });

            await interaction.followUp({
                content: `🎮 **${jogo.emoji} ${jogo.nome}** selecionado! Agora escolha os serviços que deseja.`,
                flags: [4096]
            });
        }

        // 🛠️ SELEÇÃO DE SERVIÇO (SEGUNDO DROPDOWN)
        if (interaction.customId === 'select_servico') {
            const servicoId = interaction.values[0];
            const servico = await getServico(servicoId);

            if (!servico) {
                await interaction.reply({ 
                    content: 'Serviço não encontrado.', 
                    flags: [4096]
                });
                return;
            }

            const carrinho = getCarrinho(userId);
            const itemExistente = carrinho.items.find(item => item.id === servicoId);

            if (itemExistente) {
                await interaction.reply({
                    content: `📦 **${servico.nome}** já está no seu carrinho. Escolha a nova quantidade:`,
                    components: [criarDropdownQuantidade(servicoId)],
                    flags: [4096]
                });
            } else {
                await adicionarItem(userId, servicoId, 1);
                const carrinhoEmbed = await criarCarrinhoEmbed(userId, user);
                const dropdownServicos = await criarDropdownServicos(servico.jogo_id);
                const buttonsCarrinho = criarBotoesCarrinho();

                await interaction.update({
                    embeds: [carrinhoEmbed],
                    components: [dropdownServicos, buttonsCarrinho]
                });

                await interaction.followUp({
                    content: `✅ **${servico.nome}** adicionado ao carrinho. Deseja adicionar mais unidades?`,
                    components: [criarDropdownQuantidade(servicoId)],
                    flags: [4096]
                });
            }
        }

        // 📦 SELEÇÃO DE QUANTIDADE (TERCEIRO DROPDOWN)
        if (interaction.customId === 'select_quantidade') {
            const [servicoId, quantidadeStr] = interaction.values[0].split('_');
            const quantidade = parseInt(quantidadeStr);
            const servico = await getServico(servicoId);

            if (!servico) {
                await interaction.reply({ 
                    content: 'Serviço não encontrado.', 
                    flags: [4096]
                });
                return;
            }

            removerItem(userId, servicoId);
            await adicionarItem(userId, servicoId, quantidade);

            const carrinhoEmbed = await criarCarrinhoEmbed(userId, user);
            const dropdownServicos = await criarDropdownServicos(servico.jogo_id);
            const buttonsCarrinho = criarBotoesCarrinho();

            await interaction.update({
                embeds: [carrinhoEmbed],
                components: [dropdownServicos, buttonsCarrinho]
            });

            await interaction.followUp({ 
                content: `📦 Quantidade de **${servico.nome}** atualizada para **${quantidade}x**.`, 
                flags: [4096]
            });
        }

        // 🔄 ATUALIZAR CARRINHO
        if (interaction.customId === 'atualizar_carrinho') {
            const carrinho = getCarrinho(userId);
            const carrinhoEmbed = await criarCarrinhoEmbed(userId, user);

            if (carrinho.jogoSelecionado) {
                const dropdownServicos = await criarDropdownServicos(carrinho.jogoSelecionado);
                const buttonsCarrinho = criarBotoesCarrinho();

                await interaction.update({
                    embeds: [carrinhoEmbed],
                    components: [dropdownServicos, buttonsCarrinho]
                });
            } else {
                const dropdownJogos = await criarDropdownJogos();
                const buttonsCarrinho = criarBotoesCarrinho();

                await interaction.update({
                    embeds: [carrinhoEmbed],
                    components: [dropdownJogos, buttonsCarrinho]
                });
            }
        }

        // 🎮 TROCAR JOGO
        if (interaction.customId === 'trocar_jogo') {
            limparCarrinho(userId); // Limpa tudo ao trocar jogo
            const carrinhoEmbed = await criarCarrinhoEmbed(userId, user);
            const dropdownJogos = await criarDropdownJogos();
            const buttonsCarrinho = criarBotoesCarrinho();

            await interaction.update({
                embeds: [carrinhoEmbed],
                components: [dropdownJogos, buttonsCarrinho]
            });

            await interaction.followUp({
                content: '🎮 **Jogo alterado!** Seu carrinho foi limpo. Selecione um novo jogo para começar.',
                flags: [4096]
            });
        }

        // ➖ REMOVER ITEM
        if (interaction.customId === 'remover_item') {
            const carrinho = getCarrinho(userId);
            if (carrinho.items.length === 0) {
                await interaction.reply({ 
                    content: 'Seu carrinho já está vazio!', 
                    flags: [4096]
                });
                return;
            }

            const dropdownRemover = criarDropdownRemover(userId);
            await interaction.reply({
                content: '🗑️ Escolha qual item deseja remover:',
                components: [dropdownRemover],
                flags: [4096]
            });
        }

        // ✅ CONFIRMAR REMOÇÃO
        if (interaction.customId === 'confirmar_remocao') {
            const servicoId = interaction.values[0];
            const servico = await getServico(servicoId);
            removerItem(userId, servicoId);

            const carrinho = getCarrinho(userId);
            const carrinhoEmbed = await criarCarrinhoEmbed(userId, user);

            let componentes = [];
            if (carrinho.jogoSelecionado) {
                const dropdownServicos = await criarDropdownServicos(carrinho.jogoSelecionado);
                componentes.push(dropdownServicos);
            } else {
                const dropdownJogos = await criarDropdownJogos();
                componentes.push(dropdownJogos);
            }
            componentes.push(criarBotoesCarrinho());

            await interaction.update({
                embeds: [carrinhoEmbed],
                components: componentes
            });

            const nomeServico = servico ? servico.nome : 'Serviço removido';
            await interaction.followUp({ 
                content: `🗑️ **${nomeServico}** removido do carrinho.`, 
                flags: [4096]
            });
        }

        // 🧹 LIMPAR CARRINHO
        if (interaction.customId === 'limpar_carrinho') {
            limparCarrinho(userId);

            const carrinhoEmbed = await criarCarrinhoEmbed(userId, user);
            const dropdownJogos = await criarDropdownJogos();
            const buttonsCarrinho = criarBotoesCarrinho();

            await interaction.update({
                embeds: [carrinhoEmbed],
                components: [dropdownJogos, buttonsCarrinho]
            });

            await interaction.followUp({ 
                content: '🧹 Seu carrinho foi limpo! Selecione um jogo para começar novamente.', 
                flags: [4096]
            });
        }

        // 💳 FINALIZAR PEDIDO
        if (interaction.customId === 'finalizar_pedido') {
            const carrinho = getCarrinho(userId);
            if (carrinho.items.length === 0) {
                await interaction.reply({ 
                    content: 'Seu carrinho está vazio. Adicione itens antes de finalizar!', 
                    flags: [4096]
                });
                return;
            }

            const pagamentoEmbed = await criarPagamentoEmbed(userId, user);
            const adminButton = criarBotaoAdminFinalizar(threadId);

            await interaction.update({
                embeds: [pagamentoEmbed],
                components: [adminButton]
            });

            const clienteMember = interaction.member;
            const cargoEmAndamento = interaction.guild.roles.cache.find(role => role.name === CARGO_SERVICO_EM_ANDAMENTO);
            if (cargoEmAndamento && clienteMember) {
                if (!clienteMember.roles.cache.has(cargoEmAndamento.id)) {
                    try {
                        await clienteMember.roles.add(cargoEmAndamento);
                        console.log(`[Cargo] Adicionado '${CARGO_SERVICO_EM_ANDAMENTO}' para ${clienteMember.user.tag}`);
                    } catch (error) {
                        console.error(`❌ Erro ao adicionar cargo:`, error.message);
                    }
                }
            }

            // Resumo dos jogos no pedido
            const jogosPedido = [...new Set(carrinho.items.map(item => item.jogo_id))];
            const resumoJogos = [];
            for (const jogoId of jogosPedido) {
                const jogo = await getJogo(jogoId);
                resumoJogos.push(jogo ? `${jogo.emoji} ${jogo.nome}` : jogoId);
            }

            await thread.send(`✅ ${user}, seu pedido multi-jogos foi finalizado! A equipe Hellza já foi notificada e aguarda seu comprovante de PIX.\n\n🎮 **Jogos no pedido:** ${resumoJogos.join(', ')}\n\n🚨 **IMPORTANTE:** O botão vermelho acima é **exclusivo para administradores**. Apenas admins podem finalizar o serviço.\n\n💬 **Agora você pode:** Enviar seu comprovante PIX, tirar dúvidas, ou conversar normalmente aqui na thread!`);

            const adminChannel = interaction.guild.channels.cache.find(c => c.name.toLowerCase().includes('logs') || c.name.toLowerCase().includes('admin'));
            if (adminChannel && adminChannel.isTextBased()) {
                await adminChannel.send(`🔔 **NOVO PEDIDO MULTI-JOGOS!** O usuário ${user} (ID: ${userId}) finalizou um pedido na thread ${thread.name} (${thread.url}).\n🎮 **Jogos:** ${resumoJogos.join(', ')}`);
            }
        }

        // 👑 BOTÃO ADMIN FINALIZAR (mesmo sistema de segurança)
        if (interaction.customId.startsWith('admin_finalizar_')) {
            console.log(`🔍 Tentativa de finalização multi-jogos: ${user.tag} (${userId}) na guild ${interaction.guild?.name}`);

            if (!member) {
                console.log(`🚫 FALHA 1: Member inexistente para ${user.tag}`);
                await interaction.reply({ 
                    content: '❌ **Erro de Autenticação**\nMembro não encontrado no servidor.', 
                    flags: [4096]
                });
                return;
            }

            const isAdmin = isAdminNaGuild(userId, interaction.guild);
            if (!isAdmin) {
                console.log(`🚫 FALHA 2: ${user.tag} não é admin na guild ${interaction.guild?.name}`);
                await interaction.reply({ 
                    content: '🚫 **ACESSO NEGADO!**\n\n❌ Você não tem permissão para finalizar serviços.\n\n👑 **Cargos autorizados:** Hellza, Admin, Moderador, Staff, Suporte.\n\n⚠️ **Tentativa de acesso não autorizada registrada.**', 
                    flags: [4096]
                });
                return;
            }

            const adminConfirmado = isQualquerAdmin(member);
            if (!adminConfirmado) {
                console.log(`🚫 FALHA 3: Validação final falhou para ${user.tag}`);
                await interaction.reply({ 
                    content: '🚫 **VALIDAÇÃO FINAL FALHOU**\n\nVerifique seus cargos com um administrador superior.', 
                    flags: [4096]
                });
                return;
            }

            console.log(`✅ VALIDAÇÃO COMPLETA: Admin ${user.tag} autorizado a finalizar serviço multi-jogos`);

            await interaction.update({
                content: `✅ **🎉 SERVIÇO MULTI-JOGOS FINALIZADO COM SUCESSO! 🎉**\n\n👑 **Finalizado por:** ${member.displayName}\n📅 **Data:** ${new Date().toLocaleString('pt-BR')}\n\n💼 O cliente foi removido da thread e já pode criar uma nova loja quando necessário.\n\n🔒 Esta thread será arquivada automaticamente.`,
                embeds: [],
                components: []
            });

            try {
                const clienteMember = thread.guild.members.cache.find(m => 
                    thread.members.cache.has(m.id) && 
                    !m.user.bot && 
                    !isQualquerAdmin(m)
                );

                if (clienteMember) {
                    console.log(`👤 Cliente identificado: ${clienteMember.user.tag}`);

                    const carrinhoCliente = getCarrinho(clienteMember.id);
                    await logarServicoFinalizado(interaction.guild, clienteMember, member, thread.name, carrinhoCliente);

                    const cargoComprador = thread.guild.roles.cache.find(role => role.name === CARGO_CLIENTE_COMPROU);
                    const cargoEmAndamento = thread.guild.roles.cache.find(role => role.name === CARGO_SERVICO_EM_ANDAMENTO);

                    if (cargoComprador && !clienteMember.roles.cache.has(cargoComprador.id)) {
                        await clienteMember.roles.add(cargoComprador);
                        console.log(`[Cargo] Adicionado '${CARGO_CLIENTE_COMPROU}' para ${clienteMember.user.tag}`);
                    }

                    if (cargoEmAndamento && clienteMember.roles.cache.has(cargoEmAndamento.id)) {
                        await clienteMember.roles.remove(cargoEmAndamento);
                        console.log(`[Cargo] Removido '${CARGO_SERVICO_EM_ANDAMENTO}' de ${clienteMember.user.tag}`);
                    }

                    await thread.members.remove(clienteMember.id);
                    console.log(`👤 Cliente ${clienteMember.user.tag} removido da thread multi-jogos ${thread.name}`);

                    removerThreadAtiva(clienteMember.id);
                    limparCarrinho(clienteMember.id);

                    try {
                        await clienteMember.send(
                            `🎉 **SERVIÇO MULTI-JOGOS FINALIZADO COM SUCESSO!**\n\n` +
                            `👑 **Finalizado por:** ${member.displayName}\n` +
                            `📅 **Data:** ${new Date().toLocaleString('pt-BR')}\n\n` +
                            `✅ Você recebeu o cargo '${CARGO_CLIENTE_COMPROU}'.\n\n` +
                            `🛒 **Para futuros serviços:** Reaja 🛒 na mensagem fixada oficial nos canais para criar uma nova loja privada!\n\n` +
                            `🙏 **Obrigado por escolher a Hellza Gaming!**`
                        );
                    } catch (dmError) {
                        console.error(`❌ Não foi possível enviar DM para ${clienteMember.user.tag}:`, dmError.message);
                    }
                } else {
                    console.log('⚠️ Cliente não encontrado na thread');
                }

                finalizarThread(threadId, member.id);

                const oldName = thread.name;
                const newName = oldName.includes('finalizado') ? oldName : `✅-finalizado-${oldName.replace('🛒-loja-', '')}`;

                await thread.setName(newName);
                await thread.setArchived(true);

                console.log(`✅ Thread multi-jogos finalizada por ${member.user.tag}: ${oldName} → ${newName}`);

                const adminChannel = interaction.guild.channels.cache.find(c => 
                    (c.name.toLowerCase().includes('logs') || c.name.toLowerCase().includes('admin')) &&
                    !c.name.toLowerCase().includes('finalizados')
                );
                if (adminChannel && adminChannel.isTextBased()) {
                    const clienteTag = clienteMember?.user.tag || 'Cliente não encontrado';
                    await adminChannel.send(
                        `🎉 **SERVIÇO MULTI-JOGOS FINALIZADO COM SUCESSO!**\n\n` +
                        `👑 **Admin:** ${member.user.tag}\n` +
                        `👤 **Cliente:** ${clienteTag}\n` +
                        `📄 **Thread:** ${newName}\n` +
                        `🕐 **Horário:** ${new Date().toLocaleString('pt-BR')}\n\n` +
                        `💼 **Status:** Finalizado e arquivado automaticamente\n` +
                        `📊 **Log detalhado enviado para:** #${CANAL_LOG_FINALIZADOS}`
                    );
                }

            } catch (error) {
                console.error(`❌ Erro durante finalização multi-jogos por ${member.user.tag}:`, error.message);

                try {
                    await thread.send(`❌ **Erro durante finalização:** ${error.message}\n\n⚠️ Contate um administrador se o problema persistir.`);
                } catch (sendError) {
                    console.error(`❌ Não foi possível enviar erro na thread:`, sendError.message);
                }
            }
        }

    } catch (error) {
        console.error(`❌ Erro na interação multi-jogos ${interaction.customId} por ${user.tag}:`, error);
        try {
            if (interaction.deferred || interaction.replied) {
                await interaction.followUp({ 
                    content: '❌ Ocorreu um erro ao processar sua solicitação.', 
                    flags: [4096]
                });
            } else {
                await interaction.reply({ 
                    content: '❌ Ocorreu um erro ao processar sua solicitação.', 
                    flags: [4096]
                });
            }
        } catch (replyError) {
            console.error(`❌ Erro ao responder interação:`, replyError.message);
        }
    }
});

// ================================================
// 🚫 EVENT: ERROS
// ================================================

client.on(Events.Error, (error) => {
    console.error('❌ Erro crítico no sistema multi-jogos:', error);
});

// ================================================
// 🔑 LOGIN DO BOT
// ================================================

client.login(process.env.DISCORD_TOKEN);