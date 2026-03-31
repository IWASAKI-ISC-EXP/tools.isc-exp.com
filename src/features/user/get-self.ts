"use server";
import { cookies } from "next/headers";
import { cache } from "react";
import { collectionKeys, cookieKeys } from "@/constants";
import { AuthSelf, Self } from "@/entities/self";
import v from "@/entities/valibot";
import { adminFirestore, firebaseAdminAuth } from "@/firebase/admin";

/**
 * 現在ログインしているユーザーの情報を取得する
 * Firebase Authentication の情報であり、Users コレクションの情報ではないことに注意
 */
export const getAuthSelf = cache(async (): Promise<AuthSelf | null> => {
  const sessionCookie = (await cookies()).get(cookieKeys.session)?.value;

  if (!sessionCookie) return null;

  try {
    const decodedToken = await firebaseAdminAuth.verifySessionCookie(
      sessionCookie,
      true,
    );

    return v.parse(AuthSelf, {
      uid: decodedToken.uid,
      email: decodedToken.email,
      picture: decodedToken.picture,
    });
  } catch (e) {
    if (e instanceof v.ValiError) {
      throw e;
    }
    return null;
  }
});

/**
 * 現在ログインしているユーザーの完全な情報を取得する
 * Firebase Authentication でログインはしているが、Users コレクションに情報が存在しない場合（未オンボーディング）は null を返すことに注意
 * `getIsCompletedOnboarding` などと組み合わせて使用することを想定している
 * @returns
 */
export const getSelf = cache(async (): Promise<Self | null> => {
  const authSelf = await getAuthSelf();
  if (!authSelf) return null;

  // Users コレクションから追加情報を取得する
  const userDoc = await adminFirestore
    .collection(collectionKeys.users)
    .doc(authSelf.uid)
    .get();

  if (!userDoc.exists) return null;

  return v.parse(Self, { ...authSelf, ...userDoc.data(), id: userDoc.id });
});
