"use client";

/**
 * ProjectMenu — kebab menu for a dashboard project card: rename or delete.
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  projectId: string;
  projectName: string;
}

export default function ProjectMenu({ projectId, projectName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(projectName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setRenaming(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === projectName) {
      setRenaming(false);
      setOpen(false);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Could not rename project.");
        setBusy(false);
        return;
      }
      setRenaming(false);
      setOpen(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${projectName}" and all of its scans? This cannot be undone.`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Could not delete project.");
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Project options for ${projectName}`}
        aria-expanded={open}
        className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-foreground transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <circle cx="8" cy="3" r="1.4" />
          <circle cx="8" cy="8" r="1.4" />
          <circle cx="8" cy="13" r="1.4" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-zinc-800 bg-zinc-900 p-1 shadow-lg shadow-black/40">
          {renaming ? (
            <form onSubmit={handleRename} className="p-2">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-white focus:border-accent focus:outline-none"
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRenaming(false);
                    setName(projectName);
                  }}
                  className="rounded-md px-2 py-1 text-xs text-zinc-400 hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-md bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground hover:bg-accent-hover disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </form>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setRenaming(true)}
                className="block w-full rounded-md px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800"
              >
                Rename
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy}
                className="block w-full rounded-md px-3 py-2 text-left text-sm text-red-400 hover:bg-red-950/50 disabled:opacity-50"
              >
                Delete
              </button>
            </>
          )}
          {error && <p className="px-3 pb-2 text-xs text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
}
