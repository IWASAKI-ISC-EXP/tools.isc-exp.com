"use server";

import { collectionKeys } from "@/constants";
import { hasEnoughRole, Role } from "@/entities/role";
import { User } from "@/entities/self";
import v from "@/entities/valibot";
import { ForbiddenError, UnauthorizedError } from "@/errors/auth";
import { adminFirestore } from "@/firebase/admin";
import { getSelf } from "./get-self";

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

  return v.parse(User, { ...doc.data(), id: doc.id });
}
