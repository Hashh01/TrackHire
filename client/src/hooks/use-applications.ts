import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type ApplicationInput, type ApplicationWithInterviews } from "@shared/routes";

export function useApplications(search?: string, status?: string) {
  const queryKey = [api.applications.list.path, search, status].filter(Boolean);
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Build query string
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (status) params.status = status;
      const queryString = new URLSearchParams(params).toString();
      const url = `${api.applications.list.path}${queryString ? `?${queryString}` : ''}`;

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch applications");
      return api.applications.list.responses[200].parse(await res.json());
    },
  });
}

export function useApplication(id: number) {
  return useQuery({
    queryKey: [api.applications.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.applications.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch application");
      return api.applications.get.responses[200].parse(await res.json());
    },
    enabled: !isNaN(id),
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ApplicationInput) => {
      const validated = api.applications.create.input.parse(data);
      const res = await fetch(api.applications.create.path, {
        method: api.applications.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.applications.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create application");
      }
      return api.applications.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.applications.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
    },
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<ApplicationInput>) => {
      const validated = api.applications.update.input.parse(data);
      const url = buildUrl(api.applications.update.path, { id });
      
      const res = await fetch(url, {
        method: api.applications.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update application");
      return api.applications.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.applications.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.applications.get.path, data.id] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
    },
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.applications.delete.path, { id });
      const res = await fetch(url, { 
        method: api.applications.delete.method,
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to delete application");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.applications.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
    },
  });
}
