"use server";

import { collectionKeys } from "@/constants";
import { hasEnoughRole, Role } from "@/entities/role";
import { User } from "@/entities/self";
import v from "@/entities/valibot";
import { ForbiddenError, UnauthorizedError } from "@/errors/auth";
import { adminFirestore } from "@/firebase/admin";
import { getSelf } from "./get-self";

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

  return doc.docs.map((doc) => v.parse(User, { uid: doc.id, ...doc.data() }));
}
