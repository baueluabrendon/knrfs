
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

interface RepaymentScheduleItem {
  paymentDate: string;
  principalAmount: number;
  interestAmount: number;
  gstAmount: number;
  totalPayment: number;
  remainingBalance: number;
}

interface RepaymentScheduleProps {
  schedule: RepaymentScheduleItem[];
  loan: {
    id: string;
    borrowerName: string;
    amount: number;
    interestRate: number;
    term: number;
  };
}

export const RepaymentSchedule = ({ schedule, loan }: RepaymentScheduleProps) => {
  const [ledger, setLedger] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const fetchLedger = async () => {
      const { data, error } = await supabase
        .from("repayment_ledger_view")
        .select("*")
        .eq("loan_id", loan.id)
        .order("entry_date", { ascending: true });

      if (error) {
        console.error("Error fetching ledger:", error.message);
        return;
      }

      setLedger(data || []);

      if (data && data.length > 0) {
        const first = data[0];
        setSummary({
          borrower_name: first.borrower_name,
          bank: first.bank,
          account_name: first.account_name,
          account_number: first.account_number,
          loan_id: first.loan_id,
          disbursement_date: first.disbursement_date,
          start_repayment_date: first.start_repayment_date,
          maturity_date: first.maturity_date,
          principal: first.principal,
          interest: first.interest,
          gross_loan: first.gross_loan,
          loan_term: first.loan_term,
          interest_rate: first.interest_rate,
        });
      }
    };

    if (loan.id) {
      fetchLedger();
    }
  }, [loan.id]);

  const calculateRunningBalance = () => {
    let balance = summary?.gross_loan || 0;
    return ledger.map((entry) => {
      const debit = entry.debit ?? 0;
      const credit = entry.credit ?? 0;
      balance += debit - credit;
      return { ...entry, running_balance: balance };
    });
  };

  const ledgerWithBalance = calculateRunningBalance();

  const totalDebits = ledger.reduce((sum, e) => sum + (e.debit ?? 0), 0);
  const totalCredits = ledger.reduce((sum, e) => sum + (e.credit ?? 0), 0);
  const balance = summary?.gross_loan ? summary.gross_loan + totalDebits - totalCredits : 0;

  // If we don't have ledger data yet, show the original schedule view
  if (!summary || ledger.length === 0) {
    return (
      <div className="rounded-lg border p-4">
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Repayment Schedule Details</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div>
              <span className="font-medium">Loan ID:</span> {loan.id}
            </div>
            <div>
              <span className="font-medium">Borrower:</span> {loan.borrowerName}
            </div>
            <div>
              <span className="font-medium">Principal Amount:</span> ${loan.amount.toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Interest Rate:</span> {loan.interestRate}%
            </div>
            <div>
              <span className="font-medium">Term:</span> {loan.term} months
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Principal</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>GST</TableHead>
                <TableHead>Total Payment</TableHead>
                <TableHead>Remaining Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedule.map((payment, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                  <TableCell>${payment.principalAmount.toLocaleString()}</TableCell>
                  <TableCell>${payment.interestAmount.toLocaleString()}</TableCell>
                  <TableCell>${payment.gstAmount.toLocaleString()}</TableCell>
                  <TableCell>${payment.totalPayment.toLocaleString()}</TableCell>
                  <TableCell>${payment.remainingBalance.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Show the ledger view if we have data
  return (
    <div className="space-y-4">
      {summary && (
        <Card className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold uppercase">Loan Repayment Ledger</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <strong>Borrower:</strong> {summary.borrower_name}
              <br />
              <strong>Loan ID:</strong> {summary.loan_id}
              <br />
              <strong>Term:</strong> {summary.loan_term} fortnights
              <br />
              <strong>Interest Rate:</strong> {summary.interest_rate?.replace("RATE_", "")}%
            </div>
            <div>
              <strong>Bank:</strong> {summary.bank || "N/A"}
              <br />
              <strong>Account Name:</strong> {summary.account_name || "N/A"}
              <br />
              <strong>Account Number:</strong> {summary.account_number || "N/A"}
              <br />
              <strong>Disbursed:</strong> {summary.disbursement_date ? new Date(summary.disbursement_date).toLocaleDateString() : "N/A"}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><strong>Principal:</strong> K{summary.principal?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}</div>
            <div><strong>Interest:</strong> K{summary.interest?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}</div>
            <div><strong>Gross Loan:</strong> K{summary.gross_loan?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}</div>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Debit (K)</TableHead>
              <TableHead className="text-right">Credit (K)</TableHead>
              <TableHead className="text-right">Balance (K)</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledgerWithBalance.map((entry, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(entry.entry_date).toLocaleDateString()}</TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell className="text-right">
                  {entry.debit !== null ? `K${entry.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {entry.credit !== null ? `K${entry.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "-"}
                </TableCell>
                <TableCell className="text-right">
                  K{entry.running_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>{entry.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-end text-sm mt-4">
          <div className="space-y-1 text-right">
            <div><strong>Total Debits:</strong> K{totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div><strong>Total Credits:</strong> K{totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div><strong>Outstanding Balance:</strong> K{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
