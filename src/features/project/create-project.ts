"use server";

import { firestore } from "firebase-admin";
import { collectionKeys } from "@/constants";
import type { Project } from "@/entities/project";
import {
  ProjectWithTimestamp,
  ProjectWithTimestampTransformer,
} from "@/entities/project.server";
import { hasEnoughRole, Role } from "@/entities/role";
import { schemaVersion } from "@/entities/schema-version";
import { User } from "@/entities/self";
import v from "@/entities/valibot";
import { ForbiddenError, UnauthorizedError } from "@/errors/auth";
import { getSelf } from "@/features/user/get-self";
import { adminFirestore } from "@/firebase/admin";

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
  >,
): Promise<Project> {
  const self = await getSelf();

  if (!self) throw new UnauthorizedError();
  if (!hasEnoughRole(self.role, minimumRole)) throw new ForbiddenError();

  const safeProject = v.parse(v.omit(ProjectWithTimestamp, ["id"]), {
    ...unsafeProject,
    _schemaVersion: schemaVersion.literal,
    createdAt: firestore.Timestamp.now(),
    createdBy: v.parse(User, self),
  });

  const createdDocRef = await adminFirestore
    .collection(collectionKeys.projects)
    .add(safeProject);

  return v.parse(ProjectWithTimestampTransformer, {
    ...safeProject,
    id: createdDocRef.id,
  });
}
