# HyperUnicorn Season 1 — Points System Design Specification

**Version:** 1.0 (prototype)  
**Status:** Normative for this repository; implementation lives in TypeScript modules cited below.  
**Season length:** 8 weekly epochs (`programRules.seasonWeeks`).

This document describes *what the points system is*. Product rationale, interview-style narrative, and “how I approached the assignment” live in [README.md](README.md).

---

## 1. Goals and non-goals

### 1.1 Goals

- Reward **vault (managed LP / TVL)** and **direct trading** activity in one transparent season.
- Prefer **simple integer rates** auditors can recompute by hand.
- Encode **stickiness** for smaller LPs (duration ladder) while **capping compounding** for very large vault deposits (whale cap).
- Encode **consistency** for traders via an active-day bonus applied only to trading-derived buckets (not vault).
- Demonstrate evolution over **multiple weeks** with **mock per-user activity** (see §7).

### 1.2 Non-goals (this prototype)

- Real-time or onchain scoring; indexer, oracle, or wallet auth.
- Sybil resistance, wallet clustering, or post-season enforcement automation (flagging is narrative/UI-only unless `slash` is populated on activity).
- Referrals: persona fields may reference mock referral counts; **they are not scored** in Season 1.

---

## 2. Definitions

| Term | Meaning in this prototype |
|------|---------------------------|
| **Participant** | A distinct user identity; mock data uses a fixed set of `PersonaId` values. |
| **Week / epoch** | Integer `week` from 1 … `seasonWeeks` (8). |
| **Vault deposit (USD)** | `vaultDepositUsd`: notional USD treated as deposited for scoring that week. |
| **Vault-days** | `vaultDays`: number of days in the week that deposit counts toward dollar-days (max 7 in mock data). |
| **Cumulative vault-days** | Running sum of `vaultDays` per participant across weeks **in week order** (see §5.3). |
| **Trading volume (USD)** | `tradingVolumeUsd`: notional routed for opens/closes / rolls for the week. |
| **Average open exposure (USD)** | `avgOpenInterestUsd`: simplified stand-in for average position size over the week. |
| **OI-days** | `oiDays`: days the exposure metric counts toward “exposure points” that week. |
| **Active trading days** | `activeTradingDays`: count of days with meaningful trading activity in the week (0–7 in mock); drives consistency bonus. |
| **Points** | Abstract loyalty units; not transferable tokens. |

---

## 3. Canonical parameters

All numeric constants are defined in `src/data/programRules.ts` (single source of truth for the UI and scorer).

| Parameter | Value | Notes |
|-----------|-------|--------|
| `vaultPointsPerDollarDay` | 1 | Points per $1 vault deposit per vault-day, **before** LP duration multiplier. |
| `volumePointsPerDollar` | 2 | Points per $1 notional volume. |
| `oiHeldPointsPerDollarDay` | 1 | Points per $1 average exposure per OI-day. |
| `whaleMultiplierCapUsd` | 100,000 | If `vaultDepositUsd` **>** this in a week, LP duration multiplier is **1×** for that week’s vault scoring. |
| LP duration ladder | See §4.2 | Applied to **vault** points only. |
| Consistency ladder | See §4.3 | Percent of **qualifying** trading points (volume + OI-held). |

---

## 4. Scoring rules

### 4.1 Weekly breakdown buckets

For each participant and week, the engine computes `ScoreBreakdown`:

- `vault` — vault dollar-days × rate × LP duration multiplier  
- `volume` — volume × rate  
- `oiHeld` — average exposure × OI-days × rate  
- `streak` — consistency bonus (§4.3)  
- `slash` — optional penalty (negative points), §4.4  

**Weekly total** is the sum of all breakdown components. **Cumulative** points are the running sum of weekly totals per participant in **week order** (ties broken in code by persona id when sorting activities).

Implementation: `src/lib/scoring.ts` (`scoreWeek`, `getAllScores`).

### 4.2 Vault points and LP duration multiplier

**Base vault points (before multiplier):**

```text
baseVault = vaultDepositUsd × vaultDays × vaultPointsPerDollarDay
vaultPoints = baseVault × durationMultiplier
```

**Duration multiplier** (`getDurationMultiplier`):

1. If `vaultDepositUsd` > `whaleMultiplierCapUsd` → multiplier **1×** (label: whale cap).
2. Otherwise choose the **first** tier in `durationLadder` such that `cumulativeVaultDays >= minDays`, where `durationLadder` is ordered from **highest** `minDays` to **lowest** (so the best eligible tier wins).

Tiers (cumulative vault-days):

| Cumulative vault-days ≥ | Multiplier |
|-------------------------|------------|
| 56 | 2× |
| 28 | 1.5× |
| 14 | 1.25× |
| 0 | 1× |

**Critical implementation detail:** When scoring a given week, `cumulativeVaultDays` is the participant’s total **including that week’s** `vaultDays` (updated before `scoreWeek` runs). See `getAllScores` in `src/lib/scoring.ts`.

### 4.3 Volume, open exposure, and consistency

**Volume points:**

```text
volumePoints = tradingVolumeUsd × volumePointsPerDollar
```

**Open exposure points:**

```text
oiHeldPoints = avgOpenInterestUsd × oiDays × oiHeldPointsPerDollarDay
```

