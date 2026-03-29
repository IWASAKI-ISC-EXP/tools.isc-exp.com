"use server";
import "server-only"; // 変更箇所: v1 の共通パターン
import { collectionKeys, googleLoginAllowedDomain } from "@/constants";
import { LoginStatus } from "@/entities/login";
import { Role } from "@/entities/role";
import { UserInfo } from "@/entities/self";
import { schemaVersion } from "@/entities/v1/schema-version"; // 変更箇所: schemaVersion を共通定義から使用
import type { Self } from "@/entities/v1/self"; // 変更箇所: v1 の Self 型を使用
import v from "@/entities/valibot";
import { adminFirestore } from "@/firebase/admin";
import { getDepartmentById } from "../get-department-by-id";
import { getSelfLoginStatus } from "./get-self-login-status"; // 変更箇所: v1 版の getSelfLoginStatus を使用

/**
 * 新規ユーザー登録を行う
 * すでにオンボーディングが完了している場合、ログインしていない場合は null を返す
 * この関数から null が返ってきた場合は常にホームにリダイレクトすることが期待される。ログインしていない null の場合はホームにリダイレクトされた後に proxy.ts によってログインページにリダイレクトされるはず。
 */
export async function registerSelf(
  unsafeUserInfo: Omit<UserInfo, "role">,
): Promise<Self | null> {
  const userInfo = v.parse(UserInfo, { ...unsafeUserInfo, role: Role.Member }); // デフォルトで Member ロールを付与

  const selfLoginStatus = await getSelfLoginStatus();
  if (selfLoginStatus.status !== LoginStatus.IncompleteOnboarding) return null;

  // 許可されていないメールドメインの場合、エラーをスローする
  // クライアントサイドで制限しているため、正規のログインルートでは発生しないが、セキュリティのためサーバーサイドでもチェックする
  if (
    selfLoginStatus.self.email.split("@").pop() !== googleLoginAllowedDomain
  ) {
    throw new NotAllowedEmailDomainError();
  }

  const department = await getDepartmentById(userInfo.departmentId);
  if (!department) return null; // 部署が存在しない場合は null を返す （通常はクライアントサイドで弾かれるはず）

  // Users コレクションに情報を登録する
  // 変更箇所: _schemaVersion を追加し、departmentId の代わりに Department オブジェクトを保存
  const userData = {
    _schemaVersion: schemaVersion.literal, // 変更箇所: 数値直書きではなく schemaVersion から参照
    name: userInfo.name,
    enrollmentYear: userInfo.enrollmentYear,
    department,
    role: userInfo.role,
  };

  await adminFirestore
    .collection(collectionKeys.users)
    .doc(selfLoginStatus.self.uid)
    .set(userData);

  // 変更箇所: v1 の User は id フィールドを持つため uid から生成して返す
  return {
    ...selfLoginStatus.self,
    ...userData,
    id: selfLoginStatus.self.uid,
  };
}

class NotAllowedEmailDomainError extends Error {
  constructor() {
    super("Not allowed email domain");
    this.name = "NotAllowedEmailDomainError";
  }
}
