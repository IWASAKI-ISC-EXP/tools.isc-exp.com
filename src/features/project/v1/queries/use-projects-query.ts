"use client";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants";
import { getProjects } from "../get-projects"; // 変更箇所

export function useProjectsQuery() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: getProjects,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
