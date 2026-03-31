"use server";
import { collectionKeys, googleLoginAllowedDomain } from "@/constants";
import { LoginStatus } from "@/entities/login";
import { Role } from "@/entities/role";
import { schemaVersion } from "@/entities/schema-version";
import { type Self, UserInfo } from "@/entities/self";
import v from "@/entities/valibot";
import { adminFirestore } from "@/firebase/admin";
import { getDepartmentById } from "./get-department-by-id";
import { getSelfLoginStatus } from "./get-self-login-status";

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

  const department = await getDepartmentById(userInfo.department.id);
  if (!department) return null; // 部署が存在しない場合は null を返す （通常はクライアントサイドで弾かれるはず）

  // Users コレクションに情報を登録する
  const userData = {
    ...userInfo,
    _schemaVersion: schemaVersion.literal,
  };

  await adminFirestore
    .collection(collectionKeys.users)
    .doc(selfLoginStatus.self.uid)
    .set(userData);

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
