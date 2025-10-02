const { Events } = require('discord.js');
const { removerThreadAtiva } = require('../utils/threadManager');

module.exports = {
    name: Events.ThreadDelete,
    async execute(thread, client) {
        for (const [userId, threadId] of client.threadsAtivas.entries()) {
            if (threadId === thread.id) {
                removerThreadAtiva(userId);
                console.log(`🗑️ Thread ${thread.name} deletada, controle removido para usuário ${userId}`);
                break;
            }
        }
    },
};
