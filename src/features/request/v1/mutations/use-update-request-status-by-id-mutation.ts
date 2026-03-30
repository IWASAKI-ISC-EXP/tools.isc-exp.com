"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants";
import type { RequestStatus } from "@/entities/v1/request"; // 変更箇所
import { updateRequestStatusById } from "../update-request-status-by-id"; // 変更箇所

export function useUpdateRequestStatusByIdMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) =>
      updateRequestStatusById(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.myRequests,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.requests,
      });
    },
  });
}
