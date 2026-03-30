"use server";

import { cache } from "react";
import { collectionKeys } from "@/constants";
import type { Project } from "@/entities/v1/project"; // 変更箇所
import { ProjectWithTimestampTransformer } from "@/entities/v1/project.server"; // 変更箇所
import v from "@/entities/valibot";
import { UnauthorizedError } from "@/errors/auth";
import { adminFirestore } from "@/firebase/admin";
import { getAuthSelf } from "../../user/v1/get-self"; // 変更箇所

export const getProjectById = cache(
  async (id: string): Promise<Project | null> => {
    const authSelf = await getAuthSelf();
    if (!authSelf) throw new UnauthorizedError();

    const doc = await adminFirestore
      .collection(collectionKeys.projects)
      .doc(id)
      .get();

    if (!doc.exists) return null;

    return v.parse(ProjectWithTimestampTransformer, {
      id: doc.id,
      ...doc.data(),
    });
  },
);
