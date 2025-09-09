import React from 'react';
import { CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ActivityLogFilters as Filters } from '@/lib/api/activity-logs';
import { BranchSelector } from '@/components/dashboard/BranchSelector';

interface ActivityLogFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const ACTIVITY_TYPES = [
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'VIEW', label: 'View' },
  { value: 'APPROVE', label: 'Approve' },
  { value: 'PROCESS', label: 'Process' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'EXPORT', label: 'Export' },
];

const TABLE_NAMES = [
  { value: 'borrowers', label: 'Borrowers' },
  { value: 'loans', label: 'Loans' },
  { value: 'repayments', label: 'Repayments' },
  { value: 'applications', label: 'Applications' },
  { value: 'branches', label: 'Branches' },
  { value: 'user_profiles', label: 'Users' },
  { value: 'defaults', label: 'Defaults' },
];

export const ActivityLogFilters: React.FC<ActivityLogFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const handleBranchChange = (branchId: string) => {
    onFiltersChange({ ...filters, branchId });
  };

  const handleActivityTypeChange = (activityType: string) => {
    onFiltersChange({ 
      ...filters, 
      activityType: activityType === 'all' ? undefined : activityType 
    });
  };

  const handleTableNameChange = (tableName: string) => {
    onFiltersChange({ 
      ...filters, 
      tableName: tableName === 'all' ? undefined : tableName 
    });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    onFiltersChange({ 
      ...filters, 
      startDate: date ? format(date, 'yyyy-MM-dd') : undefined 
    });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    onFiltersChange({ 
      ...filters, 
      endDate: date ? format(date, 'yyyy-MM-dd') : undefined 
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Branch Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Branch</label>
            <BranchSelector
              selectedBranchId={filters.branchId}
              onBranchChange={handleBranchChange}
            />
          </div>

          {/* Activity Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Activity Type</label>
            <Select
              value={filters.activityType || 'all'}
              onValueChange={handleActivityTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All activities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                {ACTIVITY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table Name Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Table</label>
            <Select
              value={filters.tableName || 'all'}
              onValueChange={handleTableNameChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All tables" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tables</SelectItem>
                {TABLE_NAMES.map((table) => (
                  <SelectItem key={table.value} value={table.value}>
                    {table.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          <div className="space-y-2">
            <label className="text-sm font-medium invisible">Actions</label>
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate ? (
                    format(new Date(filters.startDate), 'PPP')
                  ) : (
                    'Select start date'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.startDate ? new Date(filters.startDate) : undefined}
                  onSelect={handleStartDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate ? (
                    format(new Date(filters.endDate), 'PPP')
                  ) : (
                    'Select end date'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.endDate ? new Date(filters.endDate) : undefined}
                  onSelect={handleEndDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};