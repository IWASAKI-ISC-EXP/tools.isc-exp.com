import { FileText, FolderKanban, Settings, UsersRound } from "lucide-react";
import { urls } from "@/constants";
import { hasEnoughRole, Role } from "@/entities/role";
import { ListCard } from "@/features/home/components/list-card";
import { getSelf } from "@/features/user/v1/get-self";

export default async function () {
  const self = await getSelf();
  if (!self) return;
  return (
    <main className="mx-auto py-8">
      <div className="mb-8">
        <h1 className="mb-2 font-medium text-gray-900 text-xl tracking-[-0.3em]">
          ようこそ
        </h1>
        <p className="text-gray-600 tracking-[-0.14em]">
          メニューから操作を選択してください
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {self.role !== Role.Teacher && (
          <ListCard
            title="申請一覧（個人）"
            description="自分の交通費申請を確認・管理できます"
            iconBg="bg-indigo-100"
            icon={FileText}
            iconClassName="text-indigo-600"
            href={urls.meRequests}
          />
        )}
        {hasEnoughRole(self.role, Role.Leader) && (
          <>
            <ListCard
              title="申請一覧（全体）"
              description="全メンバーの申請を承認・精算できます"
              iconBg="bg-green-100"
              icon={UsersRound}
              iconClassName="text-green-600"
              href={urls.manageRequests}
            />

            <ListCard
              title="案件一覧"
              description="交通費申請の案件を管理できます"
              iconBg="bg-purple-100"
              icon={FolderKanban}
              iconClassName="text-purple-600"
              href={urls.manageProjects}
            />
          </>
        )}
        {hasEnoughRole(self.role, Role.Admin) && (
          <ListCard
            title="ユーザー管理"
            description="ユーザーの権限を管理できます"
            iconBg="bg-amber-100"
            icon={Settings}
            iconClassName="text-amber-600"
            href={urls.manageUsers}
          />
        )}
      </div>
    </main>
  );
}
