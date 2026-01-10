import api from "./client";
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  UserUpdate,
  ChangePasswordData,
  RegisterResponse,
  VerifyEmailData,
  ForgotPasswordData,
  ResetPasswordData,
} from "@/lib/types";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;

export const authApi = {
  // Register now returns a message, not a User/Token
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>("/auth/register", data);
    return response.data;
  },

  // Verify Email (This one returns the User + Token)
  verifyEmail: async (data: VerifyEmailData): Promise<AuthResponse> => {
    const params = new URLSearchParams({ email: data.email, otp: data.otp });
    const response = await api.post<AuthResponse>(
      `/auth/verify-email?${params.toString()}`
    );
    return response.data;
  },

  // Login with email/password
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  // Get current user
  getMe: async (): Promise<User> => {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },

  // Exchange token
  setSession: async (token: string) => {
    return api.post("/auth/session", { access_token: token });
  },

  // Update Profile
  updateProfile: async (data: UserUpdate): Promise<User> => {
    const response = await api.patch<User>("/users/me", data);
    return response.data;
  },

  // Change Password
  changePassword: async (data: ChangePasswordData): Promise<void> => {
    await api.post("/auth/change-password", data);
  },

  // Forgot Password
  forgotPassword: async (
    data: ForgotPasswordData
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      "/auth/forgot-password",
      data
    );
    return response.data;
  },

  // Reset Password
  resetPassword: async (
    data: ResetPasswordData
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      "/auth/reset-password",
      data
    );
    return response.data;
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
