import { useMemo, useState } from "react";
import { useProjectsQuery } from "@/features/project/queries/use-projects-query";
import type { Request, RequestStatus } from "@/entities/request";
import { useDeleteMyRequestByIdMutation } from "../mutations/use-delete-my-request-by-id-mutation";
import { useMyRequestsQuery } from "../queries/use-my-requests-query";
import { RequestFilterStatus } from "../components/request-status-tab";

export type RequestWithProject = Request & {
  projectName: string;
  expense: number;
};

export function useMeRequestTable() {
  const [status, setStatus] = useState<RequestFilterStatus>("all");

  const requestsQuery = useMyRequestsQuery();
  const projectsQuery = useProjectsQuery();

  const allData = useMemo<RequestWithProject[]>(() => {
    if (!requestsQuery.data || !projectsQuery.data) {
      return [];
    }

    const projectMap = new Map(
      projectsQuery.data.map((p) => [
        p.id,
        { name: p.name, expense: p.expense },
      ]),
    );

    return requestsQuery.data
      .map((req): RequestWithProject | null => {
        const project = projectMap.get(req.projectId);
        if (!project) return null;

        return {
          ...req,
          projectName: project.name,
          expense: project.expense,
        };
      })
      .filter((row): row is RequestWithProject => row !== null);
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
    isLoading: requestsQuery.isLoading || projectsQuery.isLoading,
    error: requestsQuery.error || projectsQuery.error,
    deleteRequest,
    isDeleting: deleteMutation.isPending,
  };
}
