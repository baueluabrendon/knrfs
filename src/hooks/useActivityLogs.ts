import { useState, useEffect } from 'react';
import { activityLogsApi, ActivityLog, ActivityLogFilters } from '@/lib/api/activity-logs';

export const useActivityLogs = (filters: ActivityLogFilters = {}) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    const response = await activityLogsApi.getActivityLogs(filters);
    
    if (response.success && response.data) {
      setLogs(response.data.data);
      setTotalCount(response.data.count);
    } else {
      setError(response.error || 'Failed to fetch activity logs');
      setLogs([]);
      setTotalCount(0);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [
    filters.branchId,
    filters.userId,
    filters.activityType,
    filters.tableName,
    filters.startDate,
    filters.endDate,
    filters.limit,
    filters.offset
  ]);

  return {
    logs,
    totalCount,
    loading,
    error,
    refetch: fetchLogs
  };
};

export const useActivityLogStats = (branchId?: string) => {
  const [stats, setStats] = useState<{
    totalActivities: number;
    activitiesThisWeek: number;
    activitiesThisMonth: number;
    topActivities: { activity_type: string; count: number; }[];
    topUsers: { user_name: string; user_role: string; count: number; }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    const response = await activityLogsApi.getActivityLogStats(branchId);
    
    if (response.success && response.data) {
      setStats(response.data);
    } else {
      setError(response.error || 'Failed to fetch activity log stats');
      setStats(null);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, [branchId]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};