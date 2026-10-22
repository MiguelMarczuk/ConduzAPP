const { test, before, after } = require("node:test"),
  assert = require("node:assert/strict");
const fs = require("node:fs"),
  { randomUUID } = require("node:crypto");
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const {
  ref,
  uploadBytes,
  getBytes,
  deleteObject,
} = require("firebase/storage");
const { doc, setDoc, getDoc, deleteDoc } = require("firebase/firestore");
const projectId = "demo-conduzapp-cloud-tests",
  scope = "demo-" + randomUUID(),
  bucket = `gs://${projectId}.appspot.com`;
const photo = `profilePhotos/${scope}/s/profile.png`,
  document = `identityDocuments/${scope}/s/document.png`,
  booking = `cloud-rules-${randomUUID()}`,
  evidence = `disputes/${booking}/s/proof.png`;
let env;
let metadata;
const png = fs.readFileSync("assets/demo/perfil-ficticio.png");
const client = (uid, extra = {}) =>
  env
    .authenticatedContext(uid, {
      conduzDemo: true,
      stateScope: scope,
      ...extra,
    })
    .storage(bucket);
before(async () => {
  // O Storage Emulator resolve firestore.get no projeto com que foi iniciado,
  // mesmo quando o bucket de teste usa outro projeto. Somente este UUID é criado.
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
  const ar = require("node:module").createRequire(
    require("node:path").resolve("functions/package.json"),
  );
  const app = ar("firebase-admin/app").initializeApp(
    { projectId: "demo-conduzapp" },
    "cloud-rules-metadata",
  );
  const db = require("../functions/emulator-db").configureEmulatorFirestore(
    ar("firebase-admin/firestore").getFirestore(app),
  );
  metadata = db.doc(`bookingAccess/${booking}`);
  await metadata.create({
    student: "s",
    instructor: "t",
    scope,
    disputeOpen: true,
  });
  env = await initializeTestEnvironment({
    projectId,
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: fs.readFileSync("firestore.rules", "utf8"),
    },
    storage: {
      host: "127.0.0.1",
      port: 9199,
      rules: fs.readFileSync("storage.cloud.rules", "utf8"),
    },
  });
  await env.withSecurityRulesDisabled(async (ctx) =>
    setDoc(doc(ctx.firestore(), "bookingAccess", booking), {
      student: "s",
      instructor: "t",
      scope,
      disputeOpen: true,
    }),
  );
});
after(async () => {
  if (!env) return;
  await env.withSecurityRulesDisabled(async (ctx) => {
    for (const path of [photo, document, evidence]) {
      try {
        await deleteObject(ref(ctx.storage(bucket), path));
      } catch (e) {
        if (e.code !== "storage/object-not-found") throw e;
      }
    }
    await deleteDoc(doc(ctx.firestore(), "bookingAccess", booking));
  });
  await env.cleanup();
  await metadata.delete();
});
test("Storage online exige convite e cenário, conserva documento privado e recusa escrita alheia", async () => {
  const owner = client("s"),
    teacher = client("t"),
    administrator = client("a", { admin: true });
  const notInvited = env
    .authenticatedContext("s", { stateScope: scope })
    .storage(bucket);
  await assertFails(
    uploadBytes(ref(notInvited, photo), png, { contentType: "image/png" }),
  );
  await assertFails(
    uploadBytes(ref(teacher, photo), png, { contentType: "image/png" }),
  );
  await assertSucceeds(
    uploadBytes(ref(owner, photo), png, { contentType: "image/png" }),
  );
  await assertSucceeds(getBytes(ref(teacher, photo)));
  await assertFails(
    getBytes(ref(env.unauthenticatedContext().storage(bucket), photo)),
  );
  await assertFails(
    getBytes(
      ref(client("a", { admin: true, stateScope: "demo-outro" }), photo),
    ),
  );
  await assertSucceeds(
    uploadBytes(ref(owner, document), png, { contentType: "image/png" }),
  );
  await assertSucceeds(getBytes(ref(owner, document)));
  await assertSucceeds(getBytes(ref(administrator, document)));
  await assertFails(getBytes(ref(teacher, document)));
  await assertFails(deleteObject(ref(owner, photo)));
  await assertFails(
    getDoc(
      doc(
        env
          .authenticatedContext("s", { conduzDemo: true, stateScope: scope })
          .firestore(),
        "private",
        scope,
      ),
    ),
  );
  await assertFails(
    setDoc(
      doc(
        env
          .authenticatedContext("s", { conduzDemo: true, stateScope: scope })
          .firestore(),
        "private",
        scope,
      ),
      { admin: true },
    ),
  );
});
test("evidências online ficam restritas aos participantes e administrador do mesmo cenário", async () => {
  await assertSucceeds(
    uploadBytes(ref(client("s"), evidence), png, { contentType: "image/png" }),
  );
  await assertSucceeds(getBytes(ref(client("t"), evidence)));
  await assertSucceeds(getBytes(ref(client("a", { admin: true }), evidence)));
  await assertFails(getBytes(ref(client("o"), evidence)));
  await assertFails(
    getBytes(
      ref(client("a", { admin: true, stateScope: "demo-outro" }), evidence),
    ),
  );
  await assertFails(
    uploadBytes(ref(client("o"), `disputes/${booking}/o/other.png`), png, {
      contentType: "image/png",
    }),
  );
  let snapshot;
  await env.withSecurityRulesDisabled(async (ctx) => {
    snapshot = await getDoc(doc(ctx.firestore(), "bookingAccess", booking));
  });
  assert.equal(snapshot.data().scope, scope);
});
