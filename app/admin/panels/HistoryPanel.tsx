type Run = {
  id: number;
  created_at: string;
  trigger: string | null;
  found_count: number | null;
  kept_count: number | null;
  total_tokens: number | null;
  cost_usd: number | null;
  error: string | null;
};

export default function HistoryPanel({ runs }: { runs: Run[] }) {
  const completed = runs.filter((r) => !r.error && r.cost_usd != null);
  const avgCost =
    completed.length > 0
      ? completed.reduce((sum, r) => sum + (r.cost_usd ?? 0), 0) /
        completed.length
      : 0;
  const projectedMonthly = avgCost * 60; // ~2 runs/day * 30 days

  return (
    <div className="flex flex-col gap-8">
      <div className="overflow-x-auto">
        <table
          className="font-mono text-xs text-left w-full"
          style={{ minWidth: 1000 }}
        >
          <thead>
            <tr className="text-muted border-b border-line uppercase tracking-wider">
              <th className="pb-3 pr-4" style={{ width: 170 }}>
                Started
              </th>
              <th className="pb-3 pr-4" style={{ width: 110 }}>
                Trigger
              </th>
              <th className="pb-3 pr-4" style={{ width: 90 }}>
                Found
              </th>
              <th className="pb-3 pr-4" style={{ width: 90 }}>
                Kept
              </th>
              <th className="pb-3 pr-4" style={{ width: 90 }}>
                Tokens
              </th>
              <th className="pb-3 pr-4" style={{ width: 110 }}>
                Cost
              </th>
              <th className="pb-3">Result</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r) => (
              <tr key={r.id} className="border-b border-line">
                <td className="py-3 pr-4 text-muted">
                  {new Date(r.created_at).toLocaleString("en-GB")}
                </td>
                <td className="py-3 pr-4 text-ink">{r.trigger ?? "—"}</td>
                <td className="py-3 pr-4 text-ink">{r.found_count ?? "—"}</td>
                <td className="py-3 pr-4 text-ink">{r.kept_count ?? "—"}</td>
                <td className="py-3 pr-4 text-ink">
                  {r.total_tokens ?? "—"}
                </td>
                <td className="py-3 pr-4 text-ink">
                  {r.cost_usd != null ? `$${r.cost_usd.toFixed(4)}` : "—"}
                </td>
                <td className="py-3">
                  {r.error ? (
                    <span className="text-accent">Failed — {r.error}</span>
                  ) : (
                    <span className="text-ink">OK</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-3 gap-px bg-line">
        {[
          { label: "Average cost per run", value: `$${avgCost.toFixed(3)}` },
          {
            label: "Projected monthly",
            value: `$${projectedMonthly.toFixed(2)}`,
          },
          {
            label: "Cost per subscriber",
            value: "n/a — paywall off",
          },
        ].map((cell) => (
          <div key={cell.label} className="bg-paper p-5">
            <div className="text-[10px] uppercase tracking-wider text-muted">
              {cell.label}
            </div>
            <div className="text-lg font-medium text-ink mt-1 font-mono">
              {cell.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
