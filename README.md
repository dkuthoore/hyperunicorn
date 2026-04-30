# HyperUnicorn Points Prototype

This is a small React + TypeScript prototype for the Panoptic take-home assignment. It designs and demos a points system for HyperUnicorn, a hypothetical DeFi protocol with managed vault users and direct perpetual-style traders.

The **normative** Season 1 rules (formulas, ordering, leaderboard semantics, and file map) live in [Points-System-Spec.md](Points-System-Spec.md); this README focuses on motivation and tradeoffs.

## Run Locally

```bash
npm install
npm run dev
```

## What I Built

The app has four top-level tabs:

- **Overview** explains the scoring model, formulas, and user personas.
- **Simulation** compares five user archetypes over eight weekly epochs and shows how their cumulative points evolve.
- **Dashboard** includes a user dashboard and an admin dashboard: users can see their trading activity and points history; admins see aggregate-level statistics.
- **Next Steps** lists out areas for improvement and things I would implement in a production system.

All scoring inputs are local mock data in `src/data/`.

## Points System

Users can do two things on HyperUnicorn: deposit into vaults or trade. They earn points based on those activities according to the point system below.

- **Vault Deposits:** `1 pt per $1 per day`
- **LP Duration Multiplier:** `1.25×` / `1.5×` / `2×` at ≥14 / ≥28 / ≥56 cumulative vault-days respectively; deposits above `$100K` skip tiers (`1×` on vault-derived points—that week’s whale cap in Overview).
- **Volume:** `2 pts per $1` notional (opens/closes).
- **Open Exposure:** `1 pt per $1` of average exposure per day.
- **Consistency:** `2%` / `5%` / `10%` of qualifying weekly volume + open-exposure points at ≥2 / ≥4 / ≥6 active trading days (vault excluded)—same tiers as the Overview formulas.

On HyperUnicorn, users are trading their Uniswap LP positions, but for simplicity, we ignore any complexity associated with LP positions and just simplify it to trading and vault depositing.

## Personas

Mock data is split into separate files under `src/data`:

- **Alice, Vault Whale:** large vault depositor, valuable for TVL, excluded from duration multiplier by the $100K cap.
- **Bob, Conviction Trader:** large open position, low routed volume, few trades.
- **Charlie, Passive Depositor:** medium vault user who unlocks duration multipliers at week 2 and week 4.
- **Diana, Volume Trader:** day trader, high volume, many trades, high leverage.
- **Eve, Points Farmer:** very large volume from farming; abusive vault deposits and withdrawals.

## My Approach

### Foundations and Demo

I wanted to create a simple and clear points program for this assignment. So I started from first principles with the two activities users can take on the platform (trading and depositing) and worked up from there. 

I intentionally abstracted away the complexity of the HyperUnicorn DeFi protocol (trading Uniswap LP positions rather than traditional perps) as it introduces a lot of detail that is not important to the points program in and of itself.  
To present the details of the Points Program verbally, I added the scoring rules and Next Steps to the UI.

### Points Program Rules

I experimented with many combinations of points rules and persona activity, then decided to use integer point rates and other easy-to-read coefficients—for example, `1 pt` per `$1` per day on vault deposits—so the model is easy to audit, quick to recompute by hand, and easy for users to understand in their dashboard.

### Personas

I added the Eve persona as a simple example of someone abusing the system. Rather than filtering scores in real time, it felt more appropriate to award points under the published Season 1 rules and handle enforcement after the fact—so I surface her flagged activity in the Dashboard instead of stripping credit live.

### Practical Measures

I wanted to think practically about how points overwhelmingly skew toward whales. I implemented the LP duration multiplier to reward sticky vault liquidity, but it does not apply above the whale threshold—large depositors still earn vault points, without stacking extra LP duration tiers on top.

### Edge Cases

- **Vault Abuse.** People can still game vault dollar-days by moving liquidity around weekly checkpoints without leaving sticky TVL, which is why I pointed at delayed withdrawals in **Next Steps** instead of pretending this mock closes the hole.
- **Sybil Resistance.** This POC does not account for out-of-protocol sybil activity like wallet clustering. I mentioned we would filter this activity out after the season. 
- **How average exposure is calculated.** We currently use an average exposure value to mock open positions, but in practice this would need to be measured with snapshots or calculated from real position data.

## Areas for Improvement and Next Steps

The **Next Steps** tab in the UI lists the product directions I would iterate toward first. I kept the same themes here in my own words, plus a short engineering backlog

**Product Next Steps**

- **New-Market Exploration.** I would reward thoughtful activity in newly listed or quieter markets once there is enough data to tell real bootstrapping apart from hollow farming.
- **Liquidation Resilience Bonuses.** I like small comeback incentives for traders who get liquidated, come back with real flow or fees, and keep contributing to the protocol instead of disappearing.
- **Referral Program**
- **PnL-Based Rewards.**  Weekly trading competitions or an end-of-season bonus that allocates prizes to strong traders.
- **Delayed Withdrawals.** I would add withdrawal delays to prevent vault abuse. 
- **Deeper Slashing + Sybil Review.** 

