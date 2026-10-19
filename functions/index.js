'use strict';
// Bloqueio explícito de execução fora dos emuladores.
if (process.env.FUNCTIONS_EMULATOR !== 'true' || !process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error('ConduzAPP TCC: backend exclusivo dos emuladores. Deploy desabilitado.');
}
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { randomUUID } = require('node:crypto');
const { execute, empty } = require('./domain');
initializeApp({projectId:'demo-conduzapp'});
const db = getFirestore();
exports.conduz = onCall({cors:true}, async request => {
  if (!request.auth) throw new HttpsError('unauthenticated','Entre na sua conta.');
  const actor = {uid:request.auth.uid,admin:request.auth.token.admin === true};
  const {op,input} = request.data || {};
  const id = randomUUID();
  try {
    return await db.runTransaction(async tx => {
      const ref = db.doc('private/state');
      const snap = await tx.get(ref);
      const result = execute(snap.data() || empty(),actor,op,input,Date.now(),id);
      if (result.write) {
        tx.set(ref,result.state);
        // Metadados mínimos para as regras das fotos privadas, nunca dados públicos.
        for (const b of Object.values(result.state.bookings)) {
          tx.set(db.doc(`bookingAccess/${b.id}`),{student:b.student,instructor:b.instructor,disputeOpen:!!b.disputeOpen});
        }
      }
      return result.result;
    });
  } catch (error) {
    throw new HttpsError('failed-precondition',error.message || 'Operação recusada.');
  }
});
