import { useMemo, useState } from "react";
import { type Request, RequestStatus } from "@/entities/request";
import { useProjectsQuery } from "@/features/project/queries/use-projects-query";
import type { RequestFilterStatus } from "../components/request-status-tab";
import { useDeleteMyRequestByIdMutation } from "../mutations/use-delete-my-request-by-id-mutation";
import { useMyRequestsQuery } from "../queries/use-my-requests-query";

export type RequestWithProject = Request & {
  projectName?: string;
  expense?: number;
};

export function useMeRequestTable() {
  const [status, setStatus] = useState<RequestFilterStatus>(
    RequestStatus.Pending,
  );

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
    if (status === "all") return allData;
    return allData.filter((row) => row.status === status);
  }, [allData, status]);

  const deleteMutation = useDeleteMyRequestByIdMutation();

  const deleteRequest = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    await requestsQuery.refetch();
  };

  return {
    status,
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
