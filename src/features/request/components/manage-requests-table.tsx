"use client";

import { CircleAlert, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Role } from "@/entities/role";
import { useProjectByIdQuery } from "@/features/project/queries/use-project-by-id-query";
import { useUpdateRequestStatusByIdMutation } from "@/features/request/mutations/use-update-request-status-by-id-mutation";
import { useSelf } from "@/features/user/hooks/use-self";
import { useUserByIdQuery } from "@/features/user/queries/use-user-by-id-query";
import { useRequests } from "../queries/use-request";
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
}: {
  requestId: string;
  status: RequestStatus;
  requesterName: string;
  projectName?: string;
  projectExpense?: number;
}) {
  const { mutate } = useUpdateRequestStatusByIdMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const self = useSelf();

  const isTeacher = self?.role === Role.Teacher;

  const handleUpdate = (nextStatus: RequestStatus) => {
    setIsSubmitting(true);
    mutate({
      id: requestId,
      status: nextStatus,
    });
    setIsSubmitting(false);
  };

  if (status === RequestStatus.Pending) {
    return (
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          className="text-red-600"
          disabled={isSubmitting}
          onClick={() => handleUpdate(RequestStatus.Rejected)}
        >
          却下
        </Button>

        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={isSubmitting}
          onClick={() => handleUpdate(RequestStatus.Approved)}
        >
          承認
        </Button>
      </div>
    );
  }

  if (status === RequestStatus.Approved) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={isSubmitting || !isTeacher}
          >
            精算
          </Button>
        </DialogTrigger>

        <DialogContent
          className="sm:max-w-sm"
          onInteractOutside={(e) => isSubmitting && e.preventDefault()}
          onEscapeKeyDown={(e) => isSubmitting && e.preventDefault()}
        >
          <DialogHeader>
            <div className="flex items-start gap-3">
              <CircleAlert className="mt-1 h-10 w-10" />
              <div>
                <DialogTitle className="font-semibold text-lg">
                  精算確認
                </DialogTitle>

                <DialogDescription>
                  交通費を精算します。よろしいですか？
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <Table className="text-sm">
              <TableBody>
                <TableRow>
                  <TableCell className="w-32 font-medium text-gray-600">
                    案件名
                  </TableCell>
                  <TableCell>{projectName}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium text-gray-600">
                    申請者
                  </TableCell>
                  <TableCell>{requesterName}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium text-gray-600">
                    金額
                  </TableCell>
                  <TableCell>{projectExpense} 円</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="min-w-28"
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
            </DialogClose>
            <Button
              variant="outline"
              onClick={() => {
                handleUpdate(RequestStatus.Paid);
              }}
              disabled={isSubmitting}
              className="bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              精算する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}

export function ManageRequestsTable() {
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<RequestFilterStatus>(
    RequestStatus.Pending,
  );

  const { data, isLoading } = useRequests();

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
                <RequestRow keyword={keyword} key={r.id} r={r} />
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
        <ActionButtons
          requestId={r.id}
          status={r.status}
          requesterName={user?.name || ""}
          projectName={project?.name || ""}
          projectExpense={project?.expense}
        />
      </TableCell>
    </TableRow>
  );
}
