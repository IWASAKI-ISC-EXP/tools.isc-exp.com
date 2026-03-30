"use server";
import { cache } from "react";

import { collectionKeys } from "@/constants";
import type { Project } from "@/entities/v1/project"; // 変更箇所
import { ProjectWithTimestampTransformer } from "@/entities/v1/project.server"; // 変更箇所
import v from "@/entities/valibot";
import { UnauthorizedError } from "@/errors/auth";
import { adminFirestore } from "@/firebase/admin";
import { getAuthSelf } from "../../user/v1/get-self"; // 変更箇所

/**
 * 存在するすべての案件情報を取得
 */
export const getProjects = cache(async (): Promise<Project[]> => {
  const authSelf = await getAuthSelf();
  if (!authSelf) throw new UnauthorizedError();

  const snapshot = await adminFirestore
    .collection(collectionKeys.projects)
    .get();

  return snapshot.docs.map((doc) =>
    v.parse(ProjectWithTimestampTransformer, {
      id: doc.id,
      ...doc.data(),
    }),
  );
});
