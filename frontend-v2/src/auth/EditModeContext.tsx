import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, campaignPath } from "@/api/client";
import { useAuth } from "./AuthContext";

interface EditMode {
  canEdit: boolean;
  isDono: boolean;
  ready: boolean;
  enabled: boolean;
  setEnabled: (value: boolean) => void;
}
const Context = createContext<EditMode | null>(null);
const key = (slug: string) => `codex.editMode.${slug}`;

export function EditModeProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const { user, loading } = useAuth();
  const [permission, setPermission] = useState({ canEdit: false, isDono: false, ready: false });
  const [wanted, setWanted] = useState(false);

  useEffect(() => {
    let active = true;
    setPermission({ canEdit: false, isDono: false, ready: false });
    setWanted(false);
    if (loading)
      return () => {
        active = false;
      };
    if (!user) {
      setPermission({ canEdit: false, isDono: false, ready: true });
      return () => {
        active = false;
      };
    }
    void api
      .get<{ papel: string }>(campaignPath(slug, "admin/session"))
      .then(({ papel }) => {
        if (!active) return;
        setPermission({ canEdit: true, isDono: papel === "dono", ready: true });
        setWanted(sessionStorage.getItem(key(slug)) === "1");
      })
      .catch(() => {
        if (active) setPermission({ canEdit: false, isDono: false, ready: true });
      });
    return () => {
      active = false;
    };
  }, [slug, user?.id, loading]);

  const canEdit = Boolean(user) && permission.canEdit;
  const setEnabled = useCallback(
    (value: boolean) => {
      if (!canEdit) return;
      setWanted(value);
      if (value) sessionStorage.setItem(key(slug), "1");
      else sessionStorage.removeItem(key(slug));
    },
    [canEdit, slug],
  );

  return (
    <Context.Provider
      value={{
        ...permission,
        canEdit,
        isDono: canEdit && permission.isDono,
        enabled: canEdit && wanted,
        setEnabled,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useEditMode() {
  const value = useContext(Context);
  if (!value) throw new Error("useEditMode requires EditModeProvider");
  return value;
}
