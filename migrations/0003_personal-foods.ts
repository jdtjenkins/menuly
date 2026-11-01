export const statements = [
  `CREATE TABLE personal_foods (
    id TEXT PRIMARY KEY NOT NULL CHECK (length(id) > 0),
    user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 100),
    unit TEXT NOT NULL CHECK (unit IN ('g', 'ml')),
    reference_amount REAL NOT NULL CHECK (typeof(reference_amount) IN ('integer', 'real') AND reference_amount > 0 AND reference_amount <= 1000000000000),
    calories REAL NOT NULL CHECK (typeof(calories) IN ('integer', 'real') AND calories >= 0 AND calories <= 1000000000000),
    protein REAL CHECK (protein IS NULL OR (typeof(protein) IN ('integer', 'real') AND protein >= 0 AND protein <= 1000000000000)),
    carbohydrates REAL CHECK (carbohydrates IS NULL OR (typeof(carbohydrates) IN ('integer', 'real') AND carbohydrates >= 0 AND carbohydrates <= 1000000000000)),
    fat REAL CHECK (fat IS NULL OR (typeof(fat) IN ('integer', 'real') AND fat >= 0 AND fat <= 1000000000000))
  )`,
  `CREATE INDEX personal_foods_owner_name_idx ON personal_foods(user_id, name COLLATE NOCASE, id)`,
];
