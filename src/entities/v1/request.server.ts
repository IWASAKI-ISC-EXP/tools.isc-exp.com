import "server-only";
import { firestore } from "firebase-admin";
import v from "@/entities/valibot";
import { Project } from "./project";
import { Request } from "./request";

// Request エンティティの createdAt を Firestore の Timestamp 型で扱うバージョン
// Timestamp が Server SDK 特有の型であるため分ける
const ProjectInRequestWithTimestamp = v.object({
  ...v.omit(Project, ["createdAt"]).entries,
  createdAt: v.custom<firestore.Timestamp>(
    (data) => data instanceof firestore.Timestamp,
    "Expected firestore.Timestamp",
  ),
});

export const RequestWithTimestamp = v.object({
  ...v.omit(Request, ["project", "date", "createdAt"]).entries,
  project: ProjectInRequestWithTimestamp,
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
    project: { ...r.project, createdAt: r.project.createdAt.toDate() },
    date: r.date.toDate(),
    createdAt: r.createdAt.toDate(),
  })),
);
