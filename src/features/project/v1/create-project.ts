"use server";

import { firestore } from "firebase-admin";
import { collectionKeys } from "@/constants";
import { hasEnoughRole, Role } from "@/entities/role";
import type { Project } from "@/entities/v1/project"; // 変更箇所
import {
  ProjectWithTimestamp,
  ProjectWithTimestampTransformer,
} from "@/entities/v1/project.server"; // 変更箇所
import v from "@/entities/valibot";
import { ForbiddenError, UnauthorizedError } from "@/errors/auth";
import { adminFirestore } from "@/firebase/admin";
import { getSelf } from "../../user/v1/get-self"; // 変更箇所

const minimumRole = Role.Leader;
/**
 * 案件を作成する
 * Leader 以上の権限が必要
 * @param unsafeProject
 * @returns
 */
export async function createProject(
  unsafeProject: Omit<
    Project,
    "_schemaVersion" | "id" | "createdAt" | "createdBy"
  >, // 変更箇所: _schemaVersion を除外
): Promise<Project> {
  const self = await getSelf(); // 変更箇所: v1 の getSelf を使用

  if (!self) throw new UnauthorizedError();
  if (!hasEnoughRole(self.role, minimumRole)) throw new ForbiddenError();

  const safeProject = v.parse(v.omit(ProjectWithTimestamp, ["id"]), {
    ...unsafeProject,
    _schemaVersion: 1, // 変更箇所
    createdAt: firestore.Timestamp.now(),
    // 変更箇所: createdBy を uid 文字列から User オブジェクトに変更
    createdBy: {
      _schemaVersion: self._schemaVersion,
      id: self.id,
      name: self.name,
      enrollmentYear: self.enrollmentYear,
      department: self.department,
      role: self.role,
    },
  });

  const createdDocRef = await adminFirestore
    .collection(collectionKeys.projects)
    .add(safeProject);

  return v.parse(ProjectWithTimestampTransformer, {
    ...safeProject,
    id: createdDocRef.id,
  });
}
