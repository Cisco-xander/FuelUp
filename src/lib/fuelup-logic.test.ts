import { describe, expect, it } from "vitest";
import {
  calculateCustomMealPricePerServing,
  calculateDailyTargets,
  getDeliveryFee,
} from "./fuelup-logic";

describe("calculateDailyTargets", () => {
  it("calculates calorie and macro targets using Mifflin-St Jeor and goal adjustments", () => {
    const result = calculateDailyTargets({
      sex: "male",
      age: 28,
      weightKg: 75,
      heightCm: 175,
      activity: 1.55,
      goal: "gain",
    });

    expect(result.kcal).toBe(2950);
    expect(result.proteinG).toBe(150);
    expect(result.carbsG).toBe(387);
    expect(result.fatG).toBe(89);
    expect(result.warning).toBeUndefined();
  });

  it("flags minors and prevents unsafe low calories", () => {
    const result = calculateDailyTargets({
      sex: "female",
      age: 16,
      weightKg: 55,
      heightCm: 165,
      activity: 1.2,
      goal: "loss",
    });

    expect(result.warning).toContain("under 18");
    expect(result.kcal).toBeGreaterThanOrEqual(1600);
  });
});

describe("calculateCustomMealPricePerServing", () => {
  it("adds prep-cost markup and rounds to whole KES", () => {
    const price = calculateCustomMealPricePerServing({
      ingredientCostKes: 150,
      prepDeliveryPercent: 35,
    });

    expect(price).toBe(203);
  });
});

describe("getDeliveryFee", () => {
  it("charges different fees by delivery zone", () => {
    expect(getDeliveryFee("westlands", 500)).toBe(100);
    expect(getDeliveryFee("mombasa-road", 500)).toBe(150);
    expect(getDeliveryFee("pickup", 500)).toBe(0);
  });
});
