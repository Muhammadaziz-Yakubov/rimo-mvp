import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";

// 1. Fetch connected authorities list (internal — for report wizard)
export function useAuthorities() {
  return useQuery<any[]>({
    queryKey: ["authorities"],
    queryFn: async () => {
      const { data } = await apiClient.get("/authorities");
      return data;
    },
  });
}

// 1b. Fetch user's own organizations (juridical entities)
export function useOrganizations() {
  return useQuery<any[]>({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data } = await apiClient.get("/organizations");
      return data;
    },
  });
}

// 2. Fetch available reports templates
export function useReports() {
  return useQuery<any[]>({
    queryKey: ["reports"],
    queryFn: async () => {
      const { data } = await apiClient.get("/reports");
      return data;
    },
  });
}

// 3. Fetch tax tasks / reports submitted/draft history
export function useTasks(status?: string) {
  return useQuery<any[]>({
    queryKey: ["tasks", status],
    queryFn: async () => {
      const { data } = await apiClient.get("/tasks", {
        params: status ? { status } : undefined,
      });
      return data;
    },
  });
}

// 4. Fetch notifications
export function useNotifications() {
  return useQuery<any[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await apiClient.get("/notifications");
      return data;
    },
  });
}

// 5. Fetch API request activity log
export function useApiActivity() {
  return useQuery<any[]>({
    queryKey: ["apiActivity"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api-activity");
      return data;
    },
  });
}

// 6. Fetch user audit logs
export function useAuditLogs() {
  return useQuery<any[]>({
    queryKey: ["auditLogs"],
    queryFn: async () => {
      const { data } = await apiClient.get("/audit-logs");
      return data;
    },
  });
}

// 7. Fetch workspace aggregated analytics
export function useAnalytics() {
  return useQuery<any>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const { data } = await apiClient.get("/analytics");
      return data;
    },
  });
}

// 8. Authority Sync Mutation
export function useSyncAuthority() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => {
      const { data } = await apiClient.post(`/authorities/${id}/sync`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authorities"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

// 9. Fetch integration user profile info
export function useUserProfile() {
  return useQuery<any>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const { data } = await apiClient.get("/users/me");
      return data;
    },
  });
}

// 10. Fetch official government integration reporting authorities
export function useIntegrationAuthorities() {
  return useQuery<any[]>({
    queryKey: ["integrationAuthorities"],
    queryFn: async () => {
      const { data } = await apiClient.get("/integration/authorities");
      return data;
    },
  });
}

// 11. Fetch financials statistics
export function useFinancialStats(params?: { startDate?: string; endDate?: string }) {
  return useQuery<any>({
    queryKey: ["financialStats", params],
    queryFn: async () => {
      const { data } = await apiClient.get("/financials/stats", {
        params,
      });
      return data;
    },
  });
}

// 12. Fetch transactions list
export function useTransactions(filters: {
  type?: string;
  category?: string;
  taxCategory?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<any>({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      const { data } = await apiClient.get("/financials/transactions", {
        params: filters,
      });
      return data;
    },
  });
}

// 13. Import transactions mutation
export function useImportTransactions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await apiClient.post("/financials/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financialStats"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

// 14. Clear transactions mutation
export function useClearTransactions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.delete("/financials/transactions/clear");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financialStats"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

// 15. Rimo AI chat mutation
export function useAiChat() {
  return useMutation({
    mutationFn: async (payload: { query: string; history?: any[] }) => {
      const { data } = await apiClient.post("/financials/ai-chat", payload);
      return data;
    },
  });
}

// 16. Fetch AI report drafts list
export function useAiDrafts() {
  return useQuery<any[]>({
    queryKey: ["aiDrafts"],
    queryFn: async () => {
      const { data } = await apiClient.get("/reports/ai-drafts");
      return data;
    },
  });
}

// 17. Fetch AI report draft details
export function useAiDraft(id: string) {
  return useQuery<any>({
    queryKey: ["aiDraft", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/reports/ai-drafts/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// 18. Generate AI report draft mutation
export function useGenerateAiReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { reportId: number; period: string }) => {
      const { data } = await apiClient.post("/reports/ai-generate", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aiDrafts"] });
    },
  });
}

// 19. Approve AI report draft
export function useApproveAiReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`/reports/ai-drafts/${id}/approve`);
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["aiDrafts"] });
      queryClient.invalidateQueries({ queryKey: ["aiDraft", id] });
    },
  });
}

// 20. Reject AI report draft and trigger correction
export function useRejectAiReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; reason: string }) => {
      const { data } = await apiClient.post(`/reports/ai-drafts/${payload.id}/reject`, {
        reason: payload.reason,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["aiDrafts"] });
      queryClient.invalidateQueries({ queryKey: ["aiDraft", variables.id] });
    },
  });
}

// 21. Submit approved AI report to Government API
export function useSubmitAiReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`/reports/ai-drafts/${id}/submit`);
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["aiDrafts"] });
      queryClient.invalidateQueries({ queryKey: ["aiDraft", id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

// 22. Add transactions via AI manual input
export function useAddAiTransactions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { text: string; type: "income" | "expense" }) => {
      const { data } = await apiClient.post("/financials/transactions/ai-add", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financialStats"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
