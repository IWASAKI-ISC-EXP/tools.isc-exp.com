"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExpLogo } from "@/components/exp-logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { urls } from "@/constants";
import { DepartmentId, EnrollmentYear, Name } from "@/entities/self";
import { useDepartmentsQuery } from "@/features/user/queries/use-departments-query";
import { registerSelf } from "@/features/user/register-self";
import { useFormValue } from "@/hooks/useFormValue";
import { getAvailableEnrollmentYears } from "../utils/get-available-enrollment-years";

export function OnboardingForm() {
  const router = useRouter();
  const enrollmentYears = getAvailableEnrollmentYears();
  const { data: departments = [], isPending } = useDepartmentsQuery();
  const [name, setName, nameError] = useFormValue("", Name);
  const [enrollmentYear, setYear, yearError] = useFormValue(0, EnrollmentYear);
  const [departmentId, setDepartment, departmentError] = useFormValue(
    "",
    DepartmentId,
  );

  const [isSubmitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSubmitting(true);

    await registerSelf({
      name,
      enrollmentYear,
      departmentId,
    });
    router.push(urls.home);
  }
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-xl text-center">
        <CardHeader>
          <div className="flex justify-center">
            <ExpLogo className="mb-4 h-20 w-auto" loading="eager" />
          </div>
          <CardTitle>プロフィール登録</CardTitle>
          <CardDescription>初回ログイン時の登録が必要です</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="mb-5 flex flex-col gap-6">
              <NameBox
                text="名前"
                placeholder="山田 太郎"
                value={name}
                onChange={(e) => setName(e.target.value)}
                errorMsg={nameError}
              />
            </div>
            <div className="mb-5">
              <Label className="mb-2 text-muted-foreground">
                入学年度 <span className="text-red-500">*</span>
              </Label>
              {isPending ? (
                <Skeleton className="h-10 w-full rounded-md" />
              ) : (
                <Select
                  value={enrollmentYear === 0 ? "" : String(enrollmentYear)}
                  onValueChange={(v) => setYear(Number(v))}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full bg-gray-100">
                    <SelectValue placeholder="学年を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {enrollmentYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}年
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="mb-5">
              <Label className="mb-2 text-muted-foreground">
                学科 <span className="text-red-500">*</span>
              </Label>
              {isPending ? (
                <Skeleton className="h-10 w-full rounded-md" />
              ) : (
                <Select
                  value={departmentId}
                  onValueChange={(v) => setDepartment(v)}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full bg-gray-100">
                    <SelectValue placeholder="学科を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <Button
              type="submit"
              className="w-full py-5"
              disabled={
                isSubmitting || !name || !enrollmentYear || !departmentId
              }
            >
              <p> 登録してホームへ</p>
            </Button>
          </form>
        </CardContent>
        <div className="mx-8 rounded-lg border border-blue-200 bg-blue-50 p-4 text-left text-blue-900 text-sm">
          <p className="mb-1.5">注意事項</p>
          <ul className="ml-2.5 list-disc">
            <li className="mb-1">登録後、権限は「メンバー」に設定されます</li>
            <li>プロフィール作成日時は自動的に保存されます</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

type NameBoxProps = {
  text: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errorMsg: string | null;
};
function NameBox({
  text,
  placeholder,
  value,
  onChange,
  errorMsg,
}: NameBoxProps) {
  return (
    <div>
      <Label className="mb-2 text-muted-foreground">
        {text}
        <span className="text-red-500">*</span>
      </Label>
      <Input placeholder={placeholder} value={value} onChange={onChange} />
      {errorMsg && <p className="mt-1 text-red-500 text-sm">{errorMsg}</p>}
    </div>
  );
}
