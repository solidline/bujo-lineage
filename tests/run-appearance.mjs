import {build} from 'esbuild';
import {chromium} from 'playwright-core';
import {readFileSync,mkdtempSync,existsSync,rmSync} from 'node:fs';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
const dir=mkdtempSync(resolve(tmpdir(),'bujo-appearance-'));
try {
 const js=resolve(dir,'test.js');
 await build({entryPoints:['tests/appearance-browser.ts'],outfile:js,bundle:true,platform:'browser',format:'iife'});
 const html=`<!doctype html><meta charset="utf-8"><style>body{width:330px;margin:16px;background:#fff;color:#222}input{width:20px;height:20px}.markdown-rendered pre{width:280px}code{font:14px monospace}${readFileSync('styles.css','utf8')}</style>
 <div id="fixture" class="markdown-rendered"><ul><li class="task-list-item" data-task=" "><input class="task-list-item-checkbox" type="checkbox"> ! Parent ⏳ 2027-01-03 <a class="internal-link" href="#">previous</a> · moved 1 time <code>📅 2027-01-02</code><ul><li class="task-list-item" data-task=" ">? Child</li></ul></li></ul><pre><code><span class="token keyword">const</span> message = "${'a'.repeat(140)}";</code></pre></div><pre id="results"></pre><script>${readFileSync(js,'utf8')}</script>`;
 const browser=await chromium.launch({executablePath:process.env.BUJO_CHROMIUM || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : chromium.executablePath()),headless:true,args:['--no-sandbox'],timeout:20000});
 try {
   const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
   await page.setContent(html,{waitUntil:'domcontentloaded',timeout:20000});
   await page.waitForFunction(()=>/^(PASS|FAIL)/.test(document.getElementById('results')?.textContent || ''),{},{timeout:10000});
   const report=await page.locator('#results').textContent();
   if(!report?.startsWith('PASS')) {console.error(report);process.exitCode=1;} else console.log(report);
 } finally {await browser.close();}
} finally {rmSync(dir,{recursive:true,force:true});}
