import "server-only";
import { firestore } from "firebase-admin";
import v from "@/entities/valibot";
import { Request } from "./request";
import { ProjectWithTimestamp } from "./project.server";

export const RequestWithTimestamp = v.object({
  ...v.omit(Request, ["project", "date", "createdAt"]).entries,
  project: ProjectWithTimestamp,
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
