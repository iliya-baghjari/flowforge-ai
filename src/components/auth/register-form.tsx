"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { registerSchema, type RegisterFormValues } from "@/lib/schemas";
import { cn } from "@/lib/utils";

export const RegisterForm: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    console.log("Registration submitted", values);
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="name">
          Full name
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="name"
            type="text"
            autoComplete="name"
            className={cn(
              "h-11 w-full rounded-xl border bg-background pl-10 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40",
              errors.name ? "border-destructive" : "border-border",
            )}
            placeholder="Alex Morgan"
            {...register("name")}
          />
        </div>
        {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="email">
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={cn(
              "h-11 w-full rounded-xl border bg-background pl-10 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40",
              errors.email ? "border-destructive" : "border-border",
            )}
            placeholder="you@example.com"
            {...register("email")}
          />
        </div>
        {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className={cn(
              "h-11 w-full rounded-xl border bg-background pl-10 pr-10 text-sm outline-none transition focus:ring-2 focus:ring-primary/40",
              errors.password ? "border-destructive" : "border-border",
            )}
            placeholder="Create a password"
            {...register("password")}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="confirmPassword">
          Confirm password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            className={cn(
              "h-11 w-full rounded-xl border bg-background pl-10 pr-10 text-sm outline-none transition focus:ring-2 focus:ring-primary/40",
              errors.confirmPassword ? "border-destructive" : "border-border",
            )}
            placeholder="Re-enter your password"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            onClick={() => setShowConfirmPassword((value) => !value)}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword ? <p className="text-sm text-destructive">{errors.confirmPassword.message}</p> : null}
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/70 p-3 text-sm text-muted-foreground">
        <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-border text-primary" {...register("terms")} />
        <span>
          I agree to the <span className="font-medium text-foreground">terms and conditions</span>.
        </span>
      </label>
      {errors.terms ? <p className="text-sm text-destructive">{errors.terms.message}</p> : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
};
