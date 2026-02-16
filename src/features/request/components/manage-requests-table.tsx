"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { type Request, RequestStatus } from "@/entities/request";
import { Role } from "@/entities/role";
import { useProjectByIdQuery } from "@/features/project/queries/use-project-by-id-query";
import { useUpdateRequestStatusByIdMutation } from "@/features/request/mutations/use-update-request-status-by-id-mutation";
import { useSelf } from "@/features/user/hooks/use-self";
import { useUserByIdQuery } from "@/features/user/queries/use-user-by-id-query";
import { useRequests } from "../queries/use-request";
import {
  type RequestFilterStatus,
  RequestFilterTabs,
} from "./requests-filter-tabs";
import { RequestStatusBadge } from "./requests-status-badge";

function ActionButtons({
  requestId,
  status,
}: {
  requestId: string;
  status: RequestStatus;
}) {
  const { mutate, isPending } = useUpdateRequestStatusByIdMutation();
  const self = useSelf();

  const isTeacherOrHigher = self?.role === Role.Teacher;

  const handleUpdate = (nextStatus: RequestStatus) => {
    mutate({
      id: requestId,
      status: nextStatus,
    });
  };

  if (status === RequestStatus.Pending) {
    return (
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          className="text-red-600"
          disabled={isPending}
          onClick={() => handleUpdate(RequestStatus.Rejected)}
        >
          却下
        </Button>

        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={isPending}
          onClick={() => handleUpdate(RequestStatus.Approved)}
        >
          承認
        </Button>
      </div>
    );
  }

  if (status === RequestStatus.Approved) {
    return (
      <div className="flex justify-end">
        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={isPending || !isTeacherOrHigher}
          onClick={() => handleUpdate(RequestStatus.Paid)}
        >
          精算
        </Button>
      </div>
    );
  }

  return null;
}

export function ManageRequestsTable() {
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<RequestFilterStatus>(
    RequestStatus.Pending,
  );

  const { data } = useRequests();


  const statusCounts: Record<RequestFilterStatus, number> = {
    all: data?.length ?? 0,
    [RequestStatus.Pending]:
      data?.filter((r) => r.status === RequestStatus.Pending).length ?? 0,
    [RequestStatus.Approved]:
      data?.filter((r) => r.status === RequestStatus.Approved).length ?? 0,
    [RequestStatus.Paid]:
      data?.filter((r) => r.status === RequestStatus.Paid).length ?? 0,
    [RequestStatus.Rejected]:
      data?.filter((r) => r.status === RequestStatus.Rejected).length ?? 0,
  };

  const filteredData =
    filter === "all" ? data : data?.filter((r) => r.status === filter);

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

      <div className="rounded-xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="h-20 bg-gray-50">
              <TableHead>ステータス</TableHead>
              <TableHead>申請者</TableHead>
              <TableHead>案件名</TableHead>
              <TableHead>参加日時</TableHead>
              <TableHead>申請日</TableHead>
              <TableHead>金額</TableHead>
              <TableHead>備考</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData?.map((r) => (
              <RequestRow key={r.id} r={r} keyword={keyword} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

type RequestRowProps = {
  r: Request;
  keyword: string;
};

function RequestRow({ r, keyword }: RequestRowProps) {
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
        <ActionButtons requestId={r.id} status={r.status} />
      </TableCell>
    </TableRow>
  );
}
