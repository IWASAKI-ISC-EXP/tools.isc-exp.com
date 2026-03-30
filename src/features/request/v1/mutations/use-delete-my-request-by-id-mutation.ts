"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants";
import { deleteMyRequestById } from "../delete-my-request-by-id"; // 変更箇所

export function useDeleteMyRequestByIdMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMyRequestById,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.myRequests,
      });
    },
  });
}
