import { useSearchParams } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { RequestStatus } from "@/entities/request";

const STATUS_QUERY_KEY = "status";

export type RequestFilterStatus = "all" | RequestStatus;

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

export function useRequestFilterStatus() {
  const searchParams = useSearchParams();

  const initialFilter = normalizeRequestFilterStatus(
    searchParams.get(STATUS_QUERY_KEY),
  );

  const [statusRaw, setStatusRaw] = useQueryState(
    STATUS_QUERY_KEY,
    parseAsString.withDefault(initialFilter),
  );

  const selectedStatus = normalizeRequestFilterStatus(statusRaw);

  const setStatus = (next: RequestFilterStatus) => {
    void setStatusRaw(next);
  };

  return {
    status: selectedStatus,
    setStatus,
  };
}
