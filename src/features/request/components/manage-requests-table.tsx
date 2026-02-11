"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Request, RequestStatus } from "@/entities/request";
import { Role } from "@/entities/role";
import { useProjectByIdQuery } from "@/features/project/queries/use-project-by-id-query";
import { useUpdateRequestStatusByIdMutation } from "@/features/request/mutations/use-update-request-status-by-id-mutation";
import { useSelf } from "@/features/user/hooks/use-self";
import { useUserByIdQuery } from "@/features/user/queries/use-user-by-id-query";
import { cn } from "@/lib/utils";
import { useRequests } from "../queries/use-request";

type Props = {
  value: string;
  label: string;
  count: number;
  active: boolean;
};

function StatusTab({ value, label, count, active }: Props) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "flex items-center gap-2 rounded-full px-4 py-2 text-sm",
        "border transition-all",
        active
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 font-medium text-xs",
          active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600",
        )}
      >
        {count}
      </span>
    </TabsTrigger>
  );
}

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
  const [filter, setFilter] = useState<string>(RequestStatus.Pending);
  const { data } = useRequests();
  // TODO: keyword で絞り込んだ時に表示件数と合わせる
  const statusCounts = {
    pending:
      data?.filter((r) => r.status === RequestStatus.Pending).length ?? 0,
    approved:
      data?.filter((r) => r.status === RequestStatus.Approved).length ?? 0,
    paid: data?.filter((r) => r.status === RequestStatus.Paid).length ?? 0,
    rejected:
      data?.filter((r) => r.status === RequestStatus.Rejected).length ?? 0,
  };
  const filteredData = data?.filter((r) => r.status === filter);

  return (
    <div className="w-full space-y-4">
      <div className="mb-4 w-fill max-w-none">
        <Input
          placeholder="申請者名で検索..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full bg-white"
        />

        <div>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="mt-4 gap-4 bg-transparent p-0">
              <StatusTab
                value={RequestStatus.Pending}
                label="承認待ち"
                count={statusCounts?.pending ?? 0}
                active={filter === RequestStatus.Pending}
              />

              <StatusTab
                value={RequestStatus.Approved}
                label="精算待ち"
                count={statusCounts?.approved ?? 0}
                active={filter === RequestStatus.Approved}
              />

              <StatusTab
                value={RequestStatus.Paid}
                label="精算済み"
                count={statusCounts?.paid ?? 0}
                active={filter === RequestStatus.Paid}
              />

              <StatusTab
                value={RequestStatus.Rejected}
                label="拒否"
                count={statusCounts?.rejected ?? 0}
                active={filter === RequestStatus.Rejected}
              />
            </TabsList>
          </Tabs>
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
              <TableHead>金額</TableHead>
              <TableHead>備考</TableHead>
              <TableHead>申請日</TableHead>
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

const STATUS_MAP = {
  [RequestStatus.Pending]: {
    label: "承認待ち",
    className: "bg-yellow-100 text-yellow-800",
  },
  [RequestStatus.Approved]: {
    label: "精算待ち",
    className: "bg-blue-100 text-blue-800",
  },
  [RequestStatus.Paid]: {
    label: "精算済み",
    className: "bg-green-100 text-green-800",
  },
  [RequestStatus.Rejected]: {
    label: "拒否",
    className: "bg-red-100 text-red-800",
  },
};

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

  const status = STATUS_MAP[r.status];

  if (!user?.name.includes(keyword)) {
    return null;
  }

  return (
    <TableRow>
      <TableCell>
        <Badge
          className={cn(
            "flex items-center gap-1 rounded-full px-3 py-1 text-sm",
            status.className,
          )}
        >
          {status.label}
        </Badge>
      </TableCell>

      <TableCell>{user ? user.name : ""}</TableCell>

      <TableCell className="whitespace-pre-line">
        {project?.name}
        <br />
      </TableCell>

      <TableCell>{formatDateJP(r.date)}</TableCell>

      <TableCell>{project?.expense}円</TableCell>

      <TableCell className="whitespace-pre-line text-gray-600 text-sm">
        {r.memo}
      </TableCell>

      <TableCell className="text-gray-600 text-sm">
        {formatDateJP(r.date)}
      </TableCell>

      <TableCell>
        <ActionButtons requestId={r.id} status={r.status} />
      </TableCell>
    </TableRow>
  );
}
