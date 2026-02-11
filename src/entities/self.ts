import v from "@/entities/valibot";
import { RoleSchema } from "./role";

export const AuthSelf = v.object({
  uid: v.string(),
  // Firebase Authentication Admin SDK の型定義は optional になっていないが、処理上必要なため Required にする
  email: v.pipe(v.string(), v.email()),
  picture: v.optional(v.string()),
});

export type AuthSelf = v.InferOutput<typeof AuthSelf>;

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

export const DepartmentId = v.pipe(
  v.string(),
  v.minLength(1, "学科を選択してください"),
);

export type Department = v.InferOutput<typeof DepartmentId>;

export const UserInfo = v.object({
  name: Name,

  /**
   * 入学年度
   */
  enrollmentYear: EnrollmentYear,

  departmentId: DepartmentId,

  role: RoleSchema,
});

export type UserInfo = v.InferOutput<typeof UserInfo>;

export const Self = v.object({
  ...AuthSelf.entries,
  ...UserInfo.entries,
});

export type Self = v.InferOutput<typeof Self>;

export const User = v.object({
  uid: AuthSelf.entries.uid,
  ...UserInfo.entries,
});

export type User = v.InferOutput<typeof User>;
