import { weeklyActivity } from "../data/activity";
import { personas } from "../data/personas";
import { programRules } from "../data/programRules";
import type { Persona, PersonaId, PersonaType, PointsSource, ScoreBreakdown, WeeklyActivity, WeeklyScore } from "../types";

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPoints(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

/** Compact ticks for leaderboard Y-axis (e.g. 2.4M, 892K) — points, not USD. */
export function formatAxisPointsCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Math.round(Number(value)));
}

export function getWeeklyActivity(personaId: PersonaId, week: number): WeeklyActivity | undefined {
  return weeklyActivity.find((activity) => activity.personaId === personaId && activity.week === week);
}

/** Streak tier percent — same `.find()` order as `scoreWeek`. */
export function getActiveStreakBonusPercent(activeTradingDays: number): number {
  return (
    programRules.streakBonuses.find((item) => activeTradingDays >= item.minActiveDays)?.bonusPercent ?? 0
  );
}

/** Short multiplier for badges (1.25×, 2×). */
export function formatMultiplierShort(multiplier: number): string {
  if (multiplier % 1 === 0) return `${multiplier}×`;
  return `${Number(multiplier.toFixed(2)).toString()}×`;
}

/** Rank among all participants at the chosen epoch (#1 highest points). */
export function getPersonaRank(
  scores: WeeklyScore[],
  week: number,
  personaId: PersonaId,
): number | undefined {
  const board = getLeaderboard(scores, week, "all");
  return board.find((row) => row.persona.id === personaId)?.rank;
}

export function getLeaderboard(
  scores: WeeklyScore[],
  week: number,
  filter: PersonaType | "all",
) {
  return personas
    .filter((persona) => filter === "all" || persona.type === filter)
    .map((persona) => {
      const score = scores.find((item) => item.personaId === persona.id && item.week === week);
      return {
        persona,
        score,
        points: score?.cumulative ?? 0,
      };
    })
    .sort((a, b) => b.points - a.points)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export function getUserScores(scores: WeeklyScore[], personaId: PersonaId) {
  return scores.filter((score) => score.personaId === personaId).sort((a, b) => a.week - b.week);
}

export function sumBreakdown(scores: WeeklyScore[]): ScoreBreakdown {
  const totals: ScoreBreakdown = {
    vault: 0,
    volume: 0,
    oiHeld: 0,
    streak: 0,
    slash: 0,
  };

  scores.forEach((score) => {
    Object.entries(score.breakdown).forEach(([source, value]) => {
      totals[source as PointsSource] += value;
    });
  });

  return totals;
}

export function breakdownChartData(
  breakdown: ScoreBreakdown,
  options?: { includeSlash?: boolean },
) {
  const includeSlash = options?.includeSlash ?? false;
  return Object.entries(breakdown)
    .filter(([source, value]) => {
      if (value === 0) return false;
      if (!includeSlash && source === "slash") return false;
      return true;
    })
    .map(([source, value]) => ({
      source,
      label: sourceLabels[source as PointsSource],
      value: Math.round(value),
    }));
}

export const sourceLabels: Record<PointsSource, string> = {
  vault: "Vault Deposits",
  volume: "Volume",
  oiHeld: "Open Position Duration",
  streak: "Consistency",
  slash: "Slashing",
};
