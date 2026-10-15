import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function CampaignCard({
  id,
  slug,
  nome,
  sistema,
  capaUrl,
  href,
  children,
}: {
  id?: number;
  slug: string;
  nome: string;
  sistema: string;
  capaUrl?: string | null;
  href?: string;
  children?: ReactNode;
}) {
  const media = capaUrl ? (
    <img src={capaUrl} alt="" className="h-36 w-full object-cover" />
  ) : (
    <div className="h-36 w-full" style={{ background: "var(--seal)" }} aria-hidden />
  );
  const heading = (
    <>
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-display text-2xl leading-tight">{nome}</h2>
      </div>
      <p className="text-sm text-muted-foreground">{sistema}</p>
      <p className="font-mono text-xs text-muted-foreground">
        /c/{id != null ? `${id}/${slug}` : slug}
      </p>
    </>
  );

  return (
    <article
      aria-label={nome}
      className="flex h-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-float"
    >
      {media}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {href ? (
          <Link to={href} className="space-y-2 rounded-md hover:text-seal">
            {heading}
          </Link>
        ) : (
          <div className="space-y-2">{heading}</div>
        )}
        {children}
      </div>
    </article>
  );
}
