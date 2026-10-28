import { useLocation, matchPath } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSeo } from "@/lib/seo";

export const seoRoutes = [
  { path: "/", key: "home", index: true },
  { path: "/explorar", key: "explorar", index: true },
  { path: "/termos", key: "termos", index: true },
  { path: "/privacidade", key: "privacidade", index: true },
  { path: "/contato", key: "contato", index: true },
  { path: "/login", key: "login", index: false },
  { path: "/registo", key: "registo", index: false },
  { path: "/esqueci-senha", key: "esqueciSenha", index: false },
  { path: "/convite/:token", key: "convite", index: false },
  { path: "/reset/:token", key: "reset", index: false },
  { path: "/painel", key: "painel", index: false },
  { path: "/painel/novo", key: "novo", index: false },
  { path: "/conta", key: "conta", index: false },
  { path: "/admin", key: "admin", index: false },
  { path: "/admin/convites", key: "adminConvites", index: false },
] as const;

export function SeoRouter() {
  const { pathname } = useLocation();
  const { t } = useTranslation("comum");
  const campaign = pathname.startsWith("/c/") || pathname === "/c";
  const route = seoRoutes.find(({ path }) => matchPath({ path, end: true }, pathname));
  const key = route?.key ?? "naoEncontrada";
  useSeo(
    campaign
      ? null
      : {
          title: t(`seo.${key}.title`),
          description: t(`seo.${key}.description`),
          canonical: route?.index ? `${window.location.origin}${pathname}` : undefined,
          robots: route?.index ? "index, follow" : "noindex, nofollow",
        },
  );
  return null;
}
