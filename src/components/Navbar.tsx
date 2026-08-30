/**
 * Navbar — top navigation bar shown on all authenticated pages.
 */
import Image from "next/image";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-10 border-b border-zinc-800/80 bg-[#0b0a08]/85 px-6 py-3 backdrop-blur supports-backdrop-filter:bg-[#0b0a08]/60">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/dashboard" className="flex items-center" aria-label="Vibyze dashboard">
          <Image src="/logo.png" alt="Vibyze" width={300} height={100} className="h-12 w-auto" priority />
        </Link>

        <div className="flex items-center gap-6 text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Link href="/scan/new" className="hover:text-foreground transition-colors">
            New Scan
          </Link>
          <Link href="/settings" className="hover:text-foreground transition-colors">
            Settings
          </Link>
          <SignOutButton />
        </div>
      </div>
    </nav>
  );
}
