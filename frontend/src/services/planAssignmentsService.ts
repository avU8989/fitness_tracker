import { handleResponse } from "../utils/apiHelpers";
import { API_URL } from "@env";
import { CreateTrainingAssignmentRequest } from "../requests/trainingPlan";

const URL = `${API_URL}/trainingplan-assignments`;
export async function getActivePlan(token: string, date: string) {
  try {
    const response = await fetch(`${URL}/active?date=${date}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch active plan: ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    console.error("Error in getActivePlan:", err);
    throw err;
  }
}

export async function createTrainingPlanAssignment(
  token: string,
  data: CreateTrainingAssignmentRequest
) {
  try {
    const response = await fetch(`${URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to assign trainingplan: ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    console.error("Error assigning Trainingplan:", err);
    throw err;
  }
}
