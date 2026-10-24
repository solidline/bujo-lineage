/** Shared context and line syntax; no persistence or identity decisions here. */
export const BUJO_SYMBOLS=[' ','x','-','>','<','o'] as const;
export type EntryTarget='open'|'completed'|'cancelled'|'event'|'note';
export interface EntryParts {indent:string;marker:string;status:string;body:string}
export function assertCaptureContext(text:string,lineNumber:number):void {
  const lines=text.split('\n');
  if(lineNumber<0 || lineNumber>=lines.length)throw Error('Place the cursor on a note line.');
  let fence='',length=0,frontmatter=lines[0]?.trim()==='---';
  for(let i=0;i<=lineNumber;i++) {
    if(frontmatter) {if(i>0 && /^(?:---|\.\.\.)\s*$/.test(lines[i]))frontmatter=false;else if(i===lineNumber)throw Error('This command cannot run inside frontmatter.');continue;}
    const match=lines[i].match(/^\s*(`{3,}|~{3,})/);
    if(match) {if(i===lineNumber)throw Error('This command cannot run inside fenced code.');if(!fence){fence=match[1][0];length=match[1].length;}else if(match[1][0]===fence && match[1].length>=length)fence='';}
  }
  if(fence)throw Error('This command cannot run inside fenced code.');
}
export function entryParts(line:string):EntryParts {
  const bullet=line.match(/^(\s*)([-+*]|\d+[.)])\s+(.*)$/);
  if(bullet) {
    const checkbox=bullet[3].match(/^\[(.)\](?:\s(.*)|$)/);
    if(checkbox) {
      if(!(BUJO_SYMBOLS as readonly string[]).includes(checkbox[1]))throw Error('This checkbox uses a custom status outside the BuJo types.');
      return {indent:bullet[1],marker:bullet[2],status:checkbox[1],body:checkbox[2] || ''};
    }
    return {indent:bullet[1],marker:bullet[2],status:'note',body:bullet[3]};
  }
  if(/^\s*(?:#{1,6}\s|>|---\s*$|\.\.\.\s*$)/.test(line) || /^(?: {4}|\t)/.test(line))throw Error('Place the cursor on a bullet, checkbox, or ordinary text line.');
  const indent=line.match(/^\s*/)?.[0] || '';
  return {indent,marker:'-',status:'text',body:line.slice(indent.length)};
}
export function formatEntry(line:string,target:EntryTarget):string {
  const parts=entryParts(line);
  const symbol={open:' ',completed:'x',cancelled:'-',event:'o',note:'note'}[target];
  if(parts.status===symbol)return line;
  return parts.indent+parts.marker+' '+(target==='note'?'':`[${symbol}] `)+parts.body;
}
