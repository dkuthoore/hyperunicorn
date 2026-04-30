const usdFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const programRules = {
  seasonWeeks: 8,
  /** Vault / LP deposits: points per $1 deposited per day (before LP duration multiplier). */
  vaultPointsPerDollarDay: 1,
  /** Volume: points per $1 notional traded. */
  volumePointsPerDollar: 2,
  /** Open position: points per $1 of exposure per day. */
  oiHeldPointsPerDollarDay: 1,
  whaleMultiplierCapUsd: 100_000,
  durationLadder: [
    { minDays: 56, multiplier: 2, label: "2.00x loyal LP" },
    { minDays: 28, multiplier: 1.5, label: "1.50x retained LP" },
    { minDays: 14, multiplier: 1.25, label: "1.25x sticky LP" },
    { minDays: 0, multiplier: 1, label: "1.00x base" },
  ],
  streakBonuses: [
    { minActiveDays: 6, bonusPercent: 10, label: "power streak" },
    { minActiveDays: 4, bonusPercent: 5, label: "weekly streak" },
    { minActiveDays: 2, bonusPercent: 2, label: "light streak" },
    { minActiveDays: 0, bonusPercent: 0, label: "no streak" },
  ],
} as const;

const lpDurationMultiplierFormulaLines = programRules.durationLadder
  .filter((tier) => tier.minDays >= 14)
  .sort((a, b) => a.minDays - b.minDays)
  .map((tier) => `${tier.multiplier}× if ≥ ${tier.minDays} days`)
  .join("\n");

/** Same tiers as streak scoring; three positive bonus rows, ascending thresholds. */
const consistencyFormulaLines = programRules.streakBonuses
  .filter((tier) => tier.minActiveDays > 0)
  .sort((a, b) => a.minActiveDays - b.minActiveDays)
  .map((tier) => `${tier.bonusPercent}% × points if ≥ ${tier.minActiveDays} days`)
  .join("\n");

function durationMultiplierRationale(): string {
  const cap = usdFmt.format(programRules.whaleMultiplierCapUsd);
  return `Whale cap: deposits larger than ${cap} that week yield 1× on vault deposits (tiers skipped). Below that cap, tiers apply; below 14 cumulative vault-days you stay at 1× base.`;
}

function vaultDepositsRationale(): string {
  return [
    "Base vault points = this rate × dollars deposited × vault-days in the week, then × LP duration multiplier on those vault points.",
    "Cumulative vault days through the week sets the tier in the next row.",
  ].join("\n\n");
}

/** Overview table: Formula column stays one-glance readable; rationales carry edge cases. */
export const ruleCards = [
  {
    metric: "Vault Deposits",
    formula: "1 pt per $1 per day",
    rationale: vaultDepositsRationale(),
  },
  {
    metric: "LP Duration Multiplier",
    formula: lpDurationMultiplierFormulaLines,
    rationale: durationMultiplierRationale(),
  },
  {
    metric: "Volume",
    formula: `${programRules.volumePointsPerDollar} pts per $1 notional`,
    rationale:
      "Opening and closing of positions. Rewards notional volume to account for leverage used.",
  },
  {
    metric: "Open Exposure",
    formula: "1 pt per $1 average exposure per day",
    rationale:
      "Rewards holding positions open to account for longer-term traders rather than day traders.",
  },
  {
    metric: "Consistency",
    formula: consistencyFormulaLines,
    rationale:
      "Rewards consistent user activity. Users who engage and place trades across several active trading days in the period earn a streak multiplier bonus on qualifying weekly points settled at week's end; vault liquidity is excluded.",
  },
];
