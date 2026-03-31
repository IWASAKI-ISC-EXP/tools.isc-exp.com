"use server";

import { collectionKeys } from "@/constants";
import type { Request } from "@/entities/v1/request";
import { RequestWithTimestampTransformer } from "@/entities/v1/request.server";
import v from "@/entities/valibot";
import { UnauthorizedError } from "@/errors/auth";
import { getSelf } from "@/features/user/v1/get-self";
import { adminFirestore } from "@/firebase/admin";

/**
 * 自分の交通費申請を取得する
 * TODO: この関数は申請が多くなったときにパフォーマンスが悪くなる可能性があるため、時期を見てページネーションを実装する
 * @returns
 */
export async function getMyRequests(): Promise<Request[]> {
  const self = await getSelf();

  if (!self) throw new UnauthorizedError();

  const snapshot = await adminFirestore
    .collection(collectionKeys.requests)
    .where("requestedBy.id", "==", self.uid)
    .get();

  return snapshot.docs.map((doc) =>
    v.parse(RequestWithTimestampTransformer, {
      id: doc.id,
      ...doc.data(),
    }),
  );
}
