import { API_URL } from "@env";
import { CreateHeartRateLogRequest } from "../requests/CreateHeartRateLogRequest";

//API URL for Trainigplans Endpoint
const URL = `${API_URL}/healthdata`;

export async function createHeartRateLog(
  token: string,
  data: CreateHeartRateLogRequest
) {
  const response = await fetch(`${URL}/heartrate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create Heart Rate Log");
  }

  return response.json();
}
