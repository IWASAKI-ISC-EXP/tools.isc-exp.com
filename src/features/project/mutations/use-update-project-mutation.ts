"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants";
import { updateProjectById } from "../update-project";

/**
 * 案件情報を更新する Mutation
 * @returns
 *
 * @example
 * const mutation = useUpdateProjectByIdMutation();
 * mutation.mutate({ id: "projectId", data: { name: "New Project Name" } });
 */
export function useUpdateProjectByIdMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn が引数を１つしか受け取れないため、オブジェクトでラップする
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateProjectById>[1];
    }) => updateProjectById(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}
