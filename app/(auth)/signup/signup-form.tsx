"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GUEST_XP_KEY,
  GUEST_PROGRESS_KEY,
  type ClassLevel,
} from "@/lib/constants";
import { USERNAME_RE } from "@/lib/validation";

type UsernameStatus =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "available" }
  | { state: "taken"; reason: string }
  | { state: "invalid"; reason: string };

function readGuestSession() {
  if (typeof window === "undefined") return { xp: 0, progress: [] as number[] };
  let xp = 0;
  let progress: number[] = [];
  try {
    xp = Number(window.localStorage.getItem(GUEST_XP_KEY) ?? "0") || 0;
  } catch {
    /* ignore */
  }
  try {
    const raw = window.localStorage.getItem(GUEST_PROGRESS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        progress = parsed.filter(
          (n): n is number => typeof n === "number" && Number.isInteger(n)
        );
      }
    }
  } catch {
    /* ignore */
  }
  return { xp: Math.max(0, Math.floor(xp)), progress };
}

export function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [classLevel, setClassLevel] = useState<ClassLevel>("11");

  // Result of the async availability check, keyed by the value it was for.
  const [availability, setAvailability] = useState<{
    forValue: string;
    available: boolean;
    reason?: string;
  } | null>(null);
  const [checking, setChecking] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Guest XP lives only in localStorage (client-only). Read it after mount so
  // server render (0) and first client render match, avoiding a hydration
  // mismatch; this is the legitimate "sync from an external system" effect.
  const [guestXp, setGuestXp] = useState(0);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGuestXp(readGuestSession().xp);
  }, []);

  const normalizedUsername = username.trim().toLowerCase();
  const formatValid = USERNAME_RE.test(normalizedUsername);

  // Derive display status from render-time state — no setState-in-effect.
  const usernameStatus: UsernameStatus = !normalizedUsername
    ? { state: "idle" }
    : !formatValid
      ? {
          state: "invalid",
          reason: "3-32 chars: lowercase letters, numbers, underscores.",
        }
      : checking
        ? { state: "checking" }
        : availability && availability.forValue === normalizedUsername
          ? availability.available
            ? { state: "available" }
            : { state: "taken", reason: availability.reason ?? "That username is taken." }
          : { state: "checking" };

  // Debounced real-time availability fetch. State is only set inside the
  // async callback / on cleanup, never synchronously in the effect body.
  useEffect(() => {
    if (!normalizedUsername || !formatValid) {
      return;
    }

    let cancelled = false;
    const handle = setTimeout(async () => {
      if (cancelled) return;
      setChecking(true);
      try {
        const res = await fetch(
          `/api/check-username?u=${encodeURIComponent(normalizedUsername)}`
        );
        const data: { available: boolean; reason?: string } = await res.json();
        if (cancelled) return;
        setAvailability({
          forValue: normalizedUsername,
          available: data.available,
          reason: data.reason,
        });
      } catch {
        if (!cancelled) {
          setAvailability({ forValue: normalizedUsername, available: true });
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [normalizedUsername, formatValid]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSubmitting(true);

    const guest = readGuestSession();

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          username: username.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          password,
          classLevel,
          guestXp: guest.xp,
          guestProgress: guest.progress,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.field) {
          setFieldErrors({ [data.field]: data.error });
        } else if (data.fieldErrors) {
          const flat: Record<string, string> = {};
          for (const [k, v] of Object.entries(data.fieldErrors)) {
            if (Array.isArray(v) && v[0]) flat[k] = v[0] as string;
          }
          setFieldErrors(flat);
        } else {
          setFormError(data.error ?? "Something went wrong.");
        }
        setSubmitting(false);
        return;
      }

      // Account created — clear guest session, then auto-login.
      try {
        window.localStorage.removeItem(GUEST_XP_KEY);
        window.localStorage.removeItem(GUEST_PROGRESS_KEY);
      } catch {
        /* ignore */
      }

      const signInResult = await signIn("credentials", {
        identifier: username.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Account exists but auto-login failed — send them to login.
        router.push("/login?message=Account created — please log in.");
        return;
      }

      // Redirect to dashboard with welcome banner state.
      router.push("/?welcome=1");
      router.refresh();
    } catch {
      setFormError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  const usernameValid =
    usernameStatus.state === "available" || usernameStatus.state === "idle";

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <h2 className="text-lg font-semibold">Create your account</h2>

      {guestXp > 0 && (
        <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          You&apos;ve earned {guestXp} XP this session — it&apos;ll be saved to
          your account.
        </p>
      )}

      {formError && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      )}

      <Field label="Full Name" htmlFor="name" error={fieldErrors.name}>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />
      </Field>

      <Field
        label="Username"
        htmlFor="username"
        error={
          fieldErrors.username ??
          (usernameStatus.state === "taken" ||
          usernameStatus.state === "invalid"
            ? usernameStatus.reason
            : undefined)
        }
        hint={
          usernameStatus.state === "checking"
            ? "Checking availability…"
            : usernameStatus.state === "available"
              ? "✓ Available"
              : undefined
        }
        hintTone={usernameStatus.state === "available" ? "success" : "muted"}
      >
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
      </Field>

      <Field label="Email" htmlFor="email" error={fieldErrors.email}>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </Field>

      <Field label="Phone (optional)" htmlFor="phone" error={fieldErrors.phone}>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />
      </Field>

      <Field label="Password" htmlFor="password" error={fieldErrors.password}>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
            className="pr-16"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </Field>

      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium">Class</legend>
        <div className="flex gap-2">
          {(["11", "12", "both"] as const).map((value) => (
            <button
              type="button"
              key={value}
              onClick={() => setClassLevel(value)}
              className={
                "flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors " +
                (classLevel === value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-muted")
              }
            >
              {value === "both" ? "Both" : `Class ${value}`}
            </button>
          ))}
        </div>
      </fieldset>

      <Button
        type="submit"
        className="w-full"
        disabled={submitting || !usernameValid}
      >
        {submitting ? "Creating account…" : "Sign up"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  hintTone = "muted",
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  hintTone?: "muted" | "success";
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p
          className={
            "mt-1 text-xs " +
            (hintTone === "success" ? "text-success" : "text-muted-foreground")
          }
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
