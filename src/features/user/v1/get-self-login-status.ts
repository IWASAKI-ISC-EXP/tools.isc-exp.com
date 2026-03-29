"use server";
import { cache } from "react";
import { LoginStatus } from "@/entities/login";
import type { AuthSelf } from "@/entities/self";
import type { Self } from "@/entities/v1/self"; // 変更箇所: v1 の Self 型を使用
import { getAuthSelf, getSelf } from "./get-self"; // 変更箇所: v1 の getSelf を使用

/**
 * 現在のユーザーのログイン状態を取得する
 * - 未ログインの場合: `{ status: LoginStatus.NotLoggedIn }`
 * - ログインしているがオンボーディング未完了の場合: `{ status: LoginStatus.IncompleteOnboarding, self: AuthSelf }`
 * - ログインしておりオンボーディング完了の場合: `{ status: LoginStatus.LoggedIn, self: Self }`
 */
export const getSelfLoginStatus = cache(
  async (): Promise<
    | { status: LoginStatus.NotLoggedIn }
    | {
        status: LoginStatus.IncompleteOnboarding;
        self: AuthSelf;
      }
    | {
        status: LoginStatus.LoggedIn;
        self: Self; // 変更箇所: v1 の Self 型
      }
  > => {
    const authSelf = await getAuthSelf();
    if (!authSelf) {
      return { status: LoginStatus.NotLoggedIn };
    }

    const self = await getSelf();
    if (!self) {
      return { status: LoginStatus.IncompleteOnboarding, self: authSelf };
    }

    return { status: LoginStatus.LoggedIn, self };
  },
);
