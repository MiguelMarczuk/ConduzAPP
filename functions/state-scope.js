"use strict";
// A claim é emitida apenas pelo Admin SDK nos emuladores, nunca pelo formulário.
// Testes e ensaios usam documentos próprios e preservam private/state.
function statePath(token = {}) {
  if (token.stateScope === undefined) return "private/state";
  if (!/^(test|demo)-[a-zA-Z0-9-]{1,80}$/.test(token.stateScope))
    throw new Error("Ambiente isolado inválido.");
  return `private/${token.stateScope}`;
}
module.exports = { statePath };
