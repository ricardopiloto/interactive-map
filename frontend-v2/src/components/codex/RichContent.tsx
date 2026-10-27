import { COMBAT_MARKER } from "./markdown-format";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Swords } from "lucide-react";
import { Children, isValidElement, type ReactNode } from "react";

export interface RelatedEntity {
  id: number;
  label: string;
  href: string;
}

export function RichContent({
  markdown,
  related = [],
  callouts = false,
}: {
  markdown: string;
  related?: RelatedEntity[];
  callouts?: boolean;
}) {
  const { t } = useTranslation("comum");
  const blockquote = ({ children }: { children?: ReactNode }) => {
    const nodes = Children.toArray(children);
    const first = nodes.findIndex((node) => isValidElement(node));
    const candidate = nodes[first];
    const paragraph =
      isValidElement<{ children?: ReactNode }>(candidate) && candidate.type === "p"
        ? candidate
        : null;
    const contents = paragraph ? Children.toArray(paragraph.props.children) : [];
    const opening = contents.find((node) => typeof node === "string" && node.trim()) ?? contents[0];
    const match =
      typeof opening === "string" && opening.toLowerCase().startsWith(COMBAT_MARKER)
        ? new RegExp(`^.{${COMBAT_MARKER.length}}(?:[ \t]+([^\n]*))?`, "i").exec(opening)
        : null;
    if (!match) return <blockquote>{children}</blockquote>;
    const title = match[1]?.trim() || t("combat");
    const remainder = typeof opening === "string" ? opening.slice(match[0].length) : "";
    return (
      <div className="min-w-0 rounded-lg border border-combat/50 border-l-4 border-l-combat bg-combat/10 p-3 break-words [overflow-wrap:anywhere]">
        <div className="flex min-w-0 items-start gap-2 font-semibold text-combat">
          <Swords className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span className="min-w-0 break-words [overflow-wrap:anywhere]">{title}</span>
        </div>
        {(remainder || contents.length > 1 || nodes.length > first + 1) && (
          <div className="min-w-0 text-foreground break-words [overflow-wrap:anywhere]">
            {(remainder || contents.length > 1) && (
              <p>
                {remainder}
                {contents.filter((node) => node !== opening)}
              </p>
            )}
            {nodes.slice(first + 1)}
          </div>
        )}
      </div>
    );
  };
  return (
    <div className="space-y-3">
      <div className="space-y-2 text-sm leading-relaxed text-foreground [&_a]:text-seal [&_a]:underline [&_h2]:font-display [&_h2]:text-xl [&_li]:ml-5 [&_li]:list-disc [&_p]:my-2">
        <ReactMarkdown
          rehypePlugins={[rehypeSanitize]}
          components={callouts ? { blockquote } : undefined}
        >
          {markdown}
        </ReactMarkdown>
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
