import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { expect, it, vi } from "vitest";
import { LoginPage } from "./Login";

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
});
