/** Appearance changes are transient DOM/classes only; Markdown stays untouched. */
export interface AppearanceSettings { journalStyling: boolean; codeHighlighting: boolean; preferJetBrainsMono?: boolean }
const journalClass='bujo-lineage-journal';
const codeClass='bujo-lineage-code';
const fontClass='bujo-lineage-mono';
export class Appearance {
  private bodies=new Set<HTMLElement>();
  private settings:AppearanceSettings;
  constructor(body:HTMLElement, settings:AppearanceSettings) {this.settings=settings;this.attach(body);}
  attach(body:HTMLElement) {this.bodies.add(body);this.apply(this.settings);}
  detach(body:HTMLElement) {body.classList.remove(journalClass,codeClass,fontClass);this.bodies.delete(body);}
  apply(settings:AppearanceSettings) {
    this.settings=settings;
    for(const body of this.bodies) {
      body.classList.toggle(journalClass,settings.journalStyling);
      body.classList.toggle(codeClass,settings.codeHighlighting);
      body.classList.toggle(fontClass,settings.preferJetBrainsMono===true);
    }
  }
  clear() {for(const body of this.bodies)body.classList.remove(journalClass,codeClass,fontClass);this.bodies.clear();}
}
export interface Token {from:number;to:number;kind:'priority'|'question'|'scheduled'|'due'|'count'}
export function journalTokens(text:string):Token[] {
  const excluded=[...text.matchAll(/`+[^`]*`+|<!--[^]*?-->/g)].map(m=>({from:m.index!,to:m.index!+m[0].length}));
  const regex=/(?:⏳|⌛)\uFE0F? *\d{4}-\d{2}-\d{2}|(?:📅|📆|🗓)\uFE0F? *\d{4}-\d{2}-\d{2}|\bmoved \d+ times?\b|(?:^\s*|\] )([!?])(?= )/g;
  const result:Token[]=[];
  for(const m of text.matchAll(regex)) {
    let from=m.index!,value=m[0];
    if(m[1]) {from+=value.length-1;value=m[1];}
    const to=from+value.length;
    if(excluded.some(e=>from<e.to && to>e.from))continue;
    const kind=value==='!'?'priority':value==='?'?'question':value.startsWith('moved')?'count':/^(?:⏳|⌛)/.test(value)?'scheduled':'due';
    result.push({from,to,kind});
  }
  return result;
}
export function decorateJournal(element:HTMLElement):void {
  const doc=element.ownerDocument;
  for(const task of Array.from(element.querySelectorAll<HTMLElement>('.task-list-item'))) {
    const walker=doc.createTreeWalker(task,4 /* SHOW_TEXT */); const nodes:Text[]=[];
    let node:Node|null;
    while((node=walker.nextNode())) {
      const parent=node.parentElement;
      if(parent?.closest('.task-list-item')!==task || parent.closest('code, pre, a, script, style, .bujo-lineage-token'))continue;
      nodes.push(node as Text);
    }
    for(const node of nodes) {
      const text=node.textContent || '';const tokens=journalTokens(text);if(!tokens.length)continue;
      const fragment=doc.createDocumentFragment();let offset=0;
      for(const token of tokens) {
        fragment.append(doc.createTextNode(text.slice(offset,token.from)));
        const span=doc.createElement('span');span.className='bujo-lineage-token bujo-lineage-'+token.kind;span.textContent=text.slice(token.from,token.to);fragment.append(span);offset=token.to;
      }
      fragment.append(doc.createTextNode(text.slice(offset)));node.replaceWith(fragment);
    }
    for(const link of Array.from(task.querySelectorAll('a.internal-link'))) if(/^(previous|next)$/.test(link.textContent || ''))link.classList.add('bujo-lineage-nav');
  }
}
