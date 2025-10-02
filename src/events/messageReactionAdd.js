const { Events, ChannelType, ThreadAutoArchiveDuration, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { CARGO_ADMIN_PRINCIPAL, CARGOS_SUPORTE } = require('../../config');
const { temThreadAtiva, getThreadAtiva, marcarThreadAtiva, getProximoNumeroThread, removerThreadAtiva } = require('../utils/threadManager');
const { criarCarrinhoEmbed, criarDropdownServicos, criarBotoesCarrinho } = require('../utils/uiComponents');

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user, client) {
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
            if (!client.mensagensOficiais.has(reaction.message.id)) {
                console.log(`🚫 Reação em mensagem não oficial ignorada: ${reaction.message.id} por ${user.tag}`);
                await reaction.users.remove(user.id);

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
                    console.log(`❌ Não foi possível enviar DM para ${user.tag}:`, dmError.message);
                }
                return;
            }

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

            const numeroThread = getProximoNumeroThread(user.id);
            const nomeThread = `🛒-loja-${user.username}-${numeroThread}`;

            console.log(`🔢 Criando thread ${numeroThread} para ${user.tag}: ${nomeThread}`);

            try {
                const thread = await reaction.message.channel.threads.create({
                    name: nomeThread,
                    type: ChannelType.PrivateThread,
                    autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
                    reason: `Loja ${numeroThread} para ${user.tag}`,
                    invitable: false
                });

                marcarThreadAtiva(user.id, thread.id);

                await thread.members.add(user.id);
                console.log(`👤 ${user.tag} adicionado à thread ${numeroThread}`);

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
                console.error(`❌ Erro crítico ao criar thread para ${user.tag}:`, error);
                removerThreadAtiva(user.id);
                try {
                    await user.send(
                        `❌ **Ocorreu um erro ao criar sua loja privada.** Por favor, tente novamente mais tarde ou contate um administrador.`
                    );
                } catch (dmError) {
                    console.error(`❌ Não foi possível enviar DM de erro para ${user.tag}:`, dmError.message);
                }
            }
        }
    }
};
