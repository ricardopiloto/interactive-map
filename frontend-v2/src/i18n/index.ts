import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ptComum from "@/locales/pt-BR/comum.json";
import ptMapa from "@/locales/pt-BR/mapa.json";
import ptRelacoes from "@/locales/pt-BR/relacoes.json";
import ptAdmin from "@/locales/pt-BR/admin.json";
import ptSessoes from "@/locales/pt-BR/sessoes.json";
import ptLinhaTempo from "@/locales/pt-BR/linhaTempo.json";
import enComum from "@/locales/en/comum.json";
import enMapa from "@/locales/en/mapa.json";
import enRelacoes from "@/locales/en/relacoes.json";
import enAdmin from "@/locales/en/admin.json";
import enSessoes from "@/locales/en/sessoes.json";
import enLinhaTempo from "@/locales/en/linhaTempo.json";

const detector = new LanguageDetector();
detector.addDetector({
  name: "normalizedNavigator",
  lookup: () => (navigator.language.toLowerCase().startsWith("en") ? "en" : "pt-BR"),
});

void i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    resources: {
      "pt-BR": {
        comum: ptComum,
        mapa: ptMapa,
        relacoes: ptRelacoes,
        admin: ptAdmin,
        sessoes: ptSessoes,
        linhaTempo: ptLinhaTempo,
      },
      en: {
        comum: enComum,
        mapa: enMapa,
        relacoes: enRelacoes,
        admin: enAdmin,
        sessoes: enSessoes,
        linhaTempo: enLinhaTempo,
      },
    },
    ns: ["comum", "mapa", "relacoes", "admin", "sessoes", "linhaTempo"],
    defaultNS: "comum",
    supportedLngs: ["pt-BR", "en"],
    fallbackLng: "pt-BR",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "normalizedNavigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "codex-language",
    },
  });

export default i18n;
