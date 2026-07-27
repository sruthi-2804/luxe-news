type Reader = {
  email: string;
  is_admin: boolean | null;
  created_at: string;
};

export default function ReadersPanel({ readers }: { readers: Reader[] }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-px bg-line" style={{ maxWidth: 280 }}>
        <div className="bg-paper p-5">
          <div className="text-[10px] uppercase tracking-wider text-muted">
            Total readers
          </div>
          <div className="text-[32px] font-medium text-ink mt-1">
            {readers.length}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted">
        Membership is a config flag, not a default — every signed-in reader
        currently has full access, so there&apos;s no plan tiering to manage yet.
      </p>

      <div className="overflow-x-auto">
        <table className="text-sm text-left w-full" style={{ minWidth: 640 }}>
          <thead>
            <tr className="text-muted border-b border-line text-xs uppercase tracking-wider">
              <th className="pb-3 pr-4">Email</th>
              <th className="pb-3 pr-4">Admin</th>
              <th className="pb-3 font-mono">Joined</th>
            </tr>
          </thead>
          <tbody>
            {readers.map((r) => (
              <tr key={r.email} className="border-b border-line">
                <td className="py-3 pr-4 text-ink">{r.email}</td>
                <td className="py-3 pr-4 text-muted">
                  {r.is_admin ? "Yes" : "No"}
                </td>
                <td className="py-3 text-muted font-mono text-xs">
                  {new Date(r.created_at).toLocaleDateString("en-GB")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
