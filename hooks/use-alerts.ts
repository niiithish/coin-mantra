import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Alert } from "@/lib/alerts";
import {
  deleteAlert as apiDeleteAlert,
  saveAlert as apiSaveAlert,
  toggleAlertStatus as apiToggleAlertStatus,
  updateAlert as apiUpdateAlert,
  getAlerts,
} from "@/lib/alerts";

export const ALERTS_QUERY_KEY = ["alerts"];

export function useAlerts() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ALERTS_QUERY_KEY,
    queryFn: getAlerts,
    staleTime: 60 * 1000, // 1 minute
  });

  const addMutation = useMutation({
    mutationFn: (alert: Omit<Alert, "id" | "createdAt" | "isActive">) =>
      apiSaveAlert(alert),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ALERTS_QUERY_KEY });
        toast.success(`Alert "${data.alertName}" created!`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create alert");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Alert> }) =>
      apiUpdateAlert(id, updates),
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ALERTS_QUERY_KEY });
        toast.success("Alert updated");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update alert");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDeleteAlert(id),
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ALERTS_QUERY_KEY });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete alert");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => apiToggleAlertStatus(id),
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ALERTS_QUERY_KEY });
        toast.success("Alert status toggled");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to toggle alert status");
    },
  });

  return {
    alerts: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addAlert: addMutation.mutateAsync,
    updateAlert: updateMutation.mutateAsync,
    deleteAlert: deleteMutation.mutateAsync,
    toggleAlert: toggleMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ALERTS_QUERY_KEY }),
  };
}
