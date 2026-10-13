async function main() {
  for(const route of ["/login","/","/users","/register","/add-admin","/images/logo/coolerguru-logo-image.png","/api/admin-backend/auth/me"]) {
    const res=await fetch(`http://localhost:3001${route}`,{redirect:"manual"});
    console.log(`${route}: ${res.status}${res.headers.get("location") ? ` -> ${res.headers.get("location")}` : ""}`);
    if(route==="/login" && res.status!==200) throw new Error("Login unavailable");
    if(["/","/users","/register","/add-admin"].includes(route) && !res.headers.get("location")?.endsWith("/login")) throw new Error(`Unprotected route ${route}`);
  }
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
