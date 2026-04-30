import type { ReactNode } from "react";

interface SectionCardProps {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ title, eyebrow, children, className = "" }: SectionCardProps) {
  return (
    <section
      className={`rounded-3xl border border-slate-800 bg-slate-950/75 p-6 shadow-2xl shadow-slate-950/30 ${className}`}
    >
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
          {eyebrow}
        </p>
      )}
      {title && <h2 className="mb-4 text-2xl font-semibold text-white">{title}</h2>}
      {children}
    </section>
  );
}
