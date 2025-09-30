import { API_URL } from "@env";
import { CreatePhysicalActivityLogRequest } from "../requests/CreatePhysicalActivityLogRequest";

//API URL for Health Data Endpoint regarding Physical Activity
const URL = `${API_URL}/healthdata`;

export async function createPhysicalActivityLog(
  token: string,
  data: CreatePhysicalActivityLogRequest
) {
  const response = await fetch(`${URL}/physical-activity`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create Physical Activity Log");
  }

  return response.json();
}
