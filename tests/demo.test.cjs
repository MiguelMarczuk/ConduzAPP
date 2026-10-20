const test = require("node:test");
const assert = require("node:assert/strict");
const { demoFixture } = require("../scripts/demo-fixture.cjs");
const { execute, slots, end, HOUR, DAY } = require("../functions/domain");
const now = Date.parse("2026-10-30T09:00:00-03:00");
const student = { uid: "demo-aluno" },
  teacher = { uid: "demo-instrutor" };
test("preparação de 30/10 contém agenda disponível e histórico recente sem alterar o relógio", () => {
  const s = demoFixture(now, "demo-30-outubro");
  assert.equal(s.users[teacher.uid].approval, "aprovado");
  assert.equal(s.users[teacher.uid].periods.length, 14);
  assert.ok(slots(s, teacher.uid, now).length > 0);
  assert.equal(s.users["demo-pendente"].approval, "pendente");
  const b = Object.values(s.bookings)[0];
  assert.ok(end(b) <= now && end(b) > now - DAY);
  assert.equal(b.paymentMode, "simulado");
  assert.equal(b.paid, true);
  let result = execute(s, teacher, "complete", { booking: b.id }, now).state;
  assert.equal(result.bookings[b.id].status, "concluido");
  result = execute(
    result,
    student,
    "review",
    { booking: b.id, rating: 5 },
    now,
  ).state;
  result = execute(
    result,
    teacher,
    "review",
    { booking: b.id, rating: 4 },
    now,
  ).state;
  assert.equal(Object.keys(result.reviews).length, 2);
  assert.equal(s.bookings[b.id].status, "confirmado");
});
test("novos ensaios têm identificadores próprios e datas renovadas", () => {
  const a = demoFixture(now, "demo-ensaio-a"),
    b = demoFixture(now + DAY, "demo-ensaio-b");
  assert.notEqual(a.demo.historicalBooking, b.demo.historicalBooking);
  assert.equal(
    Object.values(b.bookings)[0].start - Object.values(a.bookings)[0].start,
    DAY,
  );
  assert.notEqual(
    a.users[teacher.uid].credentialExpires,
    b.users[teacher.uid].credentialExpires,
  );
  assert.throws(() => demoFixture(now, "private/state"), /inválida/);
});
test("cenário histórico não permite forçar conclusão de reserva futura", () => {
  const s = demoFixture(now, "demo-normal");
  const start = slots(s, teacher.uid, now)[0];
  let next = execute(
    s,
    student,
    "book",
    { instructor: teacher.uid, start },
    now,
    "futura",
  ).state;
  next = execute(next, teacher, "accept", { booking: "futura" }, now).state;
  next = execute(next, student, "pay", { booking: "futura" }, now).state;
  assert.throws(
    () =>
      execute(
        next,
        teacher,
        "complete",
        { booking: "futura", demo: true, now: now + 10 * HOUR },
        now,
      ),
    /término/,
  );
});
