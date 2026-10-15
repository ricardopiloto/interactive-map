import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ApiError } from "@/api/client";

export function useApiErrorMessage() {
  const { t } = useTranslation("comum");
  return useCallback(
    (reason: unknown, fallback?: string) => {
      if (reason instanceof ApiError && reason.codigo) {
        return t(`errors.${reason.codigo}`, {
          ...reason.detalhes,
          defaultValue: fallback ?? t("errors.GENERICO"),
        });
      }
      return fallback ?? t("errors.GENERICO");
    },
    [t],
  );
}
