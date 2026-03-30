"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants";
import { getMyRequests } from "../get-my-requests"; // 変更箇所

export function useMyRequestsQuery() {
  return useQuery({
    queryKey: queryKeys.myRequests,
    queryFn: getMyRequests,
    staleTime: Infinity, // 新規申請や削除をするときに invalidate するので無限にしておく
  });
}
