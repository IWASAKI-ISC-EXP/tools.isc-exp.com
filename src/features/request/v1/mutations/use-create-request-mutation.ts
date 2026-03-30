"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants";
import { createRequest } from "../create-request"; // 変更箇所

export function useCreateRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.myRequests,
      });
    },
  });
}
