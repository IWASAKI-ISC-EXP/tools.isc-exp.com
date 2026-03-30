"use server";

import { collectionKeys } from "@/constants";
import { RequestWithTimestampTransformer } from "@/entities/v1/request.server"; // 変更箇所
import v from "@/entities/valibot";
import { ForbiddenError, UnauthorizedError } from "@/errors/auth";
import { getSelf } from "@/features/user/v1/get-self"; // 変更箇所
import { adminFirestore } from "@/firebase/admin";

/**
 * 自分の交通費申請をIDで削除する
 * 自分の申請ではない場合は ForbiddenError を投げる
 * @param requestId
 * @returns
 */
export async function deleteMyRequestById(requestId: string): Promise<void> {
  const self = await getSelf(); // 変更箇所: v1 の getSelf を使用

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

  if (request.requestedBy.id !== self.id) throw new ForbiddenError(); // 変更箇所: uid 文字列比較から User オブジェクトの id 比較に変更

  await adminFirestore
    .collection(collectionKeys.requests)
    .doc(requestId)
    .delete();

  return;
}
