import type { NextRequest } from "next/server";
import { authProxy } from "@/features/proxy/auth";
import { getSelfLoginStatus } from "@/features/user/get-self-login-status";

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};

export async function proxy(req: NextRequest) {
  const selfLoginStatus = await getSelfLoginStatus();

  return authProxy(req, selfLoginStatus);
}
