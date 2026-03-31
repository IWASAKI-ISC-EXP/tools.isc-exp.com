import { Role } from "@/entities/role";
import type { AuthSelf, Self } from "@/entities/v1/self";

export function createMockSelf(self: Partial<Self> = {}): Self {
  return {
    _schemaVersion: 1,
    id: "user_123",
    name: "山田 太郎",
    role: Role.Member,
    department: {
      id: "dept_001",
      name: "情報セキュリティ学科",
    },
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
