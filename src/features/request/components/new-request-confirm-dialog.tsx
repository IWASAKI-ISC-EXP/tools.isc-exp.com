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
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { useNewRequestForm } from "../hooks/use-new-request-form";

export function NewRequestConfirmForm({
  open,
  onOpenChange,
  form,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  form: ReturnType<typeof useNewRequestForm>;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (form.isPending) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-1 h-10 w-10" />

            <div>
              <DialogTitle className="font-semibold text-lg">
                送信確認
              </DialogTitle>

              <DialogDescription>
                以下の内容で交通費を申請します。よろしいですか？
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (form.isPending) return;
            form.submit();
          }}
          className="space-y-4"
        >
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <Table className="text-sm">
              <TableBody>
                <TableRow>
                  <TableCell className="w-32 font-medium text-gray-600">
                    案件名
                  </TableCell>
                  <TableCell>{form.name}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium text-gray-600">
                    日付
                  </TableCell>
                  <TableCell>{form.formatDate(form.date)}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium text-gray-600">
                    金額
                  </TableCell>
                  <TableCell>{form.expense} 円</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="flex gap-3">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="min-w-28"
                onClick={form.reset}
                disabled={form.isPending}
              >
                キャンセル
              </Button>
            </DialogClose>

            <Button
              type="submit"
              className="min-w-28"
              disabled={form.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {form.isPending ? "送信中..." : "送信する"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
