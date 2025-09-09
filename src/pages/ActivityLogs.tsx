import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ActivityLogFilters } from '@/components/activity-logs/ActivityLogFilters';
import { ActivityLogTable } from '@/components/activity-logs/ActivityLogTable';
import { ActivityLogStats } from '@/components/activity-logs/ActivityLogStats';
import { useActivityLogs, useActivityLogStats } from '@/hooks/useActivityLogs';
import { ActivityLogFilters as Filters } from '@/lib/api/activity-logs';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ActivityLogs() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<Filters>({
    limit: 100,
    offset: 0
  });

  // Only allow super users and administrators to access activity logs
  if (!user || !['administrator', 'super user'].includes(user.role)) {
    return <Navigate to="/admin" replace />;
  }

  const { logs, loading: logsLoading, totalCount } = useActivityLogs(filters);
  const { stats, loading: statsLoading } = useActivityLogStats(filters.branchId);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Activity Logs</h1>
          <p className="text-muted-foreground">
            Monitor officer activities across the system
          </p>
        </div>

        <ActivityLogStats stats={stats} loading={statsLoading} />

        <ActivityLogFilters filters={filters} onFiltersChange={setFilters} />

        <ActivityLogTable logs={logs} loading={logsLoading} />

        {totalCount > (filters.limit || 100) && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Showing {logs.length} of {totalCount.toLocaleString()} total entries
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}