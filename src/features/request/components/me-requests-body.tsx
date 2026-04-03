"use client";

import { RequestStatus } from "@/entities/request";
import { useMeRequestTable } from "../hooks/use-me-request-table";
import type { RequestFilterStatus } from "../hooks/use-request-filter-status";
import { MeRequestsTable } from "./me-requests-table";
import { NewRequestButton } from "./new-request-button";
import { RequestFilterTabs } from "./request-status-tab";

export function MeRequestsBody() {
  const {
    status,
    setStatus,
    data,
    requests,
    isLoading,
    isDeleting,
    deleteRequest,
  } = useMeRequestTable();

  const counts: Record<RequestFilterStatus, number> = {
    all: requests.length,
    [RequestStatus.Pending]: requests.filter(
      (d) => d.status === RequestStatus.Pending,
    ).length,
    [RequestStatus.Approved]: requests.filter(
      (d) => d.status === RequestStatus.Approved,
    ).length,
    [RequestStatus.Paid]: requests.filter(
      (d) => d.status === RequestStatus.Paid,
    ).length,
    [RequestStatus.Rejected]: requests.filter(
      (d) => d.status === RequestStatus.Rejected,
    ).length,
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <RequestFilterTabs
          value={status}
          onChange={setStatus}
          counts={counts}
        />

        <NewRequestButton />
      </div>

      <MeRequestsTable
        data={data}
        loading={isLoading}
        onDelete={deleteRequest}
        isDeleting={isDeleting}
      />
    </div>
  );
}
