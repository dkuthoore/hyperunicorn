import { SectionCard } from "../components/SectionCard";

const improvements = [
  {
    title: "New-Market Exploration",
    summary:
      "Reward early activity in newly listed or less-trafficked markets once there is enough data to distinguish useful bootstrapping from empty farming.",
  },
  {
    title: "Liquidation Resilience Bonuses",
    summary:
      "Give small comeback bonuses to traders who get liquidated, return with real activity, and continue generating flow or fees for the protocol.",
  },
  {
    title: "Referral Programs",
    summary:
      "Add referral rewards only for invited users who become sustained vault depositors or direct traders, not for empty signups.",
  },
  {
    title: "PnL-Based Rewards",
    summary:
      "Complement activity points with economics-based prizes. One path: weekly trading competitions ranked on realized P&L over a fixed window. Another: run an end-of-season review of cumulative realized P&L across the program and allocate rewards to top risk-adjusted performers on the platform.",
  },
  {
    title: "Delayed Withdrawals",
    summary:
      "Add withdrawal delays or unbonding on vault liquidity so users cannot deposit right before a weekly checkpoint, earn points on capital that barely stayed in the system, and withdraw immediately after settlement. Cooldowns bias rewards toward stickier TVL and reduce end-of-epoch gaming.",
  },
  {
    title: "Deeper Slashing + Sybil Review",
    summary:
      "Example: Eve is flagged in-app for farming-like patterns while still earning full points under the Season 1 model. Post-season review could slash accrued balances after the fact—wallet clustering, wash-trade detection, repeat open/close heuristics, and manual workflows—without surfacing live penalties week-by-week.",
  },
];

export function NextSteps() {
  return (
    <div className="space-y-6">
      <SectionCard title="Next steps" eyebrow="Areas for Improvement">
        <ul className="m-0 list-outside list-disc space-y-6 p-0 pl-5 text-slate-300 marker:text-cyan-400 sm:pl-6">
          {improvements.map((item) => (
            <li key={item.title} className="pl-2 leading-7">
              <h2 className="text-lg font-semibold text-white">{item.title}</h2>
              <p className="mt-2 leading-7">{item.summary}</p>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
