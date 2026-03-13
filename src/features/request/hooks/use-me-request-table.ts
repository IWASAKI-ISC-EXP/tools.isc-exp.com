import { useSearchParams } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import { type Request, RequestStatus } from "@/entities/request";
import { useProjectsQuery } from "@/features/project/queries/use-projects-query";
import type { RequestFilterStatus } from "../components/request-status-tab";
import { useDeleteMyRequestByIdMutation } from "../mutations/use-delete-my-request-by-id-mutation";
import { useMyRequestsQuery } from "../queries/use-my-requests-query";

function normalizeRequestFilterStatus(
  value: string | null | undefined,
): RequestFilterStatus {
  return value === "all" ||
    value === RequestStatus.Pending ||
    value === RequestStatus.Approved ||
    value === RequestStatus.Paid ||
    value === RequestStatus.Rejected
    ? value
    : RequestStatus.Pending;
}

export type RequestWithProject = Request & {
  projectName: string;
  expense: number;
};

export function useMeRequestTable() {
  const searchParams = useSearchParams();

  const initialFilter = normalizeRequestFilterStatus(
    searchParams.get("status"),
  );

  const [statusRaw, setStatusRaw] = useQueryState(
    "status",
    parseAsString.withDefault(initialFilter),
  );

  const status = normalizeRequestFilterStatus(statusRaw);

  const setStatus = (next: RequestFilterStatus) => {
    void setStatusRaw(next);
  };

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
