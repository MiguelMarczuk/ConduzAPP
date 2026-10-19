const test = require('node:test');
const assert = require('node:assert/strict');
const {execute, empty, slots, HOUR, DAY} = require('../functions/domain');
const now = Date.parse('2026-10-19T12:00:00-03:00');
const start = now + DAY;
const actor = {uid:'student'};
const teacher = {uid:'teacher'};
const admin = {uid:'admin',admin:true};
function fixture() {
 const s=empty();
 s.users.student={id:'student',name:'Aluno Teste',role:'aluno',favorites:[]};
 s.users.other={id:'other',name:'Outro Aluno',role:'aluno',favorites:[]};
 s.users.teacher={id:'teacher',name:'Instrutor Teste',role:'instrutor',approval:'aprovado',credential:'FICTICIA',credentialExpires:now+30*DAY,price:9999,periods:Array.from({length:7},(_,day)=>({day,from:8,to:20})),blocks:[]};
 s.users.admin={id:'admin',name:'Admin',role:'admin'};
 return s;
}
const act=(s,a,op,input={},time=now,id='b1')=>execute(s,a,op,input,time,id).state;
function booked(){return act(fixture(),actor,'book',{instructor:'teacher',start});}
function paid(){return act(act(booked(),teacher,'accept',{booking:'b1'}),actor,'pay',{booking:'b1'});}
test('autenticação obrigatória e cadastro sem elevação de privilégio',()=>{
 assert.throws(()=>execute(empty(),{},'state'),/Autenticação/);
 assert.throws(()=>execute(empty(),actor,'register',{role:'admin',name:'Fraude'}),/Perfil inválido/);
 assert.throws(()=>act(fixture(),actor,'approve',{instructor:'teacher',decision:'aprovado',reason:'teste'}),/administração/);
});
test('cadastro instrutor inicia pendente e sem horários',()=>{
 const s=act(empty(),teacher,'register',{role:'instrutor',name:'Instrutor'});
 assert.equal(s.users.teacher.approval,'pendente');assert.deepEqual(slots(s,'teacher',now),[]);
});
test('credenciamento manual exige autorização válida; suspensão e vencimento impedem reserva',()=>{
 for(const change of [{approval:'pendente'},{credentialExpires:now-1},{suspendedUntil:now+DAY}]){
  const s=fixture();Object.assign(s.users.teacher,change);
  assert.throws(()=>act(s,actor,'book',{instructor:'teacher',start}),/aprovação/);
 }
 const s=fixture();s.users.teacher.credentialExpires=0;
 assert.throws(()=>act(s,admin,'approve',{instructor:'teacher',decision:'aprovado',reason:'Análise'}),/vencida/);
});
test('sem disponibilidade não gera horários e bloqueios são respeitados',()=>{
 const s=fixture();s.users.teacher.periods=[];assert.deepEqual(slots(s,'teacher',now),[]);
 assert.throws(()=>act(s,actor,'book',{instructor:'teacher',start}),/disponibilidade/);
 const t=fixture();t.users.teacher.blocks=['2026-10-20'];assert.throws(()=>act(t,actor,'book',{instructor:'teacher',start}),/disponibilidade/);
});
test('múltiplos períodos e validação de sobreposição',()=>{
 const s=act(fixture(),teacher,'availability',{periods:[{day:2,from:8,to:10},{day:2,from:14,to:18}],blocks:[]});
 assert.equal(slots(s,'teacher',now).length,6);
 assert.throws(()=>act(s,teacher,'availability',{periods:[{day:2,from:8,to:12},{day:2,from:11,to:14}],blocks:[]}),/sobrepostos/);
});
test('novas reservas têm 60 minutos, hora cheia, sete dias e valores imutáveis',()=>{
 const s=booked();assert.equal(s.bookings.b1.duration,60);assert.equal(s.bookings.b1.price,9999);assert.equal(s.bookings.b1.commission,300);
 s.users.teacher.price=12000;assert.equal(s.bookings.b1.price,9999);
 assert.throws(()=>act(fixture(),actor,'book',{instructor:'teacher',start:start+60000}),/hora cheia/);
 assert.throws(()=>act(fixture(),actor,'book',{instructor:'teacher',start:now+8*DAY}),/sete dias/);
});
test('reserva conflitante é recusada; duração legada de 50 min é preservada',()=>{
 const s=booked();s.bookings.b1.duration=50;
 assert.throws(()=>act(s,{uid:'other'},'book',{instructor:'teacher',start}),/reservado/);
 assert.equal(s.bookings.b1.duration,50);
});
test('pagamento simulado só após aceite e só pelo aluno participante',()=>{
 assert.throws(()=>act(booked(),actor,'pay',{booking:'b1'}),/indisponível/);
 assert.throws(()=>act(booked(),{uid:'other'},'accept',{booking:'b1'}),/participa/);
 const s=paid();assert.equal(s.bookings.b1.status,'confirmado');assert.equal(s.bookings.b1.paymentMode,'simulado');assert.equal(s.bookings.b1.payoutEligible,false);
 assert.throws(()=>act(s,actor,'pay',{booking:'b1'}),/indisponível/);
});
test('cancelamento aluno >2h integral e limite exato de 2h recebe 50%',()=>{
 assert.equal(act(paid(),actor,'cancel',{booking:'b1'},start-2*HOUR-1).bookings.b1.refund,9999);
 assert.equal(act(paid(),actor,'cancel',{booking:'b1'},start-2*HOUR).bookings.b1.refund,5000);
 assert.throws(()=>act(paid(),actor,'cancel',{booking:'b1'},start),/indisponível/);
});
test('cancelamento instrutor integral e quinto gera alerta',()=>{
 const s=paid();s.users.teacher.cancellations=4;
 const t=act(s,teacher,'cancel',{booking:'b1'});assert.equal(t.bookings.b1.refund,9999);assert.equal(t.users.teacher.adminAlert,true);
});
test('remarcação mantém original até aceite, preço e duração legados',()=>{
 let s=paid();s.bookings.b1.duration=50;
 s=act(s,teacher,'propose',{booking:'b1',start:start+HOUR});assert.equal(s.bookings.b1.start,start);
 assert.throws(()=>act(s,teacher,'reschedule',{booking:'b1',accept:true}),/outra parte/);
 s=act(s,actor,'reschedule',{booking:'b1',accept:true});assert.equal(s.bookings.b1.start,start+HOUR);assert.equal(s.bookings.b1.duration,50);assert.equal(s.bookings.b1.price,9999);
 assert.throws(()=>act(paid(),actor,'propose',{booking:'b1',start:start+HOUR},start-2*HOUR),/três horas/);
});
test('aceite da remarcação revalida horário ocupado',()=>{
 let s=act(paid(),teacher,'propose',{booking:'b1',start:start+HOUR});
 s=act(s,{uid:'other'},'book',{instructor:'teacher',start:start+HOUR},now,'b2');
 assert.throws(()=>act(s,actor,'reschedule',{booking:'b1',accept:true}),/reservado/);assert.equal(s.bookings.b1.start,start);
});
test('conclusão após término e avaliações bilaterais uma vez por aula',()=>{
 assert.throws(()=>act(paid(),teacher,'complete',{booking:'b1'},start),/término/);
 assert.throws(()=>act(paid(),actor,'review',{booking:'b1',rating:5}),/concluídas/);
 let s=act(paid(),teacher,'complete',{booking:'b1'},start+HOUR);
 s=act(s,actor,'review',{booking:'b1',rating:5},start+HOUR);
 s=act(s,teacher,'review',{booking:'b1',rating:4},start+HOUR);
 assert.equal(Object.keys(s.reviews).length,2);
 assert.throws(()=>act(s,actor,'review',{booking:'b1',rating:2},start+HOUR),/já avaliou/);
});
test('disputa durante aula e até 24h após fim bloqueia elegibilidade',()=>{
 let s=act(paid(),actor,'dispute',{booking:'b1',reason:'Problema relatado'},start,'ticket');
 assert.equal(s.bookings.b1.disputeOpen,true);assert.equal(s.bookings.b1.payoutEligible,false);
 assert.throws(()=>act(s,actor,'eligibility',{booking:'b1'},start+26*HOUR),/janela/);
 assert.throws(()=>act(paid(),actor,'dispute',{booking:'b1',reason:'Problema relatado'},start+25*HOUR+1),/24h/);
 assert.throws(()=>act(paid(),actor,'dispute',{booking:'b1',reason:'Problema relatado'},start-1),/durante/);
 s=act(s,admin,'resolve',{ticket:'ticket',reason:'Análise concluída',refund:9999},start+26*HOUR);assert.equal(s.bookings.b1.refundStatus,'pendente_simulado');
});
test('elegibilidade após janela independe da confirmação do aluno e não transfere dinheiro',()=>{
 let s=act(paid(),teacher,'complete',{booking:'b1'},start+HOUR);
 s=act(s,teacher,'eligibility',{booking:'b1'},start+25*HOUR+1);assert.equal(s.bookings.b1.payoutEligible,true);assert.equal(s.bookings.b1.transferred,undefined);
});
test('no-show aluno respeita 20min; terceira falta confirmada do instrutor suspende sem mudar notas',()=>{
 assert.throws(()=>act(paid(),admin,'absence',{booking:'b1',who:'aluno',reason:'Ausência comprovada'},start+19*60000),/tolerância/);
 assert.equal(act(paid(),admin,'absence',{booking:'b1',who:'aluno',reason:'Ausência comprovada'},start+20*60000).bookings.b1.refund,0);
 const s=paid();s.users.teacher.absences=2;
 const t=act(s,admin,'absence',{booking:'b1',who:'instrutor',reason:'Ausência comprovada'},start+HOUR);assert.ok(t.users.teacher.suspendedUntil>start);assert.deepEqual(t.reviews,{});
});
test('mensagens e reservas são privadas para terceiros',()=>{
 let s=paid();s=act(s,actor,'message',{to:'teacher',text:'Olá'},now,'msg');
 assert.throws(()=>act(s,{uid:'other'},'message',{to:'teacher',text:'Intruso'}),/Solicite/);
 const v=execute(s,{uid:'other'},'state',{},now).result;assert.deepEqual(v.bookings,{});assert.deepEqual(v.messages,[]);assert.equal(v.users.teacher.credential,undefined);
});

test('aceite expirado e credencial vencendo antes da aula são recusados',()=>{
 assert.throws(()=>act(booked(),teacher,'accept',{booking:'b1'},start),/expirada/);
 const s=fixture();s.users.teacher.credentialExpires=start-1;assert.throws(()=>act(s,actor,'book',{instructor:'teacher',start}),/vence/);
});
test('estorno integral ou pendente impede elegibilidade',()=>{
 let s=act(paid(),teacher,'complete',{booking:'b1'},start+HOUR);s.bookings.b1.refund=9999;s.bookings.b1.refundStatus='concluido_simulado';
 assert.throws(()=>act(s,teacher,'eligibility',{booking:'b1'},start+26*HOUR),/Estorno/);
 s.bookings.b1.refund=100;s.bookings.b1.refundStatus='pendente_simulado';assert.throws(()=>act(s,teacher,'eligibility',{booking:'b1'},start+26*HOUR),/Estorno/);
});
