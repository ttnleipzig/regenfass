// Conversions for `<input type="datetime-local">`, which speaks local
// wall-clock time with no UTC offset. Both directions stay in the browser's
// zone so what the user picks is what they meant.

// Seconds are dropped because the input's default step is one minute.
export function toDateTimeInput(t: number): string {
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

// The exact shape `datetime-local` emits. Checked before parsing because
// `Date.parse` is lenient enough to read a half-typed "2026-07-" as July 2026,
// which would fetch a range the user never asked for.
const DATE_TIME_LOCAL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

// `Date.parse` reads an offset-less date-time as local time, which is what the
// picker means. Returns NaN for a blank, malformed or half-typed value; callers
// treat that as "range not ready" rather than sending it to the backend.
export function fromDateTimeInput(v: string): number {
  if (!DATE_TIME_LOCAL.test(v)) return NaN;
  return Date.parse(v);
}
