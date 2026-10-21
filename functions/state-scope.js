"use strict";
// A claim é emitida apenas pelo Admin SDK nos emuladores, nunca pelo formulário.
// Testes e ensaios usam documentos próprios e preservam private/state.
function statePath(token = {}) {
  if (token.stateScope === undefined) return "private/state";
  if (!/^(test|demo)-[a-zA-Z0-9-]{1,80}$/.test(token.stateScope))
    throw new Error("Ambiente isolado inválido.");
  return `private/${token.stateScope}`;
}
function effectiveNow(state,token,realNow,emulator=process.env.FUNCTIONS_EMULATOR === 'true') {
 const scope=token?.stateScope;
 return emulator && /^demo-[a-zA-Z0-9-]{1,80}$/.test(scope||'') && state.demo?.scope===scope && Number.isFinite(state.demo.clockOffset) && Math.abs(state.demo.clockOffset)<=7*86400000 ? realNow+state.demo.clockOffset:realNow;
}
module.exports = { statePath,effectiveNow };
