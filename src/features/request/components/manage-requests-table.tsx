"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Request, RequestStatus } from "@/entities/request";
import { hasEnoughRole, Role } from "@/entities/role";
import { useUpdateRequestStatusByIdMutation } from "@/features/request/mutations/use-update-request-status-by-id-mutation";
import { useSelf } from "@/features/user/hooks/use-self";
import {
  type RequestFilterStatus,
  useRequestFilterStatus,
} from "../hooks/use-request-filter-status";
import { useRequests } from "../queries/use-request";
import { RequestStatusBadge } from "./request-status-badge";
import { RequestStatusChangeConfirmDialog } from "./request-status-change-confirm-dialog";
import { RequestFilterTabs } from "./request-status-tab";

const SKELETON_ROW_KEYS = ["row-1", "row-2", "row-3", "row-4", "row-5"];

function ActionButtons({
  requestId,
  status,
  requesterName,
  projectName,
  projectExpense,
  onOptimisticUpdate,
}: {
  requestId: string;
  status: RequestStatus;
  requesterName: string;
  projectName?: string;
  projectExpense?: number;
  onOptimisticUpdate: (requestId: string, nextStatus: RequestStatus) => void;
}) {
  const RequestConfirmSummary = {
    projectName: projectName || "",
    requesterName,
    projectExpense: projectExpense || 0,
  };

  const { mutate } = useUpdateRequestStatusByIdMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const self = useSelf();

  const isTeacher = self?.role === Role.Teacher;
  const isLeaderOrHigher = hasEnoughRole(self?.role, Role.Leader);

  const handleUpdate = (nextStatus: RequestStatus) => {
    const prevStatus = status;
    setIsSubmitting(true);
    onOptimisticUpdate(requestId, nextStatus);
    mutate(
      {
        id: requestId,
        status: nextStatus,
      },
      {
        onError() {
          onOptimisticUpdate(requestId, prevStatus);
        },
        onSettled() {
          setIsSubmitting(false);
        },
      },
    );
  };

  if (status === RequestStatus.Pending) {
    return (
      <div className="flex justify-end gap-2">
        <RequestStatusChangeConfirmDialog
          Summary={RequestConfirmSummary}
          isSubmitting={isSubmitting}
          canManageRequests={isLeaderOrHigher}
          handleUpdate={handleUpdate}
          actionVariant="reject"
        />

        <RequestStatusChangeConfirmDialog
          Summary={RequestConfirmSummary}
          isSubmitting={isSubmitting}
          canManageRequests={isLeaderOrHigher}
          handleUpdate={handleUpdate}
          actionVariant="approve"
        />
      </div>
    );
  }

  if (status === RequestStatus.Approved) {
    return (
      <RequestStatusChangeConfirmDialog
        Summary={RequestConfirmSummary}
        isSubmitting={isSubmitting}
        canManageRequests={isTeacher}
        handleUpdate={handleUpdate}
        actionVariant="paid"
      />
    );
  }

  return null;
}

export function ManageRequestsTable() {
  const [keyword, setKeyword] = useState("");

  const { status: selectedStatus, setStatus } = useRequestFilterStatus();

  const [optimisticStatusMap, setOptimisticStatusMap] = useState<
    Record<string, RequestStatus>
  >({});

  const { data, isLoading } = useRequests();

  const mergedData = data?.map((r) => ({
    ...r,
    status: optimisticStatusMap[r.id] ?? r.status,
  }));

  const handleOptimisticUpdate = (
    requestId: string,
    nextStatus: RequestStatus,
  ) => {
    setOptimisticStatusMap((prev) => ({
      ...prev,
      [requestId]: nextStatus,
    }));
  };

  const statusCounts: Record<RequestFilterStatus, number> = {
    all: mergedData?.length ?? 0,
    [RequestStatus.Pending]:
      mergedData?.filter((r) => r.status === RequestStatus.Pending).length ?? 0,
    [RequestStatus.Approved]:
      mergedData?.filter((r) => r.status === RequestStatus.Approved).length ??
      0,
    [RequestStatus.Paid]:
      mergedData?.filter((r) => r.status === RequestStatus.Paid).length ?? 0,
    [RequestStatus.Rejected]:
      mergedData?.filter((r) => r.status === RequestStatus.Rejected).length ??
      0,
  };

  const filteredData = (
    selectedStatus === "all"
      ? mergedData
      : mergedData?.filter((r) => r.status === selectedStatus)
  )?.filter((r) =>
    r.requestedBy.name.toLowerCase().includes(keyword.toLowerCase()),
  );

  return (
    <div className="w-full space-y-4">
      <div className="mb-4 w-fill max-w-none">
        <Input
          placeholder="申請者名で検索..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full bg-white"
        />

        <div className="mt-4">
          <RequestFilterTabs
            value={selectedStatus}
            onChange={setStatus}
            counts={statusCounts}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="h-20 bg-gray-50">
              <TableHead>ステータス</TableHead>
              <TableHead>申請者</TableHead>
              <TableHead>案件名</TableHead>
              <TableHead>参加日</TableHead>
              <TableHead>申請日時</TableHead>
              <TableHead>金額</TableHead>
              <TableHead>備考</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              SKELETON_ROW_KEYS.map((key) => (
                <TableRow key={key}>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredData?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-6 text-center text-gray-500"
                >
                  データがありません
                </TableCell>
              </TableRow>
            ) : (
              filteredData?.map((r) => (
                <RequestRow
                  key={r.id}
                  r={r}
                  onOptimisticUpdate={handleOptimisticUpdate}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

type RequestRowProps = {
  r: Request;
  onOptimisticUpdate: (requestId: string, nextStatus: RequestStatus) => void;
};

function RequestRow({ r, onOptimisticUpdate }: RequestRowProps) {
  const formatDateJP = (date: Date) =>
    date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <TableRow>
      <TableCell>
        <RequestStatusBadge status={r.status} />
      </TableCell>

      <TableCell>{r.requestedBy.name}</TableCell>

      <TableCell className="whitespace-pre-line">{r.project.name}</TableCell>

      <TableCell>{formatDateJP(r.date)}</TableCell>

      <TableCell>{formatDateJP(r.createdAt)}</TableCell>

      <TableCell>{`${r.project.expense.toLocaleString()}円`}</TableCell>

      <TableCell className="whitespace-pre-line text-gray-600 text-sm">
        {r.memo}
      </TableCell>

      <TableCell>
        <ActionButtons
          requestId={r.id}
          status={r.status}
          requesterName={r.requestedBy.name}
          projectName={r.project.name}
          projectExpense={r.project.expense}
          onOptimisticUpdate={onOptimisticUpdate}
        />
      </TableCell>
    </TableRow>
  );
}
