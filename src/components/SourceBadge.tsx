import type { Persona } from "../types";

export function PersonaBadge({ persona }: { persona: Persona }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-200"
      style={{ boxShadow: `inset 3px 0 0 ${persona.color}` }}
    >
      {persona.name}
      <span className="text-slate-500">/ {persona.handle}</span>
    </span>
  );
}
