import { useState } from "react";
import { ScrollView, View, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "@/services/firebase";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/services/firebase";
import { useSession } from "@/services/session";
import { ThemedText as Text } from "@/components/themed-text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Image } from "expo-image";
import { UI } from "@/constants/theme";
import { Icon } from "@/components/ui/icon";
import {authFields,authMessage} from "@/lib/presentation";
export function AuthScreen({
  signup = false,
  role = "aluno",
}: {
  signup?: boolean;
  role?: "aluno" | "instrutor";
}) {
  const router = useRouter();
  const api = useSession();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [name, setName] = useState(""),
    [credential, setCredential] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  async function submit() {
    const invalid=authFields(email,password,signup,name);
    if(invalid){setError(invalid);return;}
    setBusy(true);
    setError("");
    try {
      if (signup) {
        if (name.trim().length < 3 || password.length < 6)
          throw new Error(
            "Informe nome completo e senha com seis ou mais caracteres.",
          );
        await createUserWithEmailAndPassword(auth, email.trim(), password);
        await httpsCallable(
          functions,
          "conduz",
        )({ op: "register", input: { name, role, credential } });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      await api.refresh();
      router.replace("/painel");
    } catch (e: unknown) {
      setError(authMessage(e,signup));
    } finally {
      setBusy(false);
    }
  }
  async function demo(account: string) {
    setEmail(`${account}@conduzapp.test`);
    setPassword("DemoTCC2026!");
  }
  return (
    <SafeAreaView style={s.page}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.shell}>
          <View style={s.brand}>
            <Image
              source={require("../../assets/icons/brand.svg")}
              style={s.mark}
              accessibilityLabel="ConduzApp"
            />
            <Text style={s.logo}>
              CONDUZ<Text style={s.logoLight}> APP</Text>
            </Text>
            <Text style={s.white}>Sua próxima conquista começa aqui.</Text>
          </View>
          <Card style={s.card}>
            <Text style={s.title}>
              {signup ? "Vamos criar sua conta" : "Bem-vindo de volta!"}
            </Text>
            <Text style={s.subtitle}>
              {signup
                ? "Cadastre-se como " + role + "."
                : role === "instrutor"
                  ? "Entre para acompanhar seus alunos e sua agenda."
                  : "Faça login para continuar sua jornada."}
            </Text>
            {signup && (
              <Input
                label="Nome completo"
                leadingIcon="user"
                value={name}
                onChangeText={setName}
              />
            )}
            <Input
              label="E-mail"
              leadingIcon="user"
              placeholder="voce@exemplo.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              label="Senha"
              leadingIcon="lock"
              placeholder="Sua senha"
              isPassword
              value={password}
              onChangeText={setPassword}
            />
            {signup && role === "instrutor" && (
              <>
                <Input
                  label="Autorização profissional (análise manual)"
                  value={credential}
                  onChangeText={setCredential}
                />
                <Text style={s.subtitle}>
                  A operação só será liberada após análise administrativa. Sem
                  consulta automática ao Detran.
                </Text>
              </>
            )}
            {!!error && (
              <Text accessibilityRole="alert" style={s.error}>
                {error}
              </Text>
            )}
            {!signup && (
              <TouchableOpacity
                accessibilityRole="button"
                style={s.forgot}
                onPress={() => router.push("/recuperar-senha")}
              >
                <Text style={s.link}>Esqueceu sua senha?</Text>
              </TouchableOpacity>
            )}
            <Button
              title={signup ? "Criar conta" : "Entrar"}
              loading={busy}
              onPress={submit}
            />
            <View style={s.divider}>
              <View style={s.line} />
              <Text style={s.subtitle}>ou</Text>
              <View style={s.line} />
            </View>
            <Button
              title={signup ? "Voltar ao login" : "Criar conta"}
              variant="secondary"
              onPress={() =>
                router.push(
                  signup
                    ? "/"
                    : role === "instrutor"
                      ? "/cadastro-instrutor"
                      : "/cadastro-aluno",
                )
              }
            />
            {!signup && (
              <TouchableOpacity
                accessibilityRole="button"
                style={s.switchRole}
                onPress={() =>
                  router.push(role === "instrutor" ? "/" : "/login-instrutor")
                }
              >
                <Text style={s.link}>
                  {role === "instrutor"
                    ? "Entrar como aluno"
                    : "Entrar como instrutor"}
                </Text>
              </TouchableOpacity>
            )}
            {api.user && !signup && (
              <Button
                title="Continuar sessão"
                variant="secondary"
                onPress={() => router.replace("/painel")}
              />
            )}
            {api.user && signup && (
              <Button
                title="Sair da sessão atual"
                variant="secondary"
                onPress={() => signOut(auth)}
              />
            )}
          </Card>
          {!signup && (
            <View style={s.demo}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ expanded: showDemo }}
                style={s.demoToggle}
                onPress={() => setShowDemo(!showDemo)}
              >
                <Icon name="shield" size={18} />
                <View style={s.flex}>
                  <Text style={s.section}>Acessos de demonstração</Text>
                  <Text style={s.caption}>
                    Aluno, instrutor e administração
                  </Text>
                </View>
                <Icon name="chevron" size={16} />
              </TouchableOpacity>
              {showDemo && (
                <View style={s.demoContent}>
                  <Text style={s.subtitle}>
                    Contas fictícias. Escolha um perfil e toque em Entrar. Os
                    emuladores devem estar preparados.
                  </Text>
                  <View style={s.row}>
                    {["aluno", "instrutor", "admin"].map((account) => (
                      <View style={s.flex} key={account}>
                        <Button
                          title={
                            account === "admin"
                              ? "Admin"
                              : account === "aluno"
                                ? "Aluno"
                                : "Instrutor"
                          }
                          variant="secondary"
                          onPress={() => demo(account)}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
          <Text style={s.foot}>
            DEMONSTRAÇÃO LOCAL · TCC 2026{"\n"}Pagamentos e estornos
            exclusivamente simulados.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: UI.color.backgroundApp },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  shell: { width: "100%", maxWidth: 440 },
  brand: {
    alignItems: "center",
    backgroundColor: UI.color.primaryDark,
    padding: 28,
    paddingBottom: 44,
    borderTopLeftRadius: UI.radius.large,
    borderTopRightRadius: UI.radius.large,
    gap: 8,
  },
  mark: { width: 64, height: 74 },
  logo: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 36,
    letterSpacing: 1,
  },
  logoLight: {
    color: "#6D9CFF",
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "800",
  },
  white: { color: "#D6E4FF", fontSize: 12 },
  card: { padding: 24, gap: 14, marginTop: -20, borderRadius: UI.radius.large },
  title: { fontSize: UI.type.title, lineHeight: 31, fontWeight: "800" },
  subtitle: {
    color: UI.color.textSecondary,
    fontSize: UI.type.body,
    lineHeight: 21,
  },
  caption: { color: UI.color.textSecondary, fontSize: 12 },
  error: { color: UI.color.dangerText },
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  flex: { flex: 1 },
  section: { fontWeight: "700", fontSize: 13 },
  foot: {
    color: UI.color.textSecondary,
    fontSize: 11,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 20,
  },
  link: { color: UI.color.primary, fontSize: 13, fontWeight: "700" },
  forgot: { alignSelf: "flex-end", paddingVertical: 8, minHeight: 36 },
  switchRole: { alignItems: "center", padding: 12 },
  divider: { flexDirection: "row", alignItems: "center", gap: 12 },
  line: { height: 1, backgroundColor: UI.color.border, flex: 1 },
  demo: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: UI.color.border,
    borderRadius: UI.radius.card,
    backgroundColor: UI.color.surface,
  },
  demoToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  demoContent: { padding: 16, paddingTop: 0, gap: 12 },
});
