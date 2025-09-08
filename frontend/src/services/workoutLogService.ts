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
