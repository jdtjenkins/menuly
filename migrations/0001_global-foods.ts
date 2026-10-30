export const statements = [
  `CREATE TABLE global_foods (
    id TEXT PRIMARY KEY NOT NULL CHECK (length(trim(id)) > 0),
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    unit TEXT NOT NULL CHECK (unit IN ('g', 'ml')),
    reference_amount REAL NOT NULL CHECK (typeof(reference_amount) IN ('integer', 'real') AND reference_amount > 0),
    calories REAL CHECK (calories IS NULL OR (typeof(calories) IN ('integer', 'real') AND calories >= 0)),
    protein REAL CHECK (protein IS NULL OR (typeof(protein) IN ('integer', 'real') AND protein >= 0)),
    carbohydrates REAL CHECK (carbohydrates IS NULL OR (typeof(carbohydrates) IN ('integer', 'real') AND carbohydrates >= 0)),
    fat REAL CHECK (fat IS NULL OR (typeof(fat) IN ('integer', 'real') AND fat >= 0))
  )`,
];
