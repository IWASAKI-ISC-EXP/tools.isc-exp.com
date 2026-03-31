"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants";
import { getUsers } from "../v1/get-users";

/**
 * 全ユーザーを取得するための Query Hook
 * Admin のみ呼び出し可能
 */
export function useUsersQuery() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: getUsers,
  });
}
