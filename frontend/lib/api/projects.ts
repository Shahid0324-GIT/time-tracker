import api from "@/lib/api/client";
import { ProjectWithClient } from "@/lib/types";

export const projectsApi = {
  getAll: async () => {
    const { data } = await api.get<ProjectWithClient[]>("/projects/");
    return data;
  },
};
