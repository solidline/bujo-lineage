/** Syntax-only adapter. No Tasks runtime/private API dependencies. */
export function rejectUnsupportedTasks(text:string):void {
  if(/🆔|⛔/.test(text)) throw Error('Tasks dependency fields cannot be transferred in v1. Keep this task canonical and surface it with queries.');
  if(/🔁|\[repeat::/i.test(text)) throw Error('Recurring tasks cannot be transferred in v1; keep the recurrence canonical.');
  if(/\[(?:scheduled|due|start|completion)::/i.test(text)) throw Error('Dataview task dates are deferred in v1; use Tasks emoji dates before transferring.');
}
// Tasks DefaultTaskSerializer extracts fields from the end, after removing the
// block anchor. Keep its date/priority/tag suffix AFTER our description metadata.
export function splitTasksSuffix(text:string):{description:string;fields:string} {
  const token=/\s+(?:(?:🛫|➕|⏳|⌛|📅|📆|🗓|✅|❌)\uFE0F? *\d{4}-\d{2}-\d{2}|(?:🔺|⏫|🔼|🔽|⏬)\uFE0F?|🏁\uFE0F? *[a-zA-Z]+|#[^\s#]+)$/;
  let description=text.trimEnd(),fields='';
  let match=description.match(token);
  while(match) {fields=match[0]+fields;description=description.slice(0,-match[0].length);match=description.match(token);}
  return {description,fields};
}
export function scheduled(text:string,date:string):string {
  return text.replace(/\s*(?:⏳|⌛)\uFE0F? *\d{4}-\d{2}-\d{2}/g,'')+' ⏳ '+date;
}
