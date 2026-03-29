import { Department } from "@/entities/department";
import { RoleSchema } from "@/entities/role";
import v from "@/entities/valibot";
import { schemaVersion } from "./schema-version";

export const Name = v.pipe(
  v.string(),
  v.minLength(1, "名前を入力してください。"),
);
export type Name = v.InferOutput<typeof Name>;

export const EnrollmentYear = v.pipe(
  v.number(),
  v.minValue(1, "入学年度を選択してください"),
);
export type EnrollmentYear = v.InferOutput<typeof EnrollmentYear>;

export const User = v.object({
  _schemaVersion: schemaVersion,
  id: v.string(),
  name: Name,
  enrollmentYear: EnrollmentYear,
  department: Department,
  role: RoleSchema,
});
export type User = v.InferOutput<typeof User>;
