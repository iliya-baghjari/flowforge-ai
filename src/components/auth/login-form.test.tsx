import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const { push, signIn } = vi.hoisted(() => ({
  push: vi.fn(),
  signIn: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => ({ get: () => "/dashboard" }),
}));

vi.mock("next-auth/react", () => ({
  signIn,
}));

import { LoginForm } from "@/components/auth/login-form";

describe("LoginForm", () => {
  it("renders email and password fields", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("submits valid credentials and redirects", async () => {
    const user = userEvent.setup();
    signIn.mockResolvedValue({ ok: true, error: null, status: 200, url: null });

    render(<LoginForm callbackUrl="/dashboard" />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(signIn).toHaveBeenCalledWith("credentials", {
      email: "user@example.com",
      password: "password123",
      redirect: false,
      callbackUrl: "/dashboard",
    });
    expect(push).toHaveBeenCalledWith("/dashboard");
  });

  it("uses the page-provided callbackUrl when present", async () => {
    const user = userEvent.setup();
    signIn.mockResolvedValue({ ok: true, error: null, status: 200, url: null });

    render(<LoginForm callbackUrl="/projects" />);

    await user.type(screen.getByLabelText("Email"), "owner@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(signIn).toHaveBeenCalledWith("credentials", {
      email: "owner@example.com",
      password: "password123",
      redirect: false,
      callbackUrl: "/projects",
    });
    expect(push).toHaveBeenCalledWith("/projects");
  });
});
