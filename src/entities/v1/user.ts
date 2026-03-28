import { RoleSchema } from "@/entities/role";
import v from "@/entities/valibot";

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
  _schemaVersion: v.literal(1),
  id: v.string(),
  name: Name,
  enrollmentYear: EnrollmentYear,
  role: RoleSchema,
});
export type User = v.InferOutput<typeof User>;
