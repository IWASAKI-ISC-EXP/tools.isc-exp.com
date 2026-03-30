"use server";

import { collectionKeys } from "@/constants";
import { hasEnoughRole, Role } from "@/entities/role";
import { User } from "@/entities/v1/user"; // 変更箇所: v1 の User 型を使用
import v from "@/entities/valibot";
import { ForbiddenError, UnauthorizedError } from "@/errors/auth";
import { adminFirestore } from "@/firebase/admin";
import { getSelf } from "./get-self"; // 変更箇所: v1 の getSelf を使用

const minimumRole = Role.Leader;
/**
 * ユーザーIDからユーザー情報を取得する
 * @param userId
 */
export async function getUserById(userId: string): Promise<User | null> {
  const self = await getSelf();

  if (!self) throw new UnauthorizedError();
  if (!hasEnoughRole(self.role, minimumRole)) throw new ForbiddenError();

  const doc = await adminFirestore
    .collection(collectionKeys.users)
    .doc(userId)
    .get();
  if (!doc.exists) return null;

  return v.parse(User, { ...doc.data(), id: doc.id }); // 変更箇所: uid → id（v1 の User スキーマに合わせる）、data展開後にidで上書き
}
