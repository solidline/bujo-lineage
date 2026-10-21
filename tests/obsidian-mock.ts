export class TFile { extension='md'; constructor(public path:string){} }
export class TFolder { constructor(public path:string){} }
export class MarkdownView { file:TFile;editor:MockEditor;persist:(s:string)=>void; async save(){this.persist(this.editor.getValue());} }
export class MockEditor {
 constructor(public text:string){} getValue(){return this.text;} offsetToPos(n:number){return {line:0,ch:n};}
 replaceRange(s:string){this.text=s;}
}
export class Notice { static messages:string[]=[];constructor(s:string){Notice.messages.push(s);} }
export class Modal {}
export class Setting {}
// Calendar arithmetic from local components, matching moment.add(1,'day').
export function moment(){const d=new Date();return {add(n:number){d.setDate(d.getDate()+n);return this;},format(){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}};}
export class Plugin { addSettingTab() {} }
export class PluginSettingTab {}
