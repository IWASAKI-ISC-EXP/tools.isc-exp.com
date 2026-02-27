import { Role } from "../entities/role";

const roleLabelMap: Record<Role, string> = {
  [Role.Member]: "メンバー",
  [Role.Leader]: "幹部",
  [Role.Teacher]: "顧問",
  [Role.Admin]: "管理者",
};

export function Rolenamejp(role: Role | null | undefined) {
  if (!role) return "不明";
  return roleLabelMap[role];
}
