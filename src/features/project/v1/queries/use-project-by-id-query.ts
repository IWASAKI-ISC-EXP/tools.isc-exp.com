"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants";
import type { Project } from "@/entities/v1/project"; // 変更箇所
import { getProjectById } from "../get-project-by-id"; // 変更箇所

export function useProjectByIdQuery(projectId: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => getProjectById(projectId),
    initialData: () => {
      // すでに getProjects で取得した案件一覧がキャッシュに存在する場合、
      // そこから該当の案件情報を返す
      // https://tanstack.com/query/v5/docs/framework/react/guides/initial-query-data#initial-data-from-cache
      return queryClient
        .getQueryData<Project[]>(queryKeys.projects)
        ?.find((project) => project.id === projectId);
    },
  });
}
