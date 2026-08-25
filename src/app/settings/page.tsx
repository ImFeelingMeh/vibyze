/**
 * Settings / Account page.
 */
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
    : { data: null };

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-bold text-white">Settings</h1>

        <div className="mt-8 space-y-5 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300">Email</label>
            <input
              readOnly
              value={user?.email ?? ""}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300">Display name</label>
            <input
              readOnly
              value={profile?.display_name ?? ""}
              placeholder="Not set"
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-400"
            />
          </div>
        </div>

        <p className="mt-4 text-xs text-zinc-500">
          Profile editing and account deletion are planned for a future release.
        </p>
      </main>
    </>
  );
}
