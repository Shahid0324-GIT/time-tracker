import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { authApi } from "@/lib/api/auth";
import { LoginCredentials, RegisterData } from "@/lib/types";
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
      setAuth(data.user);
      toast.success("Account created successfully!");
      router.push("/dashboard" as Route);
    },
    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(error.response?.data?.detail || "Registration failed");
    },
  });

  // Logout
  const logout = async () => {
    queryClient.cancelQueries();

    clearAuth();
    queryClient.clear();
    router.push("/login" as Route);
    toast.success("Logged out successfully");

    try {
      await authApi.logout();
    } catch (e) {
      console.error("Background logout error", e);
    }
  };

  // Get current user (for protected routes)
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: authApi.getMe,
    enabled: isAuthenticated,
    retry: false,
  });

  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isAuthenticated,
    currentUser,
    isLoadingUser,
  };
}
