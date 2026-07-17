// NestJS API gateway endpoints (prefix is configured in Axios client)
export const API_ENDPOINTS = {
  // Auth & Session
  login: "/auth/login",
  logout: "/auth/logout",
  refresh: "/auth/refresh",
  me: "/auth/me",

  // Workspace
  workspaces: "/workspaces",
  switchWorkspace: "/workspaces/switch",

  // Authorities
  authorities: "/authorities",
  authorityDetails: (id: string | number) => `/authorities/${id}`,
  reconnectAuthority: (id: string | number) => `/authorities/${id}/reconnect`,

  // Reports
  reports: "/reports",
  reportDetails: (id: string | number) => `/reports/${id}`,
  deadlineStatus: (id: string | number) => `/reports/${id}/deadline-status`,
  getDraftTask: (id: string | number) => `/reports/${id}/get-draft-task`,

  // Tasks (Filings / Submissions)
  tasks: "/tasks",
  taskDrafts: "/tasks/drafts",
  taskDetails: (id: string | number) => `/tasks/${id}`,
  taskFlow: (id: string | number) => `/tasks/${id}/flow`,
  taskNodeDetails: (id: string | number) => `/tasks/${id}/current-node`,
  submitNode: (id: string | number) => `/tasks/${id}/submit-current-node`,
  submitAllSteps: (id: string | number) => `/tasks/${id}/submit-all-steps`,

  // Dictionaries
  dictionaries: "/dictionaries",
  dictionaryRows: (code: string) => `/dictionaries/universal?dictionary_code=${code}`,
  dictionaryAllRows: (code: string) => `/dictionaries/universal/all?dictionary_code=${code}`,

  // Monitoring & Activity
  apiActivity: "/monitoring/api-activity",
  auditLogs: "/monitoring/audit-logs",
  connections: "/monitoring/connections",

  // Settings
  activeSessions: "/settings/security/sessions",
  terminateSession: (id: string) => `/settings/security/sessions/${id}`,
};
