import { expect, it } from "vitest";
import { slugify } from "./slugify";

it("trunca o slug em 48 caracteres", () => {
  const slug = slugify("a".repeat(60));
  expect(slug).toHaveLength(48);
});
