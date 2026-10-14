import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export interface RelatedEntity {
  id: number;
  label: string;
  href: string;
}

export function RichContent({
  markdown,
  related = [],
}: {
  markdown: string;
  related?: RelatedEntity[];
}) {
  const { t } = useTranslation("comum");
  return (
    <div className="space-y-3">
      <div className="space-y-2 text-sm leading-relaxed text-foreground [&_a]:text-seal [&_a]:underline [&_h2]:font-display [&_h2]:text-xl [&_li]:ml-5 [&_li]:list-disc [&_p]:my-2">
        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{markdown}</ReactMarkdown>
      </div>
      {related.length > 0 && (
        <div aria-label={t("v2.relatedEntities")} className="flex flex-wrap gap-2">
          {related.map((entity) => (
            <Link
              key={`${entity.href}:${entity.id}`}
              to={entity.href}
              className="rounded-full border border-border bg-accent px-3 py-1 text-xs text-foreground hover:bg-primary hover:text-primary-foreground"
            >
              {entity.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
