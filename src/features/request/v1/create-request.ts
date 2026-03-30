"use server";

import { firestore } from "firebase-admin";
import { collectionKeys } from "@/constants";
import { type Request, RequestStatus } from "@/entities/v1/request"; // 変更箇所
import { User } from "@/entities/v1/self"; // 変更箇所
import { schemaVersion } from "@/entities/v1/schema-version"; // 変更箇所
import {
  RequestWithTimestamp,
  RequestWithTimestampTransformer,
} from "@/entities/v1/request.server"; // 変更箇所
import v from "@/entities/valibot";
import { UnauthorizedError } from "@/errors/auth";
import { getSelf } from "@/features/user/v1/get-self"; // 変更箇所
import { adminFirestore } from "@/firebase/admin";

/**
 * ログインしているユーザーとして新しい交通費申請を作成する
 * @param unsafeRequest
 * @returns
 */
export async function createRequest(
  unsafeRequest: Omit<
    Request,
    "_schemaVersion" | "id" | "status" | "requestedBy" | "createdAt"
  >, // 変更箇所: _schemaVersion を除外、projectId → project オブジェクト
): Promise<Request> {
  const self = await getSelf(); // 変更箇所: v1 の getSelf を使用
  if (!self) throw new UnauthorizedError();

  const safeRequest = v.parse(v.omit(RequestWithTimestamp, ["id"]), {
    ...unsafeRequest,
    _schemaVersion: schemaVersion.literal, // 変更箇所
    // 変更箇所: requestedBy を uid 文字列から User オブジェクトに変更
    requestedBy: v.parse(User, self), // 変更箇所
    // 変更箇所: project.createdAt を Date から Timestamp に変換して embed
    project: {
      ...unsafeRequest.project,
      createdAt: firestore.Timestamp.fromDate(unsafeRequest.project.createdAt),
    },
    status: RequestStatus.Pending,
    date: firestore.Timestamp.fromDate(unsafeRequest.date),
    createdAt: firestore.Timestamp.fromDate(new Date()),
  });

  const createdDocRef = await adminFirestore
    .collection(collectionKeys.requests)
    .add(safeRequest);

  return v.parse(RequestWithTimestampTransformer, {
    ...safeRequest,
    id: createdDocRef.id,
  });
}
