import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from './types';

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  branch_id: string | null;
  activity_type: string;
  table_name: string;
  record_id: string | null;
  description: string;
  metadata: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface ActivityLogFilters {
  branchId?: string;
  userId?: string;
  activityType?: string;
  tableName?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export const activityLogsApi = {
  async getActivityLogs(filters: ActivityLogFilters = {}): Promise<ApiResponse<{data: ActivityLog[], count: number}>> {
    try {
      let query = supabase
        .from('activity_logs')
        .select(`
          *,
          branches:branch_id (
            branch_name,
            branch_code
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.branchId && filters.branchId !== 'all') {
        query = query.eq('branch_id', filters.branchId);
      }

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.activityType) {
        query = query.eq('activity_type', filters.activityType);
      }

      if (filters.tableName) {
        query = query.eq('table_name', filters.tableName);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Get activity logs error:', error);
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        data: { 
          data: data || [], 
          count: count || 0 
        }
      };
    } catch (error: any) {
      console.error('Get activity logs error:', error);
      return { success: false, error: error.message };
    }
  },

  async logActivity(
    activityType: string,
    tableName: string,
    recordId?: string,
    description?: string,
    metadata?: any
  ): Promise<void> {
    try {
      // Call the database function to log the activity
      const { error } = await supabase.rpc('log_activity', {
        p_activity_type: activityType,
        p_table_name: tableName,
        p_record_id: recordId || null,
        p_description: description || '',
        p_metadata: metadata || null
      });

      if (error) {
        console.error('Activity logging error:', error);
      }
    } catch (error) {
      console.error('Activity logging error:', error);
    }
  },

  async getActivityLogStats(branchId?: string): Promise<ApiResponse<{
    totalActivities: number;
    activitiesThisWeek: number;
    activitiesThisMonth: number;
    topActivities: { activity_type: string; count: number; }[];
    topUsers: { user_name: string; user_role: string; count: number; }[];
  }>> {
    try {
      let baseQuery = supabase
        .from('activity_logs')
        .select('*');

      if (branchId && branchId !== 'all') {
        baseQuery = baseQuery.eq('branch_id', branchId);
      }

      // Get total activities
      const { count: totalActivities } = await baseQuery;

      // Get activities this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const { count: activitiesThisWeek } = await baseQuery.gte('created_at', oneWeekAgo.toISOString());

      // Get activities this month
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const { count: activitiesThisMonth } = await baseQuery.gte('created_at', oneMonthAgo.toISOString());

      // Get top activities
      let topActivitiesQuery = supabase
        .from('activity_logs')
        .select('activity_type')
        .gte('created_at', oneMonthAgo.toISOString());
      
      if (branchId && branchId !== 'all') {
        topActivitiesQuery = topActivitiesQuery.eq('branch_id', branchId);
      }
      
      const { data: topActivitiesData } = await topActivitiesQuery;

      const activityCounts = topActivitiesData?.reduce((acc, log) => {
        acc[log.activity_type] = (acc[log.activity_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topActivities = Object.entries(activityCounts)
        .map(([activity_type, count]) => ({ activity_type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Get top users
      let topUsersQuery = supabase
        .from('activity_logs')
        .select('user_name, user_role')
        .gte('created_at', oneMonthAgo.toISOString());
      
      if (branchId && branchId !== 'all') {
        topUsersQuery = topUsersQuery.eq('branch_id', branchId);
      }
      
      const { data: topUsersData } = await topUsersQuery;

      const userCounts = topUsersData?.reduce((acc, log) => {
        const key = `${log.user_name}:${log.user_role}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topUsers = Object.entries(userCounts)
        .map(([userKey, count]) => {
          const [user_name, user_role] = userKey.split(':');
          return { user_name, user_role, count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        success: true,
        data: {
          totalActivities: totalActivities || 0,
          activitiesThisWeek: activitiesThisWeek || 0,
          activitiesThisMonth: activitiesThisMonth || 0,
          topActivities,
          topUsers
        }
      };
    } catch (error: any) {
      console.error('Get activity log stats error:', error);
      return { success: false, error: error.message };
    }
  }
};