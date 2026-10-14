import { useTranslation } from "react-i18next";

export function LanguageSelector() {
  const { i18n, t } = useTranslation("comum");
  return (
    <label className="glass flex items-center gap-2 rounded-full px-3 py-2 text-sm">
      <span className="sr-only">{t("v2.language")}</span>
      <select
        aria-label={t("v2.language")}
        value={i18n.resolvedLanguage ?? "pt-BR"}
        onChange={(event) => void i18n.changeLanguage(event.target.value)}
        className="bg-transparent text-foreground outline-none"
      >
        <option value="pt-BR">Português</option>
        <option value="en">English</option>
      </select>
    </label>
  );
}
