import api from "./client";
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
} from "@/lib/types";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;

export const authApi = {
  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  // Login with email/password
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  // Get current user
  getMe: async (): Promise<User> => {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },

  // OAuth URLs
  getGoogleLoginUrl: (): string => {
    return `${BASE_API_URL}/auth/google`;
  },

  getGithubLoginUrl: (): string => {
    return `${BASE_API_URL}/auth/github`;
  },
};
