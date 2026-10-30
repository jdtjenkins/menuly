// Illustrative development data per 100 g, or per 100 ml for liquids.
// Values are samples for exercising the app, not authoritative nutrition data.
const foods = [
  ["dev-apple", "Apple", "g", 100, 52, 0.3, 13.8, 0.2],
  ["dev-banana", "Banana", "g", 100, 89, 1.1, 22.8, 0.3],
  ["dev-orange", "Orange", "g", 100, 47, 0.9, 11.8, 0.1],
  ["dev-strawberries", "Strawberries", "g", 100, 32, 0.7, 7.7, 0.3],
  ["dev-blueberries", "Blueberries", "g", 100, 57, 0.7, 14.5, 0.3],
  ["dev-avocado", "Avocado", "g", 100, 160, 2, 8.5, 14.7],
  ["dev-carrot", "Carrot", "g", 100, 41, 0.9, 9.6, 0.2],
  ["dev-broccoli", "Broccoli", "g", 100, 34, 2.8, 6.6, 0.4],
  ["dev-spinach", "Spinach", "g", 100, 23, 2.9, 3.6, 0.4],
  ["dev-tomato", "Tomato", "g", 100, 18, 0.9, 3.9, 0.2],
  ["dev-cucumber", "Cucumber", "g", 100, 15, 0.7, 3.6, 0.1],
  ["dev-potato", "Potato", "g", 100, 77, 2, 17, 0.1],
  ["dev-sweet-potato", "Sweet potato", "g", 100, 86, 1.6, 20.1, 0.1],
  ["dev-onion", "Onion", "g", 100, 40, 1.1, 9.3, 0.1],
  ["dev-brown-rice", "Brown rice, cooked", "g", 100, 111, 2.6, 23, 0.9],
  ["dev-white-rice", "White rice, cooked", "g", 100, 130, 2.7, 28.2, 0.3],
  ["dev-oats", "Oats, dry", "g", 100, 389, 16.9, 66.3, 6.9],
  ["dev-whole-wheat-bread", "Whole wheat bread", "g", 100, 247, 13, 41, 4.2],
  ["dev-egg", "Egg", "g", 100, 143, 12.6, 0.7, 9.5],
  ["dev-chicken-breast", "Chicken breast, cooked", "g", 100, 165, 31, 0, 3.6],
  ["dev-salmon", "Salmon, cooked", "g", 100, 206, 22, 0, 12.4],
  ["dev-tuna", "Tuna, canned", "g", 100, 116, 25.5, 0, 0.8],
  ["dev-ground-beef", "Ground beef, cooked", "g", 100, 250, 26, 0, 15],
  ["dev-tofu", "Tofu, firm", "g", 100, 144, 17.3, 2.8, 8.7],
  ["dev-lentils", "Lentils, cooked", "g", 100, 116, 9, 20.1, 0.4],
  ["dev-chickpeas", "Chickpeas, cooked", "g", 100, 164, 8.9, 27.4, 2.6],
  ["dev-greek-yogurt", "Greek yogurt, plain", "g", 100, 97, 9, 3.9, 5],
  ["dev-whole-milk", "Milk, whole", "ml", 100, 61, 3.2, 4.8, 3.3],
  ["dev-olive-oil", "Olive oil", "ml", 100, 810, 0, 0, 91],
  ["dev-peanut-butter", "Peanut butter", "g", 100, 588, 25, 20, 50],
] as const;

function quote(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

export const statements = foods.map(([id, name, unit, amount, calories, protein, carbohydrates, fat]) =>
  `INSERT INTO global_foods (id, name, unit, reference_amount, calories, protein, carbohydrates, fat)
   VALUES (${quote(id)}, ${quote(name)}, ${quote(unit)}, ${amount}, ${calories}, ${protein}, ${carbohydrates}, ${fat})`,
);
