import { createHash, generateKeyPairSync, randomUUID, sign } from "node:crypto";
import { createServer } from "node:http";
import type { IncomingMessage } from "node:http";

const issuer = "http://127.0.0.1:3101";
const { publicKey, privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const publicJwk = publicKey.export({ format: "jwk" });
const codes = new Map<string, { nonce: string; challenge: string }>();

function json(data: unknown) { return JSON.stringify(data); }
function b64(data: unknown) { return Buffer.from(json(data)).toString("base64url"); }
function token(payload: Record<string, unknown>) {
  const body = `${b64({ alg: "RS256", typ: "JWT", kid: "local-test-key" })}.${b64(payload)}`;
  return `${body}.${sign("RSA-SHA256", Buffer.from(body), privateKey).toString("base64url")}`;
}
async function body(request: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return new URLSearchParams(Buffer.concat(chunks).toString());
}

createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", issuer);
  response.setHeader("Cache-Control", "no-store");
  if (url.pathname === "/.well-known/openid-configuration") {
    response.setHeader("Content-Type", "application/json");
    response.end(json({ issuer, authorization_endpoint: `${issuer}/authorize`, token_endpoint: `${issuer}/token`,
      jwks_uri: `${issuer}/jwks`, userinfo_endpoint: `${issuer}/userinfo`,
      response_types_supported: ["code"], subject_types_supported: ["public"],
      id_token_signing_alg_values_supported: ["RS256"], token_endpoint_auth_methods_supported: ["client_secret_basic", "client_secret_post"],
      code_challenge_methods_supported: ["S256"] }));
    return;
  }
  if (url.pathname === "/jwks") {
    response.setHeader("Content-Type", "application/json");
    response.end(json({ keys: [{ ...publicJwk, kid: "local-test-key", alg: "RS256", use: "sig" }] }));
    return;
  }
  if (url.pathname === "/authorize") {
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    const params = url.searchParams.toString().replaceAll("&", "&amp;");
    response.end(`<h1>Local test identity</h1><a href="/decision?answer=yes&amp;${params}">Continue as Test User</a><br><a href="/decision?answer=no&amp;${params}">Cancel</a>`);
    return;
  }
  if (url.pathname === "/decision") {
    const redirect = new URL(url.searchParams.get("redirect_uri") ?? "http://127.0.0.1:3100/food");
    const state = url.searchParams.get("state");
    if (state) redirect.searchParams.set("state", state);
    if (url.searchParams.get("answer") !== "yes") {
      redirect.searchParams.set("error", "access_denied");
    } else {
      const code = randomUUID();
      codes.set(code, { nonce: url.searchParams.get("nonce") ?? "", challenge: url.searchParams.get("code_challenge") ?? "" });
      redirect.searchParams.set("code", code);
    }
    response.writeHead(302, { Location: redirect.href }).end();
    return;
  }
  if (url.pathname === "/token" && request.method === "POST") {
    const params = await body(request);
    const code = codes.get(params.get("code") ?? "");
    if (!code || (code.challenge && createHash("sha256").update(params.get("code_verifier") ?? "").digest("base64url") !== code.challenge)) {
      response.writeHead(400, { "Content-Type": "application/json" }).end(json({ error: "invalid_grant" }));
      return;
    }
    codes.delete(params.get("code") ?? "");
    const now = Math.floor(Date.now() / 1000);
    response.setHeader("Content-Type", "application/json");
    response.end(json({ token_type: "Bearer", access_token: "fixture-access-token", expires_in: 3600,
      id_token: token({ iss: issuer, aud: "playwright-client", sub: "stable-local-subject", iat: now, exp: now + 3600,
        ...(code.nonce ? { nonce: code.nonce } : {}), email: "private@example.com", name: "Private Test Name", picture: "https://example.invalid/private.png" }) }));
    return;
  }
  if (url.pathname === "/userinfo") {
    response.setHeader("Content-Type", "application/json");
    response.end(json({ sub: "stable-local-subject", email: "private@example.com", name: "Private Test Name" }));
    return;
  }
  response.writeHead(404).end();
}).listen(3101, "127.0.0.1");
