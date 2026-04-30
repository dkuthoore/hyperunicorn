const STAT_HOVER_SHELL =
  "group transition duration-200 ease-out hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-slate-900/85 hover:shadow-lg hover:shadow-cyan-500/10 active:translate-y-0 active:duration-100";

interface StatCardProps {
  label: string;
  value: string;
  detail?: string;
  className?: string;
  /** Teal label + centered — dashboard hero metrics. */
  highlight?: boolean;
  /** Same lift/glow hover as hero; keeps default left-aligned label styling (e.g. admin metrics). */
  interactive?: boolean;
}

export function StatCard({
  label,
  value,
  detail,
  className = "",
  highlight = false,
  interactive = false,
}: StatCardProps) {
  const lifted = highlight || interactive;

  const shell = [
    "rounded-2xl border border-slate-800 bg-slate-900/70 p-4",
    lifted && STAT_HOVER_SHELL,
    highlight && "text-center",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const labelClass = highlight
    ? "text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/90 transition duration-200 group-hover:text-cyan-200"
    : interactive
      ? "text-sm text-slate-400 transition duration-200 group-hover:text-slate-300"
      : "text-sm text-slate-400";

  const valueClass = highlight
    ? "mt-2 text-2xl font-semibold tabular-nums text-white transition duration-200 group-hover:drop-shadow-[0_0_12px_rgba(34,211,238,0.22)]"
    : interactive
      ? "mt-2 text-2xl font-semibold text-white transition duration-200 group-hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.14)]"
      : "mt-2 text-2xl font-semibold text-white";

  const detailClass =
    interactive || highlight
      ? "mt-1 text-sm text-slate-500 transition duration-200 group-hover:text-slate-400"
      : "mt-1 text-sm text-slate-500";

  return (
    <div className={shell}>
      <p className={labelClass}>{label}</p>
      <p className={valueClass}>{value}</p>
      {detail && <p className={detailClass}>{detail}</p>}
    </div>
  );
}
