"use client";

import { useState } from "react";
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
import type { User } from "@/entities/v1/self";
import { convertRoleJapanese } from "@/lib/convert-role-japanese";
import { useDepartmentByIdQuery } from "../queries/use-department-by-id-query";
import { useUsersQuery } from "../queries/use-users-query";
import { UpdateUserForm } from "./updata-user-form";

export function ManageUserPageContent() {
  const [keyword, setKeyword] = useState("");
  const { data: users, isPending: isUsersPending } = useUsersQuery();

  const filteredData = users?.filter(
    (user) =>
      user.name.includes(keyword) ||
      user.enrollmentYear.toString().includes(keyword) ||
      user.role.includes(keyword) ||
      user.department.name.includes(keyword),
  );

  return (
    <>
      <div className="mb-4">ユーザー管理</div>

      <Input
        placeholder="名前・入学年度・学科・権限のいずれかで検索"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="bg-white"
      />
      <Table className="mt-4 overflow-hidden rounded-md bg-white">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-40">名前</TableHead>
            <TableHead className="w-24">入学年度</TableHead>
            <TableHead className="w-40">学科</TableHead>
            <TableHead className="w-24">現在の権限</TableHead>
            <TableHead className="w-24">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isUsersPending ? (
            Array.from(
              { length: 5 },
              (_, index) => `skeleton-row-${index}`,
            ).map((id) => <UserTableSkeletonRow key={id} />)
          ) : filteredData?.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-6 text-center text-gray-400 text-sm"
              >
                ユーザーがいません
              </TableCell>
            </TableRow>
          ) : (
            filteredData?.map((user) => <UserRow user={user} key={user.id} />)
          )}
        </TableBody>
      </Table>
    </>
  );
}

function UserRow({ user }: { user: User }) {
  return (
    <TableRow key={user.id}>
      <TableCell className="py-4">{user.name}</TableCell>
      <TableCell className="py-4">{user.enrollmentYear}年</TableCell>
      <TableCell className="py-4">{user.department.name}</TableCell>
      <TableCell className="py-4">{convertRoleJapanese(user.role)}</TableCell>
      <TableCell className="py-4">
        <UpdateUserForm user={user} />
      </TableCell>
    </TableRow>
  );
}

function UserTableSkeletonRow() {
  return (
    <TableRow>
      {Array.from({ length: 5 }, (_, index) => `skeleton-cell-${index}`).map(
        (id) => (
          <TableCell className="py-4" key={id}>
            <Skeleton className="h-6 w-full rounded-md" />
          </TableCell>
        ),
      )}
    </TableRow>
  );
}
