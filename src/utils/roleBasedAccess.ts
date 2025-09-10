import { UserProfile } from '@/types/auth';
import { menuItems } from '@/config/menuItems';

export type UserRole = 'sales officer' | 'accounts officer' | 'recoveries officer' | 'administrator' | 'super user' | 'administration officer';

export const getRoleBasedMenuItems = (user: UserProfile | null) => {
  if (!user) return [];

  const role = user.role as UserRole;

  // Super User can see all modules
  if (role === 'super user') {
    return menuItems;
  }

  // Administrator can see all modules except Activity Log
  if (role === 'administrator') {
    return menuItems.filter(item => item.label !== 'Activity Logs');
  }

  // Sales Officer, Administration Officer, Recoveries Officer can access specific modules
  if (['sales officer', 'administration officer', 'recoveries officer'].includes(role)) {
    const allowedModules = [
      'Dashboard',
      'Borrowers', 
      'Applications',
      'Loans',
      'Repayments',
      'Recoveries',
      'Reports',
      'Promotions'
    ];
    return menuItems.filter(item => allowedModules.includes(item.label));
  }

  // Accounts Officer can access specific modules including Accounting
  if (role === 'accounts officer') {
    const allowedModules = [
      'Dashboard',
      'Borrowers',
      'Applications', 
      'Loans',
      'Repayments',
      'Recoveries',
      'Accounting',
      'Reports',
      'Promotions'
    ];
    return menuItems.filter(item => allowedModules.includes(item.label));
  }

  // Default: no access
  return [];
};

export const canAccessUserManagementReports = (user: UserProfile | null): boolean => {
  if (!user) return false;
  
  const role = user.role as UserRole;
  
  // Only Super User and Administrator can access User Management Reports
  return ['super user', 'administrator'].includes(role);
};

export const canViewAllBranches = (user: UserProfile | null): boolean => {
  if (!user) return false;
  
  const role = user.role as UserRole;
  
  // Super User and Administrator can view all branches
  // Also allow if user is attached to Head Office (branch_id is null or specific head office ID)
  return ['super user', 'administrator'].includes(role) || !user.branch_id;
};

export const shouldFilterByBranch = (user: UserProfile | null): boolean => {
  if (!user) return false;
  
  return !canViewAllBranches(user);
};