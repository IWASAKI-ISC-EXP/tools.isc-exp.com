import { useMemo } from "react";
import type { Request } from "@/entities/request";
import { useProjectsQuery } from "@/features/project/queries/use-projects-query";

import { useDeleteMyRequestByIdMutation } from "../mutations/use-delete-my-request-by-id-mutation";
import { useMyRequestsQuery } from "../queries/use-my-requests-query";
import { useRequestFilterStatus } from "./use-request-filter-status";

export type RequestWithProject = Request & {
  projectName?: string;
  expense?: number;
};

export function useMeRequestTable() {
  const { status: selectedStatus, setStatus } = useRequestFilterStatus();

  const requestsQuery = useMyRequestsQuery();
  const projectsQuery = useProjectsQuery();

  const allData = useMemo<RequestWithProject[]>(() => {
    if (!requestsQuery.data) return [];

    const projectMap = new Map(
      projectsQuery.data?.map((p) => [
        p.id,
        { name: p.name, expense: p.expense },
      ]) ?? [],
    );

    return requestsQuery.data.map((req) => {
      const project = projectMap.get(req.projectId);

      return {
        ...req,
        projectName: project?.name,
        expense: project?.expense,
      };
    });
  }, [requestsQuery.data, projectsQuery.data]);

  const filteredData = useMemo(() => {
    if (selectedStatus === "all") return allData;
    return allData.filter((row) => row.status === selectedStatus);
  }, [allData, selectedStatus]);

  const deleteMutation = useDeleteMyRequestByIdMutation();

  const deleteRequest = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    await requestsQuery.refetch();
  };

  return {
    status: selectedStatus,
    setStatus,
    allData,
    data: filteredData,
    isLoading: requestsQuery.isLoading,
    isProjectsLoading: projectsQuery.isLoading,
    error: requestsQuery.error || projectsQuery.error,
    deleteRequest,
    isDeleting: deleteMutation.isPending,
  };
}
