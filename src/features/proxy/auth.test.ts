import { type NextRequest, NextResponse } from "next/server";
import { describe, expect, it } from "vitest";
import { urls } from "@/constants";
import { LoginStatus } from "@/entities/login";
import { Role } from "@/entities/role";
import type { AuthSelf, Self } from "@/entities/v1/self";
import { authProxy } from "@/features/proxy/auth";
import { createMockAuthSelf, createMockSelf } from "../../../mocks/auth";
import { createMockReqWithPathname } from "../../../mocks/next";

function createMockNotLoggedIn() {
  return { status: LoginStatus.NotLoggedIn } as const;
}

function createMockIncompleteOnboarding(authSelf?: Partial<AuthSelf>) {
  return {
    status: LoginStatus.IncompleteOnboarding,
    self: createMockAuthSelf(authSelf),
  } as const;
}

function createMockCompleteOnboarding(self: Partial<Self> = {}) {
  return {
    status: LoginStatus.LoggedIn,
    self: createMockSelf(self),
  } as const;
}

function createRedirectResponse(req: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, req.url));
}

describe("認証・認可ミドルウェアのテスト", () => {
  describe("ログインページへのアクセス", () => {
    const loginPageReq = createMockReqWithPathname(urls.login);
    it("未ログインユーザーはログインページにアクセスできる", () => {
      const result = authProxy(loginPageReq, createMockNotLoggedIn());
      expect(result).toEqual(NextResponse.next());
    });

    it("オンボーディング未完了ユーザーはオンボーディングページにリダイレクトされる", () => {
      const result = authProxy(loginPageReq, createMockIncompleteOnboarding());
      expect(result).toEqual(
        createRedirectResponse(loginPageReq, urls.onboarding),
      );
    });

    it("オンボーディング完了ユーザーはホームにリダイレクトされる", () => {
      const result = authProxy(loginPageReq, createMockCompleteOnboarding());
      expect(result).toEqual(createRedirectResponse(loginPageReq, urls.home));
    });
  });

  describe("オンボーディングページへのアクセス", () => {
    const onboardingPageReq = createMockReqWithPathname(urls.onboarding);

    it("未ログインユーザーはログインページにリダイレクトされる", () => {
      const result = authProxy(onboardingPageReq, createMockNotLoggedIn());
      expect(result).toEqual(
        createRedirectResponse(onboardingPageReq, urls.login),
      );
    });

    it("オンボーディング未完了ユーザーはオンボーディングページにアクセスできる", () => {
      const result = authProxy(
        onboardingPageReq,
        createMockIncompleteOnboarding(),
      );
      expect(result).toEqual(NextResponse.next());
    });

    it("オンボーディング完了ユーザーはホームにリダイレクトされる", () => {
      const result = authProxy(
        onboardingPageReq,
        createMockCompleteOnboarding(),
      );
      expect(result).toEqual(
        createRedirectResponse(onboardingPageReq, urls.home),
      );
    });
  });

  describe("管理者専用ページへのアクセス", () => {
    const managerPageReq = createMockReqWithPathname(urls.managerOnlyPages[0]);

    it("未ログインユーザーはログインページにリダイレクトされる", () => {
      const result = authProxy(managerPageReq, createMockNotLoggedIn());
      expect(result).toEqual(
        createRedirectResponse(managerPageReq, urls.login),
      );
    });

    it("オンボーディング未完了ユーザーはオンボーディングページにリダイレクトされる", () => {
      const result = authProxy(
        managerPageReq,
        createMockIncompleteOnboarding(),
      );
      expect(result).toEqual(
        createRedirectResponse(managerPageReq, urls.onboarding),
      );
    });

    it("一般ユーザーはホームにリダイレクトされる", () => {
      const result = authProxy(
        managerPageReq,
        createMockCompleteOnboarding({ role: Role.Member }),
      );
      expect(result).toEqual(createRedirectResponse(managerPageReq, urls.home));
    });

    it("幹部ユーザーは管理者専用ページにアクセスできる", () => {
      const result = authProxy(
        managerPageReq,
        createMockCompleteOnboarding({ role: Role.Leader }),
      );
      expect(result).toEqual(NextResponse.next());
    });
  });

  describe("一般ページへのアクセス", () => {
    const generalPageReq = createMockReqWithPathname(urls.home);

    it("未ログインユーザーはログインページにリダイレクトされる", () => {
      const result = authProxy(generalPageReq, createMockNotLoggedIn());
      expect(result).toEqual(
        createRedirectResponse(generalPageReq, urls.login),
      );
    });

    it("オンボーディング未完了ユーザーはオンボーディングページにリダイレクトされる", () => {
      const result = authProxy(
        generalPageReq,
        createMockIncompleteOnboarding(),
      );
      expect(result).toEqual(
        createRedirectResponse(generalPageReq, urls.onboarding),
      );
    });

    it("オンボーディング完了ユーザーは一般ページにアクセスできる", () => {
      const result = authProxy(generalPageReq, createMockCompleteOnboarding());
      expect(result).toEqual(NextResponse.next());
    });
  });

  describe("ユーザー管理ページへのアクセス", () => {
    const manageUserPageReq = createMockReqWithPathname(urls.manageUsers);

    it("未ログインユーザーはログインページにリダイレクトされる", () => {
      const result = authProxy(manageUserPageReq, createMockNotLoggedIn());
      expect(result).toEqual(
        createRedirectResponse(manageUserPageReq, urls.login),
      );
    });

    it("オンボーディング未完了ユーザーはオンボーディングページにリダイレクトされる", () => {
      const result = authProxy(
        manageUserPageReq,
        createMockIncompleteOnboarding(),
      );
      expect(result).toEqual(
        createRedirectResponse(manageUserPageReq, urls.onboarding),
      );
    });

    it("一般ユーザーはホームにリダイレクトされる", () => {
      const result = authProxy(
        manageUserPageReq,
        createMockCompleteOnboarding({ role: Role.Member }),
      );
      expect(result).toEqual(
        createRedirectResponse(manageUserPageReq, urls.home),
      );
    });

    it("幹部はホームにリダイレクトされる", () => {
      const result = authProxy(
        manageUserPageReq,
        createMockCompleteOnboarding({ role: Role.Leader }),
      );
      expect(result).toEqual(
        createRedirectResponse(manageUserPageReq, urls.home),
      );
    });

    it("管理者ユーザーはユーザー管理ページにアクセスできる", () => {
      const result = authProxy(
        manageUserPageReq,
        createMockCompleteOnboarding({ role: Role.Admin }),
      );
      expect(result).toEqual(NextResponse.next());
    });
  });
});
