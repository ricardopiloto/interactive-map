import { useEffect, useId, useState } from "react";
import { foldText } from "@/lib/routeView";

export interface WaypointOption {
  id: number;
  label: string;
}

export function WaypointCombobox({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: number | null;
  options: WaypointOption[];
  onChange: (id: number | null) => void;
}) {
  const listId = useId();
  const selected = options.find((option) => option.id === value) ?? null;
  const [query, setQuery] = useState(selected?.label ?? "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(selected?.label ?? "");
  }, [selected?.label]);

  const filtered = options.filter((option) => foldText(option.label).includes(foldText(query)));

  return (
    <div className="relative">
      <label className="eyebrow" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        className="w-full rounded-xl border border-border bg-card px-3 py-3 font-display text-lg"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          const next = event.target.value;
          setQuery(next);
          setOpen(true);
          if (!next.trim()) onChange(null);
        }}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 150);
        }}
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-border bg-card shadow-float"
        >
          {filtered.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                role="option"
                aria-selected={option.id === value}
                className="w-full px-3 py-2 text-left hover:bg-accent"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(option.id);
                  setQuery(option.label);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
