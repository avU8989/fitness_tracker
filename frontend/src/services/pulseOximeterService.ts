import { API_URL } from "@env";
import { CreatePulseOximeterLogRequest } from "../requests/CreatePulseOximeterLogRequest";

//API URL for Health Data Endpoint regarding Pulse Oximeter
const URL = `${API_URL}/healthdata`;

export async function createPulseOximeterLog(
  token: string,
  data: CreatePulseOximeterLogRequest
) {
  const response = await fetch(`${URL}/pulse-oximeter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create Pulse Oximeter Log");
  }

  return response.json();
}
