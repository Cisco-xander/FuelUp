import type { Goal } from "@/lib/fuelup-logic";

export type Sex = "male" | "female";

export interface SavedTarget {
  sex: Sex;
  age: number;
  weightKg: number;
  heightCm: number;
  activity: number;
  goal: Goal;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  warning?: string;
}

export interface FuelUpUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  isPhoneVerified: boolean;
  otpCode: string;
  resetCode?: string;
  createdAt: string;
}

export interface FuelUpState {
  users: FuelUpUser[];
  currentUserId: string | null;
  targets: Record<string, SavedTarget>;
}

const STORAGE_KEY = "fuelup-local-state-v1";

const defaultState: FuelUpState = {
  users: [],
  currentUserId: null,
  targets: {},
};

function readState(): FuelUpState {
  if (typeof window === "undefined") {
    return defaultState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState;
    }

    const parsed = JSON.parse(raw) as FuelUpState;
    return {
      users: parsed.users ?? [],
      currentUserId: parsed.currentUserId ?? null,
      targets: parsed.targets ?? {},
    };
  } catch {
    return defaultState;
  }
}

function writeState(state: FuelUpState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createOtp() {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

export function getCurrentUser(): FuelUpUser | null {
  const state = readState();
  if (!state.currentUserId) {
    return null;
  }

  return state.users.find((user) => user.id === state.currentUserId) ?? null;
}

export function getUserTarget(userId: string): SavedTarget | null {
  const state = readState();
  return state.targets[userId] ?? null;
}

export function saveUserTarget(userId: string, target: SavedTarget) {
  const state = readState();
  if (!state.users.some((user) => user.id === userId)) {
    throw new Error("User not found.");
  }

  state.targets[userId] = target;
  writeState(state);
  return target;
}

export function signUpUser(payload: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): FuelUpUser {
  const state = readState();
  const normalizedEmail = payload.email.trim().toLowerCase();
  const normalizedPhone = payload.phone.trim();

  const emailExists = state.users.some(
    (user) => user.email.toLowerCase() === normalizedEmail,
  );
  const phoneExists = state.users.some((user) => user.phone === normalizedPhone);

  if (emailExists || phoneExists) {
    throw new Error("An account with that email or phone already exists.");
  }

  const user: FuelUpUser = {
    id: `user_${Date.now()}`,
    name: payload.name.trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    password: payload.password,
    isPhoneVerified: false,
    otpCode: createOtp(),
    createdAt: new Date().toISOString(),
  };

  state.users.push(user);
  state.currentUserId = user.id;
  writeState(state);

  return user;
}

export function loginUser(payload: {
  email: string;
  password: string;
}): FuelUpUser {
  const state = readState();
  const user = state.users.find(
    (entry) =>
      entry.email.toLowerCase() === payload.email.trim().toLowerCase() &&
      entry.password === payload.password,
  );

  if (!user) {
    throw new Error("Incorrect email or password.");
  }

  state.currentUserId = user.id;
  writeState(state);
  return user;
}

export function verifyPhoneOtp(userId: string, otpCode: string) {
  const state = readState();
  const user = state.users.find((entry) => entry.id === userId);

  if (!user) {
    throw new Error("User was not found.");
  }

  if (user.otpCode !== otpCode.trim()) {
    throw new Error("The OTP code is incorrect.");
  }

  user.isPhoneVerified = true;
  writeState(state);
  return user;
}

export function requestPasswordReset(email: string) {
  const state = readState();
  const user = state.users.find(
    (entry) => entry.email.toLowerCase() === email.trim().toLowerCase(),
  );

  if (!user) {
    throw new Error("No account matches that email.");
  }

  user.resetCode = createOtp();
  writeState(state);
  return user;
}

export function resetPassword(payload: {
  email: string;
  otpCode: string;
  newPassword: string;
}) {
  const state = readState();
  const user = state.users.find(
    (entry) => entry.email.toLowerCase() === payload.email.trim().toLowerCase(),
  );

  if (!user || user.resetCode !== payload.otpCode.trim()) {
    throw new Error("The reset code is invalid.");
  }

  user.password = payload.newPassword;
  user.resetCode = undefined;
  writeState(state);
  return user;
}

export function logoutUser() {
  const state = readState();
  state.currentUserId = null;
  writeState(state);
  return true;
}
