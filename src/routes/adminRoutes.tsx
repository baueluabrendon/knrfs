
import { RouteObject } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { menuItems } from "@/config/menuItems";

import Loans from "@/pages/Loans";
import Borrowers from "@/pages/Borrowers";
import AddLoan from "@/pages/AddLoan";
import Users from "@/pages/Users";
import Repayments from "@/pages/Repayments";
import Applications from "@/pages/Applications";
import LoansInArrears from "@/pages/LoansInArrears";
import MissedPayments from "@/pages/MissedPayments";
import PartialPayments from "@/pages/PartialPayments";
import Analytics from "@/pages/Analytics";
import ChartOfAccounts from "@/pages/ChartOfAccounts";
import ProfitAndLoss from "@/pages/ProfitAndLoss";
import BalanceSheet from "@/pages/BalanceSheet";
import Cashflow from "@/pages/Cashflow";
import Index from "@/pages/Index";
import BulkLoans from "@/pages/BulkLoans";
import BulkBorrowers from "@/pages/BulkBorrowers";
import BulkRepayments from "@/pages/BulkRepayments";
import Recoveries from "@/pages/Recoveries";

// Define page components map for easier lookup
const pageComponents: Record<string, React.ComponentType> = {
  "/admin": Index,
  "/admin/users": Users,
  "/admin/borrowers": Borrowers,
  "/admin/applications": Applications,
  "/admin/loans/view": Loans,
  "/admin/loans/add": AddLoan,
  "/admin/repayments": Repayments,
  "/admin/recoveries": Recoveries,
  "/admin/recoveries/loans-in-arrears": LoansInArrears,
  "/admin/recoveries/missed-payments": MissedPayments,
  "/admin/recoveries/partial-payments": PartialPayments,
  "/admin/analytics": Analytics,
  "/admin/accounting/chart-of-accounts": ChartOfAccounts,
  "/admin/accounting/profit-loss": ProfitAndLoss,
  "/admin/accounting/balance-sheet": BalanceSheet,
  "/admin/accounting/cashflow": Cashflow,
  "/admin/loans/bulk": BulkLoans,
  "/admin/borrowers/bulk": BulkBorrowers,
  "/admin/repayments/bulk": BulkRepayments
};

// Generate routes based on menuItems
const generateRoutes = () => {
  const routes: RouteObject[] = [];
  
  // Create the admin layout parent route
  const adminRoute: RouteObject = {
    path: "/admin",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Index />
      }
    ]
  };
  
  // Add top-level routes
  menuItems.forEach(item => {
    // Skip parent items with subItems that are just group containers
    if (item.path !== "#") {
      const path = item.path.replace('/admin/', '');
      if (pageComponents[item.path]) {
        adminRoute.children?.push({
          path: path || undefined,
          element: pageComponents[item.path]
        });
      }
    }
    
    // Add subitems as routes
    item.subItems.forEach(subItem => {
      if (pageComponents[subItem.path]) {
        const subPath = subItem.path.replace('/admin/', '');
        adminRoute.children?.push({
          path: subPath,
          element: pageComponents[subItem.path]
        });
      }
    });
  });
  
  // Add remaining routes that might not be in menuItems
  Object.entries(pageComponents).forEach(([path, component]) => {
    const relativePath = path.replace('/admin/', '');
    if (path !== '/admin' && !adminRoute.children?.some(route => 
      (route.path && '/admin/' + route.path === path) || 
      (route.index && path === '/admin'))) {
      adminRoute.children?.push({
        path: relativePath,
        element: component
      });
    }
  });
  
  routes.push(adminRoute);
  return routes;
};

export const adminRoutes: RouteObject[] = generateRoutes();
