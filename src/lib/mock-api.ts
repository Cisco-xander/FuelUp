import { deliveryZones, meals } from "@/lib/mock-data";

export async function getMeals() {
  return meals;
}

export async function getDeliveryZones() {
  return deliveryZones;
}

export async function getDashboardSummary() {
  return {
    totals: {
      activeMeals: meals.length,
      zones: deliveryZones.length,
    },
    note: "Mock API layer active. Replace with Supabase later.",
  };
}
