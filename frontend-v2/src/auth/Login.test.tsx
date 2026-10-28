import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import { LoginPage } from "./Login";
import i18n from "@/i18n";

beforeEach(async () => {
  await i18n.changeLanguage("pt-BR");
});

vi.mock("./AuthContext", () => ({ useAuth: () => ({ login: vi.fn() }) }));

it("shows the footer on the standalone login page", () => {
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </MemoryRouter>,
  );
  expect(screen.getByTestId("site-footer")).toBeTruthy();
  expect(screen.getByRole("link", { name: "Esqueci a senha" })).toHaveAttribute(
    "href",
    "/esqueci-senha",
  );
});

it("does not add a footer to the login modal", () => {
  render(
    <MemoryRouter
      initialEntries={[{ pathname: "/login", state: { background: { pathname: "/" } } }]}
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </MemoryRouter>,
  );
  expect(screen.queryByTestId("site-footer")).toBeNull();
  expect(screen.getByRole("link", { name: "Esqueci a senha" })).toHaveAttribute(
    "href",
    "/esqueci-senha",
  );
});
