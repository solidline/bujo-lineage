import {build} from 'esbuild';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
const dir=mkdtempSync(resolve(tmpdir(),'bujo-test-'));
try {
 const file=resolve(dir,'adapter.cjs');
 await build({entryPoints:['tests/adapter.test.ts'],outfile:file,bundle:true,platform:'node',format:'cjs',alias:{obsidian:resolve('tests/obsidian-mock.ts')}});
 const result=spawnSync(process.execPath,[file],{stdio:'inherit'});process.exitCode=result.status??1;
} finally {rmSync(dir,{recursive:true,force:true});}
