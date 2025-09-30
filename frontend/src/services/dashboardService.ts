import { API_URL } from "@env";

const URL = `${API_URL}/dashboard`;

export const getDashboardOverview = async (token: string) => {
  const response = await fetch(`${URL}/overview`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard overview");
  }

  return response.json();
};
