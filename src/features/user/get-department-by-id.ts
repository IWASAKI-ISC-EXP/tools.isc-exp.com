"use server";
import { cache } from "react";
import { collectionKeys } from "@/constants";
import { Department } from "@/entities/department";
import v from "@/entities/valibot";
import { UnauthorizedError } from "@/errors/auth";
import { adminFirestore } from "@/firebase/admin";
import { getAuthSelf } from "./get-self";

export const getDepartmentById = cache(
  async (id: string): Promise<Department | null> => {
    const authSelf = await getAuthSelf();
    if (!authSelf) throw new UnauthorizedError();

    const doc = await adminFirestore
      .collection(collectionKeys.departments)
      .doc(id)
      .get();

    if (!doc.exists) return null;

    return v.parse(Department, { id: doc.id, ...doc.data() });
  },
);
