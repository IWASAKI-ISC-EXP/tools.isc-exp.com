// このファイルでは Tanstack Query の クエリキーを定義

export const departments = ["departments"] as const;

export const department = (departmentId: string) =>
  ["department", departmentId] as const;

export const projects = ["projects"] as const;
export const project = (projectId: string) => ["project", projectId] as const;

export const myRequests = ["myRequests"] as const;

export const requests = ["requests"] as const;

export const users = ["users"] as const;

export const user = (userId: string) => ["user", userId] as const;
