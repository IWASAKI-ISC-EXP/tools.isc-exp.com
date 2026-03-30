"use server";

import { collectionKeys } from "@/constants";
import { hasEnoughRole, Role } from "@/entities/role";
import { User } from "@/entities/v1/self"; // 変更箇所: v1 の User 型を使用
import v from "@/entities/valibot";
import { ForbiddenError, UnauthorizedError } from "@/errors/auth";
import { adminFirestore } from "@/firebase/admin";
import { getSelf } from "./get-self"; // 変更箇所: v1 の getSelf を使用

const minimumRole = Role.Admin;
/**
 * ユーザーIDからロールを更新する
 * Admin 以上の権限が必要
 * @param userId
 * @param role
 */
export async function updateUserRoleById({
  userId,
  role,
}: {
  userId: string;
  role: Role;
}): Promise<User | null> {
  const self = await getSelf();
  if (!self) throw new UnauthorizedError();
  if (!hasEnoughRole(self.role, minimumRole)) throw new ForbiddenError();

  const docRef = adminFirestore.collection(collectionKeys.users).doc(userId);
  const userDoc = await docRef.get();
  if (!userDoc.exists) return null;

  await docRef.update({ role });

  return v.parse(User, {
    ...userDoc.data(),
    id: userDoc.id, // 変更箇所: uid → id（v1 の User スキーマに合わせる）、data展開後にidで上書き
    role,
  });
}
