import { useState } from "react";
import v from "@/entities/valibot";
import { useProjectsQuery } from "@/features/project/queries/use-projects-query";

import { useFormValue } from "@/hooks/useFormValue";
import { useCreateRequestMutation } from "../mutations/use-create-request-mutation";

const projectIdSchema = v.pipe(
  v.string(),
  v.minLength(1, "案件を選択してください"),
);

const dateSchema = v.pipe(
  v.date("日付を入力してください"),
  v.check((d) => !Number.isNaN(d.getTime()), "存在しない日付です"),
);

const memoSchema = v.string();

export function useNewRequestForm(onSuccess: () => void) {
  const [open, setOpen] = useState(false);
  const [check, setCheck] = useState(false);
  const projects = useProjectsQuery();
  const createRequestMutation = useCreateRequestMutation();
  const reset = () => {
    projectReset();
    dateReset();
    setMemo("");
    setCheck(false);
    setOpen(false);
  };

  const [projectId, setProjectId, projectError, projectReset] = useFormValue(
    "",
    projectIdSchema,
  );
  const [date, setDate, dateError, dateReset] = useFormValue(
    new Date(),
    dateSchema,
  );
  const [memo, setMemo] = useFormValue("", memoSchema);

  const selectedProject = projects.data?.find((p) => p.id === projectId);

  const submit = () => {
    if (!canSubmit || createRequestMutation.isPending) return;

    createRequestMutation.mutate(
      { project: projects.data?.find((p) => p.id === projectId)!, date, memo },
      {
        onSuccess: () => {
          onSuccess();
          reset();
        },
      },
    );
  };

  function formatDate(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}年${m}月${d}日`;
  }

  const canSubmit =
    !!projectId &&
    !!selectedProject?.expense &&
    !!date &&
    !projectError &&
    !dateError;

  return {
    open,
    setOpen,
    check,
    setCheck,
    projects,
    projectId,
    setProjectId,
    date,
    setDate,
    memo,
    setMemo,
    formatDate,
    name: selectedProject?.name,
    expense: selectedProject?.expense,
    submit,
    errors: { projectError, dateError },
    reset,
    canSubmit,
    isPending: createRequestMutation.isPending,
  };
}
