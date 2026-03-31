"use client";

import { use } from "react";
import type { Self } from "@/entities/self";
import { UnauthorizedError } from "@/errors/auth";
import { SelfContext } from "../contexts/self";

/**
 * 現在ログインしているユーザー情報を取得する。
 * protectedRoute が true の場合、ログインしていなければ UnauthorizedError を投げる。
 * @param protectedRoute ログイン必須ページかのフラグ。デフォルトは true。
 */
export function useSelf(protectedRoute: false): Self | null;
export function useSelf(protectedRoute: true): Self;
export function useSelf(): Self;
export function useSelf(protectedRoute: boolean = true): Self | null {
  const self = use(SelfContext);
  if (protectedRoute && !self) throw new UnauthorizedError();

  return self;
}
