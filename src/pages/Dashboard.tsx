import { useMemo, useState, type CSSProperties } from "react";
import { Check, Copy } from "lucide-react";
import { BreakdownDonut, LeaderboardChart } from "../components/Charts";
import { SectionCard } from "../components/SectionCard";
import { PersonaBadge } from "../components/SourceBadge";
import { StatCard } from "../components/StatCard";
import { weeklyActivity } from "../data/activity";
import { personas } from "../data/personas";
import { programRules } from "../data/programRules";
import {
  breakdownChartData,
  formatMultiplierShort,
  formatPoints,
  formatUsd,
  getActiveStreakBonusPercent,
  getLeaderboard,
  getPersonaRank,
  getUserScores,
  getWeeklyActivity,
  sourceLabels,
  sumBreakdown,
} from "../lib/rankings";
import type { PersonaId, PersonaType, WeeklyScore } from "../types";

const ADMIN_INSIGHT_PANEL =
  "group rounded-2xl border border-slate-800 bg-slate-900 p-4 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-slate-900/85 hover:shadow-lg hover:shadow-cyan-500/10 active:translate-y-0 active:duration-100";

const DASHBOARD_SECTION_HOVER =
  "transition duration-200 hover:border-cyan-400/30 hover:shadow-[0_0_48px_-12px_rgba(34,211,238,0.12)]";

function ReferralCopyIconButton({ referralCode }: { referralCode: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title={referralCode}
      aria-label={copied ? "Referral code copied" : `Copy referral code ${referralCode}`}
      className="rounded-md p-1 text-cyan-400/90 transition hover:bg-slate-800/90 hover:text-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-cyan-400/50"
      onClick={() => {
        void navigator.clipboard?.writeText(referralCode).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        });
      }}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden strokeWidth={2.5} />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden strokeWidth={2} />
      )}
    </button>
  );
}

