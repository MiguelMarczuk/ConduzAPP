"use strict";
if (
  process.env.FUNCTIONS_EMULATOR !== "true" ||
  !process.env.FIRESTORE_EMULATOR_HOST
) {
  throw new Error(
    "ConduzAPP TCC: backend exclusivo dos emuladores. Deploy desabilitado.",
  );
}
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { randomUUID } = require("node:crypto");
const { execute, empty } = require("./domain");
const { statePath } = require("./state-scope");
let database;
function getDatabase() {
  if (!database) {
    const { initializeApp, getApps } = require("firebase-admin/app");
    const { getFirestore } = require("firebase-admin/firestore");
    if (!getApps().length) initializeApp({ projectId: "demo-conduzapp" });
    database = require("./emulator-db").configureEmulatorFirestore(getFirestore());
  }
  return database;
}
exports.conduz = onCall({ cors: true, timeoutSeconds: 60 }, async (request) => {
  if (!request.auth)
    throw new HttpsError("unauthenticated", "Entre na sua conta.");
  const actor = {
    uid: request.auth.uid,
    admin: request.auth.token.admin === true,
  };
  const { op, input } = request.data || {};
  const id = randomUUID();
  const db = getDatabase();
  try {
    const scope = statePath(request.auth.token).split('/')[1];
    const trusted = {};
    if (["setPhoto","submitIdentity"].includes(op)) {
      const {getStorage} = require("firebase-admin/storage");
      trusted.media = await require("./media").validateMedia(getStorage().bucket("demo-conduzapp.appspot.com"), actor.uid, scope, op, input?.path);
    }
    return await db.runTransaction(async (tx) => {
      const ref = db.doc(statePath(request.auth.token));
      const snap = await tx.get(ref);
      const result = execute(
        snap.data() || empty(),
        actor,
        op,
        input,
        Date.now(),
        id,
        trusted,
      );
      if (result.write) {
        tx.set(ref, result.state);
        for (const b of Object.values(result.state.bookings)) {
          tx.set(db.doc(`bookingAccess/${b.id}`), {
            student: b.student,
            instructor: b.instructor,
            disputeOpen: !!b.disputeOpen,
          });
        }
      }
      return result.result;
    });
  } catch (error) {
    throw new HttpsError(
      "failed-precondition",
      error.message || "Operação recusada.",
    );
  }
});
