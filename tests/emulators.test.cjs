const { test, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
const adminRequire = require("node:module").createRequire(
  require("node:path").resolve(__dirname, "../functions/package.json"),
);
const { initializeApp } = adminRequire("firebase-admin/app");
const { getFirestore } = adminRequire("firebase-admin/firestore");
const { getAuth } = adminRequire("firebase-admin/auth");
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const { doc, getDoc, setDoc } = require("firebase/firestore");
const { ref, uploadBytes, getBytes, listAll } = require("firebase/storage");
const { empty, HOUR, DAY } = require("../functions/domain");
initializeApp({ projectId: "demo-conduzapp" });
const db = require("../functions/emulator-db").configureEmulatorFirestore(getFirestore());
let backup,
  env,
  users = {},
  baseline,
  now,
  start;
async function account(role) {
  const email = `${role}-${Date.now()}@conduzapp.test`,
    password = "TestTCC2026!";
  let r = await fetch(
    "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );
  let data = await r.json();
  assert.ok(data.localId, JSON.stringify(data));
  if (role === "admin") {
    await getAuth().setCustomUserClaims(data.localId, { admin: true });
    r = await fetch(
      "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      },
    );
    data = await r.json();
  }
  return { uid: data.localId, token: data.idToken };
}
async function call(role, op, input = {}) {
  const r = await fetch(
    "http://127.0.0.1:5001/demo-conduzapp/us-central1/conduz",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(role ? { Authorization: `Bearer ${users[role].token}` } : {}),
      },
      body: JSON.stringify({ data: { op, input } }),
    },
  );
  const body = await r.json();
  return { status: r.status, ...body };
}
before(async () => {
  console.log("Preparando contas e estado temporário nos emuladores.");
  backup = await db.doc("private/state").get();
  for (const role of ["aluno", "outro", "instrutor", "admin"])
    users[role] = await account(role);
  now = Date.now();
  start = Math.ceil((now + DAY) / HOUR) * HOUR;
  baseline = empty();
  for (const [role, u] of Object.entries(users))
    baseline.users[u.uid] = {
      id: u.uid,
      name: `Teste ${role}`,
      role: role === "outro" ? "aluno" : role,
      favorites: [],
    };
  Object.assign(baseline.users[users.instrutor.uid], {
    approval: "aprovado",
    credential: "DEMO-TEST",
    credentialExpires: now + 30 * DAY,
    price: 8500,
    periods: Array.from({ length: 7 }, (_, day) => ({ day, from: 0, to: 24 })),
    blocks: [],
  });
  env = await initializeTestEnvironment({
    projectId: "demo-conduzapp",
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: fs.readFileSync("firestore.rules", "utf8"),
    },
    storage: {
      host: "127.0.0.1",
      port: 9199,
      rules: fs.readFileSync("storage.rules", "utf8"),
    },
  });
});
beforeEach(async () => {
  await db.doc("private/state").set(baseline);
});
after(async () => {
  if (backup?.exists) await db.doc("private/state").set(backup.data());
  else await db.doc("private/state").delete();
  for (const u of Object.values(users)) await getAuth().deleteUser(u.uid);
  if (env) await env.cleanup();
});
test("Function recusa acesso anônimo e elevação de privilégio", async () => {
  assert.equal((await call(null, "state")).status, 401);
  const r = await call("aluno", "approve", {
    instructor: users.instrutor.uid,
    decision: "aprovado",
    reason: "Fraude",
  });
  assert.ok(r.error);
  assert.match(r.error.message, /administração/);
});
test("duas reservas concorrentes: exatamente uma é aceita na transação", async () => {
  const results = await Promise.all(
    ["aluno", "outro"].map((role) =>
      call(role, "book", { instructor: users.instrutor.uid, start }),
    ),
  );
  assert.equal(
    results.filter((r) => r.result).length,
    1,
    JSON.stringify(results),
  );
  assert.equal(results.filter((r) => r.error).length, 1);
  const state = (await db.doc("private/state").get()).data();
  assert.equal(Object.keys(state.bookings).length, 1);
  const b = Object.values(state.bookings)[0];
  assert.equal(b.duration, 60);
  assert.equal(b.price, 8500);
  assert.equal(b.commission, 255);
});
test("fluxo integrado: solicitar → aceitar → simular pagamento, com privacidade", async () => {
  let r = await call("aluno", "book", {
    instructor: users.instrutor.uid,
    start,
  });
  assert.ok(r.result, JSON.stringify(r));
  const b = Object.values(r.result.bookings)[0];
  assert.ok((await call("aluno", "pay", { booking: b.id })).error);
  r = await call("instrutor", "accept", { booking: b.id });
  assert.equal(r.result.bookings[b.id].status, "aguardando_pagamento");
  r = await call("aluno", "pay", { booking: b.id });
  assert.equal(r.result.bookings[b.id].status, "confirmado");
  const outside = await call("outro", "state");
  assert.deepEqual(outside.result.bookings, {});
  assert.equal(outside.result.users[users.instrutor.uid].credential, undefined);
  await call("aluno", "message", {
    to: users.instrutor.uid,
    text: "Mensagem privada",
  });
  assert.equal((await call("instrutor", "state")).result.messages.length, 1);
  assert.equal((await call("outro", "state")).result.messages.length, 0);
  assert.ok((await call("outro", "cancel", { booking: b.id })).error);
});
test("credenciamento, indisponibilidade e suspensão são impostos no backend real", async () => {
  const u = baseline.users[users.instrutor.uid];
  for (const change of [
    { approval: "pendente" },
    { periods: [] },
    { credentialExpires: now - 1 },
    { suspendedUntil: now + DAY },
  ]) {
    const s = structuredClone(baseline);
    Object.assign(s.users[users.instrutor.uid], change);
    await db.doc("private/state").set(s);
    assert.ok(
      (await call("aluno", "book", { instructor: users.instrutor.uid, start }))
        .error,
    );
  }
  assert.equal(u.approval, "aprovado");
});
test("conclusão e avaliações bilaterais pelo endpoint com tempo do servidor", async () => {
  const state = structuredClone(baseline),
    id = "teste-aula-passada";
  state.bookings[id] = {
    id,
    student: users.aluno.uid,
    instructor: users.instrutor.uid,
    start: now - 2 * HOUR,
    duration: 60,
    price: 8500,
    commission: 255,
    status: "confirmado",
    paid: true,
    paymentMode: "simulado",
    ratings: {},
    payoutEligible: false,
  };
  await db.doc("private/state").set(state);
  let r = await call("instrutor", "complete", { booking: id });
  assert.equal(r.result.bookings[id].status, "concluido");
  assert.ok((await call("aluno", "review", { booking: id, rating: 5 })).result);
  assert.ok(
    (await call("instrutor", "review", { booking: id, rating: 4 })).result,
  );
  assert.ok((await call("aluno", "review", { booking: id, rating: 1 })).error);
  r = await call("aluno", "dispute", {
    booking: id,
    reason: "Contestação de teste",
  });
  assert.ok(r.result.bookings[id].disputeOpen);
  assert.equal(r.result.bookings[id].payoutEligible, false);
});
test("Firestore nega acesso direto a estado, reservas e escrita de privilégios", async () => {
  for (const ctx of [
    env.unauthenticatedContext(),
    env.authenticatedContext(users.aluno.uid),
    env.authenticatedContext(users.admin.uid, { admin: true }),
  ]) {
    const client = ctx.firestore();
    await assertFails(getDoc(doc(client, "private/state")));
    await assertFails(setDoc(doc(client, "private/state"), { admin: true }));
    await assertFails(
      setDoc(doc(client, "agendamentos/fraude"), { status: "confirmado" }),
    );
  }
});
test("fotos privadas: participante pode anexar, terceiro e anônimo não; admin lê", async () => {
  const booking = "teste-evidencia";
  await db
    .doc(`bookingAccess/${booking}`)
    .set({
      student: users.aluno.uid,
      instructor: users.instrutor.uid,
      disputeOpen: true,
    });
  const path = `disputes/${booking}/${users.aluno.uid}/foto.png`;
  const bytes = new Uint8Array([137, 80, 78, 71]);
  const mine = env.authenticatedContext(users.aluno.uid).storage();
  await assertSucceeds(
    uploadBytes(ref(mine, path), bytes, { contentType: "image/png" }),
  );
  await assertSucceeds(
    getBytes(
      ref(
        env.authenticatedContext(users.admin.uid, { admin: true }).storage(),
        path,
      ),
    ),
  );
  await assertSucceeds(
    getBytes(
      ref(env.authenticatedContext(users.instrutor.uid).storage(), path),
    ),
  );
  const folder = `disputes/${booking}/${users.aluno.uid}`;
  const listing = await assertSucceeds(listAll(ref(mine, folder)));
  assert.equal(listing.items.length, 1);
  await assertFails(
    listAll(ref(env.authenticatedContext(users.outro.uid).storage(), folder)),
  );
  await assertFails(
    getBytes(ref(env.authenticatedContext(users.outro.uid).storage(), path)),
  );
  await assertFails(
    getBytes(ref(env.unauthenticatedContext().storage(), path)),
  );
  await assertFails(
    uploadBytes(
      ref(mine, `disputes/${booking}/${users.aluno.uid}/arquivo.txt`),
      bytes,
      { contentType: "text/plain" },
    ),
  );
  await assertFails(
    uploadBytes(
      ref(mine, `disputes/${booking}/${users.instrutor.uid}/forjada.png`),
      bytes,
      { contentType: "image/png" },
    ),
  );
  await db.doc(`bookingAccess/${booking}`).delete();
});
