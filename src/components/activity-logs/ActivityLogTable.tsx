import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ActivityLog } from '@/lib/api/activity-logs';

interface ActivityLogTableProps {
  logs: ActivityLog[];
  loading: boolean;
}

const getActivityColor = (activityType: string) => {
  switch (activityType.toLowerCase()) {
    case 'create':
      return 'bg-green-100 text-green-800';
    case 'update':
      return 'bg-blue-100 text-blue-800';
    case 'delete':
      return 'bg-red-100 text-red-800';
    case 'view':
      return 'bg-gray-100 text-gray-800';
    case 'approve':
      return 'bg-purple-100 text-purple-800';
    case 'process':
      return 'bg-yellow-100 text-yellow-800';
    case 'login':
      return 'bg-indigo-100 text-indigo-800';
    case 'export':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getRoleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case 'sales officer':
      return 'bg-blue-100 text-blue-800';
    case 'accounts officer':
      return 'bg-green-100 text-green-800';
    case 'recoveries officer':
      return 'bg-red-100 text-red-800';
    case 'administration officer':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const ActivityLogTable: React.FC<ActivityLogTableProps> = ({ logs, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No activity logs found for the selected filters.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Logs ({logs.length} entries)</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Record ID</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        {format(new Date(log.created_at), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-muted-foreground">
                        {format(new Date(log.created_at), 'hh:mm a')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{log.user_name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(log.user_role)}>
                      {log.user_role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getActivityColor(log.activity_type)}>
                      {log.activity_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {log.table_name}
                    </code>
                  </TableCell>
                  <TableCell>
                    {log.record_id ? (
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {log.record_id}
                      </code>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={log.description}>
                      {log.description}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};