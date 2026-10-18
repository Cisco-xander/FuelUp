export type Gender = "male" | "female";
export type Goal = "gain" | "loss" | "maintain";
export type DeliveryZone =
  | "westlands"
  | "kilimani"
  | "kasarani"
  | "mombasa-road"
  | "pickup"
  | "other";

export interface DailyTargetInput {
  sex: Gender;
  age: number;
  weightKg: number;
  heightCm: number;
  activity: number;
  goal: Goal;
}

export interface DailyTargetResult {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  goalLabel: string;
  warning?: string;
}

const GOAL_LABELS: Record<Goal, string> = {
  gain: "Build muscle",
  loss: "Lose fat",
  maintain: "Maintain",
};

export function calculateDailyTargets(
  input: DailyTargetInput,
): DailyTargetResult {
  const { sex, age, weightKg, heightCm, activity, goal } = input;

  if (!Number.isFinite(age) || age <= 0) {
    throw new Error("Age must be a positive number.");
  }

  if (!Number.isFinite(weightKg) || weightKg <= 0) {
    throw new Error("Weight must be greater than zero.");
  }

  if (!Number.isFinite(heightCm) || heightCm <= 0) {
    throw new Error("Height must be greater than zero.");
  }

  if (!Number.isFinite(activity) || activity <= 0) {
    throw new Error("Activity must be greater than zero.");
  }

  const bmr =
    10 * weightKg +
    6.25 * heightCm -
    5 * age +
    (sex === "male" ? 5 : -161);

  let kcal = Math.round(bmr * activity);

  if (goal === "gain") {
    kcal += 300;
  } else if (goal === "loss") {
    kcal -= 400;
  }

  const warning =
    age < 18
      ? "Users under 18 should get guidance from a qualified nutrition professional before following a calorie target."
      : undefined;

  kcal = Math.round(kcal / 10) * 10;
  const minimumSafeCalories = age < 18 ? 1600 : 1400;
  kcal = Math.max(kcal, minimumSafeCalories);

  const proteinPerKg =
    goal === "gain" ? 2.0 : goal === "loss" ? 2.2 : 1.8;
  const proteinG = Math.round(weightKg * proteinPerKg);
  const fatG = Math.round((kcal * 0.27) / 9);
  const remainingCalories = kcal - proteinG * 4 - fatG * 9;
  const carbsG = Math.max(0, Math.round(remainingCalories / 4));

  return {
    kcal,
    proteinG,
    carbsG,
    fatG,
    goalLabel: GOAL_LABELS[goal],
    warning,
  };
}

export function calculateCustomMealPricePerServing({
  ingredientCostKes,
  prepDeliveryPercent = 35,
}: {
  ingredientCostKes: number;
  prepDeliveryPercent?: number;
}): number {
  if (!Number.isFinite(ingredientCostKes) || ingredientCostKes < 0) {
    throw new Error("Ingredient cost must be zero or greater.");
  }

  return Math.round(ingredientCostKes * (1 + prepDeliveryPercent / 100));
}

export function getDeliveryFee(zone: string, subtotalKes = 0): number {
  const normalized = zone.toLowerCase();

  if (normalized === "pickup") {
    return 0;
  }

  const feeMap: Record<string, number> = {
    westlands: 100,
    kilimani: 100,
    "mombasa-road": 150,
    kasarani: 200,
  };

  if (feeMap[normalized] !== undefined) {
    return feeMap[normalized];
  }

  return subtotalKes > 0 ? 150 : 0;
}
