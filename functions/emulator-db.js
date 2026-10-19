'use strict';
// REST evita travamentos de gRPC neste ambiente Windows. O token owner só é
// aceito pelo emulador; o endereço fixo impede uso acidental fora da máquina.
function configureEmulatorFirestore(db) {
  if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8080') {
    throw new Error('Firestore restrito ao emulador local 127.0.0.1:8080.');
  }
  const { OAuth2Client } = require('google-auth-library');
  const authClient = new OAuth2Client();
  authClient.setCredentials({ access_token: 'owner' });
  db.settings({ preferRest: true, authClient });
  return db;
}
module.exports = { configureEmulatorFirestore };
