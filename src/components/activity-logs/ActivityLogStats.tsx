import React from 'react';
import { Activity, TrendingUp, Calendar, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ActivityLogStatsProps {
  stats: {
    totalActivities: number;
    activitiesThisWeek: number;
    activitiesThisMonth: number;
    topActivities: { activity_type: string; count: number; }[];
    topUsers: { user_name: string; user_role: string; count: number; }[];
  } | null;
  loading: boolean;
}

export const ActivityLogStats: React.FC<ActivityLogStatsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
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

  return (
    <div className="space-y-6 mb-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActivities.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activitiesThisWeek.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activitiesThisMonth.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Activities (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topActivities.length > 0 ? (
                stats.topActivities.map((activity, index) => (
                  <div key={activity.activity_type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <Badge className={getActivityColor(activity.activity_type)}>
                        {activity.activity_type}
                      </Badge>
                    </div>
                    <span className="font-medium">{activity.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No activities found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" />
              Most Active Users (This Month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topUsers.length > 0 ? (
                stats.topUsers.map((user, index) => (
                  <div key={`${user.user_name}-${user.user_role}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{user.user_name}</span>
                        <Badge className={getRoleColor(user.user_role)}>
                          {user.user_role}
                        </Badge>
                      </div>
                    </div>
                    <span className="font-medium">{user.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No user activities found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};