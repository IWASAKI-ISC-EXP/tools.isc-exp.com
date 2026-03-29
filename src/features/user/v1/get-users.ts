"use server";
import "server-only"; // 変更箇所: v1 の共通パターン

import { collectionKeys } from "@/constants";
import { hasEnoughRole, Role } from "@/entities/role";
import { User } from "@/entities/v1/user"; // 変更箇所: v1 の User 型を使用
import v from "@/entities/valibot";
import { ForbiddenError, UnauthorizedError } from "@/errors/auth";
import { adminFirestore } from "@/firebase/admin";
import { getSelf } from "./get-self"; // 変更箇所: v1 の getSelf を使用

const minimumRole = Role.Admin;

/**
 * 全ユーザーを取得する
 * 管理者以上のロールを持つユーザーのみがアクセス可能
 */
export async function getUsers(): Promise<User[]> {
  const self = await getSelf();

  if (!self) throw new UnauthorizedError();
  if (!hasEnoughRole(self.role, minimumRole)) throw new ForbiddenError();

  const doc = await adminFirestore.collection(collectionKeys.users).get();
  if (doc.empty) return [];

  return doc.docs.map((doc) => v.parse(User, { ...doc.data(), id: doc.id })); // 変更箇所: uid → id（v1 の User スキーマに合わせる）、data展開後にidで上書き
}
