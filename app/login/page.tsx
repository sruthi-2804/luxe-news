import { signIn, signUp } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm border-t-2 border-black pt-8">
        <h1 className="font-serif uppercase text-3xl tracking-[0.08em] text-black text-center mb-1">
          Luxe News
        </h1>
        <p className="text-zinc-500 mb-6 text-center text-xs uppercase tracking-[0.15em]">
          Sign in to read curated news
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </p>
        )}
        {message && (
          <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">
            {message}
          </p>
        )}

        <form className="flex flex-col gap-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="border border-zinc-300 rounded px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 bg-white"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            minLength={6}
            className="border border-zinc-300 rounded px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 bg-white"
          />
          <button
            formAction={signIn}
            className="rounded bg-zinc-900 text-white px-4 py-2 text-sm font-medium hover:bg-zinc-700"
          >
            Sign In
          </button>
          <button
            formAction={signUp}
            className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
