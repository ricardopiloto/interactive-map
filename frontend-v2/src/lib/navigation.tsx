import {
  Link as RouterLink,
  useLocation,
  useNavigate as useRouterNavigate,
  useSearchParams,
} from "react-router-dom";
import type { ComponentProps } from "react";

type Search = Record<string, string | number | undefined>;

export function destination(to: string, search?: Search, hash?: string) {
  const query = new URLSearchParams();
  Object.entries(search ?? {}).forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value));
  });
  return `${to}${query.size ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

const CAMPAIGN_SUBROUTES = [
  "/relacoes",
  "/rota",
  "/sessoes",
  "/cronologia",
  "/linha-do-tempo",
  "/itens",
];

/** Prefix of the campaign currently in the URL, keeping `/c/{id}/{slug}` when that is the path. */
export function campaignBase(pathname: string): string | null {
  const canonical = pathname.match(/^\/c\/(\d+)\/([^/]+)/);
  if (canonical) return `/c/${canonical[1]}/${canonical[2]}`;
  const compat = pathname.match(/^\/c\/([^/]+)/);
  if (compat) return `/c/${compat[1]}`;
  return null;
}

export function campaignHref(id: number, slug: string): string {
  return `/c/${id}/${slug}`;
}

export function campaignRoute(to: string, pathname: string) {
  const base = campaignBase(pathname);
  if (!base) return to;
  if (to === "/") return `${base}/mapa`;
  if (CAMPAIGN_SUBROUTES.includes(to)) return `${base}${to}`;
  return to;
}

type LinkProps = Omit<ComponentProps<typeof RouterLink>, "to"> & {
  to: string;
  search?: Search;
  hash?: string;
};

export function Link({ to, search, hash, ...props }: LinkProps) {
  const location = useLocation();
  return (
    <RouterLink to={destination(campaignRoute(to, location.pathname), search, hash)} {...props} />
  );
}

export function useNavigate() {
  const navigate = useRouterNavigate();
  const location = useLocation();
  return ({
    to,
    search,
    hash,
    replace,
  }: {
    to?: string;
    search?: Search;
    hash?: string;
    replace?: boolean;
  }) =>
    navigate(
      destination(campaignRoute(to ?? location.pathname, location.pathname), search, hash),
      replace === undefined ? {} : { replace },
    );
}

export function useSearch() {
  const [search] = useSearchParams();
  return Object.fromEntries(search.entries());
}
