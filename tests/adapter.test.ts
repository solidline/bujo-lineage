import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LineageController } from '../src/obsidian-adapter';
import { selected,tasks } from '../src/lineage';
import { MarkdownView,MockEditor,TFile,TFolder } from './obsidian-mock';
import type BuJoPlugin from '../src/index';
function fixture(){
 const files=new Map([['Daily/A.md','- [ ] Capture'],['Other/Note.md',''],['Daily/Note.md','']]);
 const objects=new Map<string,TFile|TFolder>([...files.keys()].map(p=>[p,new TFile(p)]));objects.set('Daily',new TFolder('Daily'));objects.set('Other',new TFolder('Other'));
 let data:unknown={};const leaves:{view:MarkdownView}[]=[];
 const vault={getAbstractFileByPath:(p:string)=>objects.get(p),getMarkdownFiles:()=>[...objects.values()].filter((f):f is TFile=>f instanceof TFile),read:async(f:TFile)=>files.get(f.path)!,process:async(f:TFile,fn:(s:string)=>string)=>files.set(f.path,fn(files.get(f.path)!)),create:async(p:string,s:string)=>{assert.ok(!objects.has(p));files.set(p,s);objects.set(p,new TFile(p));},on:()=>({})};
 const app={vault,workspace:{containerEl:{ownerDocument:{body:{classList:{toggle:()=>{},remove:()=>{}}}}},on:()=>({}),getLeavesOfType:()=>leaves,onLayoutReady:()=>{},openLinkText:async()=>{}},fileManager:{generateMarkdownLink:(f:TFile,from:string,sub:string,alias:string)=>`[[${f.path}${sub}|${alias}]]`}};
 const plugin={app,settings:{dailyFolder:'Daily',dailyFormat:'YYYY-MM-DD',futureLog:'Future Log.md',signifiers:[]},loadData:async()=>data,saveData:async(d:unknown)=>{data=JSON.parse(JSON.stringify(d));},registerEvent:()=>{},addCommand:()=>{}};
 const controller=new LineageController(plugin as unknown as BuJoPlugin);
 return {files,objects,leaves,controller,app,plugin,open(p:string,text?:string){const v=new MarkdownView();v.file=objects.get(p) as TFile;v.editor=new MockEditor(text??files.get(p)!);v.persist=s=>{files.set(p,s);};leaves.push({view:v});return v;}};
}
test('actual adapter transfers unsaved editor content, saves destination before source, and retains unrelated edits',async()=>{
 const f=fixture();await f.controller.start();const source=f.open('Daily/A.md','Unsaved introduction\n- [ ] Capture');
 const dest=f.open('Other/Note.md','Unsaved destination paragraph');const order:string[]=[];
 source.persist=s=>{order.push('source');f.files.set('Daily/A.md',s);};dest.persist=s=>{order.push('destination');f.files.set('Other/Note.md',s);};
 await f.controller.transfer('Daily/A.md',selected(source.editor.getValue(),1),'Other/Note.md','migrate','');
 assert.ok(order.indexOf('destination')<order.indexOf('source'));assert.match(f.files.get('Daily/A.md')!,/^Unsaved introduction/);assert.match(f.files.get('Other/Note.md')!,/^Unsaved destination paragraph/);assert.equal(tasks(f.files.get('Daily/A.md')!)[0].status,'>');assert.equal(tasks(f.files.get('Other/Note.md')!)[0].status,' ');
});
test('actual adapter rejects missing folder, same note, invalid date and stale modal without any task writes',async()=>{
 const f=fixture();await f.controller.start();const t=selected(f.files.get('Daily/A.md')!,0);const before=[...f.files];
 await assert.rejects(f.controller.transfer('Daily/A.md',t,'Missing/Note.md','migrate',''),/folder is missing/);
 await assert.rejects(f.controller.transfer('Daily/A.md',t,'Daily/A.md','migrate',''),/same-note/);
 await assert.rejects(f.controller.transfer('Daily/A.md',t,'Other/Note.md','schedule','','2026-02-30'),/valid scheduled date/);assert.deepEqual([...f.files],before);assert.equal(f.controller.engine.journal.length,0);
 f.files.set('Daily/A.md','- [ ] Edited while modal open');await assert.rejects(f.controller.transfer('Daily/A.md',t,'Other/Note.md','migrate',''),/Source changed/);assert.equal(f.files.get('Other/Note.md'),'');
});
test('actual adapter handles duplicate basenames with link API and rebuilds history after note rename',async()=>{
 const f=fixture();await f.controller.start();await f.controller.transfer('Daily/A.md',selected(f.files.get('Daily/A.md')!,0),'Other/Note.md','migrate','');
 assert.match(f.files.get('Daily/A.md')!,/Other\/Note.md#\^/);
 const body=f.files.get('Other/Note.md')!;f.files.delete('Other/Note.md');f.objects.delete('Other/Note.md');f.files.set('Renamed.md',body);f.objects.set('Renamed.md',new TFile('Renamed.md'));
 const restarted=new LineageController(f.plugin as unknown as BuJoPlugin);await restarted.start();await restarted.rebuild();assert.ok(restarted.entries().some(e=>e.path==='Renamed.md' && e.task.meta?.count===1));
});
test('actual adapter detects conflicting successor and duplicate block anchors before writing',async()=>{
 const f=fixture();await f.controller.start();await f.controller.transfer('Daily/A.md',selected(f.files.get('Daily/A.md')!,0),'Other/Note.md','migrate','');
 f.files.set('Daily/Note.md',f.files.get('Other/Note.md')!);await assert.rejects(f.controller.transfer('Other/Note.md',selected(f.files.get('Other/Note.md')!,0),'New.md','migrate',''),/Duplicate source/);assert.equal(f.files.has('New.md'),false);
});
test('actual adapter refuses divergent open editors without archiving source; restart retries reserved copy',async()=>{
 const f=fixture();await f.controller.start();f.open('Other/Note.md','one');const two=f.open('Other/Note.md','two');const t=selected(f.files.get('Daily/A.md')!,0);
 await assert.rejects(f.controller.transfer('Daily/A.md',t,'Other/Note.md','migrate',''),/editors disagree/);assert.equal(f.files.get('Daily/A.md'),t.raw);assert.equal(f.controller.hasPending(),true);
 two.editor.text='one';f.leaves.pop();const restart=new LineageController(f.plugin as unknown as BuJoPlugin);await restart.start();await restart.rebuild();await restart.recover();assert.equal(restart.hasPending(),false);assert.equal(tasks(f.files.get('Other/Note.md')!).length,1);
});

test('source anchor collision with an ordinary paragraph is rejected',async()=> {
 const f=fixture();await f.controller.start();f.files.set('Daily/A.md','- [ ] Capture ^existing');f.files.set('Other/Note.md','An ordinary paragraph ^existing');
 await assert.rejects(f.controller.transfer('Daily/A.md',selected(f.files.get('Daily/A.md')!,0),'New.md','migrate',''),/Duplicate source/);assert.equal(f.files.has('New.md'),false);
});

test('add-on entrypoint registers only lineage commands with an optional appearance renderer',async()=> {
 const {default:Addon}=await import('../src/index');const f=fixture();const commands:string[]=[];let renderers=0;
 const addon=Object.assign(Object.create(Addon.prototype),f.plugin,{
   addCommand:(command:{id:string})=>commands.push(command.id),
   registerMarkdownPostProcessor:()=>{renderers++;},
 });
 await addon.onload();
 assert.deepEqual(commands.sort(),['migrate-task','recover-pending-transfers','schedule-task','view-task-history']);
 assert.equal(renderers,1);
});

test('actual adapter schedules to Future Log with an empty date',async()=> {
 const f=fixture();await f.controller.start();await f.controller.transfer('Daily/A.md',selected(f.files.get('Daily/A.md')!,0),'Future Log.md','schedule','later','');
 assert.equal(tasks(f.files.get('Daily/A.md')!)[0].status,'<');const destination=tasks(f.files.get('Future Log.md')!)[0];assert.equal(destination.status,' ');assert.doesNotMatch(destination.line,/⏳|undefined/);assert.ok(destination.meta!.timestamp);
});
