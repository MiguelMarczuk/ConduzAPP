export function authMessage(error: unknown, signup = false): string {
  const code = (error as {code?:string})?.code || "";
  if(code === "auth/invalid-email") return "Digite um endereço de e-mail válido.";
  if(signup && code === "auth/email-already-in-use") return "Já existe uma conta com este e-mail.";
  if(signup && ["auth/weak-password","auth/password-does-not-meet-requirements"].includes(code)) return "A senha não atende aos requisitos mínimos de segurança.";
  if(["auth/network-request-failed","functions/unavailable"].includes(code)) return "Não foi possível conectar. Verifique sua internet e tente novamente.";
  if(code === "auth/too-many-requests") return "Muitas tentativas. Aguarde um pouco e tente novamente.";
  if(!signup && ["auth/user-not-found","auth/wrong-password","auth/invalid-credential","auth/user-disabled"].includes(code)) return "E-mail ou senha incorretos. Confira seus dados e tente novamente.";
  return signup ? "Não foi possível concluir o cadastro. Confira os dados e tente novamente." : "Não foi possível entrar. Confira seus dados e tente novamente.";
}
export function authFields(email:string,password:string,signup=false,name=""):string {
  if(!email.trim() || !password) return "Preencha seu e-mail e sua senha.";
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Digite um endereço de e-mail válido.";
  if(signup && name.trim().length<3) return "Informe seu nome completo.";
  if(signup && password.length<6) return "A senha não atende aos requisitos mínimos de segurança.";
  return "";
}
