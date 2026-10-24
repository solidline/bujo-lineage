import type { EditorState } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate, WidgetType } from '@codemirror/view';
import { decode } from './lineage';

type OpenHistory=(view:EditorView,position:number)=>void;
class HistoryWidget extends WidgetType {
  constructor(private occurrence:string,private count:number,private open?:OpenHistory) {super();}
  eq(other:HistoryWidget) {return this.occurrence===other.occurrence && this.count===other.count;}
  toDOM(view:EditorView):HTMLElement {
    const button=view.dom.ownerDocument.createElement('button');
    button.type='button';button.className='bujo-lineage-history-chip';button.textContent='history';
    button.title='Open task history. Raw metadata remains available in Source mode.';
    button.setAttribute('aria-label',`View task history, migration count ${this.count}`);
    button.onclick=event=>{event.preventDefault();this.open?.(view,view.posAtDOM(button));};
    return button;
  }
  ignoreEvent() {return true;}
}
function hiddenMetadata(view:EditorView,live:(state:EditorState)=>boolean,open?:OpenHistory):DecorationSet {
  if(!live(view.state))return Decoration.none;
  const ranges=[];const seen=new Set<number>();
  for(const visible of view.visibleRanges) {
    for(let position=visible.from;position<=visible.to;) {
      const line=view.state.doc.lineAt(position);
      if(!seen.has(line.number) && /^\s*(?:[-+*]|\d+[.)]) /.test(line.text) && line.text.includes('<!--bujo-lineage:')) {
        seen.add(line.number);
        let node=syntaxTree(view.state).resolveInner(line.from+line.text.search(/\S/),1);let code=false;
        for(;;) {if(/code|comment|frontmatter/i.test(node.name))code=true;if(!node.parent)break;node=node.parent;}
        if(!code) {
          try {
            const meta=decode(line.text);
            const comment=line.text.match(/<!--bujo-lineage:[^]*?-->/);
            const anchor=line.text.match(/ \^([A-Za-z0-9-]+)\s*$/);
            if(meta && comment && anchor?.[1]===meta.occurrence) {
              const from=line.from+comment.index!;
              ranges.push(Decoration.replace({widget:new HistoryWidget(meta.occurrence,meta.count,open)}).range(from,from+comment[0].length));
              ranges.push(Decoration.replace({}).range(line.from+anchor.index!,line.to));
            }
          } catch { /* Malformed/unknown records stay visible for repair, never hidden. */ }
        }
      }
      if(line.to>=visible.to)break;position=line.to+1;
    }
  }
  return Decoration.set(ranges,true);
}
/** Hide only validated metadata in Live Preview; Source mode and Markdown stay raw. */
export function metadataPreview(live:(state:EditorState)=>boolean,open?:OpenHistory) {
  return ViewPlugin.fromClass(class {
    decorations:DecorationSet;
    constructor(view:EditorView) {this.decorations=hiddenMetadata(view,live,open);}
    update(update:ViewUpdate) {
      if(update.docChanged || update.viewportChanged || live(update.startState)!==live(update.state) || syntaxTree(update.startState)!==syntaxTree(update.state))this.decorations=hiddenMetadata(update.view,live,open);
    }
  },{decorations:plugin=>plugin.decorations,provide:plugin=>EditorView.atomicRanges.of(view=>view.plugin(plugin)?.decorations || Decoration.none)});
}
