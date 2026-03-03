import { describe, expect, it } from "vitest";
import { cn } from "@/shared/lib/cn";

describe("cn", () => {
  it("merges tailwind classes", () => {
    expect(cn("px-4 py-2", "px-6")).toBe("py-2 px-6");
  });
});
