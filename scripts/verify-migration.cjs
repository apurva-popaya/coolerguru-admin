const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function(spec, parent, ...rest) {
  if (spec.startsWith("@/")) spec = path.resolve("src", spec.slice(2));
  return originalResolve.call(this, spec, parent, ...rest);
};
require.extensions[".ts"] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file,"utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, file);
const { NextRequest } = require("next/server");
const { proxy } = require("../src/proxy.ts");
const { POST: forward } = require("../src/app/api/admin-backend/[...path]/route.ts");
const { apiRequest } = require("../src/lib/api/api-client.ts");
const { fetchAdminExport } = require("../src/lib/api/admin-export.ts");
const { getPortalForPath } = require("../src/lib/auth/auth-portal.ts");
const { csvToExcelBlob } = require("../src/lib/csv-to-excel.ts");
const { loginAdmin, addAdmin } = require("../src/lib/api/admin-auth-api.ts");
const json = (body, status=200, headers={}) => Response.json(body,{status,headers});
async function main() {
  for(const route of ["/","/login","/users","/supplier"]) assert.equal(getPortalForPath(route),"ADMIN");
  global.fetch=()=>{throw new Error("Unexpected backend request without admin cookies");};
  for(const route of ["/","/users","/register","/add-admin","/products/demo/edit"]) {
    const res=await proxy(new NextRequest(`https://admin.coolerguru.com${route}`));
    assert.equal(res.headers.get("location"),"https://admin.coolerguru.com/login");
  }
  assert.equal((await proxy(new NextRequest("https://admin.coolerguru.com/login"))).headers.get("location"),null);
  const req=route=>new NextRequest(`https://admin.coolerguru.com${route}`,{headers:{cookie:"admin_refresh_token=old; buyer_access_token=buyer"}});
  global.fetch=async(_url,opts)=>{
    assert.equal(opts.headers["X-Auth-Portal"],"ADMIN");
    return json({user:{active_portal:"ADMIN",roles:["ADMIN"]}},200,{"set-cookie":"admin_access_token=fresh; Domain=api.coolerguru.com; Path=/api; HttpOnly; Secure; SameSite=None"});
  };
  const renewed=await proxy(req("/users"));
  assert.match(renewed.headers.get("set-cookie"),/Path=\//);
  assert.doesNotMatch(renewed.headers.get("set-cookie"),/Domain=/);
  assert.match(renewed.headers.get("x-middleware-request-cookie"),/admin_access_token=fresh/);
  assert.equal((await proxy(req("/login"))).headers.get("location"),"https://admin.coolerguru.com/");
  for(const user of [{active_portal:"BUYER",roles:["ADMIN"]},{active_portal:"ADMIN",roles:["BUYER"]}]) {
    global.fetch=async()=>json({user});
    assert.match((await proxy(req("/"))).headers.get("location"),/\/login$/);
  }
  global.fetch=async(url,opts)=>{
    assert.match(url,/\/admin\/users\?page=2$/);
    assert.equal(opts.headers.get("X-Auth-Portal"),"ADMIN");
    assert.equal(opts.headers.get("Cookie"),"admin_refresh_token=old");
    assert.equal(Buffer.from(opts.body).toString(),"payload");
    return new Response("csv",{headers:{"content-type":"text/csv","content-disposition":"attachment; filename=export.csv","set-cookie":"admin_refresh_token=new; Domain=api.coolerguru.com; Path=/; Secure"}});
  };
  const forwarded=await forward(new NextRequest("http://localhost:3001/api/admin-backend/admin/users?page=2",{method:"POST",headers:{cookie:"admin_refresh_token=old; buyer_access_token=buyer"},body:"payload"}),{params:Promise.resolve({path:["admin","users"]})});
  assert.equal(await forwarded.text(),"csv");
  assert.match(forwarded.headers.get("content-disposition"),/export.csv/);
  assert.doesNotMatch(forwarded.headers.get("set-cookie"),/Domain=|Secure/);
  global.window={location:{pathname:"/"}};
  let calls=[];
  global.fetch=async(url,opts)=>{
    calls.push(url); assert.equal(new Headers(opts.headers).get("X-Auth-Portal"),"ADMIN");
    if(url.endsWith("/auth/refresh")) return json({success:true});
    return calls.filter(u=>u===url).length===1 ? json({},401) : json({success:true});
  };
  await apiRequest("/admin/users",{portal:"BUYER"});
  assert.deepEqual(calls,["/api/admin-backend/admin/users","/api/admin-backend/auth/refresh","/api/admin-backend/admin/users"]);
  calls=[]; await fetchAdminExport("/products/export",{method:"GET"}); assert.equal(calls.length,3);
  calls=[]; await addAdmin("Test","test@example.com","secret","secret"); assert.equal(calls.length,3);
  calls=[]; await assert.rejects(loginAdmin("test@example.com","bad")); assert.equal(calls.length,1);
  global.fetch=async(url,opts)=>{
    assert.equal(url,"/api/admin-backend/uploads"); assert.ok(opts.body instanceof FormData);
    assert.equal(new Headers(opts.headers).get("Content-Type"),null);
    return json({success:true});
  };
  await apiRequest("/uploads",{method:"POST",body:new FormData()});
  global.fetch=async(url,opts)=>{assert.equal(url,"/api/admin-backend/auth/logout");assert.equal(new Headers(opts.headers).get("X-Auth-Portal"),"ADMIN");return json({success:true});};
  await require("../src/lib/api/auth-session-api.ts").logoutUser();
  const blob=await csvToExcelBlob('Name,Phone\n"Demo, Company",0123456789',"Companies"); assert.ok(blob.size>100);
  console.log("PASS: portal isolation, protected/auth routes, role checks, cookie rotation/forwarding, backend paths, exports, refresh/retry, login, add-admin, multipart uploads, logout, Excel conversion (mock backend).");
}
main().catch(e=>{console.error(e);process.exitCode=1;});
