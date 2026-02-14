import v from "./valibot";

export enum RequestStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
  Paid = "paid",
}

export const Request = v.object({
  id: v.string(),
  projectId: v.string(),
  requestedBy: v.string(),
  date: v.date(),
  createdAt: v.date(),
  memo: v.string(),
  status: v.enum(RequestStatus),
});

export type Request = v.InferOutput<typeof Request>;
