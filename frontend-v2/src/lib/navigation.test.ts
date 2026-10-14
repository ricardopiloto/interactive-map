import { describe, expect, it } from "vitest";
import { destination } from "./navigation";

describe("React Router navigation", () => {
  it("preserves selected entities in the URL", () => {
    expect(destination("/relacoes", { p: "ela & nico", empty: undefined })).toBe(
      "/relacoes?p=ela+%26+nico",
    );
  });
});
