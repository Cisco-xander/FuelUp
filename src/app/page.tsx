"use client";

import { useEffect, useMemo, useState } from "react";
import {
  calculateDailyTargets,
  getDeliveryFee,
  type Goal,
} from "@/lib/fuelup-logic";
import {
  getCurrentUser,
  getUserTarget,
  loginUser,
  logoutUser,
  requestPasswordReset,
  resetPassword,
  saveUserTarget,
  signUpUser,
  verifyPhoneOtp,
  type FuelUpUser,
  type SavedTarget,
} from "@/lib/mock-auth";
import {
  deliveryZones,
  dietOptions,
  goalLabels,
  meals,
  type MealGoal,
} from "@/lib/mock-data";

type GoalFilter = MealGoal | "all";
type DietFilter = "Any diet" | "vegetarian" | "halal" | "gluten-free";
type FormState = {
  sex: "male" | "female";
  age: string;
  weightKg: string;
  heightCm: string;
  activity: string;
  goal: Goal;
};

const initialForm: FormState = {
  sex: "male",
  age: "28",
  weightKg: "75",
  heightCm: "175",
  activity: "1.55",
  goal: "gain",
};

export default function Home() {
  const [goalFilter, setGoalFilter] = useState<GoalFilter>("all");
  const [dietFilter, setDietFilter] = useState<DietFilter>("Any diet");
  const [form, setForm] = useState<FormState>(initialForm);
  const [authMode, setAuthMode] = useState<"signup" | "login" | "reset">("signup");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FuelUpUser | null>(null);
  const [savedTarget, setSavedTarget] = useState<SavedTarget | null>(null);
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [resetForm, setResetForm] = useState({
    email: "",
    otpCode: "",
    newPassword: "",
  });
  const [otpInput, setOtpInput] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setSavedTarget(user ? getUserTarget(user.id) : null);
  }, []);

  const target = useMemo(() => {
    return calculateDailyTargets({
      sex: form.sex,
      age: Number(form.age),
      weightKg: Number(form.weightKg),
      heightCm: Number(form.heightCm),
      activity: Number(form.activity),
      goal: form.goal,
    });
  }, [form]);

  const mealResults = useMemo(() => {
    return meals.filter((meal) => {
      const matchesGoal =
        goalFilter === "all" || meal.goals.includes(goalFilter as MealGoal);
      const matchesDiet =
        dietFilter === "Any diet" || meal.diets.includes(dietFilter);

      return matchesGoal && matchesDiet;
    });
  }, [dietFilter, goalFilter]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSignup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const user = signUpUser(signupForm);
      setCurrentUser(user);
      setSavedTarget(getUserTarget(user.id));
      setStatusMessage(
        `Welcome, ${user.name}. Your phone verification code is ${user.otpCode}.`,
      );
      setAuthMode("login");
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to create account.",
      );
    }
  };

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const user = loginUser(loginForm);
      setCurrentUser(user);
      setSavedTarget(getUserTarget(user.id));
      setStatusMessage(
        user.isPhoneVerified
          ? `Welcome back, ${user.name}.`
          : `Phone OTP pending. Code: ${user.otpCode}`,
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to sign in.",
      );
    }
  };

  const handleVerifyPhone = () => {
    if (!currentUser) {
      setStatusMessage("Please sign in to verify your phone number.");
      return;
    }

    try {
      const verifiedUser = verifyPhoneOtp(currentUser.id, otpInput);
      setCurrentUser(verifiedUser);
      setStatusMessage(`Phone verified for ${verifiedUser.name}.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Phone verification failed.",
      );
    }
  };

  const handleResetRequest = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const user = requestPasswordReset(resetForm.email);
      setStatusMessage(
        `Reset code sent for ${user.email}. Use OTP ${user.resetCode}.`,
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to reset password.",
      );
    }
  };

  const handlePasswordReset = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      resetPassword({
        email: resetForm.email,
        otpCode: resetForm.otpCode,
        newPassword: resetForm.newPassword,
      });
      setStatusMessage("Password reset was successful. You can sign in again.");
      setAuthMode("login");
      setResetForm({ email: "", otpCode: "", newPassword: "" });
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to reset password.",
      );
    }
  };

  const handleSaveTarget = () => {
    if (!currentUser) {
      setStatusMessage("Please sign in before saving your target.");
      return;
    }

    const nextTarget: SavedTarget = {
      sex: form.sex,
      age: Number(form.age),
      weightKg: Number(form.weightKg),
      heightCm: Number(form.heightCm),
      activity: Number(form.activity),
      goal: form.goal,
      kcal: target.kcal,
      proteinG: target.proteinG,
      carbsG: target.carbsG,
      fatG: target.fatG,
      warning: target.warning,
    };

    saveUserTarget(currentUser.id, nextTarget);
    setSavedTarget(nextTarget);
    setStatusMessage("Your target was saved to your account.");
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setSavedTarget(null);
    setStatusMessage("You have been signed out.");
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <div className="mx-auto max-w-6xl px-5 pb-14 pt-6 sm:px-6">
        <section className="mb-8 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--card-shadow)]">
          {currentUser ? (
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
                  Customer account
                </p>
                <h2 className="text-3xl font-black uppercase text-[var(--ink)]">
                  Welcome, {currentUser.name}
                </h2>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSaveTarget}
                  className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white"
                >
                  Save my target
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md border border-[var(--line)] bg-[var(--bg)] px-4 py-2 text-sm font-bold text-[var(--ink)]"
                >
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
                  Local-first auth
                </p>
                <h2 className="text-3xl font-black uppercase text-[var(--ink)]">
                  Create your FuelUp account
                </h2>
              </div>

              <div className="flex gap-2 rounded-full border border-[var(--line)] bg-[var(--bg)] p-1">
                {[
                  ["signup", "Sign up"],
                  ["login", "Log in"],
                  ["reset", "Reset"],
                ].map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setAuthMode(mode as "signup" | "login" | "reset")}
                    className={`flex-1 rounded-full px-3 py-2 text-sm font-bold ${
                      authMode === mode
                        ? "bg-[var(--ink)] text-[var(--bg)]"
                        : "text-[var(--muted)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {statusMessage ? (
            <p className="mt-4 rounded-md border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)]">
              {statusMessage}
            </p>
          ) : null}

          {!currentUser && (
            <div className="mt-5">
              {authMode === "signup" && (
                <form onSubmit={handleSignup} className="grid gap-3 md:grid-cols-2">
                  <label className="text-sm font-medium text-[var(--muted)]">
                    Full name
                    <input
                      value={signupForm.name}
                      onChange={(event) =>
                        setSignupForm((current) => ({ ...current, name: event.target.value }))
                      }
                      className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-[var(--ink)]"
                      required
                    />
                  </label>
                  <label className="text-sm font-medium text-[var(--muted)]">
                    Email
                    <input
                      type="email"
                      value={signupForm.email}
                      onChange={(event) =>
                        setSignupForm((current) => ({ ...current, email: event.target.value }))
                      }
                      className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-[var(--ink)]"
                      required
                    />
                  </label>
                  <label className="text-sm font-medium text-[var(--muted)]">
                    Phone
                    <input
                      value={signupForm.phone}
                      onChange={(event) =>
                        setSignupForm((current) => ({ ...current, phone: event.target.value }))
                      }
                      className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-[var(--ink)]"
                      required
                    />
                  </label>
                  <label className="text-sm font-medium text-[var(--muted)]">
                    Password
                    <input
                      type="password"
                      value={signupForm.password}
                      onChange={(event) =>
                        setSignupForm((current) => ({ ...current, password: event.target.value }))
                      }
                      className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-[var(--ink)]"
                      required
                    />
                  </label>
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="rounded-md bg-[var(--accent)] px-5 py-3 font-bold text-white"
                    >
                      Create account
                    </button>
                  </div>
                </form>
              )}

              {authMode === "login" && (
                <form onSubmit={handleLogin} className="grid gap-3 md:grid-cols-2">
                  <label className="text-sm font-medium text-[var(--muted)] md:col-span-1">
                    Email
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(event) =>
                        setLoginForm((current) => ({ ...current, email: event.target.value }))
                      }
                      className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-[var(--ink)]"
                      required
                    />
                  </label>
                  <label className="text-sm font-medium text-[var(--muted)] md:col-span-1">
                    Password
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(event) =>
                        setLoginForm((current) => ({ ...current, password: event.target.value }))
                      }
                      className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-[var(--ink)]"
                      required
                    />
                  </label>
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="rounded-md bg-[var(--accent)] px-5 py-3 font-bold text-white"
                    >
                      Log in
                    </button>
                  </div>
                </form>
              )}

              {authMode === "reset" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <form onSubmit={handleResetRequest} className="space-y-3">
                    <label className="text-sm font-medium text-[var(--muted)]">
                      Email
                      <input
                        type="email"
                        value={resetForm.email}
                        onChange={(event) =>
                          setResetForm((current) => ({ ...current, email: event.target.value }))
                        }
                        className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-[var(--ink)]"
                        required
                      />
                    </label>
                    <button
                      type="submit"
                      className="rounded-md border border-[var(--line)] bg-[var(--bg)] px-4 py-2 font-bold text-[var(--ink)]"
                    >
                      Request reset code
                    </button>
                  </form>

                  <form onSubmit={handlePasswordReset} className="space-y-3">
                    <label className="text-sm font-medium text-[var(--muted)]">
                      OTP code
                      <input
                        value={resetForm.otpCode}
                        onChange={(event) =>
                          setResetForm((current) => ({ ...current, otpCode: event.target.value }))
                        }
                        className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-[var(--ink)]"
                        required
                      />
                    </label>
                    <label className="text-sm font-medium text-[var(--muted)]">
                      New password
                      <input
                        type="password"
                        value={resetForm.newPassword}
                        onChange={(event) =>
                          setResetForm((current) => ({ ...current, newPassword: event.target.value }))
                        }
                        className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-[var(--ink)]"
                        required
                      />
                    </label>
                    <button
                      type="submit"
                      className="rounded-md bg-[var(--accent)] px-4 py-2 font-bold text-white"
                    >
                      Reset password
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {currentUser && !currentUser.isPhoneVerified && (
            <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-bold">Verify your phone number to unlock full ordering.</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  value={otpInput}
                  onChange={(event) => setOtpInput(event.target.value)}
                  placeholder="Enter OTP"
                  className="flex-1 rounded-md border border-amber-300 bg-white px-3 py-2 text-[var(--ink)]"
                />
                <button
                  type="button"
                  onClick={handleVerifyPhone}
                  className="rounded-md bg-[var(--ink)] px-4 py-2 font-bold text-white"
                >
                  Verify phone
                </button>
              </div>
            </div>
          )}

          {currentUser && savedTarget && (
            <div className="mt-5 rounded-lg border border-[var(--line)] bg-[var(--bg)] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
                Saved target
              </p>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
                <span>{savedTarget.kcal} kcal</span>
                <span>{savedTarget.proteinG} g protein</span>
                <span>{savedTarget.carbsG} g carbs</span>
                <span>{savedTarget.fatG} g fat</span>
              </div>
            </div>
          )}
        </section>

        <header className="flex items-center justify-between pb-6">
          <div className="logo text-3xl font-black uppercase tracking-tight text-[var(--ink)]">
            Fuel<span className="text-[var(--accent)]">Up</span>
          </div>

          <nav aria-label="Main navigation" className="hidden gap-6 text-sm font-medium md:flex">
            <a href="#menu" className="text-[var(--ink)] hover:text-[var(--accent)]">
              Menu
            </a>
            <a href="#calculator" className="text-[var(--ink)] hover:text-[var(--accent)]">
              Calculator
            </a>
            <a href="#how" className="text-[var(--ink)] hover:text-[var(--accent)]">
              How it works
            </a>
          </nav>
        </header>

        <section className="grid gap-8 pb-12 pt-4 md:grid-cols-[1.05fr_0.95fr] md:items-start">
          <div className="space-y-6 pt-2">
            <p className="kicker text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
              Gym nutrition, delivered
            </p>
            <h1 className="pr-4 text-5xl font-black uppercase leading-[0.9] tracking-[-0.04em] text-[var(--ink)] sm:text-6xl md:text-7xl">
              Eat for the lifts you do.
            </h1>
            <p className="max-w-xl text-base text-[var(--muted)] sm:text-lg">
              FuelUp helps Nairobi gym-goers hit daily macros faster with meals that
              are ready to cook, easy to order, and built around the goal that matters.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#menu"
                className="rounded-md bg-[var(--accent)] px-5 py-3 font-bold text-white shadow-[var(--card-shadow)] transition hover:opacity-95"
              >
                Browse meals
              </a>
              <button
                type="button"
                onClick={() => setGoalFilter(form.goal)}
                className="rounded-md border border-[var(--line)] bg-[var(--surface)] px-5 py-3 font-bold text-[var(--ink)]"
              >
                Match my goal
              </button>
            </div>
          </div>

          <div id="calculator" className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--card-shadow)]">
            <h2 className="mb-4 text-3xl font-black uppercase text-[var(--ink)]">
              Daily targets
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-[var(--muted)]">
                Sex
                <select
                  value={form.sex}
                  onChange={(event) =>
                    setField("sex", event.target.value as "male" | "female")
                  }
                  className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-[var(--ink)] outline-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </label>

              <label className="text-sm font-medium text-[var(--muted)]">
                Age
                <input
                  type="number"
                  min={14}
                  max={90}
                  value={form.age}
                  onChange={(event) => setField("age", event.target.value)}
                  className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-[var(--ink)] outline-none"
                />
              </label>

              <label className="text-sm font-medium text-[var(--muted)]">
                Weight (kg)
                <input
                  type="number"
                  min={30}
                  max={250}
                  value={form.weightKg}
                  onChange={(event) => setField("weightKg", event.target.value)}
                  className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-[var(--ink)] outline-none"
                />
              </label>

              <label className="text-sm font-medium text-[var(--muted)]">
                Height (cm)
                <input
                  type="number"
                  min={120}
                  max={230}
                  value={form.heightCm}
                  onChange={(event) => setField("heightCm", event.target.value)}
                  className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-[var(--ink)] outline-none"
                />
              </label>

              <label className="text-sm font-medium text-[var(--muted)]">
                Activity
                <select
                  value={form.activity}
                  onChange={(event) => setField("activity", event.target.value)}
                  className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-[var(--ink)] outline-none"
                >
                  <option value="1.375">Train 1–3 days/week</option>
                  <option value="1.55">Train 3–5 days/week</option>
                  <option value="1.725">Train 6–7 days/week</option>
                </select>
              </label>

              <label className="text-sm font-medium text-[var(--muted)]">
                Goal
                <select
                  value={form.goal}
                  onChange={(event) => {
                    const nextGoal = event.target.value as Goal;
                    setField("goal", nextGoal);
                  }}
                  className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-[var(--ink)] outline-none"
                >
                  <option value="gain">Build muscle</option>
                  <option value="loss">Lose fat</option>
                  <option value="maintain">Maintain</option>
                </select>
              </label>
            </div>

            <div className="mt-5 border-t border-[var(--line)] pt-4">
              <div className="text-5xl font-black leading-none text-[var(--ink)]">
                {target.kcal}
                <span className="ml-2 align-middle text-base font-semibold text-[var(--muted)]">
                  kcal / day
                </span>
              </div>

              <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-[var(--bg)]">
                <span
                  className="block bg-[var(--green)]"
                  style={{ width: `${Math.min(100, (target.proteinG * 4 * 100) / target.kcal)}%` }}
                />
                <span
                  className="block bg-[var(--carbs)]"
                  style={{ width: `${Math.min(100, (target.carbsG * 4 * 100) / target.kcal)}%` }}
                />
                <span
                  className="block bg-[var(--fat)]"
                  style={{ width: `${Math.min(100, (target.fatG * 9 * 100) / target.kcal)}%` }}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
                <span>
                  <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-[var(--green)]" />
                  {target.proteinG} g protein
                </span>
                <span>
                  <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-[var(--carbs)]" />
                  {target.carbsG} g carbs
                </span>
                <span>
                  <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-[var(--fat)]" />
                  {target.fatG} g fat
                </span>
              </div>

              <p className="mt-4 text-xs text-[var(--muted)]">
                Estimate only — not medical advice. Adjust with a nutritionist for a
                plan that fits your body, training phase, and recovery needs.
              </p>

              {target.warning ? (
                <p className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  {target.warning}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section id="menu" className="py-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-4xl font-black uppercase text-[var(--ink)] sm:text-5xl">
                The menu
              </h2>
              <p className="mt-2 text-[var(--muted)]">
                Every meal shows calories, macros, and price in KES.
              </p>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {Object.entries(goalLabels).map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={goalFilter === key}
                onClick={() => setGoalFilter(key as GoalFilter)}
                className={`rounded-full border px-4 py-2 text-sm font-medium ${
                  goalFilter === key
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                    : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {dietOptions.map((diet) => (
              <button
                key={diet}
                type="button"
                aria-pressed={dietFilter === diet}
                onClick={() => setDietFilter(diet as DietFilter)}
                className={`rounded-full border px-4 py-2 text-sm font-medium ${
                  dietFilter === diet
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                    : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                }`}
              >
                {diet}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {mealResults.map((meal) => (
              <article
                key={meal.id}
                className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--card-shadow)]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-4xl">{meal.emoji}</div>
                  <span className="rounded-full bg-[var(--bg)] px-2 py-1 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                    {meal.goals.map((goal) => goalLabels[goal]).join(" · ") || "Core"}
                  </span>
                </div>

                <h3 className="mb-2 text-2xl font-bold text-[var(--ink)]">{meal.name}</h3>

                <div className="grid grid-cols-4 gap-2 rounded-md border border-[var(--line)] bg-[var(--bg)] p-2 text-center text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
                  <div>
                    <div className="text-lg font-black text-[var(--ink)]">{meal.kcal}</div>
                    <span>kcal</span>
                  </div>
                  <div>
                    <div className="text-lg font-black text-[var(--ink)]">{meal.protein}g</div>
                    <span>p</span>
                  </div>
                  <div>
                    <div className="text-lg font-black text-[var(--ink)]">{meal.carbs}g</div>
                    <span>c</span>
                  </div>
                  <div>
                    <div className="text-lg font-black text-[var(--ink)]">{meal.fat}g</div>
                    <span>f</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <div className="text-xl font-black text-[var(--ink)]">KES {meal.priceKes}</div>
                    <div className="text-xs text-[var(--muted)]">
                      {meal.diets.length ? meal.diets.join(" · ") : "General menu"}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white"
                  >
                    Add
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="how" className="py-8">
          <h2 className="mb-5 text-4xl font-black uppercase text-[var(--ink)] sm:text-5xl">
            How it works
          </h2>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["1. Set your target", "Use the calculator or a nutritionist to set your daily goal."],
              ["2. Pick your meals", "Filter by goal and diet. See calories and macros before you order."],
              ["3. We cook and deliver", "Fresh meals to your home, office, or a partner gym fridge."],
              ["4. Adjust over time", "Track your intake, body weight, and progress each week."],
            ].map(([title, description]) => (
              <article key={title} className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--card-shadow)]">
                <h3 className="mb-2 text-2xl font-bold text-[var(--ink)]">{title}</h3>
                <p className="text-[var(--muted)]">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="py-8">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--card-shadow)]">
            <h3 className="mb-3 text-2xl font-black uppercase text-[var(--ink)]">
              Local delivery zones
            </h3>
            <div className="flex flex-wrap gap-3">
              {deliveryZones.map((zone) => (
                <span
                  key={zone.id}
                  className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm font-medium text-[var(--ink)]"
                >
                  {zone.label}: KES {getDeliveryFee(zone.id, 500)}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
