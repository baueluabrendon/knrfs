import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Users from "./pages/Users";
import Applications from "./pages/Applications";
import Loans from "./pages/Loans";
import AddLoan from "./pages/AddLoan";
import BulkLoans from "./pages/BulkLoans";
import Borrowers from "./pages/Borrowers";
import BulkBorrowers from "./pages/BulkBorrowers";
import Repayments from "./pages/Repayments";
import LoansInArrears from "./pages/LoansInArrears";
import MissedPayments from "./pages/MissedPayments";
import PartialPayments from "./pages/PartialPayments";
import ChartOfAccounts from "./pages/ChartOfAccounts";
import BalanceSheet from "./pages/BalanceSheet";
import ProfitAndLoss from "./pages/ProfitAndLoss";
import Cashflow from "./pages/Cashflow";
import Analytics from "./pages/Analytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/users" element={<Users />} />
          <Route path="/borrowers" element={<Borrowers />} />
          <Route path="/borrowers/bulk" element={<BulkBorrowers />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/loans/add" element={<AddLoan />} />
          <Route path="/loans/bulk" element={<BulkLoans />} />
          <Route path="/repayments" element={<Repayments />} />
          <Route path="/recoveries/arrears" element={<LoansInArrears />} />
          <Route path="/recoveries/missed" element={<MissedPayments />} />
          <Route path="/recoveries/partial" element={<PartialPayments />} />
          <Route path="/accounting/chart-of-accounts" element={<ChartOfAccounts />} />
          <Route path="/accounting/balance-sheet" element={<BalanceSheet />} />
          <Route path="/accounting/profit-loss" element={<ProfitAndLoss />} />
          <Route path="/accounting/cashflow" element={<Cashflow />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;