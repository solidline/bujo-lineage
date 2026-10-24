/** Portable core: no Obsidian or Node dependencies. */
import { assertCaptureContext, eventLine } from './event-command';
import { rejectUnsupportedTasks, scheduled, splitTasksSuffix } from './tasks-interop';
export interface Meta {
  v: 1; lineage: string; occurrence: string; count: number;
  previous?: string; next?: string; action: 'capture' | 'migrate' | 'schedule';
  timestamp: string; reason?: string; operation: string;
}
export interface Task { start: number; end: number; raw: string; line: string; children: string; status: string; block?: string; meta?: Meta }
const marker = /<!--bujo-lineage:([^]*?)-->/g;
export function encode(meta: Meta): string { return `<!--bujo-lineage:${encodeURIComponent(JSON.stringify(meta)).replace(/-/g, '%2D')}-->`; }
export function decode(line: string): Meta | undefined {
  const matches = [...line.matchAll(marker)];
  if (!matches.length) { if(line.includes('<!--bujo-lineage:')) throw Error('Unterminated lineage metadata.'); return; }
  if (matches.length !== 1) throw Error('Multiple lineage records; repair metadata before transferring.');
  let m: Meta;
  try { m = JSON.parse(decodeURIComponent(matches[0][1])); } catch { throw Error('Malformed lineage metadata.'); }
  if (m.v !== 1 || !validId(m.lineage) || !validId(m.occurrence) || !Number.isSafeInteger(m.count) || m.count < 0 || !validId(m.operation) || !['capture','migrate','schedule'].includes(m.action) || typeof m.timestamp !== 'string' || !Number.isFinite(Date.parse(m.timestamp)) || (m.reason !== undefined && typeof m.reason !== 'string') || (m.previous !== undefined && !validId(m.previous)) || (m.next !== undefined && !validId(m.next))) throw Error('Invalid or unsupported lineage metadata.');
  return m;
}
function validId(s: unknown): s is string { return typeof s === 'string' && /^[A-Za-z0-9-]+$/.test(s); }
export function id(prefix = 'occ'): string {
  const bytes = new Uint8Array(16); globalThis.crypto.getRandomValues(bytes);
  return prefix + '-' + Array.from(bytes, b => b.toString(16).padStart(2,'0')).join('');
}
export function tasks(text: string): Task[] {
  const lines = text.split('\n'); const result: Task[] = []; let fence = ''; let fenceLength = 0;
  for (let i=0; i<lines.length; i++) {
    const f = lines[i].match(/^\s*(`{3,}|~{3,})/);
    if(f) { if(!fence) { fence=f[1][0]; fenceLength=f[1].length; } else if(f[1][0]===fence && f[1].length>=fenceLength) fence=''; continue; }
    if(fence) continue;
    const m = lines[i].match(/^(\s*)([-+*]|\d+[.)]) \[(.)\] /); if(!m) continue;
    let end=i+1;
    const width=(s:string)=>s.match(/^\s*/)![0].replace(/\t/g,'    ').length;
    while(end<lines.length) {
      let probe=end;
      while(probe<lines.length && lines[probe].trim()==='') probe++;
      if(probe===lines.length || width(lines[probe])<=width(m[1])) break;
      end=probe+1;
    }
    const block = lines[i].match(/ \^([A-Za-z0-9-]+)\s*$/)?.[1];
    const meta=decode(lines[i]);
    if(meta && meta.occurrence !== block) throw Error('Lineage block anchor is missing or changed. Restore the anchor before proceeding.');
    result.push({start:i,end,raw:lines.slice(i,end).join('\n'),line:lines[i],children:lines.slice(i+1,end).join('\n'),status:m[3],block,meta});
  }
  return result;
}
export function selected(text: string, line: number): Task {
  const t=tasks(text).find(t=>t.start===line); if(!t) throw Error('Place the cursor on a checkbox task outside code fences.'); return t;
}
/** Explicit command capture only: ordinary bullets remain notes in the vault index. */
export function capture(text:string,line:number):Task {
  assertCaptureContext(text,line);
  const existing=tasks(text).find(task=>task.start===line);
  if(existing)return existing;
  const lines=text.split('\n');
  if(!lines[line].trim())throw Error('Enter task text before migrating or scheduling.');
  const original=lines[line];
  lines[line]=eventLine(text,line).replace(/^(\s*(?:[-+*]|\d+[.)]) \[)o(\])/, '$1 $2');
  const task=selected(lines.join('\n'),line);
  return {...task,raw:original+(task.children?'\n'+task.children:'')};
}
/** Match a complete captured block, including child content, without a saved line number. */
export function sourceMatches(text:string,expected:string):Task[] {
  const first=expected.split('\n')[0];const result:Task[]=[];
  for(const [line,value] of text.split('\n').entries()) {
    if(value!==first)continue;
    try {const candidate=capture(text,line);if(candidate.raw===expected)result.push(candidate);} catch { /* Ineligible source context is not a match. */ }
  }
  return result;
}
export function validate(t: Task): void {
  if(t.status!== ' ') throw Error(t.meta?.next ? 'Archived occurrence: open its successor from task history.' : 'Only open tasks can be transferred.');
  rejectUnsupportedTasks(t.raw);
  if(t.meta?.next) throw Error('This occurrence already has a successor. Open task history.');
  // Child lineage and child block anchors require independent identities; reject rather than duplicate anchors.
  if(/<!--bujo-lineage:| \^[A-Za-z0-9-]+\s*$/m.test(t.children)) throw Error('Attached content has block anchors or lineage. Transfer those tasks separately first.');
}
export function validDate(s: string): boolean {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d=new Date(s+'T12:00:00Z'); return Number.isFinite(d.getTime()) && d.toISOString().slice(0,10)===s;
}
export function path(s: string): string {
  s=s.trim(); if(!s.endsWith('.md')) s+='.md';
  if(!s || s.startsWith('/') || /[\\:#[\]|<>]/.test(s) || [...s].some(c=>c.charCodeAt(0)<32) || s.split('/').some(x=>!x || x==='.' || x==='..') || s==='.md') throw Error('Use a relative Markdown note path without reserved characters.'); return s;
}
export interface Plan { operation: string; sourcePath: string; destinationPath: string; expected: string; source: string; destination: string; occurrence: string; sourceOccurrence: string; lineage: string; state: 'pending' | 'committed' }
export function plan(t: Task, sourcePath: string, destinationPath: string, action: 'migrate'|'schedule', reason: string, date: string|undefined, link: (path: string, block: string, alias: string, from: string)=>string, now=new Date().toISOString()): Plan {
  validate(t); destinationPath=path(destinationPath); if(sourcePath===destinationPath) throw Error('Choose another note; same-note transfers are deferred.');
  date=date?.trim() || undefined;
  if(action==='schedule' && date && !validDate(date)) throw Error('Enter a valid scheduled date as YYYY-MM-DD.');
  const operation=id('op'), occurrence=id(), sourceOccurrence=t.block || id(), lineage=t.meta?.lineage || id('task');
  const original: Meta = t.meta || {v:1,lineage,occurrence:sourceOccurrence,count:0,action:'capture',timestamp:now,operation};
  const next: Meta={v:1,lineage,occurrence,count:original.count+1,previous:sourceOccurrence,action,timestamp:now,reason:reason || undefined,operation};
  const old: Meta={...original,next:occurrence,action,timestamp:now,reason:reason || undefined,operation};
  let base=t.line.replace(marker,'').replace(/ \^[A-Za-z0-9-]+\s*$/,'').replace(t.meta ? / · moved \d+ times?(?: · (?:\[\[[^\n]*?\]\]|\[[^\]]*\]\([^\n]*?\)))*/g : /(?!) /g,'').trimEnd();
  const sourceBase=base;
  if(action==='schedule' && date) base=scheduled(base,date);
  function render(status: string, m: Meta, links: string): string { const {description,fields}=splitTasksSuffix(status===' '?base:sourceBase); return description.replace(/^(\s*(?:[-+*]|\d+[.)]) \[).(\])/, `$1${status}$2`)+` · moved ${m.count} ${m.count===1?'time':'times'} · ${links} ${encode(m)}${fields} ^${m.occurrence}`; }
  const links=[original.previous ? link('',original.previous,'previous',sourcePath):'',link(destinationPath,occurrence,'next',sourcePath)].filter(Boolean).join(' · ');
  return {operation,sourcePath,destinationPath,expected:t.raw,source:render(action==='schedule'?'<':'>',old,links),destination:render(' ',next,link(sourcePath,sourceOccurrence,'previous',destinationPath))+(t.children?'\n'+t.children:''),occurrence,sourceOccurrence,lineage,state:'pending'};
}
export function replaceExact(text: string, expected: string, replacement: string): string {
  const lines=text.split('\n'), needle=expected.split('\n');
  const hits=sourceMatches(text,expected).map(t=>t.start);
  if(hits.length!==1) throw Error('Source changed or is ambiguous. Restore the captured source, then retry recovery; no user edits were overwritten.');
  lines.splice(hits[0],needle.length,...replacement.split('\n')); return lines.join('\n');
}
export interface Storage { read(path:string):Promise<string>; update(path:string, fn:(s:string)=>string):Promise<void>; save(plans:Plan[]):Promise<void>; flush?(path:string):Promise<void>; check?(p:Plan):Promise<void> }
export class Engine {
  private busy=false;
  constructor(public journal:Plan[], private io:Storage) {}
  async run(p:Plan):Promise<void> {
    if(this.busy) throw Error('A transfer is already running.'); this.busy=true;
    try {
      if(this.journal.some(x=>x.state==='pending' && x.operation!==p.operation)) throw Error('Resolve pending recovery before another transfer.');
      await this.io.check?.(p);
      if(!this.journal.some(x=>x.operation===p.operation)) this.journal.push(p);
      // Persist on every attempt, including a prior failed journal save.
      await this.io.save(this.journal);
      const dest=await this.io.read(p.destinationPath);
      const found=tasks(dest).filter(t=>t.meta?.operation===p.operation && t.meta.occurrence===p.occurrence);
      if(found.length>1) throw Error('Conflicting duplicate destinations. Open task history and resolve manually.');
      if(found.length===0) await this.io.update(p.destinationPath,s=>s+(s ? (s.endsWith('\n\n')?'':s.endsWith('\n')?'\n':'\n\n'):'')+p.destination+'\n');
      const verified=tasks(await this.io.read(p.destinationPath)).filter(t=>t.meta?.operation===p.operation && t.block===p.occurrence);
      if(verified.length!==1 || verified[0].raw!==p.destination) throw Error('Destination changed; recovery stopped to preserve edits.');
      await this.io.flush?.(p.destinationPath);
      await this.io.check?.(p);
      await this.io.update(p.sourcePath,s=> {
        const done=tasks(s).filter(t=>t.meta?.operation===p.operation && t.block===p.sourceOccurrence && t.meta.next===p.occurrence);
        if(done.length===1 && done[0].raw===p.source) return s;
        return replaceExact(s,p.expected,p.source);
      });
      const archived=tasks(await this.io.read(p.sourcePath)).filter(t=>t.meta?.operation===p.operation && t.block===p.sourceOccurrence);
      if(archived.length!==1 || archived[0].raw!==p.source) throw Error('Source archive could not be verified; recover the pending operation.');
      p.state='committed';
      try { await this.io.save(this.journal); } catch(e) { p.state='pending'; throw e; }
    } finally { this.busy=false; }
  }
}
export interface Located { path:string; task:Task }
export function history(entries:Located[], lineage:string): {rows:Located[]; issues:string[]} {
  const rows=entries.filter(e=>e.task.meta?.lineage===lineage).sort((a,b)=>a.task.meta!.count-b.task.meta!.count); const issues:string[]=[];
  const ids=new Map<string,Located[]>(); for(const e of rows) ids.set(e.task.block!,[...(ids.get(e.task.block!)||[]),e]);
  for(const e of rows) { const m=e.task.meta!; if((ids.get(m.occurrence)||[]).length!==1) issues.push('Duplicate occurrence '+m.occurrence);
    for(const key of ['previous','next'] as const) if(m[key] && !ids.has(m[key]!)) issues.push('Missing '+key+' target '+m[key]);
    if(rows.filter(x=>x.task.meta?.previous===m.occurrence).length>1) issues.push('Conflicting successors for '+m.occurrence);
    if(m.previous && ids.has(m.previous) && ids.get(m.previous)![0].task.meta?.next!==m.occurrence) issues.push('Broken reciprocal previous link '+m.occurrence);
    if(m.previous && ids.has(m.previous) && ids.get(m.previous)![0].task.meta!.count+1!==m.count) issues.push('Inconsistent migration count '+m.occurrence);
    if(m.next && ids.has(m.next) && ids.get(m.next)![0].task.meta?.previous!==m.occurrence) issues.push('Broken reciprocal link '+m.occurrence);
  }
  if(rows.filter(e=>e.task.status===' ').length>1) issues.push('Multiple open occurrences; possible sync branch.');
  return {rows,issues:[...new Set(issues)]};
}

/** Anchor collision index includes ordinary paragraphs, not only checkbox tasks. */
export function blockTargets(text:string):string[] {
  const result:string[]=[];let fence='';let length=0;
  for(const line of text.split('\n')) {
    const f=line.match(/^\s*(`{3,}|~{3,})/);
    if(f) {if(!fence){fence=f[1][0];length=f[1].length;}else if(f[1][0]===fence && f[1].length>=length)fence='';continue;}
    if(fence)continue;
    const m=line.match(/(?:^| )\^([A-Za-z0-9-]+)\s*$/);if(m)result.push(m[1]);
  }
  return result;
}
