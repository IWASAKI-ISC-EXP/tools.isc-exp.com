"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSelf } from "@/features/user/hooks/use-self";
import { logOut } from "@/features/user/log-out";
import { useDepartmentByIdQuery } from "@/features/user/queries/use-department-by-id-query";

type DropdownItemProps = {
  label: string;
  value: string | number | undefined;
};

function DropdownItem({ label, value }: DropdownItemProps) {
  return (
    <DropdownMenuLabel>
      <p className="text-gray-500 text-xs">{label}</p>
      <span className="rounded py-1 text-black text-sm">{value}</span>
    </DropdownMenuLabel>
  );
}

export function UserMenu() {
  const self = useSelf();
  const department = useDepartmentByIdQuery(self.departmentId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="mr-5 h-10 w-10">
          <AvatarImage src={self.picture} />
          <AvatarFallback>{self.name}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 font-normal font-sans">
        <DropdownItem label="氏名" value={self.name} />

        <DropdownItem label="メールアドレス" value={self.email} />

        <DropdownItem label="入学年度" value={`${self.enrollmentYear}年`} />

        <DropdownItem label="学科" value={department.data?.name} />

        <DropdownItem label="権限" value={self.role} />

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-red-600"
          onClick={async () => {
            await logOut();
          }}
        >
          ログアウト
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
