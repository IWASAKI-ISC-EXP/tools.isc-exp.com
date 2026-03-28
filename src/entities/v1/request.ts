import v from "@/entities/valibot";
import { Project } from "./project";
import { schemaVersion } from "./schema-version";
import { User } from "./user";

export enum RequestStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
  Paid = "paid",
}

export const Request = v.object({
  _schemaVersion: schemaVersion,
  id: v.string(),
  project: Project,
  requestedBy: User,
  date: v.date(),
  createdAt: v.date(),
  memo: v.string(),
  status: v.enum(RequestStatus),
});
export type Request = v.InferOutput<typeof Request>;
