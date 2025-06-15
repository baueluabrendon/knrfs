import React, { useEffect, useRef, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import html2pdf from "html2pdf.js";
import { Button } from "@/components/ui/button";
import { Download, Mail, Printer } from "lucide-react";

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
          gross_loan: f.gross_loan,
        });
      } else if (error) {
        console.error("Error fetching ledger data:", error);
      }
    };

    if (loan.id) {
      fetchData();
    }
  }, [loan.id]);

  const rowsPerPage = 20;
  const splitLedger = Array.from({ length: Math.ceil(ledger.length / rowsPerPage) }, (_, i) =>
    ledger.slice(i * rowsPerPage, (i + 1) * rowsPerPage)
  ).filter((rows) => rows.length > 0);

  const pages = splitLedger.length;

  const headerImage = "/header.png";
  const footerImage = "/footer.png";

  // Classes for visually hiding but keeping in DOM for export
  const hiddenExportAreaClass = "sr-only"; // Tailwind 'screen-reader only' utility

  const downloadPdf = () => {
    // Make the export area visible for html2pdf, hide after export
    const exportDiv = printRef.current;

    if (!exportDiv) return;

    // Remove sr-only class just for export, then restore after
    exportDiv.classList.remove("sr-only");
    html2pdf()
      .set({
        margin: 0,
        filename: `Statement-of-Account-${loan.id}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] }
      })
      .from(exportDiv)
      .save()
      .then(() => {
        exportDiv.classList.add("sr-only");
      })
      .catch(() => {
        exportDiv.classList.add("sr-only");
      });
  };

  const totalDebits = ledger.reduce((sum, e) => sum + (e.debit ?? 0), 0);
  const totalCredits = ledger.reduce((sum, e) => sum + (e.credit ?? 0), 0);

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
        <Button onClick={() => window.print()} variant="outline" size="sm">
          <Printer className="mr-1 h-4 w-4" />
          Print
        </Button>
        <Button onClick={downloadPdf} variant="default" size="sm">
          <Download className="mr-1 h-4 w-4" />
          Download PDF
        </Button>
        <Button onClick={() => alert("Email functionality to be implemented.")} variant="default" size="sm">
          <Mail className="mr-1 h-4 w-4" />
          Email
        </Button>
      </div>

      <Card className="p-6 mb-4 print:hidden">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">STATEMENT OF ACCOUNT</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <p><span className="font-semibold">Borrower:</span> {summary.borrower_name}</p>
            <p><span className="font-semibold">Email:</span> {summary.email}</p>
            <p><span className="font-semibold">Phone:</span> {summary.mobile_number}</p>
            <p><span className="font-semibold">Address:</span> {summary.postal_address}</p>
          </div>
          <div>
            <p><span className="font-semibold">Loan ID:</span> {summary.loan_id}</p>
            <p><span className="font-semibold">Start Date:</span> {summary.disbursement_date ? format(new Date(summary.disbursement_date), "dd/MM/yyyy") : "N/A"}</p>
            <p><span className="font-semibold">End Date:</span> {summary.maturity_date ? format(new Date(summary.maturity_date), "dd/MM/yyyy") : "N/A"}</p>
            <p><span className="font-semibold">Term:</span> {summary.loan_term} fortnights</p>
            <p><span className="font-semibold">Status:</span> {summary.loan_status} ({summary.repayment_completion_percentage}% repaid)</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-3">Loan Charges</h3>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="border rounded p-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Principal Amount:</span>
                <span className="font-medium">K{summary.principal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="border rounded p-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Interest:</span>
                <span className="font-medium">K{summary.interest.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="border rounded p-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Risk Insurance:</span>
                <span className="font-medium">K{summary.loan_risk_insurance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="border rounded p-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Documentation Fee:</span>
                <span className="font-medium">K{summary.documentation_fee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="border rounded p-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Default Fees:</span>
                <span className="font-medium">K{summary.default_fees_accumulated.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="border rounded p-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">GST:</span>
                <span className="font-medium">K{summary.total_gst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="col-span-3 border rounded p-2 bg-gray-50">
              <div className="flex justify-between items-center font-medium text-sm">
                <span>Total (Gross Loan):</span>
                <span>K{summary.gross_loan.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
        
        <h3 className="text-md font-semibold mb-3">Transaction History</h3>
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
              {ledger.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{entry.payment_number || '-'}</TableCell>
                  <TableCell>
                    {entry.entry_date ? format(new Date(entry.entry_date), "dd/MM/yyyy") : "N/A"}
                  </TableCell>
                  <TableCell>{entry.pay_period || '-'}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell className="text-right">
                    {entry.debit !== null ? `${entry.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.credit !== null ? `${entry.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.outstanding_balance !== undefined && entry.outstanding_balance !== null
                      ? entry.outstanding_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end mt-4 text-sm">
          <div className="space-y-1 text-right">
            <div><span className="font-semibold">Total Debits:</span> K{totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div><span className="font-semibold">Total Credits:</span> K{totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div><span className="font-semibold">Outstanding Balance:</span> K{summary.outstanding_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      </Card>

      {/* PDF/Export/Print content */}
      {/* Not hidden with display:none so html2pdf can access it */}
      <div ref={printRef} className={hiddenExportAreaClass} aria-hidden>
        {splitLedger.map((rows, pageIndex) => {
          // Assess for real rows: skip blank/empty export pages
          if (!rows || rows.length === 0) return null;
          return (
            <div
              key={pageIndex}
              style={{
                height: "297mm",
                width: "210mm",
                padding: "20mm 15mm",
                boxSizing: "border-box",
                pageBreakAfter: splitLedger.length > 1 && pageIndex < splitLedger.length - 1 ? "always" : "auto",
                fontFamily: "Arial, sans-serif",
                background: "#fff",
                display: "flex",
                flexDirection: "column",
                minHeight: "297mm",
                justifyContent: "space-between"
              }}
            >
              {/* Header block */}
              <div>
                <img
                  src={headerImage}
                  alt="Statement Header"
                  style={{
                    width: "100%",
                    height: "40px",
                    objectFit: "cover",
                    marginBottom: "12px"
                  }}
                />
                <div style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  textAlign: "center",
                  marginBottom: "8px",
                  textTransform: "uppercase"
                }}>
                  STATEMENT OF ACCOUNT
                </div>

                {/* First page, only: summary block */}
                {pageIndex === 0 && summary && (
                  <div style={{ marginBottom: "10px" }}>
                    <table style={{ width: "100%", fontSize: "9px", marginBottom: "12px" }}>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: "bold" }}>Borrower:</td>
                          <td>{summary.borrower_name}</td>
                          <td style={{ fontWeight: "bold" }}>Loan ID:</td>
                          <td>{summary.loan_id}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold" }}>Email:</td>
                          <td>{summary.email}</td>
                          <td style={{ fontWeight: "bold" }}>Phone:</td>
                          <td>{summary.mobile_number}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold" }}>Address:</td>
                          <td>{summary.postal_address}</td>
                          <td style={{ fontWeight: "bold" }}>Organization:</td>
                          <td>{summary.department_company}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold" }}>File Number:</td>
                          <td>{summary.file_number}</td>
                          <td style={{ fontWeight: "bold" }}>Position:</td>
                          <td>{summary.position}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold" }}>Start Date:</td>
                          <td>{summary.disbursement_date ? format(new Date(summary.disbursement_date), "dd/MM/yyyy") : "N/A"}</td>
                          <td style={{ fontWeight: "bold" }}>End Date:</td>
                          <td>{summary.maturity_date ? format(new Date(summary.maturity_date), "dd/MM/yyyy") : "N/A"}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold" }}>Term:</td>
                          <td>{summary.loan_term} fortnights</td>
                          <td style={{ fontWeight: "bold" }}>Status:</td>
                          <td>{summary.loan_status} ({summary.repayment_completion_percentage}% repaid)</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold" }}>PVA:</td>
                          <td>K{summary.fortnightly_installment?.toLocaleString()}</td>
                          <td></td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                    {/* ... loan charges ... */}
                    <div>
                      <h3 style={{ fontWeight: "bold", fontSize: "10px", margin: "8px 0" }}>Loan Charges</h3>
                      <table style={{ width: "100%", fontSize: "8.5px", marginBottom: "10px" }}>
                        <tbody>
                          <tr>
                            <td>Principal: <b>K{summary.principal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</b></td>
                            <td>Interest: <b>K{summary.interest.toLocaleString(undefined, { minimumFractionDigits: 2 })}</b></td>
                            <td>Risk Insurance: <b>K{summary.loan_risk_insurance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</b></td>
                          </tr>
                          <tr>
                            <td>Documentation Fee: <b>K{summary.documentation_fee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</b></td>
                            <td>Default Fees: <b>K{summary.default_fees_accumulated.toLocaleString(undefined, { minimumFractionDigits: 2 })}</b></td>
                            <td>GST: <b>K{summary.total_gst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</b></td>
                          </tr>
                          <tr>
                            <td colSpan={3} style={{ background: "#f5f5f5" }}>
                              <b>Total (Gross Loan):</b> K{summary.gross_loan.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <h3 style={{ fontWeight: "bold", fontSize: "10px", margin: "8px 0 6px" }}>Transaction History</h3>
                <table style={{ width: "100%", fontSize: "8px", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f3f4f6" }}>
                      <th style={{ padding: "4px", border: "1px solid #e5e7eb" }}>#</th>
                      <th style={{ padding: "4px", border: "1px solid #e5e7eb" }}>Date</th>
                      <th style={{ padding: "4px", border: "1px solid #e5e7eb" }}>Pay Period</th>
                      <th style={{ padding: "4px", border: "1px solid #e5e7eb" }}>Description</th>
                      <th style={{ padding: "4px", border: "1px solid #e5e7eb", textAlign: "right" }}>Debit (K)</th>
                      <th style={{ padding: "4px", border: "1px solid #e5e7eb", textAlign: "right" }}>Credit (K)</th>
                      <th style={{ padding: "4px", border: "1px solid #e5e7eb", textAlign: "right" }}>Balance (K)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((entry, i) => (
                      <tr key={i}>
                        <td style={{ padding: "4px", border: "1px solid #e5e7eb" }}>{entry.payment_number ?? "-"}</td>
                        <td style={{ padding: "4px", border: "1px solid #e5e7eb" }}>
                          {entry.entry_date ? format(new Date(entry.entry_date), "dd/MM/yyyy") : "N/A"}
                        </td>
                        <td style={{ padding: "4px", border: "1px solid #e5e7eb" }}>{entry.pay_period || "-"}</td>
                        <td style={{ padding: "4px", border: "1px solid #e5e7eb" }}>{entry.description}</td>
                        <td style={{ padding: "4px", border: "1px solid #e5e7eb", textAlign: "right" }}>
                          {entry.debit !== null ? entry.debit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
                        </td>
                        <td style={{ padding: "4px", border: "1px solid #e5e7eb", textAlign: "right" }}>
                          {entry.credit !== null ? entry.credit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
                        </td>
                        <td style={{ padding: "4px", border: "1px solid #e5e7eb", textAlign: "right" }}>
                          {entry.outstanding_balance !== undefined && entry.outstanding_balance !== null
                            ? entry.outstanding_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Footer block */}
              <div>
                {/* On the last page show totals */}
                {pageIndex === splitLedger.length - 1 && (
                  <div style={{ textAlign: "right", fontSize: "8.5px", margin: "15px 0 8px" }}>
                    <div><b>Total Debits:</b> K{totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <div><b>Total Credits:</b> K{totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <div style={{ fontWeight: "bold" }}>
                      <b>Outstanding Balance:</b> K{summary.outstanding_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                )}
                {/* Footer image */}
                <img
                  src={footerImage}
                  alt="Statement Footer"
                  style={{
                    marginTop: "14px",
                    width: "100%",
                    height: "40px",
                    objectFit: "cover"
                  }}
                />
                <div style={{
                  fontSize: "7px",
                  color: "#555",
                  width: "100%",
                  textAlign: "right",
                  paddingTop: "2px"
                }}>
                  Page {pageIndex + 1} of {splitLedger.length}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
