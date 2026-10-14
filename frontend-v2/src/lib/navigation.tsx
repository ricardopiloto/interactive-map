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

export function campaignRoute(to: string, pathname: string) {
  const match = pathname.match(/^\/c\/([^/]+)/);
  if (!match) return to;
  if (to === "/") return `/c/${match[1]}/mapa`;
  if (["/relacoes", "/rota", "/sessoes", "/cronologia"].includes(to)) {
    return `/c/${match[1]}${to}`;
  }
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
