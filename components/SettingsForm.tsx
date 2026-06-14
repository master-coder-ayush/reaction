"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Lock, ShieldAlert, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <section className="card-soft p-5">
        <h2 className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
          <span
            className="icon-chip h-8 w-8 bg-secondary-soft text-secondary-border"
            aria-hidden
          >
            <User className="h-4 w-4" />
          </span>
          Account
        </h2>
        <div className="mt-4 space-y-3">
          <Field label="Full name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email">
            <Input value={email} disabled className="bg-muted text-muted-foreground" />
          </Field>
          <Field label="Phone">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button type="button" onClick={saveAccount} variant="primary" size="sm">
            Save changes
          </Button>
          {accountMsg && (
            <span className="text-sm font-medium text-muted-foreground">
              {accountMsg}
            </span>
          )}
        </div>
      </section>

      {/* Privacy */}
      <section className="card-soft p-5">
        <h2 className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
          <span
            className="icon-chip h-8 w-8 bg-info-soft text-info-border"
            aria-hidden
          >
            <Lock className="h-4 w-4" />
          </span>
          Privacy
        </h2>
        <label className="mt-4 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold">
            Public Profile: {isPublic ? "ON" : "OFF"}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            onClick={() => togglePrivacy(!isPublic)}
            className={
              "relative h-6 w-11 shrink-0 rounded-full transition-colors " +
              (isPublic ? "bg-primary" : "bg-muted-foreground/40")
            }
          >
            <span
              className={
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform " +
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
              className="font-semibold text-secondary hover:underline"
            >
              /u/{username}
            </Link>
            .
          </p>
        )}
      </section>

      {/* Password */}
      <section className="card-soft p-5">
        <h2 className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
          <span
            className="icon-chip h-8 w-8 bg-accent-soft text-accent-border"
            aria-hidden
          >
            <Lock className="h-4 w-4" />
          </span>
          Change password
        </h2>
        <div className="mt-4 space-y-3">
          <Field label="Current password">
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </Field>
          <Field label="New password">
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Field>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button
            type="button"
            onClick={changePassword}
            variant="primary"
            size="sm"
          >
            Update password
          </Button>
          {pwMsg && (
            <span className="text-sm font-medium text-muted-foreground">
              {pwMsg}
            </span>
          )}
        </div>
      </section>

      {/* Danger zone */}
      <section className="rounded-2xl border border-destructive/40 bg-card p-5 shadow-soft">
        <h2 className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-destructive">
          <span
            className="icon-chip h-8 w-8 bg-destructive-soft text-destructive-border"
            aria-hidden
          >
            <ShieldAlert className="h-4 w-4" />
          </span>
          Delete account
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Permanently deletes your account, XP, badges, and cards. This cannot be
          undone.
        </p>
        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="mt-4 inline-flex h-9 items-center gap-2 rounded-2xl border-2 border-destructive/60 bg-card px-4 text-sm font-extrabold tracking-wide text-destructive transition-colors hover:bg-destructive-soft"
          >
            <Trash2 className="h-4 w-4" />
            Delete account
          </button>
        ) : (
          <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive-soft/50 p-4">
            <p className="text-sm font-bold">
              Are you sure? This is permanent.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                onClick={deleteAccount}
                disabled={deleting}
                variant="destructive"
                size="sm"
              >
                {deleting ? "Deleting…" : "Yes, delete everything"}
              </Button>
              <Button
                type="button"
                onClick={() => setConfirmDelete(false)}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
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
      <span className="mb-1.5 block text-xs font-bold text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
