import { useState } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
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
  async function submit() {
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
      setError(e instanceof Error ? e.message : "Não foi possível entrar.");
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
        <View style={s.brand}>
          <Text style={s.logo}>
            CONDUZ<Text style={s.logoLight}>APP</Text>
          </Text>
          <Text style={s.white}>Sua próxima conquista começa aqui.</Text>
        </View>
        <Card style={s.card}>
          <Text style={s.tag}>DEMONSTRAÇÃO LOCAL • TCC 2026</Text>
          <Text style={s.title}>
            {signup ? "Vamos criar sua conta" : "Bem-vindo de volta"}
          </Text>
          <Text style={s.subtitle}>
            {signup
              ? `Cadastre-se como ${role}.`
              : "Encontre seu caminho com mais confiança."}
          </Text>
          {signup && (
            <Input label="Nome completo" value={name} onChangeText={setName} />
          )}
          <Input
            label="E-mail"
            placeholder="voce@exemplo.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Senha"
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
          {!!error && <Text style={s.error}>{error}</Text>}
          <Button
            title={signup ? "Criar conta" : "Entrar"}
            loading={busy}
            onPress={submit}
          />
          {!signup && (
            <Button
              title="Esqueci minha senha"
              variant="secondary"
              onPress={() => router.push("/recuperar-senha")}
            />
          )}
          <Button
            title={signup ? "Voltar ao login" : "Criar conta de aluno"}
            variant="secondary"
            onPress={() => router.push(signup ? "/" : "/cadastro-aluno")}
          />
          {!signup && (
            <Button
              title="Cadastrar como instrutor"
              variant="secondary"
              onPress={() => router.push("/cadastro-instrutor")}
            />
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
          <Card style={s.card}>
            <Text style={s.section}>Contas fictícias da apresentação</Text>
            <Text style={s.subtitle}>
              Escolha um perfil e toque em Entrar. Requer os emuladores com a
              base de demonstração preparada.
            </Text>
            <View style={s.row}>
              {["aluno", "instrutor", "admin"].map((a) => (
                <View style={s.flex} key={a}>
                  <Button
                    title={a}
                    variant="secondary"
                    onPress={() => demo(a)}
                  />
                </View>
              ))}
            </View>
          </Card>
        )}
        <Text style={s.foot}>
          Pagamentos e estornos exclusivamente simulados.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F3F6FC" },
  scroll: { padding: 24, gap: 20, alignItems: "center" },
  brand: {
    backgroundColor: "#1E56F0",
    padding: 32,
    borderRadius: 24,
    width: "100%",
    maxWidth: 540,
    gap: 8,
  },
  logo: { color: "#fff", fontSize: 32, fontWeight: "800", lineHeight: 40 },
  logoLight: { color: "#C8DBFF", fontWeight: "500", fontSize: 32 },
  white: { color: "#E2EBFF" },
  card: { width: "100%", maxWidth: 540, padding: 24, gap: 16 },
  title: { fontSize: 28, lineHeight: 36, fontWeight: "800" },
  tag: { fontSize: 11, color: "#1E56F0", fontWeight: "800", letterSpacing: 1 },
  subtitle: { color: "#64748B", fontSize: 14, lineHeight: 21 },
  error: { color: "#B91C1C" },
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  flex: { flex: 1, minWidth: 100 },
  section: { fontWeight: "700" },
  foot: { color: "#64748B", fontSize: 12, textAlign: "center" },
});
