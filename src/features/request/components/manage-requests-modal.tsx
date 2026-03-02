import { CircleAlert, Save } from "lucide-react";
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

type ManageRequestsModalProps = {
  projectName: string;
  requesterName: string;
  projectExpense: number;
  isSubmitting: boolean;
  isTeacherOrHigher: boolean;
  handleUpdate: (requestStatus: RequestStatus) => void;
  targetRequestStatus: RequestStatus;
  buttontext: string;
  dialogtitle: string;
  dialogdescription: string;
  buttonclassname: string;
};

export function ManageRequestsModal({
  projectName,
  requesterName,
  projectExpense,
  isSubmitting,
  isTeacherOrHigher,
  handleUpdate,
  targetRequestStatus,
  buttontext,
  dialogtitle,
  dialogdescription,
  buttonclassname,
}: ManageRequestsModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className={buttonclassname}
          disabled={isSubmitting || !isTeacherOrHigher}
          variant={"outline"}
        >
          {buttontext}
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
                {dialogtitle}
              </DialogTitle>

              <DialogDescription>{dialogdescription}</DialogDescription>
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
              handleUpdate(targetRequestStatus);
            }}
            disabled={isSubmitting}
            className="bg-indigo-600 px-6 text-white hover:bg-indigo-700 hover:text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            {buttontext}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
