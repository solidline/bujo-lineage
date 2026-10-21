import { syntaxTree } from '@codemirror/language';
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { journalTokens } from './appearance';

/** Viewport-only decorations; never rewrites text, selections or checkboxes. */
function highlights(view:EditorView):DecorationSet {
  const ranges=[];const seen=new Set<number>();
  for(const visible of view.visibleRanges) {
    for(let pos=visible.from;pos<=visible.to;) {
      const line=view.state.doc.lineAt(pos);
      if(!seen.has(line.number) && /^\s*(?:[-+*]|\d+[.)]) \[.\] /.test(line.text)) {
        seen.add(line.number);
        for(const token of journalTokens(line.text)) {
          const from=line.from+token.from,to=line.from+token.to;
          let node=syntaxTree(view.state).resolveInner(from,1);let code=false;
          for(;;) {if(/code|comment|frontmatter/i.test(node.name))code=true;if(!node.parent)break;node=node.parent;}
          if(!code)ranges.push(Decoration.mark({class:'bujo-lineage-token bujo-lineage-'+token.kind}).range(from,to));
        }
      }
      if(line.to>=visible.to)break;pos=line.to+1;
    }
  }
  return Decoration.set(ranges,true);
}
export const journalHighlights=ViewPlugin.fromClass(class {
  decorations:DecorationSet;
  constructor(view:EditorView) {this.decorations=highlights(view);}
  update(update:ViewUpdate) {if(update.docChanged || update.viewportChanged || syntaxTree(update.startState)!==syntaxTree(update.state))this.decorations=highlights(update.view);}
},{decorations:plugin=>plugin.decorations});
