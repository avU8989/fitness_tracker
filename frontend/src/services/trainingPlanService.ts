import { CreateTrainingPlanRequest } from "../requests/CreateTrainingPlanRequest";
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

export async function getTrainingPlans(token: string) {
  const response = await fetch(`${URL}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("status", response.status, "body", await response.clone().text);
  if (!response.ok) {
    throw new Error("Failed to fetch training plan");
  }

  return response.json();
}
