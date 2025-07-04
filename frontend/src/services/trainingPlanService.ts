import { CreateTrainingPlanRequest } from "../requests/trainingPlan";
import { handleResponse } from "../utils/apiHelpers";
import { API_URL } from "@env";

//API URL for Trainigplans Endpoint
const URL = `${API_URL}/training-plans`;

export async function createTrainingPlan(
  token: string,
  data: CreateTrainingPlanRequest
) {
  const response = await fetch(`${URL}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  console.log(response);

  if (!response.ok) {
    throw new Error("Failed to create training plan");
  }

  return response.json();
}
