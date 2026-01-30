import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InterviewInput } from "@shared/routes";

export function useCreateInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InterviewInput) => {
      const validated = api.interviews.create.input.parse(data);
      const res = await fetch(api.interviews.create.path, {
        method: api.interviews.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.interviews.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to schedule interview");
      }
      return api.interviews.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific application to refresh its interviews list
      queryClient.invalidateQueries({ 
        queryKey: [api.applications.get.path, variables.applicationId] 
      });
      queryClient.invalidateQueries({
        queryKey: [api.stats.get.path]
      });
    },
  });
}

export function useDeleteInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, applicationId }: { id: number, applicationId: number }) => {
      const url = buildUrl(api.interviews.delete.path, { id });
      const res = await fetch(url, { 
        method: api.interviews.delete.method,
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to delete interview");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [api.applications.get.path, variables.applicationId] 
      });
    },
  });
}
