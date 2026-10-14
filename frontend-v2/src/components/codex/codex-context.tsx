import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemePref = "claro" | "escuro" | "auto";
interface Ctx {
  theme: ThemePref;
  setTheme: (t: ThemePref) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
}
const CodexCtx = createContext<Ctx | null>(null);

export function CodexProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePref>("auto");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("codex-theme") as ThemePref | null;
    if (saved) setThemeState(saved);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "escuro" || (theme === "auto" && mq.matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const setTheme = (t: ThemePref) => {
    setThemeState(t);
    localStorage.setItem("codex-theme", t);
  };

  return (
    <CodexCtx.Provider value={{ theme, setTheme, searchOpen, setSearchOpen }}>
      {children}
    </CodexCtx.Provider>
  );
}

export function useCodex() {
  const c = useContext(CodexCtx);
  if (!c) throw new Error("useCodex outside provider");
  return c;
}
