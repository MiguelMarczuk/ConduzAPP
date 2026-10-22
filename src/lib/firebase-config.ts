type Settings = {
  mode?: string;
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  appId?: string;
};
export function firebaseSettings(input: Settings) {
  const mode = input.mode || "emulator";
  if (mode === "emulator")
    return {
      mode,
      config: {
        apiKey: "demo-conduzapp-key",
        authDomain: "demo-conduzapp.firebaseapp.com",
        projectId: "demo-conduzapp",
        storageBucket: "demo-conduzapp.appspot.com",
        appId: "demo-conduzapp",
      },
    };
  if (mode !== "cloud-demo") throw new Error("Ambiente Firebase inválido.");
  const { apiKey, authDomain, projectId, storageBucket, appId } = input;
  if (
    !apiKey ||
    !appId ||
    !projectId ||
    !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId) ||
    projectId.startsWith("demo-") ||
    authDomain !== `${projectId}.firebaseapp.com` ||
    ![`${projectId}.firebasestorage.app`, `${projectId}.appspot.com`].includes(
      storageBucket || "",
    )
  )
    throw new Error(
      "Configuração online incompleta ou inconsistente. Nenhuma conexão local será usada.",
    );
  return {
    mode,
    config: { apiKey, authDomain, projectId, storageBucket, appId },
  };
}
