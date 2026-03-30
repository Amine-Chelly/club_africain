import { cn } from "./cn";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b", false && "c", undefined)).toBe("a b");
  });
});
