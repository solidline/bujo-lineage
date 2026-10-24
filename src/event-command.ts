import { changeEntryType } from './entry-types';
export { assertCaptureContext } from './entry-syntax';
/** Retain the existing event helper/export while sharing all transition rules. */
export function eventLine(text:string,lineNumber:number):string {
  return changeEntryType(text,lineNumber,'event');
}
