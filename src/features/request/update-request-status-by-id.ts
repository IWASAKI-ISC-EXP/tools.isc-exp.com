"use server";

import { fromTheme } from "tailwind-merge";
import { collectionKeys } from "@/constants";
import { type Request, RequestStatus } from "@/entities/request";
import { RequestWithTimestampTransformer } from "@/entities/request.server";
import { hasEnoughRole, Role } from "@/entities/role";
import v from "@/entities/valibot";
import { ForbiddenError, UnauthorizedError } from "@/errors/auth";
import { getSelf } from "@/features/user/get-self";
import { adminFirestore } from "@/firebase/admin";

const minimumRole = Role.Leader;
const paidMinimumRole = Role.Teacher;
/**
 * 交通費申請のステータスをIDで更新する
 * 基本的には幹部以上の権限が必要だが、精算は顧問のみ可能
 * @param id
 * @param status
 */
export async function updateRequestStatusById(
  id: string,
  status: RequestStatus,
): Promise<Request | null> {
  const self = await getSelf();
  if (!self) throw new UnauthorizedError();

  // 権限チェック
  if (status === RequestStatus.Paid && self.role !== paidMinimumRole)
    throw new ForbiddenError();
  if (!hasEnoughRole(self.role, minimumRole)) throw new ForbiddenError();

  const requestRef = await adminFirestore
    .collection(collectionKeys.requests)
    .doc(id)
    .get();

  if (!requestRef.exists) return null;

  await adminFirestore.collection(collectionKeys.requests).doc(id).update({
    status,
  });

  return v.parse(RequestWithTimestampTransformer, {
    id,
    ...requestRef.data(),
    status,
  });
}
