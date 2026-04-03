import { useMemo } from "react";
import { queryClient } from "@/components/query";
import { queryKeys } from "@/constants";
import { useDeleteMyRequestByIdMutation } from "../mutations/use-delete-my-request-by-id-mutation";
import { useMyRequestsQuery } from "../queries/use-my-requests-query";
import { useRequestFilterStatus } from "./use-request-filter-status";

export function useMeRequestTable() {
  const { status: selectedStatus, setStatus } = useRequestFilterStatus();
  const { data: requests = [], isLoading, error } = useMyRequestsQuery();

  const filteredData = useMemo(() => {
    if (selectedStatus === "all") return requests;
    return requests?.filter((row) => row.status === selectedStatus) || [];
  }, [requests, selectedStatus]);

  const deleteMutation = useDeleteMyRequestByIdMutation();

  const deleteRequest = async (id: string) => {
    await deleteMutation.mutateAsync(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.myRequests });
      },
    });
  };

  return {
    status: selectedStatus,
    setStatus,
    requests,
    data: filteredData,
    isLoading,
    error,
    deleteRequest,
    isDeleting: deleteMutation.isPending,
  };
}
