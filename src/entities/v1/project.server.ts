import "server-only";
import { firestore } from "firebase-admin";
import v from "@/entities/valibot";
import { Project } from "./project";

// Project エンティティの createdAt を Firestore の Timestamp 型で扱うバージョン
// Timestamp が Server SDK 特有の型であるため分ける
export const ProjectWithTimestamp = v.object({
  ...Project.entries,
  createdAt: v.custom<firestore.Timestamp>(
    (data) => data instanceof firestore.Timestamp,
    "Expected firestore.Timestamp",
  ),
});

export const ProjectWithTimestampTransformer = v.pipe(
  ProjectWithTimestamp,
  v.transform((p) => ({ ...p, createdAt: p.createdAt.toDate() })),
);
