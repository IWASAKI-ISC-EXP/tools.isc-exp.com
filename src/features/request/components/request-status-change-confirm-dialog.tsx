import { CircleAlert } from "lucide-react";
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
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { RequestStatus } from "@/entities/request";

type RequestStatusChangeConfirmDialogProps = {
  projectName: string;
  requesterName: string;
  projectExpense: number;
  isSubmitting: boolean;
  canManageRequests: boolean;
  handleUpdate: (requestStatus: RequestStatus) => void;
  targetRequestStatus: RequestStatus;
  buttonText: string;
  buttonIcon: React.ReactNode;
  dialogTitle: string;
  dialogDescription: string;
  buttonClassName: string;
  confirmButtonClassName: string;
};

export function RequestStatusChangeConfirmDialog({
  projectName,
  requesterName,
  projectExpense,
  isSubmitting,
  canManageRequests,
  handleUpdate,
  targetRequestStatus,
  buttonText,
  buttonIcon,
  dialogTitle,
  dialogDescription,
  buttonClassName,
  confirmButtonClassName,
}: RequestStatusChangeConfirmDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className={buttonClassName}
          disabled={isSubmitting || !canManageRequests}
          variant={"outline"}
        >
          {buttonText}
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
                {dialogTitle}
              </DialogTitle>

              <DialogDescription>{dialogDescription}</DialogDescription>
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
              disabled={isSubmitting || !canManageRequests}
            >
              キャンセル
            </Button>
          </DialogClose>
          <Button
            variant="outline"
            onClick={() => {
              handleUpdate(targetRequestStatus);
            }}
            disabled={isSubmitting || !canManageRequests}
            className={confirmButtonClassName}
          >
            {buttonIcon}
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
