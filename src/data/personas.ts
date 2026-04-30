import type { Persona } from "../types";

export const personas: Persona[] = [
  {
    id: "alice",
    name: "Alice",
    handle: "Vault Whale",
    type: "vault",
    headline: "Large vault depositor who anchors TVL but does not need retention subsidies.",
    strategy:
      "Deposits a large amount into the managed vault for the full season. She is valuable for depth, but her size alone should not compound through every bonus.",
    risk: "Low operational risk, high concentration risk.",
    color: "#8b5cf6",
    mockReferralCount: 3,
  },
  {
    id: "bob",
    name: "Bob",
    handle: "Conviction Trader",
    type: "trader",
    headline: "Holds meaningful perp exposure for days instead of cycling volume.",
    strategy:
      "Keeps a large synthetic directional position open nearly the full epoch through HyperUnicorn's LP-position primitive and only rolls minimally. Conviction over churn: meaningful held exposure with comparatively light weekly flow next to volume traders.",
    risk: "High market risk, high protocol fee contribution.",
    color: "#14b8a6",
    mockReferralCount: 7,
  },
  {
    id: "charlie",
    name: "Charlie",
    handle: "Passive Depositor",
    type: "vault",
    headline: "Smaller vault user who responds well to retention nudges.",
    strategy:
      "Commits medium-sized capital for the full season. Charlie unlocks duration multipliers because the program wants this user to stay.",
    risk: "Low risk, strong retention signal.",
    color: "#f59e0b",
    mockReferralCount: 2,
  },
  {
    id: "diana",
    name: "Diana",
    handle: "Volume Trader",
    type: "trader",
    headline:
      "Chains heavy routed flow week over week with short-lived LP-based synthetic exposure.",
    strategy:
      "Escalates position opens, closes, and rolls through the season while riding bursty synthetic exposure with short half-lives. The mechanics are LP positions, but the user-facing behavior looks like active perps trading.",
    risk: "Medium risk, possible wash-trading edge case if uncapped.",
    color: "#3b82f6",
    mockReferralCount: 10,
  },
  {
    id: "eve",
    name: "Eve",
    handle: "Points Farmer",
    type: "hybrid",
    headline:
      "Strong points from vault plus relentless routed flow — flagged because volume massively outweighs any real exposure held.",
    strategy:
      "Keeps a steady sub-cap vault for dollar-days while stacking routed notional week after week with almost no average open exposure (quick clips only). That shape reads as churn/wash-adjacent flow farming; in production she’d be queued for post-season review—not someone you treat as organic volume.",
    risk: "High abuse risk.",
    color: "#ef4444",
    mockReferralCount: 4,
  },
];
