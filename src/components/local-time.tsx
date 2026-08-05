import { useEffect, useState } from "react";

const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "America/Sao_Paulo",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Live clock in Victória's time zone (America/Sao_Paulo). */
export function LocalTime({ suffix = "my time zone" }: { suffix?: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(formatter.format(new Date()));
    tick();
    const id = setInterval(tick, 1000 * 15);
    return () => clearInterval(id);
  }, []);

  if (!time) return <span suppressHydrationWarning>{suffix}</span>;

  return (
    <span suppressHydrationWarning>
      {time} – {suffix}
    </span>
  );
}
