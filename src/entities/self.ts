import { Department } from "@/entities/department";
import { RoleSchema } from "@/entities/role";
import v from "@/entities/valibot";
import { schemaVersion } from "./schema-version";

// Firebase Auth から取得する情報
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

// オンボーディングフォームの入力型
export const UserInfo = v.object({
  name: Name,
  enrollmentYear: EnrollmentYear,
  department: Department,
  role: RoleSchema,
});
export type UserInfo = v.InferOutput<typeof UserInfo>;

export const User = v.object({
  _schemaVersion: schemaVersion,
  id: AuthSelf.entries.uid,
  ...UserInfo.entries,
});
export type User = v.InferOutput<typeof User>;

// ログイン済みユーザーの完全情報（Auth + Firestore User）
export const Self = v.object({
  ...AuthSelf.entries,
  ...User.entries,
});
export type Self = v.InferOutput<typeof Self>;
