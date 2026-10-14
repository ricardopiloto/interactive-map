import { useCallback, useEffect, useState } from "react";
import { ApiError } from "./client";

export function useApi<T>(key: string | null, load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [loading, setLoading] = useState(Boolean(key));
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    let active = true;
    setData(null);
    setError(null);
    setLoading(Boolean(key));
    if (key) {
      void load()
        .then((value) => {
          if (active) setData(value);
        })
        .catch((reason: unknown) => {
          if (active) setError(reason instanceof Error ? reason : new Error(String(reason)));
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }
    return () => {
      active = false;
    };
    // Callers identify requests by key; the loader is intentionally not a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, revision]);

  return { data, error, loading, reload };
}
