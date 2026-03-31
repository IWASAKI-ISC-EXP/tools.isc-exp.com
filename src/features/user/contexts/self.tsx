"use client";
import { createContext, type PropsWithChildren } from "react";
import type { Self } from "@/entities/self";

type SelfContextType = Self | null;

export const SelfContext = createContext<SelfContextType>(null);

export function SelfProvider({
  children,
  self,
}: PropsWithChildren<{ self: SelfContextType }>) {
  return <SelfContext.Provider value={self}>{children}</SelfContext.Provider>;
}
