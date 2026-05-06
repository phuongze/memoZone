import { CalendarHeart } from "lucide-react";
import { useMemo } from "react";

function diffDays(startDate) {
  const start = new Date(startDate);
  const now = new Date();

  if (Number.isNaN(start.getTime())) return 0;

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  return Math.max(1, Math.floor((utcNow - utcStart) / millisecondsPerDay) + 1);
}

export default function LoveCounter({ startDate }) {
  const days = useMemo(() => diffDays(startDate), [startDate]);
  const sinceLabel = useMemo(() => {
    const parsed = new Date(startDate);
    if (Number.isNaN(parsed.getTime())) return "-";

    return parsed.toLocaleString("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }, [startDate]);

  return (
    <section className="rounded-3xl border border-rosewood/15 bg-white/70 p-6 shadow-soft">
      <div className="mb-2 flex items-center gap-2 text-rosewood">
        <CalendarHeart className="h-5 w-5" />
        <h2 className="font-serif text-2xl">Love Counter</h2>
      </div>
      <p className="text-4xl font-semibold text-rosewood sm:text-5xl">{days} days</p>
      <p className="mt-2 text-sm text-rosewood/75">
        Since {sinceLabel}
      </p>
    </section>
  );
}
