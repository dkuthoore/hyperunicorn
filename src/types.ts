export type PersonaId = "alice" | "bob" | "charlie" | "diana" | "eve";

export type PersonaType = "vault" | "trader" | "hybrid";

export type PointsSource =
  | "vault"
  | "volume"
  | "oiHeld"
  | "streak"
  | "slash";

export interface Persona {
  id: PersonaId;
  name: string;
  handle: string;
  type: PersonaType;
  headline: string;
  strategy: string;
  risk: string;
  color: string;
  /** Demo-only: qualified referrals in-flight; not part of Season 1 scoring. */
  mockReferralCount: number;
}

interface SlashEvent {
  points: number;
  reason: string;
}

export interface WeeklyActivity {
  personaId: PersonaId;
  week: number;
  vaultDepositUsd: number;
  vaultDays: number;
  tradingVolumeUsd: number;
  /** Synthetic exposure represented by AMM LP positions rather than a CEX-style perp book. */
  avgOpenInterestUsd: number;
  oiDays: number;
  activeTradingDays: number;
  slash?: SlashEvent;
}

export type ScoreBreakdown = Record<PointsSource, number>;

export interface WeeklyScore {
  personaId: PersonaId;
  week: number;
  breakdown: ScoreBreakdown;
  total: number;
  cumulative: number;
  durationMultiplier: number;
  multiplierLabel: string;
  events: string[];
}
