import { API_URL } from "@env";
import { CreateSleepLogRequest } from "../requests/CreateSleepLogRequest";

//API URL for Trainigplans Endpoint
const URL = `${API_URL}/healthdata`;

export async function createSleepLog(
  token: string,
  data: CreateSleepLogRequest
) {
  const response = await fetch(`${URL}/sleep`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create Sleep Log");
  }

  return response.json();
}
