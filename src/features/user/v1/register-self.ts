"use server";
import { collectionKeys, googleLoginAllowedDomain } from "@/constants";
import { LoginStatus } from "@/entities/login";
import { Role } from "@/entities/role";
import { schemaVersion } from "@/entities/v1/schema-version"; // 変更箇所: schemaVersion を共通定義から使用
import { type Self, UserInfo } from "@/entities/v1/self"; // 変更箇所: v1 の UserInfo / Self 型を使用
import v from "@/entities/valibot";
import { adminFirestore } from "@/firebase/admin";
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

  // Users コレクションに情報を登録する
  // 変更箇所: _schemaVersion を追加し、v1 UserInfo は department オブジェクトを直接持つため getDepartmentById 不要
  const userData = {
    ...userInfo,
    _schemaVersion: schemaVersion.literal, // 変更箇所: 数値直書きではなく schemaVersion から参照
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
