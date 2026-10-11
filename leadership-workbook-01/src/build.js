const fs=require('fs'),path=require('path');const {chromium}=require('playwright');
(async()=>{
 const B=__dirname; const parts=['p1.html','p2.html','p3.html'].filter(f=>fs.existsSync(path.join(B,f)));
 const html=`<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>명문 리더십 교육 1회차 워크북</title><link rel="stylesheet" href="style.css"></head><body>${parts.map(f=>fs.readFileSync(path.join(B,f),'utf8')).join('\n')}</body></html>`;
 fs.writeFileSync(path.join(B,'workbook.html'),html);
 const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
 const pg=await br.newPage({viewport:{width:794,height:1123},deviceScaleFactor:1});
 await pg.goto('file://'+path.join(B,'workbook.html'),{waitUntil:'networkidle'});
 await pg.evaluate(()=>document.fonts.ready);
 // overflow check
 const of=await pg.evaluate(()=>[...document.querySelectorAll('.page')].map((p,i)=>{const r=p.getBoundingClientRect();let mx=0;p.querySelectorAll('*').forEach(e=>{if(e.closest('.pn')||e.closest('.cover'))return;const b=e.getBoundingClientRect();if(b.height>0)mx=Math.max(mx,b.bottom-r.top)});return [i+1,Math.round(mx)]}));
 console.log(JSON.stringify(of.filter(x=>x[1]>1123-62)));
 const n=await pg.$$eval('.page',a=>a.length);
 fs.mkdirSync(path.join(B,'shots'),{recursive:true});
 const pages=await pg.$$('.page'); const only=process.argv[2]?process.argv[2].split(',').map(Number):null;
 for(let i=0;i<pages.length;i++){ if(only&&!only.includes(i+1))continue; await pages[i].screenshot({path:path.join(B,'shots',`p${String(i+1).padStart(2,'0')}.png`)});}
 if(process.argv[3]==='pdf'){await pg.pdf({path:path.join(B,'workbook.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true});}
 console.log('pages',n); await br.close();
})();
