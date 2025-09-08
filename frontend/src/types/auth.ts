export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegistrationRequest {
  username: string;
  email: string;
  password: string;
  age?: number;
  height?: number;
  weight?: number;
}
