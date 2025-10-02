const { Events } = require('discord.js');
// const { postarServicosAutomatico } = require('../commands/postarServicos');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`🤖 Bot ANTI-DUPLICAÇÃO online: ${client.user.tag}!`);
        client.user.setActivity('🛒 Sistema Único v2.2', { type: 'PLAYING' });
        
        // COMENTAR ESTAS LINHAS PARA PARAR O REENVIO:
        /*
        console.log('🚀 Iniciando configuração automática dos servidores...');
        for (const [guildId, guild] of client.guilds.cache) {
            try {
                await postarServicosAutomatico(client, guild);
                console.log(`✅ Servidor ${guild.name} configurado com sucesso!`);
            } catch (error) {
                console.error(`❌ Erro ao configurar o servidor ${guild.name}:`, error);
            }
        }
        */
        
        console.log('🎉 Bot operacional sem repostagem automática!');
    },
};