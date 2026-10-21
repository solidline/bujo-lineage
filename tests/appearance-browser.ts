import {Appearance,decorateJournal,journalTokens} from '../src/appearance';
import {journalHighlights} from '../src/editor-highlights';
import {EditorView} from '@codemirror/view';
import {EditorState} from '@codemirror/state';
import {markdown} from '@codemirror/lang-markdown';
const results:string[]=[];
function check(ok:unknown,message:string) {if(!ok)throw Error(message);results.push(message);}
(async()=>{
try {
  const appearance=new Appearance(document.body,{journalStyling:true,codeHighlighting:false});
  check(document.body.classList.contains('bujo-lineage-journal')&&!document.body.classList.contains('bujo-lineage-code'),'journal and code toggles are independent');
  const other=document.createElement('div');appearance.attach(other);
  appearance.apply({journalStyling:false,codeHighlighting:true});
  check(!other.classList.contains('bujo-lineage-journal')&&other.classList.contains('bujo-lineage-code'),'changes propagate to attached popout bodies');
  appearance.detach(other);check(!other.className.includes('bujo-lineage'),'closed popout styles are released');
  appearance.clear();check(!document.body.className.includes('bujo-lineage')&&!other.className.includes('bujo-lineage'),'unload clears all appearance classes');
  appearance.apply({journalStyling:true,codeHighlighting:true});check(!other.className.includes('bujo-lineage'),'unloaded documents are released');
  const root=document.getElementById('fixture')!;const text=root.textContent;const checkbox=root.querySelector('input')!,link=root.querySelector('a')!;let clicks=0;link.addEventListener('click',()=>clicks++);
  decorateJournal(root);decorateJournal(root);
  check(root.textContent===text,'decoration preserves all rendered text');
  check(root.querySelector('input')===checkbox&&root.querySelector('a')===link,'checkbox and navigation DOM are preserved');
  link.click();check(clicks===1,'existing navigation handlers survive decoration');
  check(root.querySelectorAll('.bujo-lineage-scheduled').length===1,'dates highlighted once after repeated rendering');
  check(!root.querySelector('code .bujo-lineage-token'),'inline code excluded from task decoration');
  check(root.querySelectorAll('.bujo-lineage-token .bujo-lineage-token').length===0,'nested tasks and existing signifier spans are not double wrapped');
  check(journalTokens('- [ ] ! Task <!-- ⏳ 2027-01-01 --> `📅 2027-01-02` ⏳ 2027-01-03').map(t=>t.kind).join(',')==='priority,scheduled','metadata and inline code excluded by tokenization');
  appearance.attach(document.body);appearance.apply({journalStyling:true,codeHighlighting:true});
  const editor=document.createElement('div');editor.className='markdown-source-view mod-cm6';root.append(editor);
  const source='- [ ] ! Task ⏳ 2027-01-03\n- [x] Done\n- [-] Cancelled\n- [>] Moved\n- [<] Later\n- [o] Event\n\n```md\n- [ ] ! Example ⏳ 2027-01-03\n```';
  const view=new EditorView({state:EditorState.create({doc:source,extensions:[markdown(),journalHighlights]}),parent:editor});
  check(editor.querySelectorAll('.bujo-lineage-scheduled').length===1,'CodeMirror highlights task dates and excludes fenced examples');
  check(editor.querySelectorAll('.bujo-lineage-task').length===6,'all six editor statuses receive explicit line decorations without host data-task attributes');
  check(getComputedStyle(editor.querySelector('.bujo-lineage-status-open')!,'::after').content.includes('open'),'ordinary open tasks show a visible status label');
  check(getComputedStyle(editor.querySelector('.bujo-lineage-status-done')!).borderInlineStartColor!==getComputedStyle(editor.querySelector('.bujo-lineage-status-migrated')!).borderInlineStartColor,'completed and migrated editor states have distinct colored markers');
  check(view.state.doc.toString()===source,'editor decorations never mutate Markdown');
  const before=getComputedStyle(root.querySelector('.bujo-lineage-scheduled')!).color;
  document.body.classList.add('theme-dark');const after=getComputedStyle(root.querySelector('.bujo-lineage-scheduled')!).color;
  check(before!==after,'palette follows Obsidian light/dark mode');
  const code=root.querySelector('pre')!;check(getComputedStyle(code).overflowX==='auto','code blocks scroll horizontally');
  check(getComputedStyle(checkbox).width==='44px' && getComputedStyle(checkbox).height==='44px','touch checkboxes expose 44px targets');
  check(code.scrollWidth>code.clientWidth,'long code remains inside its scrollable block at mobile width');
  appearance.apply({journalStyling:false,codeHighlighting:false});
  check(getComputedStyle(code).overflowX!=='auto','disabling code styling restores the theme layout');
  check(getComputedStyle(checkbox).width!=='44px','disabling journal styling restores theme checkbox size');
  const themeFont=getComputedStyle(root).fontFamily;
  appearance.apply({journalStyling:false,codeHighlighting:false,preferJetBrainsMono:true});
  check(getComputedStyle(root).fontFamily.startsWith('"JetBrains Mono"'),'JetBrains Mono preference applies independently to notes');
  check(getComputedStyle(editor.querySelector('.cm-scroller')!).fontFamily.startsWith('"JetBrains Mono"'),'font preference applies to CodeMirror');
  const loaded=await document.fonts.load('16px "JetBrains Mono"');
  check(loaded.some(face=>face.family==='JetBrains Mono' && face.status==='loaded'),'bundled font loads without a font installation or external request');
  appearance.apply({journalStyling:false,codeHighlighting:false,preferJetBrainsMono:false});
  check(getComputedStyle(root).fontFamily===themeFont,'disabling font preference restores theme font');
  appearance.apply({journalStyling:false,codeHighlighting:false,preferJetBrainsMono:true});
  view.destroy();appearance.clear();
  check(!document.body.classList.contains('bujo-lineage-mono'),'unload removes font preference class');
  document.getElementById('results')!.textContent='PASS '+results.length+' browser checks\n'+results.join('\n');
} catch(error) {document.getElementById('results')!.textContent='FAIL '+String(error)+'\n'+results.join('\n');}

})();
