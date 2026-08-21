import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges class names and resolves conflicting Tailwind classes", () => {
    expect(cn("px-2", "px-4", "text-red-500", "text-blue-500")).toBe("px-4 text-blue-500");
  });

  it("handles conditional classes and falsy values", () => {
    expect(cn("base", false && "hidden", undefined, "active")).toBe("base active");
  });
});
