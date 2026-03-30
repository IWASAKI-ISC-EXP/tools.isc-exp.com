"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants";
import { getRequests } from "../get-requests"; // 変更箇所

export function useRequests() {
  return useQuery({
    queryKey: queryKeys.requests,
    queryFn: getRequests,
  });
}
