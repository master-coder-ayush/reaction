"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

// SettingsForm (Sprint 8 §8.2). Account fields + privacy toggle + password
// change + account deletion. Each section saves independently via PATCH (or
// DELETE) to /api/user/settings. Privacy ON shows a live link to the profile.

type Props = {
  username: string;
  initialName: string;
  email: string;
  initialPhone: string;
  initialIsPublic: boolean;
};

export function SettingsForm({
  username,
  initialName,
  email,
  initialPhone,
  initialIsPublic,
}: Props) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [accountMsg, setAccountMsg] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function patch(payload: Record<string, unknown>): Promise<boolean> {
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return false;
      }
      return data.ok === true;
    } catch {
      return false;
    }
  }

  async function saveAccount() {
    setAccountMsg(null);
    const ok = await patch({ name, phone });
    setAccountMsg(ok ? "Saved." : "Couldn't save — try again.");
  }

  async function togglePrivacy(next: boolean) {
    setIsPublic(next);
    await patch({ isPublic: next });
  }

  async function changePassword() {
    setPwMsg(null);
    if (newPassword.length < 8) {
      setPwMsg("New password must be at least 8 characters.");
      return;
    }
    const res = await fetch("/api/user/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setPwMsg("Password changed.");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      setPwMsg(data.error ?? "Couldn't change password.");
    }
  }

  async function deleteAccount() {
    setDeleting(true);
    try {
      const res = await fetch("/api/user/settings", { method: "DELETE" });
      if (res.ok) {
        await signOut({ callbackUrl: "/" });
      } else {
        setDeleting(false);
      }
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Account */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-bold">Account</h2>
        <div className="mt-4 space-y-3">
          <Field label="Full name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            />
          </Field>
          <Field label="Email">
            <input
              value={email}
              disabled
              className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground"
            />
          </Field>
          <Field label="Phone">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            />
          </Field>
        </div>
        <button
          type="button"
          onClick={saveAccount}
          className="mt-4 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Save changes
        </button>
        {accountMsg && (
          <span className="ml-3 text-sm text-muted-foreground">{accountMsg}</span>
        )}
      </section>

      {/* Privacy */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-bold">Privacy</h2>
        <label className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium">
            Public Profile: {isPublic ? "ON" : "OFF"}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            onClick={() => togglePrivacy(!isPublic)}
            className={
              "relative h-6 w-11 rounded-full transition-colors " +
              (isPublic ? "bg-primary" : "bg-muted-foreground/40")
            }
          >
            <span
              className={
                "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform " +
                (isPublic ? "translate-x-5" : "translate-x-0.5")
              }
            />
          </button>
        </label>
        {isPublic && (
          <p className="mt-3 text-sm text-muted-foreground">
            Your profile is live at{" "}
            <Link
              href={`/u/${username}`}
              className="text-primary hover:underline"
            >
              /u/{username}
            </Link>
            .
          </p>
        )}
      </section>

      {/* Password */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-bold">Change password</h2>
        <div className="mt-4 space-y-3">
          <Field label="Current password">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            />
          </Field>
          <Field label="New password">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            />
          </Field>
        </div>
        <button
          type="button"
          onClick={changePassword}
          className="mt-4 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Update password
        </button>
        {pwMsg && (
          <span className="ml-3 text-sm text-muted-foreground">{pwMsg}</span>
        )}
      </section>

      {/* Danger zone */}
      <section className="rounded-2xl border border-destructive/40 bg-card p-5 shadow-sm">
        <h2 className="text-lg font-bold text-destructive">Delete account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently deletes your account, XP, badges, and cards. This cannot be
          undone.
        </p>
        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="mt-4 inline-flex h-10 items-center rounded-lg border border-destructive px-4 text-sm font-semibold text-destructive hover:bg-destructive/10"
          >
            Delete account
          </button>
        ) : (
          <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
            <p className="text-sm font-medium">
              Are you sure? This is permanent.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={deleteAccount}
                disabled={deleting}
                className="inline-flex h-10 items-center rounded-lg bg-destructive px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Yes, delete everything"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
