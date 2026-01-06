"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuthStore } from "@/lib/stores/authStore";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";
import { Route } from "next";

export function DeleteAccountCard() {
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user) {
      toast.error("No user is logged in.");
      return;
    }
    if (user.email === "janedoe@example.com") {
      toast.error("Demo account cannot be deleted.");
      return;
    }

    setIsDeleting(true);
    try {
      await authApi.deleteAccount();

      // 1. Clear local state
      logout();

      // 2. Show success and redirect
      toast.success("Account deleted successfully");
      router.replace("/login" as Route);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to delete account. Please try again.";
      toast.error(msg);
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
      <CardHeader>
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertTriangle className="h-5 w-5" />
          <CardTitle>Danger Zone</CardTitle>
        </div>
        <CardDescription>
          Permanently delete your account and all associated data (Projects,
          Time Entries, Invoices). This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isDeleting}>
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete My Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove all your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault(); // Prevent closing immediately to show loading state if needed
                  handleDelete();
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isDeleting || user?.email === "janedoe@example.com"}
              >
                {isDeleting ? "Deleting..." : "Yes, delete my account"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
