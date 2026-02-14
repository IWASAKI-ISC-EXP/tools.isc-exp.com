import "server-only";
import { firestore } from "firebase-admin";
import v from "@/entities/valibot";
import { Request } from "./request";

// Request エンティティの createdAt を Firestore の Timestamp 型で扱うバージョン
// Timestamp が Server SDK 特有の型であるため分ける
export const RequestWithTimestamp = v.object({
  ...Request.entries,
  date: v.custom<firestore.Timestamp>(
    (data) => data instanceof firestore.Timestamp,
    "Expected firestore.Timestamp",
  ),
  createdAt: v.custom<firestore.Timestamp>(
    (data) => data instanceof firestore.Timestamp,
    "Expected firestore.Timestamp",
  ),
});

export const RequestWithTimestampTransformer = v.pipe(
  RequestWithTimestamp,
  v.transform((r) => ({
    ...r,
    date: r.date.toDate(),
    createdAt: r.createdAt.toDate(),
  })),
);
