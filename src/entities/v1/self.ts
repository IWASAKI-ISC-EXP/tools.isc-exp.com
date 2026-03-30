import { Department } from "@/entities/department";
import { RoleSchema } from "@/entities/role";
import v from "@/entities/valibot";
import { User } from "./user";

// Firebase Auth から取得する情報
export const AuthSelf = v.object({
  uid: v.string(),
  // Firebase Authentication Admin SDK の型定義は optional になっていないが、処理上必要なため Required にする
  email: v.pipe(v.string(), v.email()),
  picture: v.optional(v.string()),
});
export type AuthSelf = v.InferOutput<typeof AuthSelf>;

// オンボーディングフォームの入力型
export const UserInfo = v.object({
  name: User.entries.name,
  enrollmentYear: User.entries.enrollmentYear,
  department: Department,
  role: RoleSchema,
});
export type UserInfo = v.InferOutput<typeof UserInfo>;

// ログイン済みユーザーの完全情報（Auth + Firestore User）
export const Self = v.object({
  ...AuthSelf.entries,
  ...User.entries,
});
export type Self = v.InferOutput<typeof Self>;
