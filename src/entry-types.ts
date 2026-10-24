import { assertCaptureContext, EntryTarget, entryParts, formatEntry } from './entry-syntax';
import { decode } from './lineage';
import { rejectUnsupportedTasks } from './tasks-interop';
export class ArchivedEntryError extends Error {
  constructor(public successor:string) {super('This occurrence has a successor. Open it before changing its type.');}
}
/** A one-line, reversible syntax edit. Never changes metadata, dates, or children. */
export function changeEntryType(text:string,lineNumber:number,target:EntryTarget):string {
  assertCaptureContext(text,lineNumber);
  const line=text.split('\n')[lineNumber];
  const meta=decode(line);
  if(meta?.next)throw new ArchivedEntryError(meta.next);
  if(meta && line.match(/ \^([A-Za-z0-9-]+)\s*$/)?.[1]!==meta.occurrence)throw Error('Lineage block anchor is missing or changed. Restore it before changing type.');
  const parts=entryParts(line);
  const symbol={open:' ',completed:'x',cancelled:'-',event:'o',note:'note'}[target];
  if(parts.status===symbol)return line;
  rejectUnsupportedTasks(line);
  return formatEntry(line,target);
}
