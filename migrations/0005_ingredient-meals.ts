export const statements = [
  `CREATE TABLE meals (
    id TEXT PRIMARY KEY NOT NULL CHECK (length(id) > 0),
    user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 100),
    serving_yield REAL NOT NULL CHECK (typeof(serving_yield) IN ('integer', 'real') AND serving_yield > 0 AND serving_yield <= 1000000000000)
  )`,
  `CREATE INDEX meals_owner_name_idx ON meals(user_id, name COLLATE NOCASE, id)`,
  `CREATE TABLE meal_ingredients (
    id TEXT PRIMARY KEY NOT NULL CHECK (length(id) > 0),
    meal_id TEXT NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 0),
    amount REAL NOT NULL CHECK (typeof(amount) IN ('integer', 'real') AND amount > 0 AND amount <= 1000000000000),
    global_food_id TEXT REFERENCES global_foods(id),
    personal_food_id TEXT REFERENCES personal_foods(id),
    CHECK ((global_food_id IS NOT NULL) <> (personal_food_id IS NOT NULL)),
    UNIQUE (meal_id, position)
  )`,
  `CREATE INDEX meal_ingredients_meal_position_idx ON meal_ingredients(meal_id, position)`,
  `CREATE INDEX meal_ingredients_personal_food_idx ON meal_ingredients(personal_food_id, meal_id)`,
];
