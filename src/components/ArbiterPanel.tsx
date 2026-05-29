"use client";

import { useMemo, useState } from "react";
import { BrainCircuit, Crosshair, Loader2 } from "lucide-react";
import {
  ArbiterCandidate,
  ArbiterRankedResult,
  compareWithArbiter,
} from "@/lib/arbiter";

export function ArbiterPanel({
  records,
  onSelect,
}: {
  records: ArbiterCandidate[];
  onSelect?: (record: ArbiterCandidate) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ArbiterRankedResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeRecords = useMemo(
    () =>
      records.filter(
        (record) =>
          record.title &&
          Number.isFinite(record.lat) &&
          Number.isFinite(record.lng)
      ),
    [records]
  );

  const marketCount = useMemo(
    () => activeRecords.filter((record) => record.type === "market").length,
    [activeRecords]
  );

  async function run() {
    const cleanQuery = query.trim();
    if (!cleanQuery || !activeRecords.length || loading) return;
    setLoading(true);
    setError("");

    try {
      const ranked = await compareWithArbiter(cleanQuery, activeRecords, 20);
      setResults(ranked);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ARBITER compare failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glass-panel pointer-events-auto overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border-primary)]/50 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-[var(--cyan-primary)]" />
          <span className="font-mono text-[11px] font-bold tracking-[0.28em] text-[var(--text-heading)]">
            ARBITER
          </span>
        </div>
        <span className="font-mono text-[8px] tracking-[0.18em] text-[var(--text-muted)]">
          {activeRecords.length.toLocaleString()} ACTIVE · {marketCount.toLocaleString()} MKT
        </span>
      </div>

      <div className="space-y-2 p-3">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") run();
            }}
            placeholder="Ask the live world state..."
            className="min-w-0 rounded-md border border-[var(--border-primary)]/50 bg-black/45 px-3 py-2 font-mono text-[10px] tracking-wide text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]/60 focus:border-[var(--cyan-primary)]/70"
          />
          <button
            onClick={run}
            disabled={loading || !query.trim() || !activeRecords.length}
            className="rounded-md border border-[var(--cyan-primary)]/40 bg-[var(--cyan-primary)]/10 px-3 py-2 font-mono text-[9px] font-bold tracking-[0.18em] text-[var(--cyan-primary)] transition-colors hover:bg-[var(--cyan-primary)]/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "RUN"}
          </button>
        </div>

        {error && (
          <div className="rounded border border-[var(--alert-red)]/30 bg-[var(--alert-red)]/10 px-2 py-1.5 font-mono text-[9px] text-[var(--alert-red)]">
            {error}
          </div>
        )}

        <div className="max-h-[260px] space-y-1.5 overflow-y-auto styled-scrollbar pr-1">
          {results.length === 0 && !loading && (
            <div className="rounded-md border border-white/5 bg-white/[0.025] px-3 py-3">
              <p className="font-mono text-[9px] leading-relaxed tracking-[0.12em] text-[var(--text-muted)]">
                QUERY CURRENT SUMMARY-BEARING OSIRIS RECORDS BY MEANING.
              </p>
            </div>
          )}

          {results.map((result, index) => (
            <button
              key={`${result.record.id}-${index}`}
              onClick={() => onSelect?.(result.record)}
              className="grid w-full grid-cols-[28px_1fr_54px] items-center gap-2 rounded-md border border-white/5 bg-white/[0.035] px-2 py-2 text-left transition-colors hover:border-[var(--gold-primary)]/35 hover:bg-[var(--gold-primary)]/10"
            >
              <span className="font-mono text-[9px] text-[var(--text-muted)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[11px] font-semibold leading-tight text-[var(--text-heading)]">
                  {result.record.title}
                </span>
                <span className="mt-0.5 flex min-w-0 items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  <Crosshair className="h-2.5 w-2.5 shrink-0 text-[var(--gold-primary)]" />
                  <span className="truncate">
                    {[result.record.type, result.record.location, result.record.severity]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
              </span>
              <span className="justify-self-end flex flex-col items-end gap-1">
                <em className="rounded border border-[var(--gold-primary)]/25 px-1.5 py-1 font-mono text-[9px] not-italic text-[var(--gold-primary)]">
                  {Number(result.score).toFixed(3)}
                </em>
                {result.record.url && (
                  <span className="font-mono text-[7px] font-bold tracking-[0.18em] text-[var(--cyan-primary)]">
                    OPEN
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

