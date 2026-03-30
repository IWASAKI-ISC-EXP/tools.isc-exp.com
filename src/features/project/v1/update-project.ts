"use server";

import { collectionKeys } from "@/constants";
import { hasEnoughRole, Role } from "@/entities/role";
import type { Project } from "@/entities/v1/project"; // 変更箇所
import { ProjectWithTimestampTransformer } from "@/entities/v1/project.server"; // 変更箇所
import v from "@/entities/valibot";
import { ForbiddenError, UnauthorizedError } from "@/errors/auth";
import { getSelf } from "@/features/user/v1/get-self"; // 変更箇所
import { adminFirestore } from "@/firebase/admin";

const minimumRole = Role.Leader;
/**
 * 案件情報を更新する
 * Leader 以上の権限が必要
 * ログインしていない、権限が足りない場合はエラーをスローする
 * @param id
 * @param data
 * @returns
 */
export async function updateProjectById(
  id: string,
  data: Partial<Pick<Project, "name" | "status" | "expense">>,
): Promise<Project> {
  const self = await getSelf(); // 変更箇所: v1 の getSelf を使用
  if (!self) throw new UnauthorizedError();
  if (!hasEnoughRole(self.role, minimumRole)) throw new ForbiddenError();

  const docRef = adminFirestore.collection(collectionKeys.projects).doc(id);
  await docRef.update(data);

  return v.parse(ProjectWithTimestampTransformer, {
    id,
    ...(await docRef.get()).data(),
  });
}
