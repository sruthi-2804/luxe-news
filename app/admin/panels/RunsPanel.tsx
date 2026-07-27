import ProviderSelector from "../ProviderSelector";
import { updateRunSettings, addCredits } from "../actions";

type Settings = {
  active_provider: string;
  recency_hours: number | null;
  auto_publish: boolean | null;
  stories_per_edition: number | null;
};

export default function RunsPanel({
  settings,
  balance,
  pendingCount,
  costToday,
  readerCount,
  lastRunAt,
}: {
  settings: Settings | null;
  balance: number;
  pendingCount: number;
  costToday: number;
  readerCount: number;
  lastRunAt: string | null;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-4 gap-px bg-line">
        {[
          {
            label: "Last run",
            value: lastRunAt
              ? new Date(lastRunAt).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—",
          },
          { label: "Pending review", value: String(pendingCount) },
          { label: "Cost today", value: `$${costToday.toFixed(2)}` },
          { label: "Readers", value: String(readerCount) },
        ].map((cell) => (
          <div key={cell.label} className="bg-paper p-5">
            <div className="text-[10px] uppercase tracking-wider text-muted">
              {cell.label}
            </div>
            <div className="text-[32px] font-medium text-ink mt-1">
              {cell.value}
            </div>
          </div>
        ))}
      </div>

      <section className="border border-line p-6">
        <h2 className="text-sm font-semibold text-ink mb-4 uppercase tracking-wider">
          Schedule
        </h2>
        <form
          action={updateRunSettings}
          className="flex flex-col gap-4 max-w-sm"
        >
          <label className="flex items-center justify-between text-sm text-ink">
            Auto-publish approved stories
            <input
              type="checkbox"
              name="auto_publish"
              defaultChecked={settings?.auto_publish ?? false}
            />
          </label>
          <p className="text-xs text-muted -mt-2">
            Default off — every story waits for review in the queue.
          </p>
          <label className="flex flex-col gap-1 text-sm text-ink">
            Recency window (hours)
            <input
              type="number"
              name="recency_hours"
              min={1}
              defaultValue={settings?.recency_hours ?? 36}
              className="border border-line rounded px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink">
            Stories per edition
            <input
              type="number"
              name="stories_per_edition"
              min={1}
              max={20}
              defaultValue={settings?.stories_per_edition ?? 10}
              className="border border-line rounded px-3 py-2 text-sm text-ink"
            />
          </label>
          <button
            type="submit"
            className="self-start rounded-full bg-ink text-paper px-4 py-2 text-xs font-medium uppercase tracking-wider hover:opacity-[0.82] transition-opacity duration-200"
          >
            Save schedule
          </button>
        </form>
      </section>

      <section className="border border-line p-6">
        <h2 className="text-sm font-semibold text-ink mb-4 uppercase tracking-wider">
          Model
        </h2>
        <ProviderSelector active={settings?.active_provider ?? "openai"} />
      </section>

      <section className="border border-line p-6">
        <h2 className="text-sm font-semibold text-ink mb-4 uppercase tracking-wider">
          Spend
        </h2>
        <p className="text-sm text-muted mb-4">
          Remaining balance:{" "}
          <span className="font-medium text-ink font-mono">
            ${balance.toFixed(2)}
          </span>
        </p>
        <form action={addCredits} className="flex items-center gap-2">
          <input
            type="number"
            name="amount"
            step="0.01"
            min="0"
            placeholder="Amount"
            required
            className="border border-line rounded px-3 py-2 text-sm text-ink placeholder:text-muted-soft w-28"
          />
          <button
            type="submit"
            className="rounded-full border border-line px-4 py-2 text-xs font-medium uppercase tracking-wider text-ink hover:border-ink transition-colors duration-200"
          >
            Add credits
          </button>
        </form>
      </section>
    </div>
  );
}
