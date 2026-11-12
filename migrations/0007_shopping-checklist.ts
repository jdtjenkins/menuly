export const statements = [
  `CREATE TABLE shopping_checks (
    user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    food_source TEXT NOT NULL CHECK (food_source IN ('global', 'personal')),
    food_id TEXT NOT NULL CHECK (length(food_id) > 0),
    observed_amount REAL NOT NULL CHECK (typeof(observed_amount) IN ('integer', 'real') AND observed_amount > 0 AND observed_amount < 1e999),
    PRIMARY KEY (user_id, food_source, food_id)
  )`,
];
