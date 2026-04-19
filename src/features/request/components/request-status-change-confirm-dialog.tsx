import { CircleAlert, Save, Trash2 } from "lucide-react";
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
import { RequestStatus } from "@/entities/request";

type RequestConfirmSummary = {
  projectName: string;
  requesterName: string;
  projectExpense: number;
};

type ActionVariant = "approve" | "reject" | "paid";

const primaryTriggerClass =
  "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white";

const primaryConfirmClass =
  "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white px-6";

const triggerClassByVariant: Record<ActionVariant, string> = {
  approve: primaryTriggerClass,
  reject: "text-red-600 bg-white hover:text-red-700",
  paid: primaryTriggerClass,
};

const confirmClassByVariant: Record<ActionVariant, string> = {
  approve: primaryConfirmClass,
  reject: "bg-red-600 text-white hover:bg-red-700 hover:text-white px-6",
  paid: primaryConfirmClass,
};

const ActionConfigByVariant: Record<
  ActionVariant,
  {
    buttonText: string;
    buttonIcon: React.ReactNode;
    dialogTitle: string;
    dialogDescription: string;
    targetRequestStatus: RequestStatus;
  }
> = {
  approve: {
    buttonText: "承認",
    buttonIcon: <Save className="mr-2 h-4 w-4" />,
    dialogTitle: "承認確認",
    dialogDescription: "申請を承認します。よろしいですか？",
    targetRequestStatus: RequestStatus.Approved,
  },
  reject: {
    buttonText: "却下",
    buttonIcon: <Trash2 className="mr-2 h-4 w-4" />,
    dialogTitle: "却下確認",
    dialogDescription: "申請を却下します。よろしいですか？",
    targetRequestStatus: RequestStatus.Rejected,
  },
  paid: {
    buttonText: "精算",
    buttonIcon: <Save className="mr-2 h-4 w-4" />,
    dialogTitle: "精算確認",
    dialogDescription: "交通費を精算します。よろしいですか？",
    targetRequestStatus: RequestStatus.Paid,
  },
};

type RequestStatusChangeConfirmDialogProps = {
  summary: RequestConfirmSummary;
  isSubmitting: boolean;
  canManageRequests: boolean;
  handleUpdate: (requestStatus: RequestStatus) => void;
  variant: ActionVariant;
};

export function RequestStatusChangeConfirmDialog({
  summary,
  isSubmitting,
  canManageRequests,
  handleUpdate,
  variant,
}: RequestStatusChangeConfirmDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className={triggerClassByVariant[variant]}
          disabled={isSubmitting || !canManageRequests}
          variant={"outline"}
        >
          {ActionConfigByVariant[variant].buttonText}
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
                {ActionConfigByVariant[variant].dialogTitle}
              </DialogTitle>

              <DialogDescription>
                {ActionConfigByVariant[variant].dialogDescription}
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
                <TableCell>{summary.projectName}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium text-gray-600">
                  申請者
                </TableCell>
                <TableCell>{summary.requesterName}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium text-gray-600">
                  金額
                </TableCell>
                <TableCell>{summary.projectExpense} 円</TableCell>
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
              handleUpdate(ActionConfigByVariant[variant].targetRequestStatus);
            }}
            disabled={isSubmitting || !canManageRequests}
            className={confirmClassByVariant[variant]}
          >
            {ActionConfigByVariant[variant].buttonIcon}
            {ActionConfigByVariant[variant].buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
