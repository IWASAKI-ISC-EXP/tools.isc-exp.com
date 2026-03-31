"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants";
import type { RequestStatus } from "@/entities/v1/request";
import { updateRequestStatusById } from "../v1/update-request-status-by-id";

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
