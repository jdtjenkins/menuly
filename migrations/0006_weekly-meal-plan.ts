export const statements = [
  `CREATE TABLE planned_meals (
    id TEXT PRIMARY KEY NOT NULL CHECK (length(id) > 0),
    user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    meal_id TEXT NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    weekday INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6),
    servings REAL NOT NULL CHECK (typeof(servings) IN ('integer', 'real') AND servings > 0 AND servings < 1e999)
  )`,
  `CREATE INDEX planned_meals_owner_day_idx ON planned_meals(user_id, weekday, id)`,
  `CREATE INDEX planned_meals_meal_idx ON planned_meals(meal_id)`,
];
