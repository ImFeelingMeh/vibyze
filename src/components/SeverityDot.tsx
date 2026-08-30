const DOT_COLOR: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-400",
  medium: "bg-accent",
  low: "bg-sky-400",
  info: "bg-zinc-500",
};

/** Small colour-coded severity indicator, used in place of emoji. */
export default function SeverityDot({ severity }: { severity: string }) {
  return (
    <span
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${DOT_COLOR[severity] ?? "bg-zinc-500"}`}
      aria-hidden="true"
    />
  );
}
