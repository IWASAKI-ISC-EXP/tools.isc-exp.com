"use server";

import { collectionKeys } from "@/constants";
import { hasEnoughRole, Role } from "@/entities/role";
import type { Request } from "@/entities/v1/request"; // 変更箇所
import { RequestWithTimestampTransformer } from "@/entities/v1/request.server"; // 変更箇所
import v from "@/entities/valibot";
import { ForbiddenError, UnauthorizedError } from "@/errors/auth";
import { adminFirestore } from "@/firebase/admin";
import { getSelf } from "../../user/v1/get-self"; // 変更箇所

const minimumRole = Role.Leader;
/**
 * すべての交通費申請を取得する
 * Leader 以上の権限が必要
 * TODO: この関数は申請が多くなったときにパフォーマンスが悪くなる可能性があるため、時期を見てページネーションを実装する
 */
export async function getRequests(): Promise<Request[]> {
  const self = await getSelf(); // 変更箇所: v1 の getSelf を使用

  if (!self) throw new UnauthorizedError();
  if (!hasEnoughRole(self.role, minimumRole)) throw new ForbiddenError();

  const snapshot = await adminFirestore
    .collection(collectionKeys.requests)
    .get();

  return snapshot.docs.map((doc) =>
    v.parse(RequestWithTimestampTransformer, {
      id: doc.id,
      ...doc.data(),
    }),
  );
}
