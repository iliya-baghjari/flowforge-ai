import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMailMock = vi.fn();

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: sendMailMock,
    })),
  },
}));

describe("email sending", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXTAUTH_URL = "https://example.com";
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_SECURE = "false";
    process.env.SMTP_USER = "noreply@example.com";
    process.env.SMTP_PASSWORD = "secret";
    process.env.SMTP_FROM = "noreply@example.com";
  });

  it("sends a password reset email via SMTP when configured", async () => {
    const { sendPasswordResetEmail } = await import("./email");

    const result = await sendPasswordResetEmail("user@example.com", "reset-token");

    expect(result).toBe(true);
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "noreply@example.com",
        to: "user@example.com",
        subject: "Reset your password",
      })
    );
  });
});
