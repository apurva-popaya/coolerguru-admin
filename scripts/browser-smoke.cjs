const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const out = path.resolve("artifacts/screenshots");
fs.mkdirSync(out,{recursive:true});
const browser = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe",["--headless=new","--disable-gpu","--no-first-run","--remote-debugging-port=9223",`--user-data-dir=${path.join(out,"cdp-profile")}`,"about:blank"],{windowsHide:true,stdio:"ignore"});
async function main() {
  let page;
  for(let i=0;i<50;i++) { try { page=(await (await fetch("http://127.0.0.1:9223/json/list")).json()).find(p=>p.type==="page"); if(page)break; } catch {} await new Promise(r=>setTimeout(r,100)); }
  assert.ok(page,"Chrome debugging endpoint unavailable");
  const socket=new WebSocket(page.webSocketDebuggerUrl); await new Promise(r=>socket.addEventListener("open",r,{once:true}));
  let id=0;const pending=new Map();
  socket.addEventListener("message",event=>{const msg=JSON.parse(event.data);if(msg.id){const p=pending.get(msg.id);pending.delete(msg.id);msg.error?p.reject(new Error(msg.error.message)):p.resolve(msg.result);}});
  const call=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}));});
  const evaluate=async(expression)=>(await call("Runtime.evaluate",{expression,returnByValue:true})).result.value;
  await call("Page.enable");
  for(const [name,width,height,mobile] of [["login-desktop",1440,1000,false],["login-mobile",390,844,true]]) {
    await call("Emulation.setDeviceMetricsOverride",{width,height,deviceScaleFactor:1,mobile});
    await call("Page.navigate",{url:"http://localhost:3001/login"});
    for(let i=0;i<100;i++){if(await evaluate('document.readyState === "complete" && !!document.querySelector("form")'))break;await new Promise(r=>setTimeout(r,100));}
    await new Promise(r=>setTimeout(r,1000));
    const dimensions=await evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth})');
    console.log(`${name}: viewport ${dimensions.width}, content ${dimensions.scroll}`);
    assert.equal(dimensions.scroll,dimensions.width,"Horizontal overflow");
    const screenshot=await call("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
    fs.writeFileSync(path.join(out,`${name}.png`),Buffer.from(screenshot.data,"base64"));
  }
  console.log("PASS: desktop/mobile login render without horizontal overflow.");
  await call("Browser.close"); socket.close();
}
main().catch(e=>{console.error(e.message);browser.kill();process.exitCode=1;});
