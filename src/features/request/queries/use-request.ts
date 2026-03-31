"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants";
import { getRequests } from "../get-requests";

export function useRequests() {
  return useQuery({
    queryKey: queryKeys.requests,
    queryFn: getRequests,
  });
}
