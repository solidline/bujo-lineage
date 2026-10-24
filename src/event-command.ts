import { rejectUnsupportedTasks } from './tasks-interop';
/** Change one editor line only; keep indentation, anchors, wording and child lines. */
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

export function eventLine(text:string,lineNumber:number):string {
  assertCaptureContext(text,lineNumber);
  const lines=text.split("\n");
  const line=lines[lineNumber];
  if(line.includes('<!--bujo-lineage:'))throw Error('This task has lineage history. Capture a separate event to preserve its commitment and history.');
  rejectUnsupportedTasks(line);
  const checkbox=line.match(/^(\s*(?:[-+*]|\d+[.)]) \[)(.)(\](?:\s|$))/);
  if(checkbox) {
    if(![' ','o'].includes(checkbox[2]))throw Error('Only an open, untracked task can be changed into an event.');
    return line.replace(/^(\s*(?:[-+*]|\d+[.)]) \[).(\])/, '$1o$2');
  }
  const bullet=line.match(/^(\s*(?:[-+*]|\d+[.)]))\s+(.*)$/);
  if(bullet)return bullet[1]+' [o] '+bullet[2];
  if(/^\s*(?:#{1,6}\s|>|---\s*$|\.\.\.\s*$)/.test(line) || /^(?: {4}|\t)/.test(line))throw Error('Place the cursor on a bullet, open task, blank line, or ordinary text line.');
  const indentation=line.match(/^\s*/)?.[0] || '';
  return indentation+'- [o] '+line.slice(indentation.length);
}
