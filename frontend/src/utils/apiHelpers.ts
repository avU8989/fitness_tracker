import { DayOfWeek } from "../requests/trainingPlan";

export async function handleResponse(
  response: Response,
  defaultMessage: string
) {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      throw new Error(response.statusText || defaultMessage);
    }

    if (errorData.errors && Array.isArray(errorData.errors)) {
      const error = new Error(errorData.message || defaultMessage);
      (error as any).errors = errorData.errors;
      throw error;
    }
    throw new Error(errorData.message || defaultMessage);
  }

  return response.json();
}

export function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export function toDateFormatFetchActiveTrainingPlans(date: Date): string {
  return date.toLocaleDateString("en-CA");
}

export function getTodayName(): DayOfWeek {
  const map: DayOfWeek[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const todayIndex = new Date().getDay(); // 0 = Sunday, 6 = Saturday
  return map[todayIndex];
}
