/**
 * Navbar — top navigation bar shown on all authenticated pages.
 */
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

export default function Navbar() {
  return (
    <nav className="border-b border-zinc-800 bg-zinc-950 px-6 py-3 flex items-center justify-between">
      <Link href="/dashboard" className="text-xl font-bold text-indigo-400">
        Vibyze
      </Link>

      <div className="flex items-center gap-6 text-sm text-zinc-400">
        <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">
          Dashboard
        </Link>
        <Link href="/scan/new" className="hover:text-indigo-400 transition-colors">
          New Scan
        </Link>
        <Link href="/settings" className="hover:text-indigo-400 transition-colors">
          Settings
        </Link>
        <SignOutButton />
      </div>
    </nav>
  );
}
