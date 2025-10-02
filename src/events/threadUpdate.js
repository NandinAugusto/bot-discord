const { Events } = require("discord.js");
const { removerThreadAtiva } = require("../utils/threadManager");

module.exports = {
    name: Events.ThreadUpdate,
    async execute(oldThread, newThread, client) {
        // Remove thread do controle quando é arquivada
        if (newThread.archived && !oldThread.archived) {
            for (const [userId, threadId] of client.threadsAtivas.entries()) {
                if (threadId === newThread.id) {
                    removerThreadAtiva(userId);
                    console.log(`📦 Thread ${newThread.name} arquivada, controle removido para usuário ${userId}`);
                    break;
                }
            }
        }
    },
};
