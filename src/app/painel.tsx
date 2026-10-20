import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { ref, uploadBytes, listAll, getBytes } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { auth, storage } from "@/services/firebase";
import {
  useSession,
  money,
  dateTime,
  type Profile,
  type Booking,
  type Ticket,
} from "@/services/session";
import { ThemedText as Text } from "@/components/themed-text";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
const labels: Record<string, string> = {
  solicitado: "Solicitação enviada",
  aguardando_pagamento: "Aguardando pagamento",
  confirmado: "Aula confirmada",
  cancelado: "Cancelada",
  concluido: "Concluída",
  falta_aluno: "Falta do aluno",
  falta_instrutor: "Falta do instrutor",
};
const weekdays = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];
const end = (b: Booking) => b.start + b.duration * 60000;
function Action({
  title,
  onPress,
  danger = false,
}: {
  title: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const { busy } = useSession();
  return (
    <Button
      title={title}
      disabled={busy}
      variant={danger ? "danger" : "secondary"}
      onPress={onPress}
      style={s.action}
    />
  );
}
function Heading({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={s.heading}>
      <Text style={s.title}>{title}</Text>
      {sub && <Text style={s.muted}>{sub}</Text>}
    </View>
  );
}
function RatingSummary({ uid }: { uid: string }) {
  const { state } = useSession();
  const reviews = Object.values(state?.reviews || {}).filter(
    (r) => r.to === uid,
  );
  return (
    <Text style={s.muted}>
      {reviews.length
        ? `★ ${(reviews.reduce((n, r) => n + r.rating, 0) / reviews.length).toFixed(1)} · ${reviews.length} avaliações`
        : "Ainda sem avaliações"}
    </Text>
  );
}
export default function Painel() {
  const api = useSession(),
    router = useRouter();
  const params = useLocalSearchParams<{
    tab?: string;
    instructor?: string;
    to?: string;
  }>();
  const [tab, setTab] = useState(params.tab || "Início");
  const [messageTo, setMessageTo] = useState(params.to);
  const [selected, setSelected] = useState<string | null>(
    params.instructor || null,
  );
  const me = api.state?.me;
  if (api.loading)
    return (
      <View style={s.center}>
        <ActivityIndicator />
        <Text>Conectando ao ambiente local…</Text>
      </View>
    );
  if (!api.user)
    return (
      <View style={s.center}>
        <Text>Entre para acessar sua conta.</Text>
        <Button title="Ir ao login" onPress={() => router.replace("/")} />
      </View>
    );
  if (!me)
    return (
      <SafeAreaView style={s.page}>
        <ScrollView contentContainerStyle={s.content}>
          <Heading
            title="Preparar perfil"
            sub={api.error || "Sua conta ainda não possui um perfil."}
          />
          <CompleteProfile />
          <Button title="Tentar novamente" onPress={api.refresh} />
          <Button title="Sair" onPress={() => signOut(auth)} />
        </ScrollView>
      </SafeAreaView>
    );
  const tabs =
    me.role === "admin"
      ? ["Início", "Ocorrências", "Agendamentos", "Perfil"]
      : ["Início", "Agendamentos", "Mensagens", "Perfil"];
  return (
    <SafeAreaView style={s.page}>
      <View style={s.top}>
        <View>
          <Text style={s.brand}>
            CONDUZ<Text style={{ color: "#668DF5" }}>APP</Text>
          </Text>
          <Text style={s.small}>AMBIENTE LOCAL · PAGAMENTOS SIMULADOS</Text>
        </View>
        <TouchableOpacity onPress={api.refresh}>
          <Text style={s.link}>Atualizar</Text>
        </TouchableOpacity>
      </View>
      {!!api.error && (
        <View style={s.errorBox}>
          <Text style={s.error}>{api.error}</Text>
        </View>
      )}
      {!!api.notice && (
        <TouchableOpacity onPress={api.clear} style={s.notice}>
          <Text style={s.link}>{api.notice}</Text>
        </TouchableOpacity>
      )}
      <ScrollView
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >
        {me.role === "admin" ? (
          <Admin tab={tab} />
        ) : (
          <>
            {tab === "Início" &&
              (me.role === "aluno" ? (
                <Search
                  selected={selected}
                  select={setSelected}
                  onChat={(to) => {
                    setMessageTo(to);
                    setTab("Mensagens");
                  }}
                />
              ) : (
                <InstructorHome goBookings={() => setTab("Agendamentos")} />
              ))}
            {tab === "Agendamentos" && <Bookings />}
            {tab === "Mensagens" && (
              <Messages key={me.id} initialTo={messageTo} />
            )}
            {tab === "Perfil" && <Profile />}
          </>
        )}
      </ScrollView>
      <View style={s.tabs}>
        {tabs.map((t, i) => (
          <TouchableOpacity
            key={t}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t }}
            onPress={() => {
              api.clear();
              setTab(t);
              setSelected(null);
            }}
            style={[s.tab, tab === t && s.tabActive]}
          >
            <Text style={[s.tabIcon, tab === t && s.link]}>
              {["⌂", "▦", "✉", "○"][i]}
            </Text>
            <Text style={[s.tabLabel, tab === t && s.link]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
function CompleteProfile() {
  const { run } = useSession();
  const [name, setName] = useState(""),
    [role, setRole] = useState<"aluno" | "instrutor">("aluno");
  return (
    <Card style={s.gap}>
      <Input label="Nome completo" value={name} onChangeText={setName} />
      <View style={s.row}>
        <Action title="Sou aluno" onPress={() => setRole("aluno")} />
        <Action title="Sou instrutor" onPress={() => setRole("instrutor")} />
      </View>
      <Button
        title={`Criar perfil de ${role}`}
        onPress={() => run("register", { name, role })}
      />
    </Card>
  );
}
function Search({
  selected,
  select,
  onChat,
}: {
  selected: string | null;
  select: (id: string | null) => void;
  onChat: (id: string) => void;
}) {
  const { state, run } = useSession();
  const [search, setSearch] = useState(""),
    [onlyFavorites, setOnlyFavorites] = useState(false);
  const [slot, setSlot] = useState<number | null>(null),
    [location, setLocation] = useState("");
  const me = state!.me!;
  const instructors = Object.values(state!.users).filter(
    (u) => u.role === "instrutor" && u.approval === "aprovado",
  );
  const u = selected ? state!.users[selected] : null;
  if (u)
    return (
      <View style={s.gap}>
        <Action
          title="← Voltar à busca"
          onPress={() => {
            select(null);
            setSlot(null);
          }}
        />
        <Card style={s.gap}>
          <Avatar nome={u.name} size={72} />
          <Heading
            title={u.name}
            sub={`${u.region || "Região não informada"} · ${u.car || "Veículo não informado"} · ${u.transmission || "Câmbio não informado"}`}
          />
          <RatingSummary uid={u.id} />
          <Text>{u.bio || "Perfil profissional de instrutor."}</Text>
          <Text style={s.link}>
            Autorização profissional analisada manualmente
          </Text>
          <Text style={s.price}>{money(u.price)} / aula de 60 min</Text>
          <Action
            title="Conversar com o instrutor"
            onPress={async () => {
              if (await run("openConversation", { to: u.id })) onChat(u.id);
            }}
          />
          <Action
            title={
              (me.favorites || []).includes(u.id)
                ? "♥ Remover dos favoritos"
                : "♡ Adicionar aos favoritos"
            }
            onPress={() => run("favorite", { instructor: u.id })}
          />
        </Card>
        <Heading
          title="Escolha sua próxima aula"
          sub="Horários dos próximos sete dias, no fuso de Brasília."
        />
        <View style={s.row}>
          {(u.slots || []).map((time) => (
            <TouchableOpacity
              key={time}
              onPress={() => setSlot(time)}
              style={[s.slot, slot === time && s.slotActive]}
            >
              <Text style={slot === time ? s.white : s.link}>
                {dateTime(time)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {!u.slots?.length && (
          <Card>
            <Text style={s.muted}>
              Nenhum horário disponível. O instrutor precisa configurar sua
              agenda.
            </Text>
          </Card>
        )}
        <Input
          label="Local de encontro"
          value={location}
          onChangeText={setLocation}
        />
        <Button
          title={
            slot ? `Solicitar aula · ${money(u.price)}` : "Selecione um horário"
          }
          disabled={!slot}
          onPress={async () => {
            if (
              await run("book", { instructor: u.id, start: slot, location })
            ) {
              setSlot(null);
              select(null);
            }
          }}
        />
        <Text style={s.muted}>
          O pagamento simulado fica disponível após o aceite do instrutor.
          Comissão da plataforma: 3%.
        </Text>
        <Reviews uid={u.id} />
      </View>
    );
  return (
    <View style={s.gap}>
      <View style={s.hero}>
        <Text style={s.eyebrow}>VAMOS PARA O PRÓXIMO PASSO</Text>
        <Text style={s.heroTitle}>
          Olá, {me.name.split(" ")[0]}.{"\n"}Mais confiança ao dirigir.
        </Text>
        <Text style={s.white}>
          Encontre um profissional e planeje sua próxima aula.
        </Text>
      </View>
      <Heading
        title="Encontre seu instrutor"
        sub="Profissionais com credenciamento analisado pela administração."
      />
      <Input
        label="Buscar por nome ou região"
        placeholder="Ex.: Centro, Niterói…"
        value={search}
        onChangeText={setSearch}
      />
      <Action
        title={onlyFavorites ? "Mostrar todos" : "Mostrar favoritos"}
        onPress={() => setOnlyFavorites(!onlyFavorites)}
      />
      {instructors
        .filter(
          (u) =>
            `${u.name} ${u.region}`
              .toLowerCase()
              .includes(search.toLowerCase()) &&
            (!onlyFavorites || (me.favorites || []).includes(u.id)),
        )
        .map((u) => (
          <TouchableOpacity key={u.id} onPress={() => select(u.id)}>
            <Card style={s.instructor}>
              <Avatar nome={u.name} />
              <View style={s.flex}>
                <Text style={s.cardTitle}>{u.name}</Text>
                <Text style={s.muted}>
                  {u.region || "Região não informada"}
                </Text>
                <Text style={s.small}>
                  {u.car} · {u.transmission}
                </Text>
                <RatingSummary uid={u.id} />
                <Text style={s.price}>{money(u.price)} / aula</Text>
              </View>
              <Text style={s.link}>Ver perfil ›</Text>
            </Card>
          </TouchableOpacity>
        ))}
      {!instructors.length && (
        <Card>
          <Text>Nenhum instrutor aprovado disponível.</Text>
        </Card>
      )}
    </View>
  );
}
function InstructorHome({ goBookings }: { goBookings: () => void }) {
  const { state } = useSession();
  const me = state!.me!;
  const list = Object.values(state!.bookings);
  return (
    <View style={s.gap}>
      <View style={s.hero}>
        <Text style={s.eyebrow}>PAINEL DO INSTRUTOR</Text>
        <Text style={s.heroTitle}>Olá, {me.name.split(" ")[0]}.</Text>
        <Text style={s.white}>
          Organize sua agenda e acompanhe seus alunos.
        </Text>
      </View>
      <Card style={s.gap}>
        <Text style={s.cardTitle}>Credenciamento: {me.approval}</Text>
        <Text style={s.muted}>
          {me.suspendedUntil && me.suspendedUntil > state!.now
            ? `Suspenso até ${dateTime(me.suspendedUntil)}`
            : me.credentialExpires
              ? `Validade: ${dateTime(me.credentialExpires)}`
              : "Envie sua autorização na aba Perfil."}
        </Text>
        <Text style={s.small}>
          Análise manual. O ConduzAPP não consulta automaticamente o Detran.
        </Text>
        {me.approvalReason && <Text>{me.approvalReason}</Text>}
      </Card>
      <View style={s.row}>
        <Card style={s.metric}>
          <Text style={s.number}>
            {list.filter((b) => b.status === "solicitado").length}
          </Text>
          <Text>Solicitações</Text>
        </Card>
        <Card style={s.metric}>
          <Text style={s.number}>
            {list.filter((b) => b.status === "confirmado").length}
          </Text>
          <Text>Confirmadas</Text>
        </Card>
      </View>
      <Button title="Ver solicitações e aulas" onPress={goBookings} />
      <Availability />
      <Reviews uid={me.id} />
    </View>
  );
}
function Availability() {
  const { state, run } = useSession();
  const me = state!.me!;
  const [periods, setPeriods] = useState(me.periods || []),
    [blocks, setBlocks] = useState((me.blocks || []).join(", "));
  const [day, setDay] = useState(1),
    [from, setFrom] = useState("8"),
    [to, setTo] = useState("12");
  return (
    <Card style={s.gap}>
      <Heading
        title="Sua disponibilidade"
        sub="Vários períodos por dia. Sem períodos, não há horários para reservas."
      />
      <View style={s.row}>
        {weekdays.map((d, i) => (
          <TouchableOpacity
            style={[s.chip, day === i && s.slotActive]}
            key={d}
            onPress={() => setDay(i)}
          >
            <Text style={day === i ? s.white : s.link}>{d.slice(0, 3)}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={s.row}>
        <View style={s.flex}>
          <Input
            label="Início (0–23)"
            value={from}
            onChangeText={setFrom}
            keyboardType="numeric"
          />
        </View>
        <View style={s.flex}>
          <Input
            label="Fim (1–24)"
            value={to}
            onChangeText={setTo}
            keyboardType="numeric"
          />
        </View>
      </View>
      <Action
        title="Adicionar período"
        onPress={() =>
          setPeriods([...periods, { day, from: Number(from), to: Number(to) }])
        }
      />
      {periods.map((p, i) => (
        <View style={s.row} key={`${p.day}-${p.from}-${i}`}>
          <Text style={s.flex}>
            {weekdays[p.day]} · {p.from}:00–{p.to}:00
          </Text>
          <TouchableOpacity
            onPress={() => setPeriods(periods.filter((_, j) => j !== i))}
          >
            <Text style={s.error}>Remover</Text>
          </TouchableOpacity>
        </View>
      ))}
      <Input
        label="Bloquear datas (AAAA-MM-DD, separadas por vírgula)"
        value={blocks}
        onChangeText={setBlocks}
      />
      <Button
        title="Salvar disponibilidade"
        onPress={() =>
          run("availability", {
            periods,
            blocks: blocks
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean),
          })
        }
      />
    </Card>
  );
}
function Bookings() {
  const { state } = useSession();
  const list = Object.values(state!.bookings).sort((a, b) => b.start - a.start);
  return (
    <View style={s.gap}>
      <Heading
        title="Seus agendamentos"
        sub="Solicitações, pagamentos e histórico em um só lugar."
      />
      {list.map((b) => (
        <BookingCard key={b.id} booking={b} />
      ))}
      {!list.length && (
        <Card>
          <Text>Você ainda não tem aulas agendadas.</Text>
        </Card>
      )}
    </View>
  );
}
function BookingCard({ booking: b }: { booking: Booking }) {
  const { state, run } = useSession();
  const me = state!.me!;
  const student = me.id === b.student,
    teacher = me.id === b.instructor,
    admin = me.role === "admin";
  const now = state!.now;
  const [expand, setExpand] = useState(false),
    [reason, setReason] = useState(""),
    [rating, setRating] = useState(5),
    [comment, setComment] = useState(""),
    [newStart, setNewStart] = useState("");
  const other = state!.users[student ? b.instructor : b.student];
  return (
    <Card style={s.gap}>
      <View style={s.row}>
        <View style={s.flex}>
          <Text style={s.cardTitle}>{other?.name || "Aula"}</Text>
          <Text style={s.muted}>
            {dateTime(b.start)} · {b.duration} min
          </Text>
        </View>
        <Text style={s.badge}>{labels[b.status] || b.status}</Text>
      </View>
      <View style={s.row}>
        <Text style={s.price}>{money(b.price)}</Text>
        <Text style={s.small}>
          Comissão {money(b.commission)} ·{" "}
          {b.paid ? "Pagamento simulado confirmado" : "Sem pagamento"}
        </Text>
      </View>
      <Text style={s.small}>
        {b.location || "Local a combinar"}
        {b.disputeOpen ? " · Em disputa" : ""}
      </Text>
      {b.refundStatus && (
        <Text style={s.muted}>
          Estorno {money(b.refund)} · {b.refundStatus.replaceAll("_", " ")}
        </Text>
      )}
      <Action
        title={expand ? "Fechar detalhes" : "Gerenciar aula"}
        onPress={() => setExpand(!expand)}
      />
      {expand && (
        <View style={s.gap}>
          {teacher && b.status === "solicitado" && (
            <Action
              title="Aceitar solicitação"
              onPress={() => run("accept", { booking: b.id })}
            />
          )}
          {student && b.status === "aguardando_pagamento" && (
            <Button
              title="Confirmar pagamento SIMULADO"
              onPress={() => run("pay", { booking: b.id })}
            />
          )}
          {(student || teacher) &&
            ["solicitado", "aguardando_pagamento", "confirmado"].includes(
              b.status,
            ) &&
            now < b.start && (
              <>
                <Text style={s.small}>
                  Aluno: acima de 2h, reembolso integral; até 2h antes do
                  início, 50%. Instrutor: integral. Sem cobrança real.
                </Text>
                <Action
                  danger
                  title="Cancelar aula"
                  onPress={() => run("cancel", { booking: b.id })}
                />
              </>
            )}
          {(student || teacher) &&
            b.status === "confirmado" &&
            b.start - now >= 3 * 3600000 && (
              <>
                <Input
                  label="Propor nova data (AAAA-MM-DD HH:00, Brasília)"
                  placeholder="2026-10-23 14:00"
                  value={newStart}
                  onChangeText={setNewStart}
                />
                <Action
                  title="Enviar proposta de remarcação"
                  onPress={() =>
                    run("propose", {
                      booking: b.id,
                      start: Date.parse(
                        newStart.replace(" ", "T") + ":00-03:00",
                      ),
                    })
                  }
                />
              </>
            )}
          {b.proposal && (
            <Card style={s.gap}>
              <Text>
                Proposta: {dateTime(b.proposal.start)}. A reserva original
                continua válida até o aceite.
              </Text>
              {b.proposal.by !== me.id && (
                <>
                  <Action
                    title="Aceitar remarcação"
                    onPress={() =>
                      run("reschedule", { booking: b.id, accept: true })
                    }
                  />
                  <Action
                    title="Recusar remarcação"
                    onPress={() =>
                      run("reschedule", { booking: b.id, accept: false })
                    }
                  />
                </>
              )}
            </Card>
          )}
          {teacher && b.status === "confirmado" && (
            <Action
              title="Concluir aula após o término"
              onPress={() => run("complete", { booking: b.id })}
            />
          )}
          {student && b.status === "concluido" && !b.studentConfirmed && (
            <Action
              title="Confirmar realização da aula"
              onPress={() => run("confirm", { booking: b.id })}
            />
          )}
          {b.status === "concluido" &&
            (student || teacher) &&
            !b.ratings?.[me.id] && (
              <>
                <Text style={s.cardTitle}>Avalie sua experiência</Text>
                <StarRating nota={rating} onChange={setRating} size={28} />
                <Input
                  label="Comentário"
                  value={comment}
                  onChangeText={setComment}
                />
                <Action
                  title="Enviar avaliação"
                  onPress={() =>
                    run("review", { booking: b.id, rating, comment })
                  }
                />
              </>
            )}
          {b.ratings?.[me.id] && (
            <Text>Você avaliou esta aula com {b.ratings[me.id]} estrelas.</Text>
          )}
          {(student || teacher) &&
            b.paid &&
            [
              "confirmado",
              "concluido",
              "falta_aluno",
              "falta_instrutor",
            ].includes(b.status) &&
            now >= b.start &&
            now <= end(b) + 86400000 &&
            !b.disputeOpen && (
              <>
                <Input
                  label="Relatar problema (privado)"
                  value={reason}
                  onChangeText={setReason}
                  multiline
                />
                <Action
                  title="Abrir contestação"
                  onPress={() => run("dispute", { booking: b.id, reason })}
                />
              </>
            )}
          {(b.disputeOpen || admin) && <Evidence booking={b} />}
          {b.status === "concluido" && (student || teacher) && (
            <>
              <Text style={s.muted}>
                {b.payoutEligible
                  ? "Elegível para repasse — nenhum dinheiro transferido."
                  : "Elegibilidade depende da janela de 24h e da análise de disputas."}
              </Text>
              <Action
                title="Verificar elegibilidade (simulação)"
                onPress={() => run("eligibility", { booking: b.id })}
              />
            </>
          )}
          {admin && (
            <>
              <Input
                label="Motivo / evidência administrativa"
                value={reason}
                onChangeText={setReason}
              />
              <Action
                title="Confirmar falta do aluno (tolerância 20min)"
                onPress={() =>
                  run("absence", { booking: b.id, who: "aluno", reason })
                }
              />
              <Action
                title="Confirmar falta do instrutor"
                onPress={() =>
                  run("absence", { booking: b.id, who: "instrutor", reason })
                }
              />
              {b.refundStatus === "pendente_simulado" && (
                <Action
                  title="Registrar estorno SIMULADO"
                  onPress={() => run("refund", { booking: b.id })}
                />
              )}
            </>
          )}
        </View>
      )}
    </Card>
  );
}
function Evidence({ booking: b }: { booking: Booking }) {
  const { state } = useSession();
  const [files, setFiles] = useState<string[]>([]),
    [photo, setPhoto] = useState(""),
    [message, setMessage] = useState("");
  async function load() {
    try {
      const results = await Promise.all(
        [b.student, b.instructor].map((id) =>
          listAll(ref(storage, `disputes/${b.id}/${id}`)),
        ),
      );
      setFiles(results.flatMap((r) => r.items.map((x) => x.fullPath)));
    } catch (e) {
      setMessage(String(e));
    }
  }
  async function upload() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.7,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      await uploadBytes(
        ref(storage, `disputes/${b.id}/${state!.me!.id}/${Date.now()}.jpg`),
        blob,
        { contentType: asset.mimeType || "image/jpeg" },
      );
      setMessage("Foto privada anexada.");
      await load();
    } catch (e) {
      setMessage(String(e));
    }
  }
  async function show(path: string) {
    try {
      const bytes = new Uint8Array(
        await getBytes(ref(storage, path), 5 * 1024 * 1024),
      );
      let binary = "";
      for (const value of bytes) binary += String.fromCharCode(value);
      setPhoto(`data:image/jpeg;base64,${btoa(binary)}`);
    } catch (e) {
      setMessage(String(e));
    }
  }
  return (
    <Card style={s.gap}>
      <Text style={s.cardTitle}>Evidências privadas</Text>
      <Text style={s.small}>
        Somente participantes e administração podem visualizar. Até 5 MB por
        imagem.
      </Text>
      {state!.me!.role !== "admin" && b.disputeOpen && (
        <Action title="Anexar foto" onPress={upload} />
      )}
      <Action title="Carregar anexos" onPress={load} />
      {files.map((f, i) => (
        <Action key={f} title={`Ver foto ${i + 1}`} onPress={() => show(f)} />
      ))}
      {!!message && <Text style={s.small}>{message}</Text>}
      {!!photo && (
        <Image
          source={{ uri: photo }}
          style={{ width: "100%", height: 240, resizeMode: "contain" }}
        />
      )}
    </Card>
  );
}
function Messages({ initialTo }: { initialTo?: string }) {
  const { state, run } = useSession();
  const me = state!.me!;
  const [to, setTo] = useState(initialTo || ""),
    [text, setText] = useState("");
  const pending = useRef<{
    to: string;
    text: string;
    requestId: string;
  } | null>(null);
  const participants = [
    ...new Set(
      Object.values(state!.conversations || {}).map((b) =>
        b.student === me.id ? b.instructor : b.student,
      ),
    ),
  ];
  return (
    <View style={s.gap}>
      <Heading
        title="Mensagens"
        sub="Converse sobre suas aulas e o ponto de encontro."
      />
      <View style={s.row}>
        {participants.map((id) => (
          <Action
            key={id}
            title={`${state!.users[id]?.name || "Participante"} · ${Object.values(state!.conversations).find((c) => [c.student, c.instructor].includes(id))?.tag || "SEM AGENDAMENTO"}`}
            onPress={() => setTo(id)}
          />
        ))}
      </View>
      {!participants.length && (
        <Card>
          <Text>
            Abra o perfil de um instrutor aprovado e toque em Conversar com o
            instrutor.
          </Text>
        </Card>
      )}
      {!!to && (
        <>
          <Text style={s.cardTitle}>{state!.users[to]?.name}</Text>
          {state!.messages
            .filter((m) => [m.from, m.to].includes(to))
            .map((m) => (
              <View
                key={m.id}
                style={[s.bubble, m.from === me.id ? s.mine : s.theirs]}
              >
                <Text style={m.from === me.id ? s.white : undefined}>
                  {m.text}
                </Text>
                <Text style={[s.small, m.from === me.id && s.white]}>
                  {dateTime(m.at)}
                </Text>
              </View>
            ))}
          <Input
            label="Sua mensagem"
            value={text}
            onChangeText={setText}
            multiline
          />
          <Button
            title="Enviar mensagem"
            disabled={!text.trim()}
            onPress={async () => {
              if (pending.current?.to !== to || pending.current.text !== text)
                pending.current = {
                  to,
                  text,
                  requestId: `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`,
                };
              if (await run("message", pending.current)) {
                setText("");
                pending.current = null;
              }
            }}
          />
        </>
      )}
    </View>
  );
}
function Reviews({ uid }: { uid: string }) {
  const { state } = useSession();
  const reviews = Object.values(state!.reviews).filter((r) => r.to === uid);
  return (
    <View style={s.gap}>
      <Text style={s.cardTitle}>Avaliações recebidas</Text>
      <RatingSummary uid={uid} />
      {reviews.map((r) => (
        <Card key={r.id}>
          <Text style={s.link}>{"★".repeat(r.rating)}</Text>
          <Text>{r.comment || "Sem comentário."}</Text>
        </Card>
      ))}
    </View>
  );
}
function Profile() {
  const { state, run } = useSession(),
    router = useRouter();
  const me = state!.me!;
  const [name, setName] = useState(me.name),
    [region, setRegion] = useState(me.region || ""),
    [car, setCar] = useState(me.car || ""),
    [transmission, setTransmission] = useState(me.transmission || ""),
    [bio, setBio] = useState(me.bio || ""),
    [specialty, setSpecialty] = useState(me.specialty || ""),
    [price, setPrice] = useState(String((me.price || 8000) / 100)),
    [credential, setCredential] = useState(me.credential || ""),
    [expires, setExpires] = useState(""),
    [reason, setReason] = useState("");
  return (
    <View style={s.gap}>
      <Heading title="Seu perfil" sub={`${me.name} · ${me.role}`} />
      <Card style={s.gap}>
        <Input label="Nome" value={name} onChangeText={setName} />
        <Input label="Região" value={region} onChangeText={setRegion} />
        {me.role === "instrutor" && (
          <>
            <Input label="Veículo" value={car} onChangeText={setCar} />
            <Input
              label="Câmbio"
              value={transmission}
              onChangeText={setTransmission}
            />
            <Input
              label="Especialidade"
              value={specialty}
              onChangeText={setSpecialty}
            />
            <Input
              label="Sobre você"
              value={bio}
              onChangeText={setBio}
              multiline
            />
            <Input
              label="Preço da aula em R$"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </>
        )}
        <Button
          title="Salvar perfil"
          onPress={() =>
            run("profile", {
              name,
              region,
              car,
              transmission,
              bio,
              specialty,
              price: Math.round(Number(price.replace(",", ".")) * 100),
            })
          }
        />
      </Card>
      {me.role === "instrutor" && (
        <Card style={s.gap}>
          <Heading
            title="Autorização profissional"
            sub={`Situação: ${me.approval}. Alterações exigem nova análise manual.`}
          />
          <Input
            label="Número da autorização"
            value={credential}
            onChangeText={setCredential}
          />
          <Input
            label="Validade (AAAA-MM-DD)"
            value={expires}
            onChangeText={setExpires}
          />
          <Button
            title="Enviar para análise"
            onPress={() =>
              run("credential", {
                credential,
                expires: Date.parse(expires + "T23:59:59-03:00"),
              })
            }
          />
        </Card>
      )}
      <Reviews uid={me.id} />
      <Card style={s.gap}>
        <Heading title="Ajuda e suporte" />
        <Input
          label="Descreva sua solicitação"
          value={reason}
          onChangeText={setReason}
          multiline
        />
        <Button
          title="Enviar ao suporte"
          onPress={async () => {
            if (await run("support", { reason })) setReason("");
          }}
        />
        {Object.values(state!.tickets).map((t) => (
          <View key={t.id}>
            <Text>
              {t.kind} · {t.status}
            </Text>
            <Text style={s.muted}>{t.reason}</Text>
            {t.decision && <Text>Resposta: {t.decision}</Text>}
          </View>
        ))}
      </Card>
      <Button
        title="Sair da conta"
        variant="danger"
        onPress={async () => {
          await signOut(auth);
          router.replace("/");
        }}
      />
    </View>
  );
}
function Admin({ tab }: { tab: string }) {
  const { state } = useSession();
  const instructors = Object.values(state!.users).filter(
    (u) => u.role === "instrutor",
  );
  if (tab === "Perfil") return <Profile />;
  if (tab === "Agendamentos") return <Bookings />;
  if (tab === "Ocorrências")
    return (
      <View style={s.gap}>
        <Heading
          title="Suporte e disputas"
          sub="Decisões registradas, com acompanhamento dos estornos simulados."
        />
        {Object.values(state!.tickets).map((t) => (
          <TicketCard key={t.id} ticket={t} />
        ))}
        {!Object.keys(state!.tickets).length && <Text>Sem ocorrências.</Text>}
      </View>
    );
  return (
    <View style={s.gap}>
      <View style={s.hero}>
        <Text style={s.eyebrow}>ADMINISTRAÇÃO</Text>
        <Text style={s.heroTitle}>Acompanhe o ConduzAPP.</Text>
        <Text style={s.white}>Análise manual e decisões com registro.</Text>
      </View>
      <View style={s.row}>
        <Card style={s.metric}>
          <Text style={s.number}>
            {instructors.filter((u) => u.approval === "pendente").length}
          </Text>
          <Text>Credenciamentos</Text>
        </Card>
        <Card style={s.metric}>
          <Text style={s.number}>
            {
              Object.values(state!.tickets).filter((t) => t.status === "aberto")
                .length
            }
          </Text>
          <Text>Ocorrências</Text>
        </Card>
      </View>
      <Heading
        title="Credenciamento de instrutores"
        sub="Confira autorização e validade. Esta análise não representa uma consulta automática ao Detran."
      />
      {instructors.map((u) => (
        <InstructorAdmin key={u.id} profile={u} />
      ))}
      <Heading title="Registro de operações" />
      {state!.audit
        .slice(-15)
        .reverse()
        .map((a) => (
          <Text style={s.small} key={a.id}>
            {dateTime(a.at)} · {a.op} · {state!.users[a.by]?.name}
          </Text>
        ))}
    </View>
  );
}
function InstructorAdmin({ profile: u }: { profile: Profile }) {
  const { run } = useSession();
  const [reason, setReason] = useState("");
  return (
    <Card style={s.gap}>
      <Text style={s.cardTitle}>
        {u.name} · {u.approval}
      </Text>
      <Text>Autorização: {u.credential || "Não enviada"}</Text>
      <Text style={s.muted}>
        Validade:{" "}
        {u.credentialExpires ? dateTime(u.credentialExpires) : "Não enviada"}
      </Text>
      <Text style={s.muted}>
        Cancelamentos: {u.cancellations || 0} · Faltas confirmadas:{" "}
        {u.absences || 0}
      </Text>
      {u.adminAlert && (
        <Text style={s.error}>Alerta: requer análise administrativa.</Text>
      )}
      {!!u.suspendedUntil && (
        <Text>Suspensão até {dateTime(u.suspendedUntil)}</Text>
      )}
      <Input
        label="Parecer da análise manual"
        value={reason}
        onChangeText={setReason}
      />
      <View style={s.row}>
        <Action
          title="Aprovar credenciamento"
          onPress={() =>
            run("approve", { instructor: u.id, decision: "aprovado", reason })
          }
        />
        <Action
          title="Rejeitar"
          onPress={() =>
            run("approve", { instructor: u.id, decision: "rejeitado", reason })
          }
        />
        <Action
          danger
          title="Suspender por 7 dias"
          onPress={() => run("suspend", { instructor: u.id, reason })}
        />
      </View>
    </Card>
  );
}
function TicketCard({ ticket: t }: { ticket: Ticket }) {
  const { state, run } = useSession();
  const [reason, setReason] = useState(""),
    [refund, setRefund] = useState("0");
  const b = t.booking ? state!.bookings[t.booking] : null;
  return (
    <Card style={s.gap}>
      <Text style={s.cardTitle}>
        {t.kind} · {t.status} · {state!.users[t.owner]?.name}
      </Text>
      <Text>{t.reason}</Text>
      {t.decision && <Text>Decisão: {t.decision}</Text>}
      {b && <Evidence booking={b} />}
      {t.status === "aberto" && (
        <>
          <Input
            label="Decisão administrativa"
            value={reason}
            onChangeText={setReason}
          />
          {b && (
            <Input
              label="Estorno simulado em R$"
              value={refund}
              onChangeText={setRefund}
              keyboardType="decimal-pad"
            />
          )}
          <Action
            title="Concluir análise"
            onPress={() =>
              run("resolve", {
                ticket: t.id,
                reason,
                refund: Math.round(Number(refund.replace(",", ".")) * 100),
              })
            }
          />
        </>
      )}
    </Card>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F3F6FC" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    padding: 24,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    width: "100%",
    maxWidth: 1000,
    alignSelf: "center",
    gap: 16,
  },
  top: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  brand: { fontSize: 22, fontWeight: "800", color: "#1E56F0" },
  small: { fontSize: 12, color: "#64748B", lineHeight: 19 },
  heading: { gap: 6, marginVertical: 8 },
  title: { fontSize: 25, lineHeight: 33, fontWeight: "800" },
  muted: { fontSize: 14, lineHeight: 22, color: "#64748B" },
  link: { color: "#1E56F0", fontWeight: "700" },
  white: { color: "#fff" },
  hero: { padding: 28, borderRadius: 24, backgroundColor: "#1E56F0", gap: 14 },
  eyebrow: {
    color: "#D4E2FF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  heroTitle: { color: "#fff", fontSize: 30, fontWeight: "800", lineHeight: 40 },
  gap: { gap: 14 },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
  },
  flex: { flex: 1, minWidth: 120 },
  instructor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  cardTitle: { fontSize: 17, fontWeight: "700" },
  price: { fontSize: 18, fontWeight: "800", color: "#164BC1" },
  slot: {
    padding: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#CAD7EE",
    borderRadius: 12,
  },
  slotActive: { backgroundColor: "#1E56F0", borderColor: "#1E56F0" },
  chip: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#CAD7EE",
    borderRadius: 10,
  },
  action: { paddingHorizontal: 16, paddingVertical: 11 },
  metric: { flex: 1, minWidth: 130, gap: 8 },
  number: { fontSize: 30, lineHeight: 38, color: "#1E56F0", fontWeight: "800" },
  badge: {
    fontSize: 12,
    color: "#1E56F0",
    backgroundColor: "#EBF1FF",
    padding: 8,
    borderRadius: 8,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tab: { flex: 1, alignItems: "center", padding: 8, borderRadius: 12, gap: 2 },
  tabActive: { backgroundColor: "#EBF1FF" },
  tabLabel: { fontSize: 11, color: "#64748B" },
  tabIcon: { fontSize: 22, color: "#64748B" },
  errorBox: { padding: 12, backgroundColor: "#FEE2E2" },
  error: { color: "#B91C1C", fontSize: 14 },
  notice: { padding: 10, backgroundColor: "#E6F0FF" },
  bubble: { padding: 16, borderRadius: 16, maxWidth: "88%", gap: 4 },
  mine: { alignSelf: "flex-end", backgroundColor: "#1E56F0" },
  theirs: { alignSelf: "flex-start", backgroundColor: "#fff" },
});
