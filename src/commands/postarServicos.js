const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { CANAIS_SERVICOS, CARGO_ADMIN_PRINCIPAL } = require("../../config");

async function limparMensagensGuild(client, guild) {
    console.log(`🧹 Limpando mensagens antigas no servidor: ${guild.name}`);
    try {
        const channels = guild.channels.cache.filter(c => c.isTextBased() && !c.isThread());
        let totalDeleted = 0;

        for (const [channelId, channel] of channels) {
            try {
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
                        client.mensagensOficiais.delete(msgId); 
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
        console.log(`✅ ${totalDeleted} mensagens antigas removidas de ${guild.name}`);
    } catch (error) {
        console.error("❌ Erro geral na limpeza de mensagens:", error);
    }
}

async function postarServicosAutomatico(client, guild) {
    console.log(`📢 Postando serviços em: ${guild.name}`);

    // ✅ LIMPAR APENAS UMA VEZ, ANTES DO LOOP
    await limparMensagensGuild(client, guild);

    const embed = new EmbedBuilder()
        .setTitle("🎮 SERVIÇOS GAMING v2.2 (Orpheus/Evellyn)")
        .setDescription(
            "**❗ NÃO USO HACK - CHEATS! ❗**\n\n" +
            "🛒 **Sistema Profissional com Controle Total:**\n" +
            "• Clique em 🛒 para abrir sua loja privada\n" +
            "• Uma thread por cliente (sem duplicatas)\n" +
            "• Numeração sequencial automática\n" +
            "• Sistema de quantidade inteligente\n" +
            "• Controle administrativo Hellza\n\n" +

            "**🎯 PRINCIPAIS SERVIÇOS:**\n" +
            "⭐ Missão Principal COMPLETA - **R$ 90,00**\n" +
            "👥 TODAS Histórias de Agentes - **R$ 76,00**\n" +
            "📆 Farm Mensal - **R$ 62,00**\n" +
            "🎉 Todos os Eventos v2.2 - **R$ 22,00**\n" +
            "⚔️ Investida Mortal - **R$ 14,00**\n" +
            "🔴 Nódulo Vermelho - **R$ 12,00**\n\n" +

            "**💡 Diferenciais Exclusivos:**\n" +
            "✅ Atendimento privado numerado\n" +
            "✅ Controle anti-duplicação\n" +
            "✅ Sistema Hellza de finalização\n" +
            "✅ Organização total dos pedidos\n" +
            "✅ Pagamento PIX seguro e rápido\n\n" +

            "**🚨 IMPORTANTE:**\n" +
            "• Apenas 1 thread ativa por cliente\n" +
            "• Reaja apenas nas mensagens oficiais\n" +
            "• Aguarde finalização antes de novo pedido\n\n" +

            "**🚀 CLIQUE EM 🛒 PARA COMEÇAR SEU ATENDIMENTO!**"
        )
        .setColor(0x00AE86)
        .setFooter({ 
            text: "Sistema Anti-Duplicação v2.2 • Controle Hellza • Mensagem Fixada",
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
                await mensagem.react("🛒");

                try {
                    await mensagem.pin();
                    console.log(`📌 Mensagem fixada em: ${canal.name}`);
                } catch (pinError) {
                    console.error(`❌ Erro ao fixar mensagem em ${canal.name}:`, pinError.message);
                }

                client.mensagensOficiais.add(mensagem.id);
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

module.exports = { postarServicosAutomatico };
