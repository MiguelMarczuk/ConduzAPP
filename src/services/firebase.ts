import { getApp, getApps, initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { connectStorageEmulator, getStorage } from "firebase/storage";

// Este checkout só usa emuladores. Nenhuma configuração de produção.
const app = getApps().length
  ? getApp()
  : initializeApp({
      apiKey: "demo-conduzapp-key",
      authDomain: "demo-conduzapp.firebaseapp.com",
      projectId: "demo-conduzapp",
      storageBucket: "demo-conduzapp.appspot.com",
      appId: "demo-conduzapp",
    });
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app, "us-central1");
export const storage = getStorage(app);
const host = process.env.EXPO_PUBLIC_EMULATOR_HOST || "127.0.0.1";
const state = globalThis as typeof globalThis & { conduzemulators?: boolean };
if (!state.conduzemulators) {
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, host, 8080);
  connectFunctionsEmulator(functions, host, 5001);
  connectStorageEmulator(storage, host, 9199);
  state.conduzemulators = true;
}
