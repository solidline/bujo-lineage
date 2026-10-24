import { MarkdownView, Modal, Notice, Setting, TFile, TFolder, moment } from 'obsidian';
import type BuJoPlugin from './index';
import { eventLine } from './event-command';
import { coreDailySettings, tomorrowPath } from './daily';
import { blockTargets, Engine, Located, Plan, Task, history, path, plan, selected, tasks, validate } from './lineage';

export class LineageController {
  engine: Engine;
  cache=new Map<string,Located[]>();
  anchors=new Map<string,string[]>();
  errors=new Map<string,string>();
  private writeQueue:Promise<void>=Promise.resolve();
  constructor(private plugin:BuJoPlugin) {}
  get app() { return this.plugin.app; }
  hasPending() { return this.engine?.journal.some(p=>p.state==='pending'); }
  async persist(journal:Plan[]) {
    this.writeQueue=this.writeQueue.catch(()=>{}).then(async()=> { await this.plugin.saveData({...this.plugin.settings, journal}); });
    await this.writeQueue;
  }
  async start() {
    const data=await this.plugin.loadData();
    this.engine=new Engine(data?.journal || [], {
      read:async p=> { const f=this.app.vault.getAbstractFileByPath(p); return f instanceof TFile ? this.read(f) : ''; },
      update:async (p,fn)=> {
        const f=this.app.vault.getAbstractFileByPath(p);
        if(f instanceof TFile) {
          // An editor is the authority while open, including unsaved text. Synchronous CAS transform.
          const views=this.views(f.path);
          if(views.length) { const text=views[0].editor.getValue(); if(views.some(v=>v.editor.getValue()!==text)) throw Error('Multiple editors disagree; save and close duplicate panes, then recover.');
            const next=fn(text); const editor=views[0].editor;
            editor.replaceRange(next,{line:0,ch:0},editor.offsetToPos(text.length));
            await views[0].save();
            if(await this.app.vault.read(f)!==next) throw Error('Editor save could not be verified; recover the pending operation.');
          } else await this.app.vault.process(f,fn);
        } else { this.checkPath(p); await this.app.vault.create(p,fn('')); }
      },
      save:j=>this.persist(j),
      flush:async p=> {
        const f=this.app.vault.getAbstractFileByPath(p); if(!(f instanceof TFile)) throw Error('Destination is missing.');
        const views=this.views(p); if(views.length) {
          const value=views[0].editor.getValue();
          if(views.some(v=>v.editor.getValue()!==value)) throw Error('Destination editors disagree; close duplicate panes and recover.');
          await views[0].save();
          if(await this.app.vault.read(f)!==value) throw Error('Destination save could not be verified.');
        }
      },
      check:async p=> {
        await this.rebuild();
        if([...this.anchors.values()].flat().filter(id=>id===p.sourceOccurrence).length>1) throw Error('Duplicate source block anchor; resolve before transfer.');
        const dest=this.app.vault.getAbstractFileByPath(p.destinationPath); if(dest && !(dest instanceof TFile)) throw Error('Destination is not a note.');
        const previous=new Set<string>();
        for(const e of this.entries().filter(e=>e.task.meta?.lineage===p.lineage)) {
          const prev=e.task.meta?.previous; if(prev && previous.has(prev)) throw Error('Conflicting successors detected; inspect task history.');
          if(prev) previous.add(prev);
        }
        for(const e of this.entries()) {
          if(e.task.meta?.lineage===p.lineage && e.task.status===' ' && e.task.block!==p.sourceOccurrence && e.task.block!==p.occurrence) throw Error('Another open occurrence exists; inspect task history for a sync branch.');
          if(e.task.block===p.occurrence && e.task.meta?.operation!==p.operation) throw Error('Destination anchor collision.');
          if(e.task.meta?.lineage===p.lineage && e.task.meta.previous===p.sourceOccurrence && e.task.meta.operation!==p.operation) throw Error('Conflicting successor detected; inspect task history.');
        }
        if(this.errors.size) throw Error('Malformed lineage metadata in '+[...this.errors.keys()].join(', ')+'. Repair it before transferring.');
      }
    });
    const refresh=(f:unknown)=> { if(f instanceof TFile && f.extension==='md') void this.index(f); };
    this.plugin.registerEvent(this.app.vault.on('modify',refresh));
    this.plugin.registerEvent(this.app.vault.on('create',refresh));
    this.plugin.registerEvent(this.app.vault.on('delete',f=> {this.cache.delete(f.path);this.anchors.delete(f.path);this.errors.delete(f.path);}));
    this.plugin.registerEvent(this.app.vault.on('rename',(f,old)=> {this.cache.delete(old);this.anchors.delete(old);this.errors.delete(old);refresh(f);}));
    this.plugin.addCommand({id:'set-current-line-as-event',name:'Set current line as event',editorCallback:editor=> {
      try {if(this.hasPending())throw Error('Resolve pending transfer recovery before changing task status.');
        const line=editor.getCursor().line;editor.setLine(line,eventLine(editor.getValue(),line));
      } catch(error) {this.notice(error);}
    }});
    for(const action of ['migrate','schedule'] as const) this.plugin.addCommand({id:action+'-task',name:action==='migrate'?'Migrate task':'Schedule for later',editorCallback:(editor,view)=> {
      try { if(this.hasPending()) throw Error('A transfer needs recovery. Run Recover pending transfers.');
        if(!view.file) return; const t=selected(editor.getValue(),editor.getCursor().line);
        if(t.meta?.next) { const m=new Modal(this.app);m.titleEl.setText('This occurrence has moved');new Setting(m.contentEl).setDesc('Open its successor or inspect the complete task history.').addButton(b=>b.setButtonText('Open successor').onClick(()=>{void this.openOccurrence(t.meta!.next!);m.close();})).addButton(b=>b.setButtonText('View history').onClick(()=>{void this.showHistory(t);m.close();}));m.open();return; }
        validate(t); new TransferModal(this,view.file.path,t,action).open();
      } catch(e) {this.notice(e);}
    }});
    this.plugin.addCommand({id:'view-task-history',name:'View task history',editorCallback:(editor)=> {try { const t=selected(editor.getValue(),editor.getCursor().line); void this.showHistory(t); } catch(e){this.notice(e);} }});
    this.plugin.addCommand({id:'recover-pending-transfers',name:'Recover pending transfers',callback:()=>this.recoveryModal()});
    this.app.workspace.onLayoutReady(()=> { void this.rebuild().then(()=>this.recover()); });
  }
  views(p:string):MarkdownView[] { return this.app.workspace.getLeavesOfType('markdown').map(l=>l.view).filter((v):v is MarkdownView=>v instanceof MarkdownView && v.file?.path===p); }
  async read(f:TFile):Promise<string> { return this.views(f.path)[0]?.editor.getValue() ?? await this.app.vault.read(f); }
  async index(f:TFile) { try { const text=await this.read(f);this.anchors.set(f.path,blockTargets(text));this.cache.set(f.path,tasks(text).map(task=>({path:f.path,task}))); this.errors.delete(f.path); } catch(e) {this.cache.delete(f.path);this.errors.set(f.path,String(e));} }
  async rebuild() { this.cache.clear(); this.errors.clear(); this.anchors.clear(); await Promise.all(this.app.vault.getMarkdownFiles().map(f=>this.index(f))); }
  entries() { return [...this.cache.values()].flat(); }
  checkPath(p:string) {
    path(p); const folder=p.includes('/')?p.slice(0,p.lastIndexOf('/')):'';
    if(folder && !(this.app.vault.getAbstractFileByPath(folder) instanceof TFolder)) throw Error('Destination folder is missing. Create it first.');
    const f=this.app.vault.getAbstractFileByPath(p); if(f && !(f instanceof TFile)) throw Error('Destination must be a Markdown note.');
  }
  async tomorrow():Promise<string> {
    let settings={folder:this.plugin.settings.dailyFolder,format:this.plugin.settings.dailyFormat};
    if(this.plugin.settings.useDailyNotesSettings!==false) {
      const configPath=(this.app.vault.configDir || '.obsidian')+'/daily-notes.json';
      try {
        if(await this.app.vault.adapter.exists(configPath)) settings=coreDailySettings(JSON.parse(await this.app.vault.adapter.read(configPath)));
      } catch(error) {throw Error('Could not read core Daily Notes settings: '+String(error)+'. Choose a destination manually or disable core settings in BuJo Lineage.');}
    }
    return tomorrowPath(moment(),settings.folder,settings.format);
  }
  future() { return this.plugin.settings.futureLog; }
  async transfer(source:string,t:Task,dest:string,action:'migrate'|'schedule',reason:string,date?:string) {
    dest=path(dest); this.checkPath(dest);
    const f=this.app.vault.getAbstractFileByPath(source); if(!(f instanceof TFile)) throw Error('Source moved while the dialog was open. Reopen the command.');
    // Exact task snapshot is relocated by content, never by a remembered line number.
    const matches=tasks(await this.read(f)).filter(x=>x.raw===t.raw); if(matches.length!==1) throw Error('Source changed or is ambiguous. Cancel and reopen the command.');
    const p=plan(t,source,dest,action,reason,date,(target,block,alias,from)=> {
      if(!target) target=this.entries().find(e=>e.task.block===block)?.path || source;
      const file=this.app.vault.getAbstractFileByPath(target);
      // Full vault paths prevent duplicate basename ambiguity for notes not created yet.
      return file instanceof TFile ? this.app.fileManager.generateMarkdownLink(file,from,'#^'+block,alias) : `[[${target.replace(/\.md$/,'')}#^${block}|${alias}]]`;
    });
    await this.engine.run(p); new Notice('Task transferred. Moving notes does not set a due date.');
  }
  recoveryModal() {
    const modal=new Modal(this.app);modal.titleEl.setText('Pending transfer recovery');
    const pending=this.engine.journal.filter(p=>p.state==='pending');
    if(!pending.length) modal.contentEl.createEl('p',{text:'No pending operations.'});
    for(const p of pending) {
      modal.contentEl.createEl('h3',{text:p.sourcePath+' → '+p.destinationPath});
      modal.contentEl.createEl('p',{text:'Operation '+p.operation+'. Recovery reuses the reserved destination. If either task was edited, restore the captured source/destination from this record before retrying. Keep user edits separately. No rollback deletes edits.'});
      const details=modal.contentEl.createEl('details');details.createEl('summary',{text:'Captured source and expected destination'});details.createEl('pre',{text:'SOURCE\n'+p.expected+'\n\nDESTINATION\n'+p.destination});
      new Setting(modal.contentEl).addButton(b=>b.setButtonText('Open source').onClick(()=>void this.app.workspace.openLinkText(p.sourcePath,''))).addButton(b=>b.setButtonText('Open destination').onClick(()=>void this.app.workspace.openLinkText(p.destinationPath,'')));
    }
    if(pending.length) new Setting(modal.contentEl).addButton(b=>b.setButtonText('Retry recovery').setCta().onClick(async()=>{b.setDisabled(true);await this.rebuild();await this.recover();modal.close();this.recoveryModal();}));
    modal.open();
  }
  async recover() {
    for(const p of this.engine.journal.filter(p=>p.state==='pending')) {
      // Resolve renamed files by durable occurrence identity when available.
      const entries=this.entries();
      p.sourcePath=entries.find(e=>e.task.block===p.sourceOccurrence)?.path || p.sourcePath;
      p.destinationPath=entries.find(e=>e.task.block===p.occurrence)?.path || p.destinationPath;
      try {await this.engine.run(p);new Notice('Recovered transfer.');} catch(e) {new Notice('Pending transfer: '+String(e)+' Run Recover pending transfers after resolving the conflict. Two open copies may exist.',15000);}
    }
  }
  notice(e:unknown) {new Notice(String(e),10000);}
  async openOccurrence(id:string) { await this.rebuild(); const matches=this.entries().filter(e=>e.task.block===id); if(matches.length!==1) {this.notice('Missing or ambiguous successor; inspect task history.');return;} await this.app.workspace.openLinkText(matches[0].path+'#^'+id,''); }
  async showHistory(t:Task) {
    await this.rebuild(); const modal=new Modal(this.app);modal.modalEl.addClass('bujo-lineage-modal');modal.titleEl.setText('Task history');
    if(!t.meta) modal.contentEl.createEl('p',{text:'This task has no lineage yet. Its first transfer will create one.'});
    else {
      const h=history(this.entries(),t.meta.lineage);
      for(const row of h.rows) if([...this.anchors.values()].flat().filter(id=>id===row.task.block).length>1) h.issues.push('Duplicate block target '+row.task.block);
      for(const issue of [...h.issues,...[...this.errors].map(([p,e])=>p+': '+e)]) modal.contentEl.createEl('p',{text:issue,cls:'bujo-lineage-warning'});
      for(const e of h.rows) {const m=e.task.meta!; new Setting(modal.contentEl).setName(e.path+' · ['+e.task.status+'] · count '+m.count).setDesc(m.action+' · '+m.timestamp+(m.reason?' · '+m.reason:'')).addButton(b=>b.setButtonText('Open occurrence').onClick(()=> {void this.openOccurrence(m.occurrence);modal.close();}));}
    } modal.open();
  }
}
class TransferModal extends Modal {
  constructor(private controller:LineageController,private source:string,private task:Task,private action:'migrate'|'schedule') {super(controller.app);}
  private dismissed=false;
  async onOpen() {
    this.dismissed=false;
    this.modalEl.addClass('bujo-lineage-modal');
    this.titleEl.setText(this.action==='migrate'?'Migrate task':'Schedule for later');
    let destination='',destinationError=''; try {destination=this.action==='migrate'?await this.controller.tomorrow():this.controller.future();} catch(error) {destinationError=String(error);}
    if(this.dismissed)return;
    if(destinationError)this.contentEl.createEl('p',{text:destinationError,attr:{role:'alert'}});
    let reason='',date=''; let running=false;
    this.contentEl.createEl('p',{text:'Search existing notes or enter a new note path. Existing folders only. Moving to tomorrow does not set a due date. Attached child content moves with the task.'});
    const list=this.contentEl.createEl('div');
    const render=(filter:string)=> {list.empty(); const files=this.app.vault.getMarkdownFiles().filter(f=>f.path!==this.source && f.path.toLowerCase().includes(filter.toLowerCase())).slice(0,12);for(const f of files){const b=list.createEl('button',{text:f.path});b.onclick=()=>{destination=f.path;input.setValue(destination);list.empty();};}};
    let input:import('obsidian').TextComponent;
    new Setting(this.contentEl).setName('Destination note path / search').addText(t=> {input=t;t.setValue(destination).onChange(v=> {destination=v;render(v);});t.inputEl.setAttribute('aria-label','Destination note path or search');});
    if(this.action==='schedule') new Setting(this.contentEl).setName('Scheduled date (optional)').setDesc('Leave blank to keep the current date, or use Future Log with only the move timestamp.').addText(t=> {t.inputEl.type='date';t.inputEl.setAttribute('aria-label','Scheduled calendar date, optional');t.onChange(v=>date=v);});
    new Setting(this.contentEl).setName('Reason (optional)').addTextArea(t=>{t.inputEl.setAttribute('aria-label','Reason for transfer, optional');t.onChange(v=>reason=v);});
    const error=this.contentEl.createEl('p',{attr:{role:'alert'}});
    new Setting(this.contentEl).addButton(b=>b.setButtonText('Cancel').onClick(()=>{if(!running)this.close();})).addButton(b=>b.setButtonText('Transfer task').setCta().onClick(async()=> {
      if(running)return;running=true;b.setDisabled(true);
      try {await this.controller.transfer(this.source,this.task,destination,this.action,reason,date);this.close();} catch(e) {error.setText(String(e)+(this.controller.hasPending()?' Pending operation saved. Use Recover pending transfers; do not start another transfer.':''));} finally {running=false;b.setDisabled(false);}
    }));
  }
  onClose(){this.dismissed=true;this.contentEl.empty();}
}
