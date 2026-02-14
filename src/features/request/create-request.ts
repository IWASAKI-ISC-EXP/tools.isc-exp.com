"use server";

import { firestore } from "firebase-admin";
import { collectionKeys } from "@/constants";
import { type Request, RequestStatus } from "@/entities/request";
import {
  RequestWithTimestamp,
  RequestWithTimestampTransformer,
} from "@/entities/request.server";
import v from "@/entities/valibot";
import { UnauthorizedError } from "@/errors/auth";
import { getSelf } from "@/features/user/get-self";
import { adminFirestore } from "@/firebase/admin";

/**
 * ログインしているユーザーとして新しい交通費申請を作成する
 * @param unsafeRequest
 * @returns
 */
export async function createRequest(
  unsafeRequest: Omit<Request, "id" | "status" | "requestedBy" | "createdAt">,
): Promise<Request> {
  const self = await getSelf();
  if (!self) throw new UnauthorizedError();

  const safeRequest = v.parse(v.omit(RequestWithTimestamp, ["id"]), {
    ...unsafeRequest,
    requestedBy: self.uid,
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
