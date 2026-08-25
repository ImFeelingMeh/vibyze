/**
 * IssueBadge — displays an issue severity label with colour coding.
 */
import { severityColour } from "@/lib/utils";

interface Props {
  severity: string;
}

export default function IssueBadge({ severity }: Props) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${severityColour(severity)}`}
    >
      {severity}
    </span>
  );
}
