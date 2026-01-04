import { API_URL } from "@env";
import { CreateWorkoutLogRequest } from "../requests/CreateWorkoutLogRequest";

const URL = `${API_URL}/workouts`;

export async function createWorkoutLog(
  token: string,
  data: CreateWorkoutLogRequest
) {
  const response = await fetch(`${URL}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    console.log(response);
    throw new Error(result.error || "Failed to log workout");
  }

  return result;
}

export async function getNextSkippedDay(token: string) {
  const response = await fetch(`${URL}/next-skipped`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Fetching next skipped day failed");
  }

  return response.json();
}

export async function getNextUpcomingWorkoutDay(token: string) {
  const response = await fetch(`${URL}/next-upcoming`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Fetching upcoming workout day failed");
  }

  return response.json();
}

export async function getUserWorkoutLoggedToday(token: string) {
  const response = await fetch(`${URL}/logged/today`, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Fetching logged workout status failed");
  }

  return response.json();
}
