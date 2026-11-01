export const statements = [
  "ALTER TABLE personal_foods ADD COLUMN archived_at TEXT",
  "CREATE INDEX personal_foods_owner_active_name_idx ON personal_foods(user_id, archived_at, name COLLATE NOCASE, id)",
];
