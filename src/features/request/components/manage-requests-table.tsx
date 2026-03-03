"use client";

import { Save, Trash2 } from "lucide-react";
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
import { useProjectByIdQuery } from "@/features/project/queries/use-project-by-id-query";
import { useUpdateRequestStatusByIdMutation } from "@/features/request/mutations/use-update-request-status-by-id-mutation";
import { useSelf } from "@/features/user/hooks/use-self";
import { useUserByIdQuery } from "@/features/user/queries/use-user-by-id-query";
import { useRequests } from "../queries/use-request";
import { ManageRequestsModal } from "./manage-requests-modal";
import { RequestStatusBadge } from "./request-status-badge";
import {
  type RequestFilterStatus,
  RequestFilterTabs,
} from "./request-status-tab";

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
        <ManageRequestsModal
          projectName={projectName || ""}
          requesterName={requesterName}
          projectExpense={projectExpense || 0}
          isSubmitting={isSubmitting}
          canManageRequests={isLeaderOrHigher}
          handleUpdate={handleUpdate}
          targetRequestStatus={RequestStatus.Rejected}
          buttonIcon={<Trash2 className="mr-2 h-4 w-4" />}
          buttonText="却下"
          buttonClassName="text-red-600 bg-white hover:text-red-700"
          dialogTitle="却下確認"
          dialogDescription="申請を却下します。よろしいですか？"
          confirmButtonClassName="bg-red-600 text-white hover:bg-red-700 hover:text-white px-6"
        />

        <ManageRequestsModal
          projectName={projectName || ""}
          requesterName={requesterName}
          projectExpense={projectExpense || 0}
          isSubmitting={isSubmitting}
          canManageRequests={isLeaderOrHigher}
          handleUpdate={handleUpdate}
          targetRequestStatus={RequestStatus.Approved}
          buttonIcon={<Save className="mr-2 h-4 w-4" />}
          buttonText="承認"
          buttonClassName="bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white"
          dialogTitle="承認確認"
          dialogDescription="申請を承認します。よろしいですか？"
          confirmButtonClassName="bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white px-6"
        />
      </div>
    );
  }

  if (status === RequestStatus.Approved) {
    return (
      <ManageRequestsModal
        projectName={projectName || ""}
        requesterName={requesterName}
        projectExpense={projectExpense || 0}
        isSubmitting={isSubmitting}
        canManageRequests={isTeacher}
        handleUpdate={handleUpdate}
        targetRequestStatus={RequestStatus.Paid}
        buttonIcon={<Save className="mr-2 h-4 w-4" />}
        buttonText="精算"
        buttonClassName="bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white"
        dialogTitle="精算確認"
        dialogDescription="交通費を精算します。よろしいですか？"
        confirmButtonClassName="bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white px-6"
      />
    );
  }

  return null;
}

export function ManageRequestsTable() {
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<RequestFilterStatus>(
    RequestStatus.Pending,
  );

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

  const filteredData =
    filter === "all"
      ? mergedData
      : mergedData?.filter((r) => r.status === filter);

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
            value={filter}
            onChange={setFilter}
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
                  keyword={keyword}
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
  keyword: string;
  onOptimisticUpdate: (requestId: string, nextStatus: RequestStatus) => void;
};

function RequestRow({ r, keyword, onOptimisticUpdate }: RequestRowProps) {
  const { data: project } = useProjectByIdQuery(r.projectId);
  const { data: user } = useUserByIdQuery(r.requestedBy);
  const formatDateJP = (date: Date) =>
    date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (!user?.name.includes(keyword)) {
    return null;
  }

  return (
    <TableRow>
      <TableCell>
        <RequestStatusBadge status={r.status} />
      </TableCell>

      <TableCell>{user ? user.name : ""}</TableCell>

      <TableCell className="whitespace-pre-line">
        {project?.name}
        <br />
      </TableCell>

      <TableCell>{formatDateJP(r.date)}</TableCell>

      <TableCell>{formatDateJP(r.createdAt)}</TableCell>

      <TableCell>{project?.expense}円</TableCell>

      <TableCell className="whitespace-pre-line text-gray-600 text-sm">
        {r.memo}
      </TableCell>

      <TableCell>
        <ActionButtons
          requestId={r.id}
          status={r.status}
          requesterName={user?.name || ""}
          projectName={project?.name || ""}
          projectExpense={project?.expense}
          onOptimisticUpdate={onOptimisticUpdate}
        />
      </TableCell>
    </TableRow>
  );
}
