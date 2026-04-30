import { weeklyActivity } from "../data/activity";
import { programRules } from "../data/programRules";
import type { PersonaId, ScoreBreakdown, WeeklyActivity, WeeklyScore } from "../types";

const emptyBreakdown = (): ScoreBreakdown => ({
  vault: 0,
  volume: 0,
  oiHeld: 0,
  streak: 0,
  slash: 0,
});

function getDurationMultiplier(
  cumulativeVaultDays: number,
  depositUsd: number,
): { multiplier: number; label: string } {
  if (depositUsd > programRules.whaleMultiplierCapUsd) {
    return { multiplier: 1, label: "1.00x whale cap" };
  }

  const tier = programRules.durationLadder.find(
    (item) => cumulativeVaultDays >= item.minDays,
  );

  return {
    multiplier: tier?.multiplier ?? 1,
    label: tier?.label ?? "1.00x base",
  };
}

function getStreakRate(activeTradingDays: number): number {
  const pct =
    programRules.streakBonuses.find((item) => activeTradingDays >= item.minActiveDays)
      ?.bonusPercent ?? 0;
  return pct / 100;
}

function scoreWeek(
  activity: WeeklyActivity,
  cumulativeVaultDays: number,
): Omit<WeeklyScore, "cumulative"> {
  const breakdown = emptyBreakdown();
  const { multiplier, label } = getDurationMultiplier(
    cumulativeVaultDays,
    activity.vaultDepositUsd,
  );

  const baseVault =
    activity.vaultDepositUsd * activity.vaultDays * programRules.vaultPointsPerDollarDay;
  breakdown.vault = baseVault * multiplier;
  breakdown.volume = activity.tradingVolumeUsd * programRules.volumePointsPerDollar;
  breakdown.oiHeld =
    activity.avgOpenInterestUsd * activity.oiDays * programRules.oiHeldPointsPerDollarDay;

  const streakEligible = breakdown.volume + breakdown.oiHeld;
  breakdown.streak = streakEligible * getStreakRate(activity.activeTradingDays);
  breakdown.slash = activity.slash ? -activity.slash.points : 0;

  const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
  const events: string[] = [];

  if (label !== "1.00x base" && activity.vaultDepositUsd > 0) {
    events.push(`${label} duration multiplier active`);
  }
  return {
    personaId: activity.personaId,
    week: activity.week,
    breakdown,
    total,
    durationMultiplier: multiplier,
    multiplierLabel: label,
    events,
  };
}

export function getAllScores(): WeeklyScore[] {
  const cumulativeByUser = new Map<PersonaId, number>();
  const vaultDaysByUser = new Map<PersonaId, number>();

  return [...weeklyActivity]
    .sort((a, b) => a.week - b.week || a.personaId.localeCompare(b.personaId))
    .map((activity) => {
      const nextVaultDays =
        (vaultDaysByUser.get(activity.personaId) ?? 0) + activity.vaultDays;
      vaultDaysByUser.set(activity.personaId, nextVaultDays);

      const score = scoreWeek(activity, nextVaultDays);
      const cumulative = Math.max(
        0,
        (cumulativeByUser.get(activity.personaId) ?? 0) + score.total,
      );
      cumulativeByUser.set(activity.personaId, cumulative);

      return { ...score, cumulative };
    });
}
