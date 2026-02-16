import { type NextRequest, NextResponse } from "next/server";
import { urls } from "@/constants";
import { LoginStatus } from "@/entities/login";
import { hasEnoughRole, Role } from "@/entities/role";
import type { getSelfLoginStatus } from "../user/get-self-login-status";

export function authProxy(
  req: NextRequest,
  selfLoginStatus: Awaited<ReturnType<typeof getSelfLoginStatus>>,
) {
  const isNotLoggedIn = selfLoginStatus.status === LoginStatus.NotLoggedIn;
  const isAuthLoggedIn =
    selfLoginStatus.status === LoginStatus.IncompleteOnboarding;
  const isCompleteOnboarding = selfLoginStatus.status === LoginStatus.LoggedIn;

  if (req.nextUrl.pathname === urls.login) {
    // ログインページへのアクセス
    if (isAuthLoggedIn) {
      // オンボーディングが完了していない場合、オンボーディングページへリダイレクトする
      return NextResponse.redirect(new URL(urls.onboarding, req.url));
    }

    if (isCompleteOnboarding) {
      // すでにログインしている場合、ホームへリダイレクトする
      return NextResponse.redirect(new URL(urls.home, req.url));
    }

    return NextResponse.next();
  }

  // 未ログインの場合、ログインページへリダイレクトする
  if (isNotLoggedIn) {
    return NextResponse.redirect(new URL(urls.login, req.url));
  }

  if (req.nextUrl.pathname === urls.onboarding) {
    // オンボーディングページへのアクセス
    if (isCompleteOnboarding) {
      // すでにオンボーディングが完了している場合、ホームへリダイレクトする
      return NextResponse.redirect(new URL(urls.home, req.url));
    }

    return NextResponse.next();
  }

  // オンボーディングが完了していない場合、オンボーディングページへリダイレクトする
  if (isAuthLoggedIn && req.nextUrl.pathname !== urls.onboarding) {
    return NextResponse.redirect(new URL(urls.onboarding, req.url));
  }

  // 管理者専用ページにアクセスしようとした場合、権限をチェックする
  if (urls.managerOnlyPages.includes(req.nextUrl.pathname)) {
    if (
      !isCompleteOnboarding ||
      !hasEnoughRole(selfLoginStatus.self.role, Role.Leader)
    ) {
      return NextResponse.redirect(new URL(urls.home, req.url));
    }
  }

  // ユーザー管理ページにアクセスしようとした場合、権限をチェックする
  if (req.nextUrl.pathname === urls.manageUsers) {
    if (
      !isCompleteOnboarding ||
      !hasEnoughRole(selfLoginStatus.self.role, Role.Admin)
    ) {
      return NextResponse.redirect(new URL(urls.home, req.url));
    }
  }

  return NextResponse.next();
}
