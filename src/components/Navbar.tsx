/**
 * Navbar — top navigation bar shown on all authenticated pages.
 */
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold text-indigo-600">
        Vibyze
      </Link>

      <div className="flex items-center gap-6 text-sm text-gray-600">
        <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
          Dashboard
        </Link>
        <Link href="/scan/new" className="hover:text-indigo-600 transition-colors">
          New Scan
        </Link>
        <Link href="/settings" className="hover:text-indigo-600 transition-colors">
          Settings
        </Link>
      </div>
    </nav>
  );
}
