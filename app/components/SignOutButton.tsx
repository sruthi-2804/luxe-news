import { signOut } from "../login/actions";

export default function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-xs uppercase tracking-wider text-muted hover:text-ink"
      >
        Sign Out
      </button>
    </form>
  );
}
