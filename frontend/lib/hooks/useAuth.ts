import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { authApi } from "@/lib/api/auth";
import {
  ForgotPasswordData,
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
  VerifyEmailData,
} from "@/lib/types";
import { toast } from "sonner";
import { Route } from "next";
import { AxiosError } from "axios";

export function useAuth() {
  const router = useRouter();
  const { login: setAuth, logout: clearAuth, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      setAuth(data.user);
      toast.success("Welcome back!");
      router.push("/dashboard" as Route);
    },
    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(error.response?.data?.detail || "Login failed");
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (data) => {
      toast.success("Verification code sent to your email!");

      const verifyUrl = `/verify-email?email=${encodeURIComponent(data.email)}`;
      router.push(verifyUrl as Route);
    },
    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(error.response?.data?.detail || "Registration failed");
    },
  });

  // Verify Email mutation
  const verifyEmailMutation = useMutation({
    mutationFn: (data: VerifyEmailData) => authApi.verifyEmail(data),
    onSuccess: (data) => {
      setAuth(data.user);
      toast.success("Account verified successfully!");
      router.push("/dashboard" as Route);
    },
    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(error.response?.data?.detail || "Verification failed");
    },
  });

  // Forgot Password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordData) => authApi.forgotPassword(data),
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(error.response?.data?.detail || "Request failed");
    },
  });

  // Reset Password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordData) => authApi.resetPassword(data),
    onSuccess: () => {
      toast.success("Password reset successfully. Please login.");
      router.push("/login" as Route);
    },
    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(error.response?.data?.detail || "Reset failed");
    },
  });

  // Logout
  const logout = async () => {
    queryClient.cancelQueries();
    clearAuth();
    queryClient.clear();
    router.replace("/login" as Route);
    toast.success("Logged out successfully");
    try {
      await authApi.logout();
    } catch (e) {
      console.error("Background logout error", e);
    }
  };

  // Get current user
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: authApi.getMe,
    enabled: isAuthenticated,
    retry: false,
  });

  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    verifyEmail: verifyEmailMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    logout,

    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isVerifying: verifyEmailMutation.isPending,
    isSendingReset: forgotPasswordMutation.isPending,
    isResetting: resetPasswordMutation.isPending,

    isAuthenticated,
    currentUser,
    isLoadingUser,
  };
}
