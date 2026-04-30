import { BarChart3, Calculator, LayoutDashboard, Lightbulb } from "lucide-react";
import { useMemo, useState } from "react";
import { Dashboard } from "./pages/Dashboard";
import { NextSteps } from "./pages/NextSteps";
import { Overview } from "./pages/Overview";
import { Simulation } from "./pages/Simulation";
import { getAllScores } from "./lib/scoring";

type TabId = "overview" | "simulation" | "dashboard" | "nextSteps";

const tabs = [
  { id: "overview" as const, label: "Overview", icon: Calculator },
  { id: "simulation" as const, label: "Simulation", icon: BarChart3 },
  { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { id: "nextSteps" as const, label: "Next Steps", icon: Lightbulb },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const scores = useMemo(() => getAllScores(), []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_32rem),radial-gradient(circle_at_top_right,rgba(139,92,246,0.12),transparent_28rem)]" />
      <div className="relative mx-auto min-w-0 max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 rounded-[2rem] border border-slate-800 bg-slate-950/80 p-5 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
              HyperUnicorn
            </p>
            <h1 className="mt-2 text-2xl font-bold text-white">Points Program Prototype</h1>
          </div>
          <nav className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeTab === tab.id
                      ? "bg-cyan-300 text-slate-950"
                      : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="mr-2 inline h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </header>

        {activeTab === "overview" && <Overview />}
        {activeTab === "simulation" && <Simulation scores={scores} />}
        {activeTab === "dashboard" && <Dashboard scores={scores} />}
        {activeTab === "nextSteps" && <NextSteps />}
      </div>
    </main>
  );
}

export default App;
