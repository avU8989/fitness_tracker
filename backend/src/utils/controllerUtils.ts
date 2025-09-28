export function formatLocalDateYYYYMMDD(input: string | Date): string {
  const date = input instanceof Date ? input : new Date(input);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

//Returns the start and end of a given date in UTC.
export const normalizeDayRange = (date: Date = new Date()) => {
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
};

export function normalizeDate(input: string | Date): Date {
  const d = input instanceof Date ? input : new Date(input);

  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date passed to normalizeDate: ${input}`);
  }

  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
