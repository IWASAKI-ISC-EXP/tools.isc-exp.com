"use client";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RequestStatus } from "@/entities/request";
import type { RequestWithProject } from "../hooks/use-me-request-table";
import { MeRequestsDeleteDialog } from "./me-requests-delete-dialog";
import { RequestStatusBadge } from "./request-status-badge";

type Props = {
  data: RequestWithProject[];
  loading?: boolean;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
};
type LoadingCellProps<T> = {
  value: T | undefined;
  render: (value: T) => React.ReactNode;
  skeleton: React.ReactNode;
};

export const LoadingCell = <T,>({
  value,
  render,
  skeleton,
}: LoadingCellProps<T>) => {
  if (value == null) return <>{skeleton}</>;
  return <>{render(value)}</>;
};

export function MeRequestsTable({
  data,
  loading,
  onDelete,
  isDeleting,
}: Props) {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const targetRow = data.find((r) => r.id === deleteTargetId);

  const formatDateJP = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}年${m}月${d}日`;
  };

  return (
    <div className="mt-6">
      <Table className="mb-6 overflow-hidden rounded-lg shadow">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="px-2 py-2 text-left">ステータス</TableHead>
            <TableHead className="px-2 py-2 text-left">案件内容</TableHead>
            <TableHead className="px-2 py-2 text-left">参加日</TableHead>
            <TableHead className="px-2 py-2 text-left">金額</TableHead>
            <TableHead className="px-2 py-2 text-left">備考</TableHead>
            <TableHead className="px-2 py-2 text-left">申請日時</TableHead>
            <TableHead className="px-2 py-2 text-left">削除</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="bg-white">
          {loading && data.length === 0 ? (
            Array.from(
              { length: 5 },
              (_, index) => `skeleton-row-${index}`,
            ).map((id) => <ProjectTableSkeletonRow key={id} />)
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-6 text-center text-gray-400 text-sm"
              >
                申請がありません。
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => {
              const canDelete = row.status === RequestStatus.Pending;

              return (
                <TableRow key={row.id}>
                  <TableCell className="py-4">
                    <LoadingCell
                      value={row.status}
                      skeleton={<Skeleton className="h-5 w-32" />}
                      render={(v) => <RequestStatusBadge status={v} />}
                    />
                  </TableCell>

                  <TableCell className="py-4 font-medium">
                    <LoadingCell
                      value={row.projectName}
                      skeleton={<Skeleton className="h-5 w-32" />}
                      render={(v) => v}
                    />
                  </TableCell>

                  <TableCell className="whitespace-nowrap py-4">
                    <LoadingCell
                      value={row.date}
                      skeleton={<Skeleton className="h-5 w-24" />}
                      render={(v) => (
                        <time dateTime={v.toISOString().slice(0, 10)}>
                          {formatDateJP(v)}
                        </time>
                      )}
                    />
                  </TableCell>

                  <TableCell className="whitespace-nowrap py-4">
                    <LoadingCell
                      value={row.expense}
                      skeleton={<Skeleton className="ml-auto h-5 w-20" />}
                      render={(v) => <p>¥{v.toLocaleString()}</p>}
                    />
                  </TableCell>

                  <TableCell className="py-4 text-gray-600">
                    {row.memo}
                  </TableCell>

                  <TableCell className="whitespace-nowrap py-4">
                    <LoadingCell
                      value={row.createdAt}
                      skeleton={<Skeleton className="ml-auto h-5 w-20" />}
                      render={(v) => (
                        <p className="text-gray-600">
                          申請日：
                          <br></br>
                          <time dateTime={v.toISOString().slice(0, 10)}>
                            {formatDateJP(v)}
                          </time>
                        </p>
                      )}
                    />
                  </TableCell>

                  <TableCell className="py-4">
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Button
                          size="icon"
                          variant="link"
                          onClick={() => setDeleteTargetId(row.id)}
                          disabled={!canDelete || isDeleting}
                          className="text-red-600 hover:text-red-700 disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </HoverCardTrigger>
                      {!canDelete && (
                        <HoverCardContent className="flex items-center gap-1">
                          <RequestStatusBadge status={row.status} />
                          <span>は削除できません</span>
                        </HoverCardContent>
                      )}
                    </HoverCard>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      <MeRequestsDeleteDialog
        open={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        loading={isDeleting}
        label={
          targetRow
            ? `「${targetRow.projectName}」を削除しますか？削除後は元に戻せません。`
            : undefined
        }
        onConfirm={() => {
          if (!deleteTargetId) return;
          onDelete(deleteTargetId);
          setDeleteTargetId(null);
        }}
      />
    </div>
  );
}

function ProjectTableSkeletonRow() {
  return (
    <TableRow>
      {Array.from({ length: 7 }, (_, index) => `skeleton-cell-${index}`).map(
        (id) => (
          <TableCell className="py-6" key={id}>
            <Skeleton className="h-6 w-full rounded-md" />
          </TableCell>
        ),
      )}
    </TableRow>
  );
}
