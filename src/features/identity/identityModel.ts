import { z } from "zod";

export interface IdentityProfile {
  id: string;
  displayName: string;
  initials: string;
}

const displayNameSchema = z
  .string()
  .trim()
  .min(2, "Enter the name your friends know you by.")
  .max(24, "Keep the name under 24 characters.")
  .transform((value) => value.replace(/\s+/g, " ").toUpperCase());

const pinSchema = z
  .string()
  .regex(/^\d{4}$/, "Enter a 4-digit PIN.");

export function normalizeDisplayName(value: string) {
  return displayNameSchema.parse(value);
}

export function normalizePin(value: string) {
  return pinSchema.parse(value);
}

export function profileInitials(displayName: string) {
  const words = normalizeDisplayName(displayName).split(" ");
  return words.length === 1
    ? words[0]!.slice(0, 1)
    : words.slice(0, 2).map((word) => word[0]).join("");
}

export function parseIdentityCredentials(displayName: string, pin: string) {
  const parsed = z.object({
    displayName: displayNameSchema,
    pin: pinSchema,
  }).safeParse({ displayName, pin });

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Check your name and PIN.",
    };
  }

  return { success: true as const, data: parsed.data };
}
