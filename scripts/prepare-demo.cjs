"use strict";
// Endereços fixos locais. Nenhuma credencial, banco ou pagamento de produção.
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
const { randomUUID } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const adminRequire = require("node:module").createRequire(
  path.resolve(__dirname, "../functions/package.json"),
);
const { initializeApp } = adminRequire("firebase-admin/app");
const { getAuth } = adminRequire("firebase-admin/auth");
const { getFirestore } = adminRequire("firebase-admin/firestore");
const { demoFixture, accounts } = require("./demo-fixture.cjs");
const { statePath } = require("../functions/state-scope");
initializeApp({ projectId: "demo-conduzapp" });
async function prepare() {
  const db = require("../functions/emulator-db").configureEmulatorFirestore(
    getFirestore(),
  );
  const scope = `demo-${randomUUID()}`;
  const state = demoFixture(Date.now(), scope);
  const auth = getAuth();
  for (const a of accounts) {
    let user;
    try {
      user = await auth.getUser(a.uid);
    } catch (e) {
      if (e.code !== "auth/user-not-found") throw e;
      user = await auth.createUser({
        uid: a.uid,
        email: `${a.account}@conduzapp.test`,
        password: "DemoTCC2026!",
        displayName: a.name,
      });
    }
    if (user.email !== `${a.account}@conduzapp.test`)
      throw new Error(
        "Conta não corresponde à demonstração; preparação interrompida.",
      );
  }
  // create recusa sobrescrita, inclusive se houver colisão de identificador.
  await db.doc(statePath({ stateScope: scope })).create(state);
  const b = state.bookings[state.demo.historicalBooking];
  await db
    .doc(`bookingAccess/${b.id}`)
    .create({
      student: b.student,
      instructor: b.instructor,
      disputeOpen: false,
    });
  for (const a of accounts)
    await auth.setCustomUserClaims(a.uid, {
      stateScope: scope,
      ...(a.role === "admin" ? { admin: true } : {}),
    });
  const manifest = {
    scope,
    preparedAt: state.demo.preparedAt,
    historicalBooking: b.id,
  };
  const output = path.resolve(__dirname, "../.tools/demo-current.json");
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(manifest, null, 2));
  console.log(`Demonstração isolada preparada: ${scope}`);
  console.log(
    "Base anterior e ensaios anteriores preservados. Saia e entre novamente nas três contas.",
  );
  console.log(
    "Agenda configurada; aula histórica paga aguardando conclusão. Senha fictícia: DemoTCC2026!",
  );
  console.log(
    "Execute novamente antes da apresentação para renovar as datas sem alterar o relógio.",
  );
}
prepare()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
