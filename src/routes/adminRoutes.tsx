
import { lazy } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

// Lazy load admin pages
const Dashboard = lazy(() => import('@/pages/Index'));
const Loans = lazy(() => import('@/pages/Loans'));
const AddLoan = lazy(() => import('@/pages/AddLoan'));
const BulkLoans = lazy(() => import('@/pages/BulkLoans'));
const Borrowers = lazy(() => import('@/pages/Borrowers'));
const BulkBorrowers = lazy(() => import('@/pages/BulkBorrowers'));
const Repayments = lazy(() => import('@/pages/Repayments'));
const BulkRepayments = lazy(() => import('@/pages/BulkRepayments'));
const Recoveries = lazy(() => import('@/pages/Recoveries'));
const Applications = lazy(() => import('@/pages/Applications'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Users = lazy(() => import('@/pages/Users'));
const ChartOfAccounts = lazy(() => import('@/pages/ChartOfAccounts'));
const BalanceSheet = lazy(() => import('@/pages/BalanceSheet'));
const ProfitAndLoss = lazy(() => import('@/pages/ProfitAndLoss'));
const Cashflow = lazy(() => import('@/pages/Cashflow'));

const adminRoutes = [
  {
    path: '/admin',
    element: <DashboardLayout />,
    children: [
      { path: '', element: <Dashboard /> },
      { path: 'loans', element: <Loans /> },
      { path: 'loans/add', element: <AddLoan /> },
      { path: 'loans/bulk', element: <BulkLoans /> },
      { path: 'borrowers', element: <Borrowers /> },
      { path: 'borrowers/bulk', element: <BulkBorrowers /> },
      { path: 'repayments', element: <Repayments /> },
      { path: 'repayments/bulk', element: <BulkRepayments /> },
      { path: 'recoveries', element: <Recoveries /> },
      { path: 'applications', element: <Applications /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'users', element: <Users /> },
      { path: 'chart-of-accounts', element: <ChartOfAccounts /> },
      { path: 'balance-sheet', element: <BalanceSheet /> },
      { path: 'profit-and-loss', element: <ProfitAndLoss /> },
      { path: 'cashflow', element: <Cashflow /> },
    ],
  },
];

export default adminRoutes;
