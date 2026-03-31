"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants";
import { updateUserRoleById } from "../update-user-role-by-id";

export function useUpdateUserByIdMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserRoleById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}
