import type { DatabaseConfig } from "./config";

export function assertDevelopmentSeedTarget(
  config: DatabaseConfig,
  optIn: string | undefined,
  nodeEnv: string | undefined,
): void {
  if (optIn !== "yes") {
    throw new Error("Development seed requires MENULY_DEV_SEED=yes");
  }
  if (nodeEnv === "production") {
    throw new Error("Development seed is disabled in production mode");
  }
  if (config.kind !== "file") {
    throw new Error("Development seed requires a local file database");
  }
}
