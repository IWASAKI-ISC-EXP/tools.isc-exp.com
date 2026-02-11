"use client";

import { useMeRequestTable } from "../hooks/use-new-request-form";
import { MeRequestsTable } from "./me-requests-table";
import { MeRequestsTabs } from "./me-requests-tabs";
import { NewRequestButton } from "./new-request-button";

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

  const counts = {
    all: allData.length,
    pending: allData.filter((d) => d.status === "pending").length,
    approved: allData.filter((d) => d.status === "approved").length,
    paid: allData.filter((d) => d.status === "paid").length,
    rejected: allData.filter((d) => d.status === "rejected").length,
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <MeRequestsTabs value={status} onChange={setStatus} counts={counts} />

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