**Consistency (streak) bonus:**

```text
streakEligible = volumePoints + oiHeldPoints
streakPoints = streakEligible × (bonusPercent / 100)
          where bonusPercent follows streakBonuses tier for activeTradingDays
```

`streakBonuses` use the same “first matching tier” pattern: list ordered **descending** by `minActiveDays` so the **best** eligible tier applies.

| Active trading days ≥ | Bonus % of `streakEligible` |
|------------------------|------------------------------|
| 6 | 10% |
| 4 | 5% |
| 2 | 2% |
| 0 | 0% |

Vault-derived points are **excluded** from `streakEligible` (only volume + OI-held).

### 4.4 Slash / adjustments

`WeeklyActivity` may include optional `slash: { points: number; reason: string }`. The scorer adds **`breakdown.slash = -points`** (negative). There is no separate rules engine—this encodes post-hoc or manual adjustments in mock data.

### 4.5 Rounding and display

- Internal values are floating-point; **totals and leaderboard** presentation may round for display in the UI (`formatPoints`, charts). The spec allows implementation-defined rounding for display only; weekly `total` in code is the sum of raw breakdown values.

---

## 5. Ordering and pipeline

### 5.1 Input ordering

`getAllScores`:

1. Sorts all activity rows by `week` ascending, then `personaId` lexicographically.
2. For each row in order, updates cumulative vault-days, scores the week, updates cumulative points.

### 5.2 Leaderboard and rank

At a given `week` **W**:

- Each participant’s **leaderboard points** are `WeeklyScore.cumulative` for the row `(personaId, week === W)`.
- **Rank** is sort by cumulative descending; rank 1 is highest. Filter may restrict to persona `type` (`vault` | `trader` | `hybrid`) or `all`.

Implementation: `src/lib/rankings.ts` (`getLeaderboard`, `getPersonaRank`).

### 5.3 Production-oriented batch pipeline (informative)

A production system would ingest immutable **raw activity** per epoch, version **rule parameters**, run the same pure function as `getAllScores`, and persist `WeeklyScore` rows for audit. This repo stops at in-memory computation from `src/data/activity.ts`.

---

## 6. UX contract (prototype)

The interface must allow a participant to understand:

- **Total points** (weekly and cumulative).
- **Relative standing** (rank and leaderboard at epoch **8** in the default dashboard snapshot).
- **Contribution by source** (donut / breakdown: vault, volume, OI-held, consistency, slash).

Implemented in `src/pages/Dashboard.tsx`, `src/pages/Simulation.tsx`, `src/pages/Overview.tsx`.

---

## 7. Mock data and personas

- **Activity:** `src/data/activity.ts` — per-persona weekly rows for weeks 1–8.
- **Persona metadata:** `src/data/personas.ts` — labels, `PersonaType`, copy for demo.
- **Types:** `src/types.ts` — `WeeklyActivity`, `WeeklyScore`, `ScoreBreakdown`, etc.

Personas are documented in README; Eve illustrates **high volume vs negligible held exposure** (abuse shape) for qualitative discussion—Season 1 rules still award points unless `slash` is applied in data.

---

## 8. Worked example (one week, illustrative)

Constants: `vaultPointsPerDollarDay = 1`, `volumePointsPerDollar = 2`, `oiHeldPointsPerDollarDay = 1`.

Assume **no whale cap**, prior cumulative vault-days = **13**, this week `vaultDepositUsd = 10,000`, `vaultDays = 7`:

- Cumulative vault-days after this week = **20** → duration tier **≥14** → multiplier **1.25×**.
- `baseVault = 10,000 × 7 × 1 = 70,000`
- `vault = 70,000 × 1.25 = 87,500`

Same week: `tradingVolumeUsd = 50,000`, `avgOpenInterestUsd = 20,000`, `oiDays = 7`, `activeTradingDays = 5`:

- `volume = 50,000 × 2 = 100,000`
- `oiHeld = 20,000 × 7 × 1 = 140,000`
- `streakEligible = 240,000`; active days ≥4 → **5%** → `streak = 12,000`

Weekly `total = 87,500 + 100,000 + 140,000 + 12,000 = 339,500` (plus `slash` if any).

---

## 9. File map (implementation reference)

| Concern | File(s) |
|---------|---------|
| Constants & display rule cards | `src/data/programRules.ts` |
| Pure scoring | `src/lib/scoring.ts` |
| Leaderboard, aggregates, labels | `src/lib/rankings.ts` |
| Mock time-series activity | `src/data/activity.ts` |
| Participant definitions | `src/data/personas.ts` |
| Type definitions | `src/types.ts` |

---

## 10. Open issues (explicit)

- **Vault churn between checkpoints:** Dollar-days can be gamed if users move liquidity unless withdrawals are delayed or snapshots are denser—called out in README / Next Steps.
- **Average exposure:** Mock uses a scalar average; production needs snapshots or integrals over position state.
- **Volume quality:** Notional volume can be wash-traded; no fee-weighted or counterparty-quality term in Season 1.
- **Sybil:** One wallet ≠ one human; not modeled.

Any change to scoring must update **this document** and **`src/data/programRules.ts` / `src/lib/scoring.ts`** together.
