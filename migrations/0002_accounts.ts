export const statements = [
  `CREATE TABLE app_users (
    id TEXT PRIMARY KEY NOT NULL CHECK (length(id) > 0)
  )`,
  `CREATE TABLE provider_identities (
    provider TEXT NOT NULL CHECK (length(provider) > 0),
    subject TEXT NOT NULL CHECK (length(subject) > 0),
    user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    PRIMARY KEY (provider, subject)
  )`,
  `CREATE INDEX provider_identities_user_id_idx ON provider_identities(user_id)`,
];
