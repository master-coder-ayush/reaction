import { z } from "zod";

export const USERNAME_RE = /^[a-z0-9_]{3,32}$/;

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    USERNAME_RE,
    "Username must be 3-32 chars: lowercase letters, numbers, underscores."
  );

export const guestProgressSchema = z.array(z.number().int().positive());

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Full name is required.").max(120),
  username: usernameSchema,
  email: z.email("Enter a valid email.").trim().toLowerCase(),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  password: z.string().min(8, "Password must be at least 8 characters."),
  classLevel: z.enum(["11", "12", "both"]),
  // Guest session carried over from localStorage (optional).
  guestXp: z.number().int().min(0).max(1_000_000).optional(),
  guestProgress: guestProgressSchema.optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
