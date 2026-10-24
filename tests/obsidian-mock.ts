export class TFile { extension='md'; constructor(public path:string){} }
export class TFolder { constructor(public path:string){} }
export class MarkdownView { file:TFile;editor:MockEditor;persist:(s:string)=>void; async save(){this.persist(this.editor.getValue());} }
export class MockEditor {
 constructor(public text:string){} getValue(){return this.text;} offsetToPos(n:number){return {line:0,ch:n};}
 getCursor(){return {line:0,ch:0};} getLine(line:number){return this.text.split('\n')[line];}
 setLine(line:number,value:string){const lines=this.text.split('\n');lines[line]=value;this.text=lines.join('\n');}
 replaceRange(s:string){this.text=s;}
}
export class Notice { static messages:string[]=[];constructor(s:string){Notice.messages.push(s);} }
export class Modal {}
export class Setting {}
export {default as moment} from 'moment';
export class Plugin { addSettingTab() {} register() {} registerEditorExtension() {} }
export class PluginSettingTab {}
// Public Obsidian Live Preview field; adapter doubles do not instantiate editors.
export const editorLivePreviewField = {};
