import { signOut } from "../login/actions";

export default function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-xs uppercase tracking-wider text-zinc-500 hover:text-zinc-900"
      >
        Sign Out
      </button>
    </form>
  );
}
