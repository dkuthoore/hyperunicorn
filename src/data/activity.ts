import type { WeeklyActivity } from "../types";

const weeks = [1, 2, 3, 4, 5, 6, 7, 8];

export const weeklyActivity: WeeklyActivity[] = [
  ...weeks.map((week) => ({
    personaId: "alice" as const,
    week,
    vaultDepositUsd: 550_000,
    vaultDays: 7,
    tradingVolumeUsd: 0,
    avgOpenInterestUsd: 0,
    oiDays: 0,
    activeTradingDays: 0,
  })),
  ...weeks.map((week) => ({
    personaId: "bob" as const,
    week,
    vaultDepositUsd: 0,
    vaultDays: 0,
    /** Conviction playbook: large exposure held ~full week — flow from rolls only, not churn. */
    tradingVolumeUsd: 42_000 + week * 6_500,
    avgOpenInterestUsd: 145_000 + week * 17_500,
    oiDays: 7,
    activeTradingDays: 1,
  })),
  ...weeks.map((week) => ({
    personaId: "charlie" as const,
    week,
    vaultDepositUsd: 35_000,
    vaultDays: 7,
    tradingVolumeUsd: 0,
    avgOpenInterestUsd: 0,
    oiDays: 0,
    activeTradingDays: 0,
  })),
  ...weeks.map((week) => ({
    personaId: "diana" as const,
    week,
    vaultDepositUsd: 0,
    vaultDays: 0,
    /** Active playbook: routed position flow and shorter-lived LP-based synthetic exposure. */
    tradingVolumeUsd: 235_000 + week * 50_000,
    avgOpenInterestUsd: 43_950 + week * 2_085,
    oiDays: week >= 5 ? 3 : 2,
    activeTradingDays: 7,
  })),
  ...weeks.map((week) => ({
    personaId: "eve" as const,
    week,
    vaultDepositUsd: 78_000,
    vaultDays: 7,
    /** Churn-style farmer: huge routed notional (opens/closes) vs negligible average exposure — volume games without holding risk. */
    tradingVolumeUsd: 340_000 + week * 105_000,
    avgOpenInterestUsd: 4_500,
    oiDays: 1,
    activeTradingDays: 7,
  })),
];
