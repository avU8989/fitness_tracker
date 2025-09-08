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

  if (!response.ok) {
    throw new Error("Failed to log Workout");
  }

  console.log(response);
  return response.json();
}
