import { API_URL } from "@env";

const URL = `${API_URL}/stats`;

export const getStatsOverview = async (token: string) => {
  const response = await fetch(`${URL}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch workout log history stats");
  }

  return response.json();
};

export const getStatsProgress = async (token: string) => {
  const response = await fetch(`${URL}/progress`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch workout log progress stats");
  }

  return response.json();
};
