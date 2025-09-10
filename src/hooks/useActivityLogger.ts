import { useCallback } from 'react';
import { activityLogsApi } from '@/lib/api/activity-logs';

export const useActivityLogger = () => {
  const logActivity = useCallback(async (
    activityType: string,
    tableName: string,
    recordId?: string,
    description?: string,
    metadata?: any
  ) => {
    await activityLogsApi.logActivity(activityType, tableName, recordId, description, metadata);
  }, []);

  return { logActivity };
};

// Activity type constants for consistency
export const ACTIVITY_TYPES = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE', 
  DELETE: 'DELETE',
  VIEW: 'VIEW',
  APPROVE: 'APPROVE',
  PROCESS: 'PROCESS',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  EXPORT: 'EXPORT',
  SEARCH: 'SEARCH',
  EMAIL_SENT: 'EMAIL_SENT'
} as const;

// Table name constants for consistency
export const TABLE_NAMES = {
  BORROWERS: 'borrowers',
  LOANS: 'loans',
  REPAYMENTS: 'repayments',
  APPLICATIONS: 'applications',
  BRANCHES: 'branches',
  USERS: 'user_profiles',
  DEFAULTS: 'defaults',
  PAYROLL_OFFICERS: 'payroll_officers',
  DEDUCTION_REQUESTS: 'deduction_requests'
} as const;