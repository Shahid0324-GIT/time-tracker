import api from "./client";
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  UserUpdate,
  ChangePasswordData,
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

  // Logout (Clears HttpOnly Cookie)
  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  // Get current user
  getMe: async (): Promise<User> => {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },

  // Update Profile (PATCH /users/me)
  updateProfile: async (data: UserUpdate): Promise<User> => {
    const response = await api.patch<User>("/users/me", data);
    return response.data;
  },

  // Authenticated: Change Password
  changePassword: async (data: ChangePasswordData): Promise<void> => {
    await api.post("/auth/change-password", data);
  },

  // Delete Account
  deleteAccount: async (): Promise<void> => {
    await api.delete("/users/me");
  },

  // OAuth URLs
  getGoogleLoginUrl: (): string => {
    return `${BASE_API_URL}/auth/google`;
  },

  getGithubLoginUrl: (): string => {
    return `${BASE_API_URL}/auth/github`;
  },
};
