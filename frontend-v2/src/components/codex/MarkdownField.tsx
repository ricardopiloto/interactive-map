import { forwardRef, useId, useRef, type ComponentProps, type KeyboardEvent } from "react";
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Swords,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/textarea";
import { aplicar, type MarkdownAction, type MarkdownExamples } from "./markdown-format";

type Props = Omit<ComponentProps<"textarea">, "value" | "onChange"> & {
  label: string;
  labelClassName?: string;
  value: string;
  onValueChange: (value: string) => void;
  combat?: boolean;
};

const actions = [
  ["bold", Bold],
  ["italic", Italic],
  ["heading", Heading2],
  ["list", List],
  ["ordered", ListOrdered],
  ["quote", Quote],
  ["link", LinkIcon],
  ["combat", Swords],
] as const;

export const MarkdownField = forwardRef<HTMLTextAreaElement, Props>(function MarkdownField(
  {
    label,
    labelClassName = "text-sm font-medium",
    value,
    onValueChange,
    combat = false,
    disabled,
    id: suppliedId,
    onKeyDown,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const selectionRef = useRef({ start: 0, end: 0 });
  const { t } = useTranslation("comum");
  const examples: MarkdownExamples = {
    text: t("markdown.exampleText"),
    link: t("markdown.exampleLink"),
    combatTitle: t("markdown.combatTitle"),
    enemies: t("markdown.enemies"),
    environment: t("markdown.environment"),
    tactics: t("markdown.tactics"),
    outcome: t("markdown.outcome"),
  };
  const setRef = (node: HTMLTextAreaElement | null) => {
    textareaRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };
  const rememberSelection = () => {
    const node = textareaRef.current;
    if (node) selectionRef.current = { start: node.selectionStart, end: node.selectionEnd };
  };
  const apply = (action: MarkdownAction) => {
    const node = textareaRef.current;
    if (!node || disabled) return;
    const { start, end } =
      document.activeElement === node
        ? { start: node.selectionStart, end: node.selectionEnd }
        : selectionRef.current;
    const result = aplicar(action, node.value, start, end, examples);
    node.focus();
    node.setSelectionRange(result.trocaInicio, result.trocaFim);
    const before = node.value;
    const inserted =
      typeof document.execCommand === "function"
        ? document.execCommand("insertText", false, result.trecho)
        : false;
    if (!inserted || node.value === before) onValueChange(result.texto);
    selectionRef.current = { start: result.inicio, end: result.fim };
    requestAnimationFrame(() => {
      node.focus();
      node.setSelectionRange(result.inicio, result.fim);
    });
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !(event.ctrlKey || event.metaKey) || event.altKey) return;
    const key = event.key.toLowerCase();
    if (key === "b" || key === "i") {
      event.preventDefault();
      apply(key === "b" ? "bold" : "italic");
    }
  };
  return (
    <div className="block min-w-0 space-y-1">
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <div
        role="toolbar"
        aria-label={t("markdown.toolbar")}
        aria-controls={id}
        className="flex min-w-0 flex-wrap gap-1 rounded-t-md border border-input bg-muted/40 p-1"
      >
        {actions
          .filter(([action]) => action !== "combat" || combat)
          .map(([action, Icon]) => {
            const name = t(`markdown.${action}`);
            const shortcut =
              action === "bold"
                ? t("markdown.boldShortcut")
                : action === "italic"
                  ? t("markdown.italicShortcut")
                  : "";
            return (
              <button
                key={action}
                type="button"
                disabled={disabled}
                aria-label={name}
                title={shortcut ? `${name} (${shortcut})` : name}
                className="flex size-9 shrink-0 items-center justify-center rounded border border-transparent text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                onMouseDown={(event) => event.preventDefault()}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => apply(action)}
              >
                <Icon className="size-4" aria-hidden />
              </button>
            );
          })}
      </div>
      <Textarea
        {...props}
        id={id}
        ref={setRef}
        value={value}
        disabled={disabled}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onSelect={rememberSelection}
        onClick={rememberSelection}
        onKeyUp={rememberSelection}
      />
    </div>
  );
});
