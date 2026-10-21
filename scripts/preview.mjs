import {chromium} from 'playwright-core';
import {readFileSync} from 'node:fs';
const html=readFileSync('docs/appearance-preview.html','utf8').replace('<link rel="stylesheet" href="../styles.css">','<style>'+readFileSync('styles.css','utf8')+'</style>');
const browser=await chromium.launch({executablePath:process.env.BUJO_CHROMIUM || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try {
 for(const dark of [false,true]) {
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await page.setContent(html);
  if(dark)await page.locator('body').evaluate(body=>body.classList.add('theme-dark'));
  await page.screenshot({path:'docs/appearance-'+(dark?'dark':'light')+'.png',fullPage:true});
  await page.close();
 }
} finally {await browser.close();}
