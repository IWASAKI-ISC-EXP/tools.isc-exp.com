"use client";

import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { useNewRequestForm } from "../hooks/use-new-request-form";
import { NewRequestFormCalendar } from "./new-request-form-calendar";
export function NewRequestForm({
  onSuccess,
  form,
}: {
  onSuccess: () => void;
  form: ReturnType<typeof useNewRequestForm>;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSuccess();
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <FormLabel required>案件名</FormLabel>
        <Select
          value={form.projectId}
          onValueChange={(value) => form.setProjectId(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="案件を選択してください" />
          </SelectTrigger>

          <SelectContent>
            {form.projects.data?.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {form.errors.projectError && (
          <p className="text-red-500 text-sm">{form.errors.projectError}</p>
        )}
      </div>

      <div className="space-y-2">
        <FormLabel required>日程</FormLabel>

        <NewRequestFormCalendar value={form.date} onChange={form.setDate} />

        {form.errors.dateError && (
          <p className="text-red-500 text-sm">{form.errors.dateError}</p>
        )}
      </div>

      <div className="space-y-2">
        <FormLabel required>金額（円）</FormLabel>
        <Input
          className="w-full bg-gray-100"
          disabled
          placeholder="案件を選択すると自動的に表示されます"
          value={form.expense ?? ""}
        />
      </div>

      <div className="space-y-2">
        <FormLabel>備考（任意）</FormLabel>
        <Textarea
          value={form.memo}
          onChange={(e) => form.setMemo(e.target.value)}
          placeholder="特記事項があれば入力してください"
          className="h-28 w-full break-all"
        />
      </div>

      <DialogFooter className="flex gap-2">
        <Button
          type="submit"
          disabled={!form.canSubmit}
          className="w-full bg-indigo-600 py-5 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="mr-2" />
          この内容で申請する
        </Button>
      </DialogFooter>
    </form>
  );
}
function FormLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <Label className="font-medium text-sm">
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </Label>
  );
}
