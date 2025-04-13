
import React, { useEffect, useRef, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { fetchLetterheadUrls } from "@/lib/storage/fetchLetterheadUrls";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import html2pdf from "html2pdf.js";
import { Button } from "@/components/ui/button";

interface RepaymentScheduleProps {
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
  const [headerUrl, setHeaderUrl] = useState("");
  const [footerUrl, setFooterUrl] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("repayment_ledger_view")
        .select("*")
        .eq("loan_id", loan.id)
        .order("entry_date", { ascending: true });

      if (data?.length) {
        setLedger(data);
        const f = data[0];
        setSummary({
          borrower_name: f.borrower_name,
          email: f.email || 'N/A',
          mobile_number: f.mobile_number || 'N/A',
          postal_address: f.postal_address || 'N/A',
          department_company: f.department_company || 'N/A',
          file_number: f.file_number || 'N/A',
          position: f.position || 'N/A',
          loan_id: f.loan_id,
          disbursement_date: f.disbursement_date,
          maturity_date: f.maturity_date,
          loan_term: parseInt(f.loan_term?.replace("TERM_", "") || "0"),
          interest_rate: f.interest_rate,
          repayment_completion_percentage: f.repayment_completion_percentage,
          outstanding_balance: f.outstanding_balance,
          fortnightly_installment: f.fortnightly_installment,
          principal: f.principal,
          interest: f.interest,
          loan_risk_insurance: f.loan_risk_insurance,
          documentation_fee: f.documentation_fee,
          default_fees_accumulated: f.default_fees_accumulated,
          total_gst: f.gst_amount,
          loan_status: f.loan_status,
        });

        try {
          const { headerUrl, footerUrl } = await fetchLetterheadUrls();
          setHeaderUrl(headerUrl);
          setFooterUrl(footerUrl);
        } catch (e) {
          console.error("Error fetching letterhead URLs:", e);
        }
      } else if (error) {
        console.error("Error fetching ledger data:", error);
      }
    };

    if (loan.id) {
      fetchData();
    }
  }, [loan.id]);

  const downloadPdf = () => {
    if (printRef.current) {
      html2pdf()
        .set({
          margin: 0,
          filename: `Statement-of-Account-${loan.id}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 3 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(printRef.current)
        .save();
    }
  };

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
  const rowsPerPage = 20;
  const pages = Math.ceil(ledger.length / rowsPerPage);
  const splitLedger = Array.from({ length: pages }, (_, i) =>
    ledgerWithBalance.slice(i * rowsPerPage, (i + 1) * rowsPerPage)
  );

  if (!summary || ledger.length === 0) {
    return (
      <div className="rounded-lg border p-4 text-sm text-muted-foreground text-center">
        No repayment data available for this loan.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 print:hidden">
        <Button onClick={() => window.print()} variant="outline">Print</Button>
        <Button onClick={downloadPdf} variant="default">Download PDF</Button>
        <Button onClick={() => alert("Email functionality to be implemented.")} variant="default">Email</Button>
      </div>

      {/* Statement of Account and Loan Charges section */}
      <Card className="p-6 mb-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold uppercase">Statement of Account</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <strong>Borrower:</strong> {summary.borrower_name}<br />
            <strong>Email:</strong> {summary.email}<br />
            <strong>Phone:</strong> {summary.mobile_number}<br />
            <strong>Postal Address:</strong> {summary.postal_address}<br />
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
        <h3 className="text-lg font-semibold mb-4">Loan Charges</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-4 bg-gray-50">
            <div className="text-center mb-2">
              <h4 className="font-medium text-gray-700">Principal Amount</h4>
              <p className="text-xl font-bold">K{summary.principal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </Card>
          
          <Card className="p-4 bg-gray-50">
            <div className="text-center mb-2">
              <h4 className="font-medium text-gray-700">Interest</h4>
              <p className="text-xl font-bold">K{summary.interest.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </Card>
          
          <Card className="p-4 bg-gray-50">
            <div className="text-center mb-2">
              <h4 className="font-medium text-gray-700">Risk Insurance</h4>
              <p className="text-xl font-bold">K{summary.loan_risk_insurance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </Card>
          
          <Card className="p-4 bg-gray-50">
            <div className="text-center mb-2">
              <h4 className="font-medium text-gray-700">Documentation Fee</h4>
              <p className="text-xl font-bold">K{summary.documentation_fee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </Card>
          
          <Card className="p-4 bg-gray-50">
            <div className="text-center mb-2">
              <h4 className="font-medium text-gray-700">Default Fees</h4>
              <p className="text-xl font-bold">K{summary.default_fees_accumulated.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </Card>
          
          <Card className="p-4 bg-gray-50">
            <div className="text-center mb-2">
              <h4 className="font-medium text-gray-700">Total GST</h4>
              <p className="text-xl font-bold">K{summary.total_gst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </Card>
        </div>
      </Card>

      <Card className="p-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Pay Period</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Debit (K)</TableHead>
                <TableHead className="text-right">Credit (K)</TableHead>
                <TableHead className="text-right">Balance (K)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledgerWithBalance.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{entry.payment_number || '-'}</TableCell>
                  <TableCell>{entry.entry_date ? format(new Date(entry.entry_date), "dd/MM/yyyy") : "N/A"}</TableCell>
                  <TableCell>{entry.pay_period || '-'}</TableCell>
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

      {/* PDF Export View - Hidden until download */}
      <div className="hidden">
        <div ref={printRef} className="bg-white text-[12px]">
          {splitLedger.map((rows, pageIndex) => (
            <div
              key={pageIndex}
              style={{
                height: "297mm",
                width: "210mm",
                padding: "20mm 15mm",
                boxSizing: "border-box",
                pageBreakAfter: "always",
                position: "relative",
              }}
            >
              {headerUrl && <img src={headerUrl} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "50px", objectFit: "cover" }} />}
              {footerUrl && <img src={footerUrl} style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "50px", objectFit: "cover" }} />}

              <div style={{
                position: "absolute",
                top: "45%",
                left: "50%",
                transform: "translate(-50%, -50%) rotate(-30deg)",
                fontSize: "3rem",
                color: "rgba(0,0,0,0.05)",
                whiteSpace: "nowrap"
              }}>
                SYSTEM PRINTOUT
              </div>

              <div style={{ position: "relative", zIndex: 1 }}>
                {pageIndex === 0 && summary && (
                  <div className="mb-4">
                    <h2 className="text-lg font-bold text-center mb-2">Statement of Account</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong>Borrower:</strong> {summary.borrower_name}<br />
                        <strong>Email:</strong> {summary.email}<br />
                        <strong>Phone:</strong> {summary.mobile_number}<br />
                        <strong>Address:</strong> {summary.postal_address}<br />
                        <strong>Organization:</strong> {summary.department_company}<br />
                        <strong>File Number:</strong> {summary.file_number}<br />
                        <strong>Position:</strong> {summary.position}<br />
                      </div>
                      <div>
                        <strong>Loan ID:</strong> {summary.loan_id}<br />
                        <strong>Start Date:</strong> {summary.disbursement_date ? format(new Date(summary.disbursement_date), "dd/MM/yyyy") : "N/A"}<br />
                        <strong>End Date:</strong> {summary.maturity_date ? format(new Date(summary.maturity_date), "dd/MM/yyyy") : "N/A"}<br />
                        <strong>Term:</strong> {summary.loan_term} fortnights<br />
                        <strong>PVA:</strong> K{summary.fortnightly_installment?.toLocaleString()}<br />
                        <strong>Completion:</strong> {summary.repayment_completion_percentage}%<br />
                        <strong>Status:</strong> {summary.loan_status}<br />
                      </div>
                    </div>
                  </div>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Pay Period</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Debit (K)</TableHead>
                      <TableHead className="text-right">Credit (K)</TableHead>
                      <TableHead className="text-right">Balance (K)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((entry, i) => (
                      <TableRow key={i}>
                        <TableCell>{entry.payment_number ?? "-"}</TableCell>
                        <TableCell>{entry.entry_date ? format(new Date(entry.entry_date), "dd/MM/yyyy") : "N/A"}</TableCell>
                        <TableCell>{entry.pay_period || "-"}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell className="text-right">K{(entry.debit ?? 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right">K{(entry.credit ?? 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right">K{entry.running_balance.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div style={{
                position: "absolute",
                bottom: "60px",
                right: "20mm",
                fontSize: "10px",
                color: "gray"
              }}>
                Page {pageIndex + 1} of {pages}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
