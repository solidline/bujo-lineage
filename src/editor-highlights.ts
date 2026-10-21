import { syntaxTree } from '@codemirror/language';
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { journalTokens } from './appearance';

/** Viewport-only decorations; never rewrites text, selections or checkboxes. */
function highlights(view:EditorView):DecorationSet {
  const ranges=[];const seen=new Set<number>();
  for(const visible of view.visibleRanges) {
    for(let pos=visible.from;pos<=visible.to;) {
      const line=view.state.doc.lineAt(pos);
      const match=line.text.match(/^\s*(?:[-+*]|\d+[.)]) \[(.)\] /);
      let context=syntaxTree(view.state).resolveInner(line.from+(match?.[0].length || 0),1);let isCode=false;
      for(;;) {if(/code|comment|frontmatter/i.test(context.name))isCode=true;if(!context.parent)break;context=context.parent;}
      if(!seen.has(line.number) && match && !isCode) {
        seen.add(line.number);
        const status=({ ' ':'open', x:'done', '-':'cancelled', '>':'migrated', '<':'scheduled', o:'event' } as Record<string,string>)[match[1]];
        if(status) ranges.push(Decoration.line({attributes:{class:'bujo-lineage-task bujo-lineage-status-'+status,'data-bujo-lineage-label':status}}).range(line.from));
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
