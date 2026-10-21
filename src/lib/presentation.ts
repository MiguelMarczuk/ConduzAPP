export function authMessage(error: unknown, signup = false): string {
  const code = (error as { code?: string })?.code || "";
  if (code === "auth/invalid-email")
    return "Digite um endereço de e-mail válido.";
  if (signup && code === "auth/email-already-in-use")
    return "Já existe uma conta com este e-mail.";
  if (
    signup &&
    ["auth/weak-password", "auth/password-does-not-meet-requirements"].includes(
      code,
    )
  )
    return "A senha não atende aos requisitos mínimos de segurança.";
  if (["auth/network-request-failed", "functions/unavailable"].includes(code))
    return "Não foi possível conectar. Verifique sua internet e tente novamente.";
  if (code === "auth/too-many-requests")
    return "Muitas tentativas. Aguarde um pouco e tente novamente.";
  if (
    !signup &&
    [
      "auth/user-not-found",
      "auth/wrong-password",
      "auth/invalid-credential",
      "auth/user-disabled",
    ].includes(code)
  )
    return "E-mail ou senha incorretos. Confira seus dados e tente novamente.";
  return signup
    ? "Não foi possível concluir o cadastro. Confira os dados e tente novamente."
    : "Não foi possível entrar. Confira seus dados e tente novamente.";
}
export const identityStatusLabel = (status?: string) =>
  (
    ({
      aprovado: "Aprovada",
      pendente: "Aguardando verificação",
      rejeitado: "Rejeitada",
      nao_enviada: "Envio pendente",
    }) as Record<string, string>
  )[status || "nao_enviada"] || "Envio pendente";
export function authFields(
  email: string,
  password: string,
  signup = false,
  name = "",
): string {
  if (!email.trim() || !password) return "Preencha seu e-mail e sua senha.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return "Digite um endereço de e-mail válido.";
  if (signup && name.trim().length < 3) return "Informe seu nome completo.";
  if (signup && password.length < 6)
    return "A senha não atende aos requisitos mínimos de segurança.";
  return "";
}
export const homeTab = (_role: string, pending = false) =>
  pending ? "Perfil" : "Início";
export const bookingFilters = [
  "Todas",
  "Pendentes",
  "Aguardando pagamento",
  "Confirmadas",
  "Concluídas",
  "Canceladas",
  "Faltas",
  "Em disputa",
];
export function matchesBooking(
  b: { status: string; disputeOpen?: boolean },
  filter: string,
): boolean {
  if (filter === "Todas") return true;
  if (filter === "Em disputa") return !!b.disputeOpen;
  if (filter === "Faltas") return b.status.startsWith("falta_");
  return (
    b.status ===
    (
      {
        Pendentes: "solicitado",
        "Aguardando pagamento": "aguardando_pagamento",
        Confirmadas: "confirmado",
        Concluídas: "concluido",
        Canceladas: "cancelado",
      } as Record<string, string>
    )[filter]
  );
}
export function instructorList<
  T extends {
    role: string;
    eligible?: boolean;
    featured?: boolean;
    id: string;
    name: string;
    region?: string;
  },
>(users: T[], mode: string, query: string, favorites: string[] = []): T[] {
  const all = users.filter(
    (u) => u.role === "instrutor" && u.eligible === true,
  );
  const featured = all.filter((u) => u.featured);
  return (mode === "avulsas" && featured.length ? featured : all).filter(
    (u) =>
      (mode !== "favoritos" || favorites.includes(u.id)) &&
      (u.name + " " + (u.region || ""))
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
}
