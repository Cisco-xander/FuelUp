export type MealGoal = "gain" | "loss" | "maintain";

export interface Meal {
  id: string;
  emoji: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  priceKes: number;
  goals: MealGoal[];
  diets: string[];
}

export const goalLabels: Record<MealGoal | "all", string> = {
  all: "All goals",
  gain: "Build muscle",
  loss: "Lose fat",
  maintain: "Maintain",
};

export const meals: Meal[] = [
  {
    id: "grilled-chicken-bowl",
    emoji: "🍗",
    name: "Grilled chicken & rice bowl",
    kcal: 620,
    protein: 48,
    carbs: 70,
    fat: 14,
    priceKes: 650,
    goals: ["gain", "maintain"],
    diets: [],
  },
  {
    id: "beef-sweet-potato",
    emoji: "🥩",
    name: "Beef steak, sweet potato & greens",
    kcal: 710,
    protein: 52,
    carbs: 58,
    fat: 28,
    priceKes: 820,
    goals: ["gain"],
    diets: [],
  },
  {
    id: "tilapia-ugali",
    emoji: "🐟",
    name: "Tilapia, ugali & sukuma wiki",
    kcal: 480,
    protein: 42,
    carbs: 50,
    fat: 10,
    priceKes: 600,
    goals: ["loss", "maintain"],
    diets: [],
  },
  {
    id: "egg-white-omelette",
    emoji: "🥚",
    name: "Egg-white veggie omelette",
    kcal: 320,
    protein: 30,
    carbs: 12,
    fat: 16,
    priceKes: 450,
    goals: ["loss"],
    diets: ["vegetarian"],
  },
  {
    id: "lentil-curry",
    emoji: "🍛",
    name: "Lentil & chickpea curry with brown rice",
    kcal: 540,
    protein: 26,
    carbs: 82,
    fat: 12,
    priceKes: 520,
    goals: ["maintain", "loss"],
    diets: ["vegetarian", "halal"],
  },
  {
    id: "overnight-oats",
    emoji: "🥣",
    name: "Overnight oats, whey & banana",
    kcal: 450,
    protein: 34,
    carbs: 58,
    fat: 9,
    priceKes: 400,
    goals: ["gain", "maintain"],
    diets: ["vegetarian"],
  },
  {
    id: "chicken-salad",
    emoji: "🥗",
    name: "Chicken Caesar-style salad (light)",
    kcal: 380,
    protein: 38,
    carbs: 14,
    fat: 18,
    priceKes: 560,
    goals: ["loss"],
    diets: ["gluten-free"],
  },
  {
    id: "turkey-burrito",
    emoji: "🌯",
    name: "Turkey & bean burrito wrap",
    kcal: 560,
    protein: 40,
    carbs: 62,
    fat: 16,
    priceKes: 600,
    goals: ["gain", "maintain"],
    diets: [],
  },
  {
    id: "goat-stew",
    emoji: "🍲",
    name: "Goat stew, quinoa & kachumbari",
    kcal: 590,
    protein: 44,
    carbs: 48,
    fat: 22,
    priceKes: 700,
    goals: ["maintain", "gain"],
    diets: ["gluten-free", "halal"],
  },
  {
    id: "protein-bites",
    emoji: "🥜",
    name: "Peanut butter protein bites (4)",
    kcal: 280,
    protein: 16,
    carbs: 22,
    fat: 14,
    priceKes: 300,
    goals: ["gain"],
    diets: ["vegetarian"],
  },
  {
    id: "tofu-scramble",
    emoji: "🍳",
    name: "Tofu scramble & avocado",
    kcal: 410,
    protein: 28,
    carbs: 22,
    fat: 24,
    priceKes: 480,
    goals: ["loss", "maintain"],
    diets: ["vegetarian", "gluten-free"],
  },
  {
    id: "lean-beef-pasta",
    emoji: "🍝",
    name: "Lean beef pasta, whole-wheat",
    kcal: 650,
    protein: 46,
    carbs: 78,
    fat: 16,
    priceKes: 680,
    goals: ["gain"],
    diets: [],
  },
];

export const dietOptions = [
  "Any diet",
  "vegetarian",
  "halal",
  "gluten-free",
];

export const deliveryZones = [
  { id: "westlands", label: "Westlands", feeKes: 100 },
  { id: "kilimani", label: "Kilimani", feeKes: 100 },
  { id: "mombasa-road", label: "Mombasa Road", feeKes: 150 },
  { id: "kasarani", label: "Kasarani", feeKes: 200 },
  { id: "pickup", label: "Pickup at my gym", feeKes: 0 },
];
