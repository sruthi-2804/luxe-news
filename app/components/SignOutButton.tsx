import { signOut } from "../login/actions";

export default function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-sm text-zinc-500 hover:text-zinc-900 underline"
      >
        Sign out
      </button>
    </form>
  );
}
