import { PersonaBadge } from "../components/SourceBadge";
import { SectionCard } from "../components/SectionCard";
import { personas } from "../data/personas";
import { ruleCards } from "../data/programRules";

function personaRoleLabel(type: string) {
  if (type === "vault") return "Vault";
  if (type === "trader") return "Trader";
  return "Hybrid";
}

export function Overview() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-slate-950 via-slate-950 to-cyan-950/30 p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
          HyperUnicorn Season 1
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-white md:text-6xl">
          A transparent points system for the first LP-Perp Exchange
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
          Trade LP-Perps and/or deposit into our liquidity vaults to earn points!
        </p>
      </section>

      <SectionCard title="Scoring Rules">
        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-900 text-slate-300">
              <tr>
                <th className="px-4 py-3 font-medium">Metric</th>
                <th className="px-4 py-3 font-medium">Formula</th>
                <th className="px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/60">
              {ruleCards.map((rule) => (
                <tr key={rule.metric}>
                  <td className="px-4 py-4 font-medium text-white">{rule.metric}</td>
                  <td className="whitespace-pre-line px-4 py-4 text-cyan-200">{rule.formula}</td>
                  <td className="px-4 py-4 leading-6 text-slate-400">{rule.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Five user profiles" eyebrow="Same rules, different behavior">
        <p className="leading-7 text-slate-300">
          The mock season runs one shared rules engine for everyone. The five profiles below differ only by simulated activity paths—how much TVL sits in vaults, how much LP-based position flow they route, how long synthetic exposure stays open, and when enforcement kicks in.
        </p>
        <div className="mt-6 space-y-4">
          {personas.map((persona) => (
            <article
              key={persona.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                <PersonaBadge persona={persona} />
                <span className="shrink-0 rounded-full bg-slate-950 px-3 py-1 text-xs font-medium capitalize text-slate-400 ring-1 ring-slate-700">
                  {personaRoleLabel(persona.type)}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium leading-6 text-white">{persona.headline}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{persona.strategy}</p>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
