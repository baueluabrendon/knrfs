
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface RepaymentScheduleProps {
  schedule: any[]; // Changed from never[] to any[] to accept the schedule data
  loan: {
    id: string;
    borrowerName: string;
    amount: number;
    interestRate: number;
    term: number;
  };
}

export const RepaymentSchedule = ({ loan }: RepaymentScheduleProps) => {
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
          mobile_number: first.mobile_number,
          email: first.email || 'N/A', // Added fallback if email doesn't exist
          postal_address: first.postal_address,
          department_company: first.department_company,
          file_number: first.file_number,
          bank: first.bank,
          account_name: first.account_name,
          account_number: first.account_number,
          loan_id: first.loan_id,
          disbursement_date: first.disbursement_date,
          maturity_date: first.maturity_date,
          principal: first.principal,
          interest: first.interest,
          gross_loan: first.gross_loan,
          loan_term: first.loan_term ? parseInt(first.loan_term.replace("TERM_", ""), 10) : 0,
          interest_rate: first.interest_rate,
          repayment_completion_percentage: first.repayment_completion_percentage,
          total_repayment: first.total_repayment,
          outstanding_balance: first.outstanding_balance,
          fortnightly_installment: first.fortnightly_installment,
          loan_risk_insurance: first.loan_risk_insurance,
          documentation_fee: first.documentation_fee,
          default_fees_accumulated: first.default_fees_accumulated,
          total_gst: ledger.reduce((sum, e) => sum + (e.gst_amount ?? 0), 0),
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
  const balance = totalDebits - totalCredits;

  if (!summary || ledger.length === 0) {
    return (
      <div className="rounded-lg border p-4 text-sm text-muted-foreground text-center">
        No repayment data available for this loan.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Space for Letterhead */}
      <div className="flex justify-end gap-2 print:hidden">
        <Button onClick={() => window.print()} variant="outline">Print</Button>
        <Button onClick={() => alert("Email functionality to be implemented.")} variant="default">Email</Button>
      </div>

      <Card className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold uppercase">Statement of Account</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <strong>Borrower:</strong> {summary.borrower_name}<br />
            <strong>Email:</strong> {summary.email || "N/A"}<br />
            <strong>Phone:</strong> {summary.mobile_number || "N/A"}<br />
            <strong>Postal Address:</strong> {summary.postal_address || "N/A"}<br />
          </div>
          <div>
            <strong>Loan ID:</strong> {summary.loan_id}<br />
            <strong>Start Date:</strong> {summary.disbursement_date ? format(new Date(summary.disbursement_date), "dd/MM/yyyy") : "N/A"}<br />
            <strong>End Date:</strong> {summary.maturity_date ? format(new Date(summary.maturity_date), "dd/MM/yyyy") : "N/A"}<br />
            <strong>Term:</strong> {summary.loan_term} fortnights<br />
            <strong>Status:</strong> {summary.repayment_completion_percentage}% repaid<br />
          </div>
        </div>

        <hr className="my-4 border-t border-gray-300" />
        <h3 className="text-md font-semibold mb-2">Loan Charges</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div><strong>Principal:</strong> K{summary.principal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div><strong>Interest:</strong> K{summary.interest.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div><strong>Loan Risk Insurance:</strong> K{summary.loan_risk_insurance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div><strong>Documentation Fee:</strong> K{summary.documentation_fee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div><strong>Default Fees Accumulated:</strong> K{summary.default_fees_accumulated.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div><strong>Total GST:</strong> K{summary.total_gst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="overflow-x-auto">
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
                  <TableCell>{entry.entry_date ? format(new Date(entry.entry_date), "dd/MM/yyyy") : "N/A"}</TableCell>
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
        </div>

        <div className="flex justify-end text-sm mt-4">
          <div className="space-y-1 text-right">
            <div><strong>Total Debits:</strong> K{totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div><strong>Total Credits:</strong> K{totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div><strong>Outstanding Balance (Calculated):</strong> K{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div><strong>Outstanding Balance (View):</strong> K{summary.outstanding_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div><strong>Total GST:</strong> K{summary.total_gst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
