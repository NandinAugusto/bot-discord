const PIX_CONFIG = {
    chave: process.env.PIX_CHAVE || 'seuemail@gmail.com',
    nome: process.env.PIX_NOME || 'Seu Nome Completo',
    banco: process.env.PIX_BANCO || 'Nubank'
};

const CANAIS_SERVICOS = process.env.CANAIS_SERVICOS ? process.env.CANAIS_SERVICOS.split(',') : ['serviços'];

const CARGO_ADMIN_PRINCIPAL = process.env.CARGO_ADMIN_PRINCIPAL || 'Hellza';

const CARGOS_SUPORTE = process.env.CARGOS_SUPORTE ? process.env.CARGOS_SUPORTE.split(',') : [
    'admin',
    'administrador',
    'mod',
    'moderador',
    'staff',
    'suporte',
    'vendas',
    'atendimento'
];

const CARGO_CLIENTE_COMPROU = process.env.CARGO_CLIENTE_COMPROU || 'Já comprou';
const CARGO_SERVICO_EM_ANDAMENTO = process.env.CARGO_SERVICO_EM_ANDAMENTO || 'Serviço em Andamento';

const SERVICOS = {
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

module.exports = {
    PIX_CONFIG,
    CANAIS_SERVICOS,
    CARGO_ADMIN_PRINCIPAL,
    CARGOS_SUPORTE,
    CARGO_CLIENTE_COMPROU,
    CARGO_SERVICO_EM_ANDAMENTO,
    SERVICOS
};
