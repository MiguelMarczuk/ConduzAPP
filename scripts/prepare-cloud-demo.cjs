"use strict";
const fs = require("node:fs"),
  path = require("node:path"),
  { randomUUID, randomBytes } = require("node:crypto");
const ar = require("node:module").createRequire(
  path.resolve("functions/package.json"),
);
const {
  loadConfig,
  cloudSession,
  firestoreValue,
  storageCors,
} = require("./cloud-session.cjs");
const { demoFixture, accounts: roles } = require("./demo-fixture.cjs");
async function prepare() {
  const config = loadConfig(),
    { request, credential } = await cloudSession(config);
  const root = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents`;
  await request(
    `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)`,
  );
  const bucket = await request(
    `https://storage.googleapis.com/storage/v1/b/${config.storageBucket}`,
  );
  const authConfig = await request(
    `https://identitytoolkit.googleapis.com/admin/v2/projects/${config.projectId}/config`,
  );
  if (authConfig.signIn?.email?.enabled !== true)
    throw Error(
      "Habilite E-mail/Senha em Authentication no console Firebase antes de preparar as contas.",
    );
  const credentialsFile = ".tools/cloud-demo/acessos.json";
  let manifest;
  if (fs.existsSync(credentialsFile)) {
    manifest = JSON.parse(fs.readFileSync(credentialsFile, "utf8"));
    if (
      manifest.projectId !== config.projectId ||
      manifest.scope !== config.scope
    )
      throw Error(
        "Credenciais locais pertencem a outro cenário. Nada foi sobrescrito.",
      );
  } else {
    try {
      await request(`${root}/private/${config.scope}`);
      throw Error(
        "O cenário já existe e não há manifesto local. Preparação interrompida para preservar seus dados.",
      );
    } catch (e) {
      if (e.status !== 404) throw e;
    }
    const id = randomUUID();
    manifest = {
      projectId: config.projectId,
      scope: config.scope,
      createdAt: Date.now(),
      accounts: roles.map((a) => ({
        ...a,
        uid: `cloud-${a.role}-${id}`,
        email: `${a.role}-${id}@conduzapp.test`,
        password: randomBytes(24).toString("base64url"),
      })),
    };
    fs.mkdirSync(path.dirname(credentialsFile), { recursive: true });
    fs.writeFileSync(credentialsFile, JSON.stringify(manifest, null, 2), {
      flag: "wx",
      mode: 0o600,
    });
  }
  const cors = storageCors(config.projectId, bucket.cors);
  if (JSON.stringify(cors) !== JSON.stringify(bucket.cors || []))
    await request(
      `https://storage.googleapis.com/storage/v1/b/${config.storageBucket}?ifMetagenerationMatch=${bucket.metageneration}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cors }),
      },
    );
  const identities = Object.fromEntries(
    manifest.accounts.map((a) => [a.role, a.uid]),
  );
  const state = demoFixture(manifest.createdAt, config.scope, identities);
  state.demo.cloudDemo = true;
  const { initializeApp } = ar("firebase-admin/app"),
    { getAuth } = ar("firebase-admin/auth");
  const app = initializeApp({ projectId: config.projectId, credential });
  const auth = getAuth(app);
  for (const account of manifest.accounts) {
    let user;
    try {
      user = await auth.getUser(account.uid);
    } catch (e) {
      if (e.code !== "auth/user-not-found") throw e;
      user = await auth.createUser({
        uid: account.uid,
        email: account.email,
        password: account.password,
        displayName: account.name,
      });
    }
    if (user.email !== account.email)
      throw Error(
        "Conta existente não corresponde ao cenário. Nada foi alterado.",
      );
  }
  const photo = fs.readFileSync("assets/demo/perfil-ficticio.png");
  for (const account of manifest.accounts.filter((a) => a.role !== "admin")) {
    const name = state.users[account.uid].photoPath;
    try {
      await request(
        `https://storage.googleapis.com/upload/storage/v1/b/${config.storageBucket}/o?uploadType=media&ifGenerationMatch=0&name=${encodeURIComponent(name)}`,
        {
          method: "POST",
          headers: { "Content-Type": "image/png" },
          body: photo,
        },
      );
    } catch (e) {
      if (e.status !== 412) throw e;
    }
  }
  try {
    await request(
      `${root}/private?documentId=${encodeURIComponent(config.scope)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: firestoreValue(state).mapValue.fields }),
      },
    );
  } catch (e) {
    if (e.status !== 409) throw e;
  }
  const b = state.bookings[state.demo.historicalBooking];
  try {
    await request(
      `${root}/bookingAccess?documentId=${encodeURIComponent(b.id)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: firestoreValue({
            student: b.student,
            instructor: b.instructor,
            scope: config.scope,
            disputeOpen: false,
          }).mapValue.fields,
        }),
      },
    );
  } catch (e) {
    if (e.status !== 409) throw e;
  }
  for (const account of manifest.accounts)
    await auth.setCustomUserClaims(account.uid, {
      conduzDemo: true,
      stateScope: config.scope,
      ...(account.role === "admin" ? { admin: true } : {}),
    });
  console.log(
    "Cenário fictício online preparado. A base existente foi preservada.",
  );
  console.log(
    "Contas e senhas exclusivas estão em .tools/cloud-demo/acessos.json. Não publique esse arquivo nem as senhas no GitHub.",
  );
}
if (require.main === module)
  prepare()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
module.exports = { prepare };
