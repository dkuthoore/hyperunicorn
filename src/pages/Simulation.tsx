import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SimulationChart } from "../components/Charts";
import { PersonaBadge } from "../components/SourceBadge";
import { SectionCard } from "../components/SectionCard";
import { personas } from "../data/personas";
import type { PersonaId, WeeklyScore } from "../types";

export function Simulation({ scores }: { scores: WeeklyScore[] }) {
  const [selectedIds, setSelectedIds] = useState<PersonaId[]>([
    "alice",
    "bob",
    "charlie",
    "diana",
    "eve",
  ]);
  const [visibleWeek, setVisibleWeek] = useState(8);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(900);
  /** "all" mirrors chart personas; picker filters vault LP duration multiplier log lines. */
  const [eventLogPersonaFilter, setEventLogPersonaFilter] = useState<"all" | PersonaId>("all");
  const [eventPageIndex, setEventPageIndex] = useState(0);

  const PAGE_SIZE = 5;

  useEffect(() => {
    if (!running) return;

    if (visibleWeek >= 8) {
      setRunning(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setVisibleWeek((week) => Math.min(8, week + 1));
    }, speed);

    return () => window.clearTimeout(timeout);
  }, [running, speed, visibleWeek]);

  const logEvents = useMemo(() => {
    const personaWhitelist =
      eventLogPersonaFilter === "all" ? selectedIds : [eventLogPersonaFilter];

    return scores
      .filter((score) => personaWhitelist.includes(score.personaId) && score.week <= visibleWeek)
      .flatMap((score) =>
        score.events.map((event) => ({
          week: score.week,
          personaId: score.personaId,
          persona: personas.find((item) => item.id === score.personaId),
          event,
        })),
      )
      .sort((a, b) =>
        b.week !== a.week ? b.week - a.week : a.personaId.localeCompare(b.personaId),
      );
  }, [scores, selectedIds, eventLogPersonaFilter, visibleWeek]);

  const maxPageIndex = Math.max(0, Math.ceil(logEvents.length / PAGE_SIZE) - 1);
  const pageIndex = Math.min(eventPageIndex, maxPageIndex);

  const totalEventPages = Math.max(1, Math.ceil(Math.max(logEvents.length, 1) / PAGE_SIZE));
  const pagedLogEvents = logEvents.slice(
    pageIndex * PAGE_SIZE,
    pageIndex * PAGE_SIZE + PAGE_SIZE,
  );

  const togglePersona = (personaId: PersonaId) => {
    setSelectedIds((current) =>
      current.includes(personaId)
        ? current.filter((id) => id !== personaId)
        : [...current, personaId],
    );
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Persona Simulation" eyebrow="Eight-week season">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-3xl leading-7 text-slate-300">
            Compare how the same rules treat different behavior patterns. Watch Charlie pick up
            steam when the 1.5x LP duration multiplier kicks in around week 4, while everyone
            else&apos;s cumulative points split based on how they trade and deposit.
          </p>
          <div className="flex items-center gap-2">
            <button
              className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950"
              onClick={() => {
                setVisibleWeek(1);
                setRunning(true);
              }}
            >
              <Play className="mr-2 inline h-4 w-4" />
              Run
            </button>
            <button
              className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200"
              onClick={() => setRunning((value) => !value)}
            >
              <Pause className="mr-2 inline h-4 w-4" />
              {running ? "Pause" : "Resume"}
            </button>
            <button
              className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200"
              onClick={() => {
                setVisibleWeek(8);
                setRunning(false);
              }}
            >
              <RotateCcw className="mr-2 inline h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {personas.map((persona) => (
            <button
              key={persona.id}
              className={`rounded-full border px-3 py-2 transition ${
                selectedIds.includes(persona.id)
                  ? "border-cyan-300 bg-cyan-300/10"
                  : "border-slate-800 bg-slate-900"
              }`}
              onClick={() => togglePersona(persona.id)}
            >
              <PersonaBadge persona={persona} />
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <SimulationChart scores={scores} selectedIds={selectedIds} visibleWeek={visibleWeek} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-300">
          <span>Visible through week {visibleWeek}</span>
          {[900, 550, 250].map((value, index) => (
            <button
              key={value}
              className={`rounded-full px-3 py-1 ${
                speed === value ? "bg-cyan-300 text-slate-950" : "bg-slate-900 text-slate-300"
              }`}
              onClick={() => setSpeed(value)}
            >
              {index === 0 ? "1x" : index === 1 ? "2x" : "4x"}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Vault Event Log">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <label className="flex min-w-[200px] flex-1 flex-col gap-1.5 text-sm text-slate-300">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Filter</span>
            <select
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              value={eventLogPersonaFilter}
              onChange={(event) => {
                setEventLogPersonaFilter(event.target.value as "all" | PersonaId);
                setEventPageIndex(0);
              }}
            >
              <option value="all">Everyone selected on chart ({selectedIds.length})</option>
              {personas.map((persona) => (
                <option key={persona.id} value={persona.id}>
                  {persona.name} only
                </option>
              ))}
            </select>
          </label>
          {logEvents.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">
                {logEvents.length} event{logEvents.length === 1 ? "" : "s"}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="rounded-lg border border-slate-700 p-2 text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={pageIndex <= 0}
                  onClick={() =>
                    setEventPageIndex((previous) => {
                      const clamped = Math.min(previous, maxPageIndex);
                      return Math.max(0, clamped - 1);
                    })
                  }
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="min-w-[7rem] text-center text-sm tabular-nums text-slate-300">
                  Page {pageIndex + 1} / {totalEventPages}
                </span>
                <button
                  type="button"
                  className="rounded-lg border border-slate-700 p-2 text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={pageIndex >= totalEventPages - 1}
                  onClick={() =>
                    setEventPageIndex((previous) => {
                      const clamped = Math.min(previous, maxPageIndex);
                      return Math.min(maxPageIndex, clamped + 1);
                    })
                  }
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-3">
          {logEvents.length === 0 && (
            <p className="text-slate-400">
              No vault duration events in this view yet. Personas without vault deposits have nothing to
              log here.
            </p>
          )}
          {pagedLogEvents.map((item, index) => (
            <div
              key={`${item.personaId}-${item.week}-${pageIndex}-${index}-${item.event.slice(0, 48)}`}
              className="rounded-2xl bg-slate-900 p-4"
            >
              <p className="text-sm text-cyan-300">Week {item.week}</p>
              <p className="mt-1 font-medium text-white">{item.persona?.name}</p>
              <p className="mt-1 text-sm leading-6 text-slate-400">{item.event}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
