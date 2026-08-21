import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "@/lib/schemas";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid email addresses", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Please enter a valid email address.");
    }
  });
});

describe("registerSchema", () => {
  it("requires matching passwords", () => {
    const result = registerSchema.safeParse({
      name: "Alex",
      email: "alex@example.com",
      password: "password123",
      confirmPassword: "different",
      terms: true,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain("confirmPassword");
    }
  });
});
