import { fileURLToPath } from "node:url";
import { isAbsolute, resolve } from "node:path";

export type DatabaseEnvironment = {
  DATABASE_URL?: string;
  DATABASE_AUTH_TOKEN?: string;
};

export type DatabaseConfig =
  | { kind: "file"; url: string; filePath: string }
  | { kind: "remote"; url: string; authToken?: string };

function fileConfig(path: string, projectRoot: string): DatabaseConfig {
  if (!path || path.includes("?") || path.includes("#")) {
    throw new Error("Invalid DATABASE_URL file path");
  }

  const filePath = isAbsolute(path) ? path : resolve(projectRoot, path);
  return { kind: "file", filePath, url: `file:${filePath.replaceAll("\\", "/")}` };
}

export function parseDatabaseConfig(
  env: DatabaseEnvironment,
  projectRoot = process.cwd(),
): DatabaseConfig {
  const rawUrl = env.DATABASE_URL;
  const token = env.DATABASE_AUTH_TOKEN;

  if (token !== undefined && !token.trim()) {
    throw new Error("DATABASE_AUTH_TOKEN cannot be blank");
  }

  if (rawUrl === undefined) {
    if (token !== undefined) {
      throw new Error("DATABASE_AUTH_TOKEN requires a remote DATABASE_URL");
    }
    return fileConfig("data/menuly.db", projectRoot);
  }

  if (!rawUrl.trim()) {
    throw new Error("DATABASE_URL cannot be blank");
  }

  if (rawUrl.startsWith("file:")) {
    if (token !== undefined) {
      throw new Error("DATABASE_AUTH_TOKEN cannot be used with a file database");
    }

    const path = rawUrl.startsWith("file://")
      ? fileURLToPath(rawUrl)
      : decodeURIComponent(rawUrl.slice("file:".length));
    return fileConfig(path, projectRoot);
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("DATABASE_URL must be a file or HTTP(S) URL");
  }

  if (!(["http:", "https:"] as string[]).includes(parsed.protocol) || !parsed.hostname) {
    throw new Error("DATABASE_URL must be a file or HTTP(S) URL");
  }
  if (parsed.username || parsed.password || parsed.hash || parsed.search) {
    throw new Error("DATABASE_URL must not contain credentials, a query, or a fragment");
  }

  return { kind: "remote", url: rawUrl, ...(token ? { authToken: token } : {}) };
}
