import fs from "node:fs";
import path from "node:path";
import type { BrowserContext, Page } from "@playwright/test";

export interface E2ESession {
  slug: string;
  email: string;
  password: string;
  cookieName: string;
  cookieValue: string;
  adminEmail?: string;
  adminPassword?: string;
  adminCookieValue?: string;
  deleteCampaignSlug?: string;
  origin: string;
}

export function loadSession(): E2ESession {
  const file = path.join(
    import.meta.dirname,
    "..",
    "..",
    "frontend",
    "e2e",
    ".auth",
    "session.json",
  );
  if (!fs.existsSync(file)) {
    throw new Error(
      `Sessão e2e ausente em ${file}. O webServer do Playwright deveria ter rodado seed_e2e.py.`,
    );
  }
  return JSON.parse(fs.readFileSync(file, "utf8")) as E2ESession;
}

export async function setLocale(page: Page, locale: "pt-BR" | "en") {
  await page.addInitScript((lng) => {
    localStorage.setItem("codex-language", lng);
  }, locale);
}

export async function applyAuth(context: BrowserContext, session = loadSession()) {
  await context.addCookies([
    {
      name: session.cookieName,
      value: session.cookieValue,
      url: session.origin,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  await context.setExtraHTTPHeaders({ origin: session.origin });
}

export async function applyAdminAuth(context: BrowserContext, session = loadSession()) {
  if (!session.adminCookieValue) throw new Error("Sessão admin e2e ausente — rode seed_e2e.py");
  await context.addCookies([
    {
      name: session.cookieName,
      value: session.adminCookieValue,
      url: session.origin,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  await context.setExtraHTTPHeaders({ origin: session.origin });
}
