const threadsAtivas = new Map();
const contadorThreads = new Map(); 
const threadsFinalizadas = new Map(); 

function getProximoNumeroThread(userId) {
    if (!contadorThreads.has(userId)) {
        contadorThreads.set(userId, 1);
        return 1;
    }
    const novoNumero = contadorThreads.get(userId) + 1;
    contadorThreads.set(userId, novoNumero);
    return novoNumero;
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

module.exports = {
    getProximoNumeroThread,
    temThreadAtiva,
    getThreadAtiva,
    marcarThreadAtiva,
    removerThreadAtiva,
    isThreadFinalizada,
    finalizarThread
};
