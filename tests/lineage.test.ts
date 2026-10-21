import moment from 'moment';
import { tomorrowPath } from '../src/daily';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Engine,Plan,decode,encode,history,id,path,plan,selected,tasks,validDate} from '../src/lineage';
const link=(p:string,b:string,a:string)=>`[[${p}#^${b}|${a}]]`;
const make=(text='- [ ] ! Book car service #home 📅 2026-12-01',source='Daily/A.md',dest='Folder/B.md',action:'migrate'|'schedule'='migrate',date?:string)=>plan(selected(text,0),source,dest,action,'why -->\n<script>',date,link);
function fixture(initial='- [ ] Book car service') {
 const files=new Map([['Daily/A.md',initial],['Folder/B.md','']]); let journal:Plan[]=[];let fail='';let saves=0;
 const io={read:async(p:string)=>files.get(p)||'',update:async(p:string,fn:(s:string)=>string)=>{if(fail===p)throw Error('write failed');files.set(p,fn(files.get(p)||''));},save:async(j:Plan[])=>{journal=JSON.parse(JSON.stringify(j));saves++;}};
 return {files,io,get journal(){return journal;},get saves(){return saves;},fail:(p:string)=>fail=p};
}
test('initial transfer and consecutive transfer preserve identity, counts, reciprocal links, wording edits',async()=>{
 const f=fixture();const engine=new Engine([],f.io);const p=make(f.files.get('Daily/A.md'));await engine.run(p);
 const a=tasks(f.files.get('Daily/A.md')!)[0],b=tasks(f.files.get('Folder/B.md')!)[0];
 assert.equal(a.status,'>');assert.equal(b.status,' ');assert.equal(a.meta!.count,0);assert.equal(b.meta!.count,1);assert.notEqual(a.block,b.block);assert.equal(a.meta!.next,b.block);assert.equal(b.meta!.previous,a.block);
 f.files.set('Folder/B.md',f.files.get('Folder/B.md')!.replace('Book car service','Call mechanic'));
 const p2=make(f.files.get('Folder/B.md'),'Folder/B.md','Later.md');await engine.run(p2);
 const entries=[...f.files].flatMap(([path,text])=>tasks(text).map(task=>({path,task})));
 const h=history(entries,a.meta!.lineage);assert.deepEqual(h.rows.map(x=>x.task.meta!.count),[0,1,2]);assert.equal(h.rows.filter(x=>x.task.status===' ').length,1);assert.deepEqual(h.issues,[]);assert.match(p2.destination,/Call mechanic/);
});
test('schedule replaces only destination scheduled field, preserves due/tag/signifier/indent/anchor and moves children',async()=>{
 const text='  * [ ] ! Parent #tag ⏳ 2026-10-22 📅 2026-12-01 ^existing\n    - [ ] child\n    attached note';
 const p=make(text,'Daily/A.md','Folder/B.md','schedule','2026-11-02');assert.match(p.source,/\* \[<\]/);assert.match(p.source,/\^existing$/);assert.match(p.source,/⏳ 2026-10-22/);assert.equal((p.destination.match(/⏳/g)||[]).length,1);assert.match(p.destination,/⏳ 2026-11-02/);assert.match(p.destination,/📅 2026-12-01/);assert.match(p.destination,/#tag/);assert.match(p.destination,/    - \[ \] child/);assert.doesNotMatch(p.source,/child/);
});
test('invalid statuses, ordinary bullets, code fences, recurrence, dependency fields reject',()=>{
 for(const text of ['- [x] done','- [-] cancelled','- [o] event','- [>] old','- [<] old','- note','```md\n- [ ] example\n```','~~~\n- [ ] example\n~~~','- [ ] repeat 🔁 every day','- [ ] has 🆔 abc','- [ ] has ⛔ abc','- [ ] parent\n  - child ^anchor'])assert.throws(()=>make(text),text);
});
test('path, calendar and same-note validation; cancellation is pure',()=>{
 for(const p of ['../oops','/absolute','folder//bad','a#bad','a\nbad',''])assert.throws(()=>path(p));
 assert.equal(validDate('2026-02-29'),false);assert.equal(validDate('2028-02-29'),true);assert.throws(()=>make(undefined,'Daily/A.md','Daily/A.md'));assert.throws(()=>make(undefined,undefined,undefined,'schedule','2026-02-30'));
 const f=fixture();make();assert.equal(f.saves,0);assert.equal(f.files.get('Daily/A.md'),'- [ ] Book car service');
});
test('destination failure never archives; source failure survives restart and retry without duplicate',async()=>{
 const f=fixture();const p=make(f.files.get('Daily/A.md'));f.fail('Folder/B.md');await assert.rejects(new Engine([],f.io).run(p));assert.equal(f.files.get('Daily/A.md'),p.expected);assert.equal(f.journal[0].state,'pending');
 f.fail('Daily/A.md');await assert.rejects(new Engine(f.journal,f.io).run(f.journal[0]));assert.equal(tasks(f.files.get('Folder/B.md')!).length,1);
 f.fail('');const engine=new Engine(f.journal,f.io);await engine.run(engine.journal[0]);await engine.run(engine.journal[0]);assert.equal(tasks(f.files.get('Folder/B.md')!).length,1);assert.equal(engine.journal[0].state,'committed');
});
test('edited source and destination preserved, rapid concurrent calls rejected',async()=>{
 const f=fixture();const p=make(f.files.get('Daily/A.md'));f.files.set('Daily/A.md','- [ ] User changed text');const e=new Engine([],f.io);const running=e.run(p);await assert.rejects(e.run(p),/already running/);await assert.rejects(running,/Source changed/);assert.equal(f.files.get('Daily/A.md'),'- [ ] User changed text');
 f.files.set('Folder/B.md',f.files.get('Folder/B.md')!.replace('Book car service','Edited'));await assert.rejects(new Engine(f.journal,f.io).run(f.journal[0]),/Destination changed/);assert.match(f.files.get('Folder/B.md')!,/Edited/);
});
test('unsafe reason roundtrip and malformed / unknown schema reject',()=>{
 const p=make();const m=tasks(p.destination)[0].meta!;assert.equal(m.reason,'why -->\n<script>');assert.equal(encode(m).split('-->').length,2);assert.throws(()=>decode('<!--bujo-lineage:nope-->'));assert.throws(()=>decode(encode({...m,v:2} as never)));assert.throws(()=>decode(encode({...m,count:-1})));assert.throws(()=>selected(p.destination.replace(/ \^occ-[a-f0-9]+/,' ^wrong'),0));
});
test('history reconstructed after note rename and wording edits; missing targets / conflicting branches explicit',()=>{
 const p=make();const a=tasks(p.source)[0],b=tasks(p.destination.replace('Book car service','New wording'))[0];const entries=[{path:'Renamed folder/Note.md',task:a},{path:'Duplicate/Note.md',task:b}];assert.equal(history(entries,p.lineage).issues.length,0);assert.match(history([entries[0]],p.lineage).issues.join(),/Missing next/);
 const c={...b,block:id(),meta:{...b.meta!,occurrence:id()}};assert.match(history([...entries,{path:'Branch.md',task:c}],p.lineage).issues.join(),/Conflicting successors/);
});
test('block anchor remains last; metadata does not consume next task; expected content relocation preserves unrelated edits',async()=>{
 const f=fixture('unrelated\n- [ ] Book car service\n- [ ] sibling');const t=selected(f.files.get('Daily/A.md')!,1);const p=plan(t,'Daily/A.md','Folder/B.md','migrate','',undefined,link);f.files.set('Daily/A.md','new heading\n'+f.files.get('Daily/A.md'));
 await new Engine([],f.io).run(p);assert.match(f.files.get('Daily/A.md')!,/^new heading\nunrelated/);assert.match(f.files.get('Daily/A.md')!,/- \[ \] sibling/);assert.match(p.destination,/ \^occ-[a-f0-9]+$/);
});

// Mirror the documented upstream end-of-line extraction contract, not its runtime.
test('Tasks emoji fields stay parseable after removing the final block anchor',()=> {
 const p=make('- [ ] ! Book #home 📅 2026-12-01 ⏳ 2026-10-22',undefined,undefined,'schedule','2026-11-02');
 let body=p.destination.replace(/ \^[A-Za-z0-9-]+$/,'');
 const scheduled=body.match(/⏳ *(\d{4}-\d{2}-\d{2})$/);assert.equal(scheduled?.[1],'2026-11-02');
 body=body.replace(/ *⏳ *\d{4}-\d{2}-\d{2}$/,'');
 assert.match(body,/📅 2026-12-01$/);assert.ok(body.indexOf('<!--bujo-lineage:')<body.indexOf('📅'));
 const next=make(p.destination, 'Folder/B.md','Next.md');assert.equal(tasks(next.destination)[0].meta!.count,2);assert.equal((next.destination.match(/bujo-lineage:/g)||[]).length,1);
});

test('journal save failures never bypass the durable reservation on retry',async()=> {
 const f=fixture();const p=make(f.files.get('Daily/A.md'));let fail=true;let attempts=0;
 const io={...f.io,save:async(j:Plan[])=>{attempts++;if(fail)throw Error('journal full');await f.io.save(j);}};
 const engine=new Engine([],io);await assert.rejects(engine.run(p));assert.equal(f.files.get('Folder/B.md'),'');
 await assert.rejects(engine.run(p));assert.equal(attempts,2);assert.equal(f.files.get('Folder/B.md'),'');
 fail=false;await engine.run(p);assert.equal(p.state,'committed');
});

test('duplicate destination operation is a recovery conflict',async()=> {
 const f=fixture();const p=make(f.files.get('Daily/A.md'));f.files.set('Folder/B.md',p.destination+'\n'+p.destination);
 await assert.rejects(new Engine([],f.io).run(p),/Conflicting duplicate/);assert.equal(f.files.get('Daily/A.md'),p.expected);
});


test('daily path uses local calendar days across DST and year boundaries',()=> {
 const old=process.env.TZ;process.env.TZ='America/New_York';
 try {
   for(const [input,expected] of [['2026-03-07T12:00:00','Daily/2026-03-08.md'],['2026-10-31T12:00:00','Daily/2026-11-01.md'],['2026-12-31T12:00:00','Daily/2027-01-01.md']]) {
     const now=moment(input);const before=now.valueOf();assert.equal(tomorrowPath(now,'Daily','YYYY-MM-DD'),expected);assert.equal(now.valueOf(),before);
   }
   assert.equal(tomorrowPath(moment('2026-12-31'),'Journal','YYYY/MM/DD'),'Journal/2027/01/01.md');
 } finally {if(old===undefined)delete process.env.TZ;else process.env.TZ=old;}
});

test('packaged sample history is complete and reconstructs from Markdown only',()=> {
 const entries=['2026-10-21.md','2026-10-22.md','Future Log.md'].flatMap(path=>tasks(readFileSync('sample-vault/'+path,'utf8')).map(task=>({path,task})));
 const lineage=entries[0].task.meta!.lineage;const h=history(entries,lineage);assert.equal(h.rows.length,3);assert.deepEqual(h.issues,[]);assert.deepEqual(h.rows.map(e=>e.task.status),['>','<','x']);assert.deepEqual(h.rows.map(e=>e.task.meta!.count),[0,1,2]);
});

test('source child added during destination write stops archiving rather than dropping or stranding it',async()=> {
 const f=fixture();const p=make(f.files.get('Daily/A.md'));
 const io={...f.io,update:async(path:string,fn:(s:string)=>string)=>{await f.io.update(path,fn);if(path==='Folder/B.md')f.files.set('Daily/A.md',p.expected+'\n  - [ ] New user subtask');}};
 await assert.rejects(new Engine([],io).run(p),/Source changed/);assert.match(f.files.get('Daily/A.md')!,/New user subtask/);assert.equal(tasks(f.files.get('Daily/A.md')!)[0].status,' ');
});
