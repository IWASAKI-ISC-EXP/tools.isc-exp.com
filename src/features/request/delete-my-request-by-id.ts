"use server";

import { collectionKeys } from "@/constants";
import { RequestWithTimestampTransformer } from "@/entities/request.server";
import v from "@/entities/valibot";
import { ForbiddenError, UnauthorizedError } from "@/errors/auth";
import { getSelf } from "@/features/user/get-self";
import { adminFirestore } from "@/firebase/admin";

/**
 * 自分の交通費申請をIDで削除する
 * 自分の申請ではない場合は ForbiddenError を投げる
 * @param requestId
 * @returns
 */
export async function deleteMyRequestById(requestId: string): Promise<void> {
  const self = await getSelf();

  if (!self) throw new UnauthorizedError();

  const requestRef = await adminFirestore
    .collection(collectionKeys.requests)
    .doc(requestId)
    .get();

  if (!requestRef.exists) return;

  const request = v.parse(RequestWithTimestampTransformer, {
    id: requestRef.id,
    ...requestRef.data(),
  });

  if (request.requestedBy.id !== self.uid) throw new ForbiddenError();

  await adminFirestore
    .collection(collectionKeys.requests)
    .doc(requestId)
    .delete();

  return;
}
