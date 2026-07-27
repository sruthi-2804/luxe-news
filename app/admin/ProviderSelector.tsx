"use client";

import { useTransition } from "react";
import { setProvider } from "./actions";

const PROVIDERS = [
  { id: "openai", label: "OpenAI (gpt-5.4-nano)" },
  { id: "claude", label: "Claude (haiku-4.5)" },
  { id: "gemini", label: "Gemini (3.5-flash-lite)" },
] as const;

export default function ProviderSelector({ active }: { active: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2">
      {PROVIDERS.map((p) => (
        <label
          key={p.id}
          className="flex items-center gap-2 text-sm text-ink"
        >
          <input
            type="radio"
            name="provider"
            value={p.id}
            checked={active === p.id}
            disabled={isPending}
            onChange={() => startTransition(() => setProvider(p.id))}
          />
          {p.label}
        </label>
      ))}
    </div>
  );
}
