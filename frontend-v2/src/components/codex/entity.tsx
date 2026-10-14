import { Link } from "@/lib/navigation";
import { MapPin, ScrollText, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";
import { getChar, getLoc, type Character } from "@/lib/codex-data";
import { useTranslation } from "react-i18next";

export function Monogram({
  c,
  size = 40,
  className,
}: {
  c: Character;
  size?: number;
  className?: string;
}) {
  const initials = c.name
    .split(" ")
    .filter((w) => w[0] === w[0]?.toUpperCase())
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full font-display font-medium",
        c.type === "PJ"
          ? "bg-primary text-primary-foreground ring-2 ring-seal ring-offset-2 ring-offset-card"
          : "bg-secondary text-secondary-foreground border border-border",
        c.status === "morto" && "opacity-60 grayscale",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden
    >
      {initials}
      {c.status !== "vivo" && (
        <span className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-card text-[9px] text-foreground">
          {c.status === "morto" ? "†" : "?"}
        </span>
      )}
    </span>
  );
}

const chipBase =
  "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-seal hover:text-seal";

export function LocChip({ id }: { id: string }) {
  const l = getLoc(id);
  if (!l) return null;
  return (
    <Link to="/" search={{ local: id }} className={chipBase}>
      <MapPin className="h-3 w-3" aria-hidden />
      {l.name}
    </Link>
  );
}

export function CharChip({ id }: { id: string }) {
  const c = getChar(id);
  if (!c) return null;
  return (
    <Link to="/relacoes" search={{ p: id }} className={cn(chipBase, "pl-1")}>
      <Monogram c={c} size={20} className="ring-1 ring-offset-0" />
      {c.short}
    </Link>
  );
}

export function SessionChip({ n, title }: { n: number; title?: string | undefined }) {
  const { t } = useTranslation("sessoes");
  return (
    <Link to="/sessoes" search={{ s: n }} className={chipBase}>
      <ScrollText className="h-3 w-3" aria-hidden />
      {t("v2.session", { number: n })}
      {title && <span className="text-muted-foreground">· {title}</span>}
    </Link>
  );
}

export function EventChip({ id, title }: { id: string; title: string }) {
  return (
    <Link to="/cronologia" hash={id} className={chipBase}>
      <Hourglass className="h-3 w-3" aria-hidden />
      {title}
    </Link>
  );
}
