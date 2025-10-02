const { CARGO_ADMIN_PRINCIPAL, CARGOS_SUPORTE } = require('../../config');

function isHellzaAdmin(member) {
    if (!member || !member.roles) return false;
    return member.roles.cache.some(role =>
        role.name.toLowerCase() === CARGO_ADMIN_PRINCIPAL.toLowerCase()
    );
}

function isSuporteAdmin(member) {
    if (!member || !member.roles) return false;
    return member.roles.cache.some(role =>
        CARGOS_SUPORTE.some(cargo => role.name.toLowerCase().includes(cargo.toLowerCase()))
    );
}

module.exports = { isHellzaAdmin, isSuporteAdmin };
