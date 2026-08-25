/**
 * Settings / Account page.
 */
import Navbar from "@/components/Navbar";

export default function SettingsPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Account Settings</h1>

        {/* Profile section */}
        <section className="mb-8">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display name
              </label>
              {/* TODO: Wire up to session + API */}
              <input
                type="text"
                placeholder="Your name"
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>
        </section>

        {/* Danger zone */}
        <section className="border-t border-gray-200 pt-8">
          <h2 className="text-base font-semibold text-red-600 mb-4">Danger zone</h2>
          <button
            disabled
            className="rounded-lg border border-red-200 px-5 py-2 text-sm font-medium text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            Delete account
          </button>
          <p className="mt-2 text-xs text-gray-400">
            This action is permanent and cannot be undone.
          </p>
        </section>
      </main>
    </>
  );
}
