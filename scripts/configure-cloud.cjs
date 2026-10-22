"use strict";
const fs = require("node:fs"),
  path = require("node:path"),
  cp = require("node:child_process");
const { runtimeConfig } = require("../functions/runtime");
function configure(projectId, appId, scope = "demo-tcc-2026") {
  if (!projectId || !appId)
    throw Error("Informe projeto e App ID web do Firebase.");
  if (
    !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId) ||
    projectId.startsWith("demo-")
  )
    throw Error("Projeto online inválido.");
  const output = cp.execFileSync(
    process.execPath,
    [
      path.resolve("node_modules/firebase-tools/lib/bin/firebase.js"),
      "apps:sdkconfig",
      "WEB",
      appId,
      "--project",
      projectId,
      "--json",
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
  );
  const web = JSON.parse(output).result?.sdkConfig;
  if (
    web?.projectId !== projectId ||
    !web.apiKey ||
    !web.appId ||
    web.authDomain !== `${projectId}.firebaseapp.com`
  )
    throw Error("Configuração do app não corresponde ao projeto escolhido.");
  const storageBucket = web.storageBucket;
  const backend = {
    CONDUZ_MODE: "cloud-demo",
    CONDUZ_PROJECT_ID: projectId,
    CONDUZ_STORAGE_BUCKET: storageBucket,
    CONDUZ_DEMO_SCOPE: scope,
  };
  runtimeConfig({ ...backend, GCLOUD_PROJECT: projectId });
  fs.mkdirSync(".tools/cloud-demo", { recursive: true });
  const file = ".tools/cloud-demo/config.json";
  if (fs.existsSync(file)) {
    const previous = JSON.parse(fs.readFileSync(file, "utf8"));
    if (previous.projectId !== projectId || previous.scope !== scope)
      throw Error(
        "Já existe uma configuração de outro cenário. Preserve-a antes de trocar o destino.",
      );
  }
  fs.writeFileSync(
    file,
    JSON.stringify({ projectId, scope, storageBucket, web }, null, 2),
  );
  fs.writeFileSync(
    `functions/.env.${projectId}`,
    Object.entries(backend)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n") + "\n",
  );
  console.log(
    `Configuração preparada para ${projectId}. Nenhum deploy ou faturamento foi executado.`,
  );
}
if (require.main === module) {
  try {
    configure(...process.argv.slice(2));
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  }
}
module.exports = { configure };
