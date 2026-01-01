import api from "@/lib/api/client";
import { Project, ProjectCreate, ProjectWithClient } from "@/lib/types";

export const projectsApi = {
  getAll: async () => {
    const { data } = await api.get<ProjectWithClient[]>("/projects/");
    return data;
  },

  getOne: async (id: string) => {
    const { data } = await api.get<Project>(`/projects/${id}`);
    return data;
  },

  create: async (payload: ProjectCreate) => {
    const { data } = await api.post<Project>("/projects/", payload);
    return data;
  },

  update: async ({
    id,
    payload,
  }: {
    id: string;
    payload: Partial<ProjectCreate>;
  }) => {
    const { data } = await api.patch<Project>(`/projects/${id}`, payload);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/projects/${id}`);
    return data;
  },
};
