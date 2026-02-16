"use client";

import { RequestStatus } from "@/entities/request";
import { useMeRequestTable } from "../hooks/use-me-request-table";
import { MeRequestsTable } from "./me-requests-table";
import { NewRequestButton } from "./new-request-button";
import {
  type RequestFilterStatus,
  RequestFilterTabs,
} from "./request-status-tab";

export function MeRequestsBody() {
  const {
    status,
    setStatus,
    data,
    allData,
    isLoading,
    isDeleting,
    deleteRequest,
  } = useMeRequestTable();


  const counts: Record<RequestFilterStatus, number> = {
    all: allData.length,
    [RequestStatus.Pending]: allData.filter(
      (d) => d.status === RequestStatus.Pending,
    ).length,
    [RequestStatus.Approved]: allData.filter(
      (d) => d.status === RequestStatus.Approved,
    ).length,
    [RequestStatus.Paid]: allData.filter((d) => d.status === RequestStatus.Paid)
      .length,
    [RequestStatus.Rejected]: allData.filter(
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
