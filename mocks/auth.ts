import { Role } from "@/entities/role";
import type { AuthSelf, Self } from "@/entities/self";

export function createMockSelf(self: Partial<Self> = {}): Self {
  return {
    name: "山田 太郎",
    role: Role.Member,
    departmentId: "dept_001",
    enrollmentYear: 2020,
    ...createMockAuthSelf(self),
    ...self,
  };
}

export function createMockAuthSelf(authSelf: Partial<AuthSelf> = {}): AuthSelf {
  return {
    uid: "user_123",
    email: "mockuser@example.com",
    ...authSelf,
  };
}
