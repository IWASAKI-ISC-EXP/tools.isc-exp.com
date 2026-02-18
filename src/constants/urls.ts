export const home = "/";

export const onboarding = "/onboarding";

export const login = "/login";

export const manageExpenses = "/manage/expenses";

export const manageProjects = "/manage/projects";

export const meRequests = "/me/requests";

export const manageRequests = "/manage/requests";

export const manageUsers = "/manage/users";

/**
 * 幹部以上のみアクセス可能なページ一覧
 */
export const managerOnlyPages = [
  manageExpenses,
  manageProjects,
  manageUsers,
  manageRequests,
];
