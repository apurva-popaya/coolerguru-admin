// Backend cookies must belong to the frontend host when forwarded by Next.js.
export function frontendCookie(setCookie: string, secure: boolean) {
  let cookie = setCookie.replace(/;\s*Domain=[^;]*/gi, "").replace(/;\s*Path=[^;]*/gi, "");
  cookie = cookie.replace(/;\s*SameSite=[^;]*/gi, "; SameSite=Lax");
  if (!secure) cookie = cookie.replace(/;\s*Secure\b/gi, "");
  return `${cookie}; Path=/`;
}
