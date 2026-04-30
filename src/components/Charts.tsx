import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import { personas } from "../data/personas";
import { formatAxisPointsCompact, formatPoints } from "../lib/rankings";
import type { Persona, PersonaId, WeeklyScore } from "../types";

const chartText = "#94a3b8";
const grid = "#1e293b";

function LeaderboardTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload as { persona: Persona; points: number } | undefined;
  if (!row?.persona) return null;
  const { persona, points } = row;
  return (
    <div
      className="rounded-2xl border border-slate-700/80 bg-slate-950/95 px-4 py-3 shadow-2xl backdrop-blur-sm"
      style={{ borderColor: persona.color }}
    >
      <p className="text-sm font-semibold" style={{ color: persona.color }}>
        {persona.name}
      </p>
      <p className="mt-0.5 text-xs" style={{ color: persona.color, opacity: 0.8 }}>
        {persona.handle}
      </p>
      <p className="mt-2 text-lg font-semibold tabular-nums tracking-tight" style={{ color: persona.color }}>
        {formatPoints(points)} pts
      </p>
    </div>
  );
}

export function SimulationChart({
  scores,
  selectedIds,
  visibleWeek,
}: {
  scores: WeeklyScore[];
  selectedIds: PersonaId[];
  visibleWeek: number;
}) {
  const data = Array.from({ length: visibleWeek }, (_, index) => {
    const week = index + 1;
    const row: Record<string, number> = { week };
    selectedIds.forEach((id) => {
      row[id] = scores.find((score) => score.personaId === id && score.week === week)?.cumulative ?? 0;
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={360}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid stroke={grid} strokeDasharray="3 3" />
        <XAxis dataKey="week" stroke={chartText} tickLine={false} />
        <YAxis stroke={chartText} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
        <Tooltip
          contentStyle={{ background: "#020617", border: "1px solid #334155", borderRadius: 16 }}
          formatter={(value) => `${formatPoints(Number(value))} pts`}
          labelFormatter={(label) => `Week ${label}`}
        />
        <Legend />
        {selectedIds.map((id) => {
          const persona = personas.find((item) => item.id === id);
          return (
            <Line
              key={id}
              type="monotone"
              dataKey={id}
              name={persona?.name}
              stroke={persona?.color}
              strokeWidth={3}
              dot={{ r: 3 }}
              isAnimationActive
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function LeaderboardChart({
  rows,
}: {
  rows: { persona: Persona; points: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={rows} margin={{ top: 12, right: 20, left: 20, bottom: 28 }}>
        <CartesianGrid stroke={grid} strokeDasharray="3 3" />
        <XAxis
          dataKey="persona.name"
          stroke={chartText}
          tickLine={false}
          interval={0}
          dy={10}
          height={54}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          orientation="left"
          stroke={chartText}
          width={78}
          tickMargin={10}
          tick={{ fill: chartText, fontSize: 11 }}
          tickFormatter={(value) => formatAxisPointsCompact(Number(value))}
          label={{
            value: "Points",
            angle: -90,
            position: "insideLeft",
            fill: chartText,
            fontSize: 11,
            offset: 2,
          }}
        />
        <Tooltip
          cursor={{ fill: "rgba(15, 23, 42, 0.25)" }}
          content={LeaderboardTooltip}
          wrapperStyle={{ outline: "none", zIndex: 10 }}
        />
        <Bar dataKey="points" radius={[10, 10, 0, 0]}>
          {rows.map((row) => (
            <Cell key={row.persona.name} fill={row.persona.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BreakdownDonut({
  data,
}: {
  data: { label: string; value: number; source: string }[];
}) {
  const colors = ["#14b8a6", "#8b5cf6", "#3b82f6", "#f59e0b", "#ec4899", "#ef4444"];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="label" innerRadius={58} outerRadius={92} paddingAngle={3}>
          {data.map((item, index) => (
            <Cell key={item.source} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: "#020617", border: "1px solid #334155", borderRadius: 16 }}
          formatter={(value) => `${formatPoints(Number(value))} pts`}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
