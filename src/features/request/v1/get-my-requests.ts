"use server";

import { collectionKeys } from "@/constants";
import type { Request } from "@/entities/v1/request"; // 変更箇所
import { RequestWithTimestampTransformer } from "@/entities/v1/request.server"; // 変更箇所
import v from "@/entities/valibot";
import { UnauthorizedError } from "@/errors/auth";
import { getSelf } from "@/features/user/v1/get-self"; // 変更箇所
import { adminFirestore } from "@/firebase/admin";

/**
 * 自分の交通費申請を取得する
 * TODO: この関数は申請が多くなったときにパフォーマンスが悪くなる可能性があるため、時期を見てページネーションを実装する
 * @returns
 */
export async function getMyRequests(): Promise<Request[]> {
  const self = await getSelf(); // 変更箇所: v1 の getSelf を使用

  if (!self) throw new UnauthorizedError();

  const snapshot = await adminFirestore
    .collection(collectionKeys.requests)
    .where("requestedBy.uid", "==", self.uid) // 変更箇所: requestedBy が User オブジェクトになったため、ネストしたフィールドで絞り込み
    .get();

  return snapshot.docs.map((doc) =>
    v.parse(RequestWithTimestampTransformer, {
      id: doc.id,
      ...doc.data(),
    }),
  );
}
