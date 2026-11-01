export type PersonalFoodValues = {
  name: string;
  unit: "g" | "ml";
  referenceAmount: number;
  calories: number;
  protein: number | null;
  carbohydrates: number | null;
  fat: number | null;
};

export type PersonalFoodField = "name" | "unit" | "referenceAmount" | "calories" | "protein" | "carbohydrates" | "fat";
export type PersonalFoodInput = Record<PersonalFoodField, string>;
export type PersonalFoodErrors = Partial<Record<PersonalFoodField, string>>;

const fields: PersonalFoodField[] = ["name", "unit", "referenceAmount", "calories", "protein", "carbohydrates", "fat"];
const decimal = /^\d+(?:\.\d{1,6})?$/;
const maximum = 1_000_000_000_000;

export function personalFoodInput(formData: FormData): PersonalFoodInput {
  return Object.fromEntries(fields.map((field) => [field, String(formData.get(field) ?? "").trim()])) as PersonalFoodInput;
}

export function validatePersonalFood(input: PersonalFoodInput):
  | { ok: true; values: PersonalFoodValues }
  | { ok: false; errors: PersonalFoodErrors } {
  const errors: PersonalFoodErrors = {};
  const name = input.name.trim();
  if (!name || name.length > 100) errors.name = "Enter a name up to 100 characters.";
  if (input.unit !== "g" && input.unit !== "ml") errors.unit = "Choose g or ml.";

  const parseNumber = (field: Exclude<PersonalFoodField, "name" | "unit">, required: boolean): number | null => {
    const raw = input[field].trim();
    if (!raw && !required) return null;
    const value = Number(raw);
    if (!raw || !decimal.test(raw) || !Number.isFinite(value) || value > maximum || (field === "referenceAmount" ? value <= 0 : value < 0)) {
      errors[field] = field === "referenceAmount" ? "Enter a positive amount." : "Enter a number of zero or more.";
      return null;
    }
    return value;
  };

  const referenceAmount = parseNumber("referenceAmount", true);
  const calories = parseNumber("calories", true);
  const protein = parseNumber("protein", false);
  const carbohydrates = parseNumber("carbohydrates", false);
  const fat = parseNumber("fat", false);
  if (Object.keys(errors).length || referenceAmount === null || calories === null) return { ok: false, errors };
  return { ok: true, values: { name, unit: input.unit as "g" | "ml", referenceAmount, calories, protein, carbohydrates, fat } };
}