export function Dashboard({ scores }: { scores: WeeklyScore[] }) {
  const snapshotWeek = programRules.seasonWeeks;
  const [filter, setFilter] = useState<PersonaType | "all">("all");
  const [selectedPersonaId, setSelectedPersonaId] = useState<PersonaId>("bob");

  const leaderboard = useMemo(
    () => getLeaderboard(scores, snapshotWeek, filter),
    [filter, scores, snapshotWeek],
  );
  const selectedPersona = personas.find((persona) => persona.id === selectedPersonaId) ?? personas[0];
  const selectedScores = getUserScores(scores, selectedPersona.id);
  const selectedBreakdown = sumBreakdown(selectedScores);
  const selectedFinal =
    selectedScores.find((score) => score.week === snapshotWeek) ?? selectedScores.at(-1);
  const myRank = getPersonaRank(scores, snapshotWeek, selectedPersonaId);
  const activeTvl = weeklyActivity
    .filter((activity) => activity.week === snapshotWeek)
    .reduce((sum, activity) => sum + activity.vaultDepositUsd, 0);
  const multiplierUsers = scores.filter(
    (score) => score.week === snapshotWeek && score.durationMultiplier > 1,
  ).length;
  const protocolBreakdown = sumBreakdown(scores.filter((score) => score.week <= snapshotWeek));
  const userTypeDistribution = (["vault", "trader", "hybrid"] as const).map((type) => ({
    type,
    count: personas.filter((persona) => persona.type === type).length,
  }));
  const mockReferralCode = `UNICORN-${selectedPersona.id.toUpperCase()}`;
  const depositBuckets = [
    { label: "$0", min: 0, max: 0 },
    { label: "$1-$50K", min: 1, max: 50_000 },
    { label: "$50K-$100K", min: 50_001, max: 100_000 },
    { label: "$100K+", min: 100_001, max: Number.POSITIVE_INFINITY },
  ].map((bucket) => ({
    ...bucket,
    count: weeklyActivity.filter(
      (activity) =>
        activity.week === snapshotWeek &&
        activity.vaultDepositUsd >= bucket.min &&
        activity.vaultDepositUsd <= bucket.max,
    ).length,
  }));

  return (
    <div className="min-w-0 space-y-6">
      <header className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950/95 to-slate-900/90 p-4 shadow-md shadow-slate-950/25 transition duration-200 hover:border-cyan-400/25 hover:shadow-lg hover:shadow-cyan-950/20 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/90">Your dashboard</p>
            <p className="mt-1 max-w-xl text-xs leading-snug text-slate-500 sm:text-sm">
              Switch persona to preview their metrics, breakdown, and weekly history.
            </p>
          </div>
        </div>

        <div
          className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Demo personas"
        >
          {personas.map((persona) => {
            const selected = selectedPersonaId === persona.id;
            return (
              <button
                key={persona.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-pressed={selected}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-left text-sm transition ${
                  selected
                    ? "border-cyan-300/80 bg-cyan-300/15 text-white ring-1 ring-cyan-300/35"
                    : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500 hover:bg-slate-800/70"
                }`}
                style={
                  {
                    boxShadow: selected ? `inset 3px 0 0 ${persona.color}` : undefined,
                  } satisfies CSSProperties
                }
                onClick={() => setSelectedPersonaId(persona.id)}
              >
                <span className="font-semibold text-white">{persona.name}</span>
                <span className={`hidden text-slate-500 sm:inline ${selected ? "text-slate-400" : ""}`}>
                  {persona.handle}
                </span>
                {persona.id === "eve" && (
                  <span className="rounded-full bg-red-500/20 px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide text-red-200 ring-1 ring-red-400/45">
                    Flagged
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-800/80 pt-4 sm:flex-row sm:items-start sm:gap-4">
          <div className="shrink-0">
            <p className="sr-only">Selected profile</p>
            <PersonaBadge persona={selectedPersona} />
          </div>
          <p className="min-w-0 flex-1 text-sm leading-relaxed text-slate-400 line-clamp-3 sm:line-clamp-2">
            {selectedPersona.strategy}
          </p>
          {selectedPersonaId === "eve" && (
            <div className="rounded-xl border border-red-400/35 bg-red-950/35 px-3 py-2 text-xs text-red-100 sm:max-w-xs">
              <p className="font-semibold text-red-200">Flagged wallet</p>
              <p className="mt-0.5 leading-snug text-red-100/90">
                Activity pattern: extremely high volume versus low hold time. Consistent with spamming opens/closes
                rather than productive trading.
              </p>
            </div>
          )}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          highlight
          label="Your points"
          value={formatPoints(selectedFinal?.cumulative ?? 0)}
        />
        <StatCard
          highlight
          label="Your rank"
          value={myRank != null ? `#${myRank} of ${personas.length}` : "—"}
        />
        <div className="group text-center rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-slate-900/85 hover:shadow-lg hover:shadow-cyan-500/10 active:translate-y-0 active:duration-100">
          <div className="flex items-center justify-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/90 transition duration-200 group-hover:text-cyan-200">
              Referrals
            </p>
            <ReferralCopyIconButton key={selectedPersonaId} referralCode={mockReferralCode} />
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-white transition duration-200 group-hover:drop-shadow-[0_0_12px_rgba(34,211,238,0.22)]">
            {selectedPersona.mockReferralCount}
          </p>
        </div>
      </div>

      <SectionCard
        title="Points breakdown"
        eyebrow="Season to date"
        className={`min-w-0 ${DASHBOARD_SECTION_HOVER}`}
      >
        <p className="-mt-1 mb-4 text-sm text-slate-400">
          How this persona’s cumulative score splits across scoring sources.
        </p>
        <BreakdownDonut data={breakdownChartData(selectedBreakdown)} />
      </SectionCard>

      <SectionCard
        title="Weekly history"
        eyebrow={selectedPersona.name}
        className={`min-w-0 ${DASHBOARD_SECTION_HOVER}`}
      >
        <div className="scrollbar-hide max-w-full min-w-0 overflow-x-auto overscroll-x-contain rounded-2xl border border-slate-800">
          <table className="w-full min-w-[1280px] text-center text-sm">
            <thead className="bg-slate-900 text-slate-300">
              <tr>
                <th className="sticky left-0 z-10 bg-slate-900 px-4 py-3 font-medium" rowSpan={2}>
                  Week
                </th>
                <th className="px-4 py-2 text-center font-medium text-cyan-200/90" colSpan={3}>
                  Activity (USD)
                </th>
                <th className="border-l border-slate-600 px-4 py-2 text-center font-medium text-slate-200" colSpan={6}>
                  Points
                </th>
              </tr>
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-center font-normal text-slate-400">Deposit</th>
                <th className="whitespace-nowrap px-4 py-3 text-center font-normal text-slate-400">
                  Notional volume
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-center font-normal text-slate-400">Avg exposure</th>
                <th className="whitespace-nowrap border-l border-slate-600 px-4 py-3 text-center font-normal text-slate-400">
                  Vault
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-center font-normal text-slate-400">Volume</th>
                <th className="whitespace-nowrap px-4 py-3 text-center font-normal text-slate-400">
                  Open pos. duration
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-center font-normal text-slate-400">Streak</th>
                <th className="whitespace-nowrap px-4 py-3 text-center font-normal text-slate-400">Boosts</th>
                <th className="whitespace-nowrap px-4 py-3 text-center font-normal text-slate-400">Σ pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {selectedScores.map((score) => {
                const activity = getWeeklyActivity(selectedPersona.id, score.week);
                const streakPct = getActiveStreakBonusPercent(activity?.activeTradingDays ?? 0);
                const showLpBoost = score.durationMultiplier > 1;
                const showStreakBoost = streakPct > 0;
                return (
                  <tr key={score.week} className="bg-slate-950/60">
                    <td className="sticky left-0 z-10 border-r border-slate-800 bg-slate-950/95 px-4 py-3 text-white backdrop-blur">
                      {score.week}
                    </td>
                    <td className="px-4 py-3 text-emerald-200/90">{formatUsd(activity?.vaultDepositUsd ?? 0)}</td>
                    <td className="px-4 py-3 text-emerald-200/90">{formatUsd(activity?.tradingVolumeUsd ?? 0)}</td>
                    <td className="px-4 py-3 text-emerald-200/90">{formatUsd(activity?.avgOpenInterestUsd ?? 0)}</td>
                    <td className="border-l border-slate-600 px-4 py-3 text-slate-300">{formatPoints(score.breakdown.vault)}</td>
                    <td className="px-4 py-3 text-slate-300">{formatPoints(score.breakdown.volume)}</td>
                    <td className="px-4 py-3 text-slate-300">{formatPoints(score.breakdown.oiHeld)}</td>
                    <td className="px-4 py-3 text-slate-300">{formatPoints(score.breakdown.streak)}</td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex min-h-[1.5rem] flex-wrap items-center justify-center gap-1.5">
                        {showLpBoost && (
                          <span
                            className="inline-flex items-center rounded-full border border-violet-400/40 bg-violet-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-violet-100 ring-1 ring-violet-400/30"
                            title={score.multiplierLabel}
                          >
                            {formatMultiplierShort(score.durationMultiplier)} LP
                          </span>
                        )}
                        {showStreakBoost && (
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${streakBoostRingClass(streakPct)}`}
                            title="Consistency bonus on volume + open exposure"
                          >
                            {streakPct}% streak
                          </span>
                        )}
                        {!showLpBoost && !showStreakBoost && (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">{formatPoints(score.cumulative)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Activity amounts use USD. Point columns are dimensionless scoring units. Boosts show active LP duration
          multipliers and consistency (streak) bonus tiers for that week. Scroll horizontally if the row is wider than
          your screen.
        </p>
      </SectionCard>

      <div
        className="flex flex-col items-center gap-0 py-10 sm:py-12"
        role="separator"
        aria-orientation="horizontal"
      >
        <div className="h-1 w-full max-w-2xl rounded-full bg-gradient-to-r from-transparent via-cyan-300/55 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.15)]" />
      </div>

      <SectionCard
        title="Season overview"
        eyebrow="Admin dashboard"
        className={`min-w-0 ${DASHBOARD_SECTION_HOVER}`}
      >
        <p className="-mt-1 mb-6 text-sm text-slate-400">
          Aggregate TVL mix and protocol totals — admin-style view, not participant-specific.
        </p>
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            interactive
            label="Season TVL"
            value={formatUsd(activeTvl)}
            detail={`Week ${snapshotWeek} simulated vault deposits`}
          />
          <StatCard interactive label="Participants" value={`${personas.length}`} detail="Archetypes in mock data" />
          <StatCard
            interactive
            label="Multiplier adoption"
            value={`${multiplierUsers}`}
            detail={`Users above 1.0x in week ${snapshotWeek}`}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className={ADMIN_INSIGHT_PANEL}>
            <h3 className="font-semibold text-white transition duration-200 group-hover:text-cyan-100">
              User type distribution
            </h3>
            <div className="mt-4 space-y-3">
              {userTypeDistribution.map((item) => (
                <div key={item.type}>
                  <div className="mb-1 flex justify-between text-sm capitalize text-slate-300">
                    <span>{item.type}</span>
                    <span>{item.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-cyan-300"
                      style={{ width: `${(item.count / personas.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={ADMIN_INSIGHT_PANEL}>
            <h3 className="font-semibold text-white transition duration-200 group-hover:text-cyan-100">
              Deposit size buckets
            </h3>
            <div className="mt-4 space-y-3">
              {depositBuckets.map((bucket) => (
                <div key={bucket.label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{bucket.label}</span>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-white">{bucket.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={ADMIN_INSIGHT_PANEL}>
            <h3 className="font-semibold text-white transition duration-200 group-hover:text-cyan-100">
              Points source mix
            </h3>
            <div className="mt-4 space-y-3">
              {Object.entries(protocolBreakdown)
                .filter(([, value]) => value !== 0)
                .map(([source, value]) => (
                  <div key={source} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{sourceLabels[source as keyof typeof sourceLabels]}</span>
                    <span className={value < 0 ? "text-red-300" : "text-white"}>{formatPoints(value)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Season leaderboard"
        eyebrow="Admin — all participants (end of season)"
        className={`min-w-0 ${DASHBOARD_SECTION_HOVER}`}
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(["all", "vault", "trader", "hybrid"] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={`rounded-full px-3 py-1.5 text-sm capitalize transition duration-200 ${
                  filter === item
                    ? "bg-cyan-300 text-slate-950 shadow-md shadow-cyan-500/25"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white hover:ring-1 hover:ring-cyan-400/30 active:scale-[0.98]"
                }`}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <LeaderboardChart rows={leaderboard} />
        <div className="mt-5 space-y-2">
          {leaderboard.map((row) => (
            <button
              key={row.persona.id}
              type="button"
              className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition duration-200 ${
                selectedPersonaId === row.persona.id
                  ? "border-cyan-300 bg-cyan-300/10 shadow-md shadow-cyan-500/15"
                  : "border-slate-800 bg-slate-900/70 hover:-translate-y-0.5 hover:border-cyan-400/35 hover:bg-slate-900/85 hover:shadow-lg hover:shadow-cyan-500/10 active:translate-y-0"
              }`}
              onClick={() => setSelectedPersonaId(row.persona.id)}
            >
              <div className="space-y-2">
                <p className="text-sm text-slate-500">Rank #{row.rank}</p>
                <PersonaBadge persona={row.persona} />
                {row.persona.id === "eve" && (
                  <span className="inline-block rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-200 ring-1 ring-red-400/45">
                    Points integrity flag
                  </span>
                )}
              </div>
              <p className="text-lg font-semibold text-white">{formatPoints(row.points)} pts</p>
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function streakBoostRingClass(pct: number): string {
  if (pct >= 10) return "border-rose-400/40 bg-rose-500/15 text-rose-100 ring-rose-400/30";
  if (pct >= 5) return "border-amber-400/40 bg-amber-500/15 text-amber-100 ring-amber-400/30";
  return "border-teal-400/40 bg-teal-500/15 text-teal-100 ring-teal-400/30";
}
