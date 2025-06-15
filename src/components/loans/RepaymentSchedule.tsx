import React, { useEffect, useRef, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { fetchLetterheadUrls } from "@/lib/storage/fetchLetterheadUrls";
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
          gross_loan: f.gross_loan,
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
              {ledgerWithBalance.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{entry.payment_number || '-'}</TableCell>
                  <TableCell>{entry.entry_date ? format(new Date(entry.entry_date), "dd/MM/yyyy") : "N/A"}</TableCell>
                  <TableCell>{entry.pay_period || '-'}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell className="text-right">
                    {entry.debit !== null ? `${entry.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.credit !== null ? `${entry.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.running_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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

      <div className="hidden">
        <div ref={printRef} className="bg-white">
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
                fontFamily: "Arial, sans-serif",
              }}
            >
              {headerUrl && <img src={headerUrl} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "40px", objectFit: "cover" }} />}
              
              <div style={{
                position: "absolute",
                top: "45%",
                left: "50%",
                transform: "translate(-50%, -50%) rotate(-30deg)",
                fontSize: "3rem",
                color: "rgba(0,0,0,0.05)",
                whiteSpace: "nowrap"
              }}>
                STATEMENT OF ACCOUNT
              </div>
              
              <div style={{ position: "relative", zIndex: 1, marginTop: "40px" }}>
                {pageIndex === 0 && summary && (
                  <div className="mb-6">
                    <h2 style={{ fontSize: "18px", fontWeight: "bold", textAlign: "center", marginBottom: "12px", textTransform: "uppercase" }}>
                      Statement of Account
                    </h2>
                    
                    <table style={{ width: "100%", fontSize: "10px", marginBottom: "15px", borderSpacing: "4px", borderCollapse: "separate" }}>
                      <tbody>
                        <tr>
                          <td style={{ width: "20%", fontWeight: "bold", verticalAlign: "top" }}>Borrower:</td>
                          <td style={{ width: "30%", verticalAlign: "top" }}>{summary.borrower_name}</td>
                          <td style={{ width: "20%", fontWeight: "bold", verticalAlign: "top" }}>Loan ID:</td>
                          <td style={{ width: "30%", verticalAlign: "top" }}>{summary.loan_id}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold", verticalAlign: "top" }}>Email:</td>
                          <td style={{ verticalAlign: "top" }}>{summary.email}</td>
                          <td style={{ fontWeight: "bold", verticalAlign: "top" }}>Phone:</td>
                          <td style={{ verticalAlign: "top" }}>{summary.mobile_number}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold", verticalAlign: "top" }}>Address:</td>
                          <td style={{ verticalAlign: "top" }}>{summary.postal_address}</td>
                          <td style={{ fontWeight: "bold", verticalAlign: "top" }}>Organization:</td>
                          <td style={{ verticalAlign: "top" }}>{summary.department_company}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold", verticalAlign: "top" }}>File Number:</td>
                          <td style={{ verticalAlign: "top" }}>{summary.file_number}</td>
                          <td style={{ fontWeight: "bold", verticalAlign: "top" }}>Position:</td>
                          <td style={{ verticalAlign: "top" }}>{summary.position}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold", verticalAlign: "top" }}>Start Date:</td>
                          <td style={{ verticalAlign: "top" }}>
                            {summary.disbursement_date ? format(new Date(summary.disbursement_date), "dd/MM/yyyy") : "N/A"}
                          </td>
                          <td style={{ fontWeight: "bold", verticalAlign: "top" }}>End Date:</td>
                          <td style={{ verticalAlign: "top" }}>
                            {summary.maturity_date ? format(new Date(summary.maturity_date), "dd/MM/yyyy") : "N/A"}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold", verticalAlign: "top" }}>Term:</td>
                          <td style={{ verticalAlign: "top" }}>{summary.loan_term} fortnights</td>
                          <td style={{ fontWeight: "bold", verticalAlign: "top" }}>Status:</td>
                          <td style={{ verticalAlign: "top" }}>{summary.loan_status} ({summary.repayment_completion_percentage}% repaid)</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold", verticalAlign: "top" }}>PVA:</td>
                          <td style={{ verticalAlign: "top" }}>K{summary.fortnightly_installment?.toLocaleString()}</td>
                          <td></td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                    
                    <h3 style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "8px", marginTop: "15px" }}>Loan Charges</h3>
                    <table style={{ width: "100%", borderCollapse: "separate", fontSize: "9px", borderSpacing: "4px" }}>
                      <tbody>
                        <tr>
                          <td style={{ width: "33%", padding: "6px", border: "1px solid #e5e7eb", borderRadius: "4px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>Principal Amount:</span>
                              <span style={{ fontWeight: "500" }}>K{summary.principal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                          </td>
                          <td style={{ width: "33%", padding: "6px", border: "1px solid #e5e7eb", borderRadius: "4px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>Interest:</span>
                              <span style={{ fontWeight: "500" }}>K{summary.interest.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                          </td>
                          <td style={{ width: "33%", padding: "6px", border: "1px solid #e5e7eb", borderRadius: "4px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>Risk Insurance:</span>
                              <span style={{ fontWeight: "500" }}>K{summary.loan_risk_insurance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: "6px", border: "1px solid #e5e7eb", borderRadius: "4px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>Documentation Fee:</span>
                              <span style={{ fontWeight: "500" }}>K{summary.documentation_fee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                          </td>
                          <td style={{ padding: "6px", border: "1px solid #e5e7eb", borderRadius: "4px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>Default Fees:</span>
                              <span style={{ fontWeight: "500" }}>K{summary.default_fees_accumulated.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                          </td>
                          <td style={{ padding: "6px", border: "1px solid #e5e7eb", borderRadius: "4px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>GST:</span>
                              <span style={{ fontWeight: "500" }}>K{summary.total_gst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={3} style={{ padding: "6px", border: "1px solid #e5e7eb", borderRadius: "4px", backgroundColor: "#f9fafb" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                              <span>Total (Gross Loan):</span>
                              <span>K{summary.gross_loan.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                <h3 style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "8px", marginTop: "15px" }}>
                  Transaction History
                </h3>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f3f4f6" }}>
                      <th style={{ padding: "4px", border: "1px solid #e5e7eb", textAlign: "left" }}>#</th>
                      <th style={{ padding: "4px", border: "1px solid #e5e7eb", textAlign: "left" }}>Date</th>
                      <th style={{ padding: "4px", border: "1px solid #e5e7eb", textAlign: "left" }}>Pay Period</th>
                      <th style={{ padding: "4px", border: "1px solid #e5e7eb", textAlign: "left" }}>Description</th>
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
                          {entry.running_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {pageIndex === pages - 1 && (
                  <div style={{ marginTop: "15px", textAlign: "right", fontSize: "9px" }}>
                    <div style={{ marginBottom: "2px" }}><strong>Total Debits:</strong> K{totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <div style={{ marginBottom: "2px" }}><strong>Total Credits:</strong> K{totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <div style={{ fontWeight: "bold" }}>
                      <strong>Outstanding Balance:</strong> K{summary.outstanding_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{
                position: "absolute",
                bottom: "50px",
                right: "15mm",
                fontSize: "8px",
                color: "gray"
              }}>
                Page {pageIndex + 1} of {pages}
              </div>
              
              {pageIndex === pages - 1 && (
                <div style={{ 
                  position: "absolute", 
                  bottom: "80px", 
                  left: "15mm",
                  fontSize: "8px", 
                  borderTop: "1px solid #e5e7eb",
                  width: "120px",
                  textAlign: "center",
                  paddingTop: "4px"
                }}>
                  Authorized Signature
                </div>
              )}
              
              {footerUrl && <img src={footerUrl} style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "40px", objectFit: "cover" }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
