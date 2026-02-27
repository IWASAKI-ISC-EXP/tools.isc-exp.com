"use client";

import { Save, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Role, RoleSchema } from "@/entities/role";
import type { User } from "@/entities/self";
import { roleNameJp } from "@/lib/role-name-jp";
import { useUpdateUserByIdMutation } from "../mutations/use-update-user-mutation";
export function UpdateUserForm({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [userRole, setUserRole] = useState(user.role);
  const roledeta = Role;
  const mutation = useUpdateUserByIdMutation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    await mutation.mutateAsync({ userId: user.uid, role: userRole });
    setIsOpen(false);
    setSubmitting(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Settings className="h-4 w-4 text-indigo-600" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle className="text-xl">権限を編集</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <Label className="text-gray-700">
              権限<span className="text-red-500">*</span>
            </Label>
            <Select
              value={userRole}
              onValueChange={(v: Role) => setUserRole(v)}
            >
              <SelectTrigger className="w-full bg-gray-100">
                <SelectValue placeholder="権限を選択してください" />
              </SelectTrigger>
              <SelectContent>
                {roledeta &&
                  Object.values(Role).map((role) => (
                    <SelectItem value={role} key={role}>
                      {roleNameJp(role)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-full gap-4 pt-4">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="flex-1 py-5"
                onClick={() => setUserRole(user.role)}
              >
                キャンセル
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="flex-1 bg-indigo-600 py-5 text-white"
              disabled={isSubmitting || userRole === user.role || !userRole}
            >
              <Save />
              更新
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
