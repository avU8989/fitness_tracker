import { RegistrationRequest, LoginRequest } from "../types/auth";
import { handleResponse } from "../utils/apiHelpers";
import { API_URL } from "@env";

//need to change that everytime, we start ngrok server
//To-Do Deploy server on CLOUD
//API URL for Authentication
const URL = `${API_URL}/auth`;

export async function login(email: string, password: string) {
  console.log(URL);
  const response = await fetch(`${URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email, password: password }),
  });

  return handleResponse(response, "Login failed");
}

export async function register(req: RegistrationRequest) {
  const response = await fetch(`${URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  return handleResponse(response, "Registration failed");
}
