import v from "@/entities/valibot";
import { User } from "./user";
import { schemaVersion } from "./schema-version";

export enum ProjectStatus {
  Exp = "exp",
  External = "external",
}

export const ProjectName = v.pipe(
  v.string(),
  v.minLength(1, "案件名を入力してください。"),
);
export type ProjectName = v.InferOutput<typeof ProjectName>;

export const ProjectExpense = v.pipe(
  v.number(),
  v.minValue(1, "交通費は1以上で入力してください。"),
);
export type ProjectExpense = v.InferOutput<typeof ProjectExpense>;

export const ProjectStatusSchema = v.enum(ProjectStatus);
export type ProjectStatusSchema = v.InferOutput<typeof ProjectStatusSchema>;

export const Project = v.object({
  _schemaVersion: schemaVersion,
  id: v.string(),
  name: ProjectName,
  status: ProjectStatusSchema,
  expense: ProjectExpense,
  createdBy: User,
  createdAt: v.date(),
});
export type Project = v.InferOutput<typeof Project>;
