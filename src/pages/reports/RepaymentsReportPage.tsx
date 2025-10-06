import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, DollarSign, TrendingUp, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRepaymentsReport } from "@/lib/api/reports";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const RepaymentsReportPage = () => {
  const navigate = useNavigate();
  const [payrollTypeFilter, setPayrollTypeFilter] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["repayments-report", payrollTypeFilter],
    queryFn: () =>
      getRepaymentsReport({
        payrollType: payrollTypeFilter !== "all" ? payrollTypeFilter : undefined,
      }),
  });

  const collectionRate =
    data?.summary.total_expected > 0
      ? ((data.summary.total_collected / data.summary.total_expected) * 100).toFixed(1)
      : 0;

  const exportToPDF = () => {
    const doc = new jsPDF("landscape");
    doc.setFontSize(18);
    doc.text("Repayments Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated: ${format(new Date(), "PPP")}`, 14, 30);

    // Summary
    doc.text(`Total Expected: K ${data?.summary.total_expected?.toLocaleString() || 0}`, 14, 40);
    doc.text(`Total Collected: K ${data?.summary.total_collected?.toLocaleString() || 0}`, 14, 46);
    doc.text(`Collection Rate: ${collectionRate}%`, 14, 52);

    autoTable(doc, {
      startY: 60,
      head: [["Loan ID", "Borrower", "Due Date", "Expected", "Collected", "Outstanding", "Rating"]],
      body: (data?.schedules || []).map((schedule: any) => [
        schedule.loans?.loan_id || "N/A",
        `${schedule.loans?.borrowers?.given_name} ${schedule.loans?.borrowers?.surname}`,
        format(new Date(schedule.due_date), "PPP"),
        `K ${schedule.repaymentrs?.toLocaleString() || 0}`,
        `K ${schedule.repayment_received?.toLocaleString() || 0}`,
        `K ${schedule.balance?.toLocaleString() || 0}`,
        schedule.collection_rating,
      ]),
    });

    doc.save("repayments-report.pdf");
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      (data?.schedules || []).map((schedule: any) => ({
        "Loan ID": schedule.loans?.loan_id || "N/A",
        "Borrower Name": `${schedule.loans?.borrowers?.given_name} ${schedule.loans?.borrowers?.surname}`,
        "File Number": schedule.loans?.borrowers?.file_number || "N/A",
        Organization: schedule.loans?.borrowers?.department_company || "N/A",
        "Due Date": format(new Date(schedule.due_date), "PPP"),
        "Pay Period": schedule.pay_period || "N/A",
        "Expected Amount": schedule.repaymentrs,
        "Principal Due": schedule.principalrs,
        "Interest Due": schedule.interestrs,
        "Doc Fee Due": schedule.documentation_feers,
        "Risk Insurance Due": schedule.loan_risk_insurancers,
        "Amount Collected": schedule.repayment_received,
        Outstanding: schedule.balance,
        "Collection Rate": schedule.collection_rate?.toFixed(1) + "%",
        Rating: schedule.collection_rating,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Repayments");
    XLSX.writeFile(workbook, "repayments-report.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/reports")}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reports</span>
        </Button>

        <div className="flex gap-2">
          <Button onClick={exportToPDF} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button onClick={exportToExcel} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      <h1 className="text-2xl font-bold">Repayments Report</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Expected Collections</p>
              <p className="text-2xl font-bold">K {data?.summary.total_expected?.toLocaleString() || 0}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Collected</p>
              <p className="text-2xl font-bold text-green-600">K {data?.summary.total_collected?.toLocaleString() || 0}</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Collection Rate</p>
              <p className="text-3xl font-bold">{collectionRate}%</p>
            </div>
            <CheckCircle className="w-10 h-10 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Payment Status</p>
            <div className="space-y-1 text-sm">
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Full: {data?.summary.full_payments || 0}
              </p>
              <p className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                Partial: {data?.summary.partial_payments || 0}
              </p>
              <p className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                Missed: {data?.summary.missed_payments || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* By Payroll Type Summary */}
      {data?.summary.by_payroll_type && data.summary.by_payroll_type.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Collection Summary by Payroll Type</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payroll Type</TableHead>
                <TableHead className="text-right">Active Loans</TableHead>
                <TableHead className="text-right">Expected Amount</TableHead>
                <TableHead className="text-right">Collected</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead className="text-right">Collection Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.summary.by_payroll_type.map((item: any) => (
                <TableRow key={item.payroll_type}>
                  <TableCell className="font-medium capitalize">{item.payroll_type}</TableCell>
                  <TableCell className="text-right">{item.count}</TableCell>
                  <TableCell className="text-right">K {item.expected?.toLocaleString() || 0}</TableCell>
                  <TableCell className="text-right">K {item.collected?.toLocaleString() || 0}</TableCell>
                  <TableCell className="text-right">K {(item.expected - item.collected)?.toLocaleString() || 0}</TableCell>
                  <TableCell className="text-right font-semibold">{item.collection_rate?.toFixed(1) || 0}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Filter by Payroll Type:</label>
          <Select value={payrollTypeFilter} onValueChange={setPayrollTypeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="public_servant">Public Servant</SelectItem>
              <SelectItem value="company">Company</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Detailed Data Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Loan ID</TableHead>
              <TableHead>Borrower</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Expected</TableHead>
              <TableHead className="text-right">Collected</TableHead>
              <TableHead className="text-right">Outstanding</TableHead>
              <TableHead>Rating</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (data?.schedules || []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No repayment schedules found
                </TableCell>
              </TableRow>
            ) : (
              (data?.schedules || []).map((schedule: any) => (
                <TableRow key={schedule.schedule_id}>
                  <TableCell className="font-medium">{schedule.loans?.loan_id || "N/A"}</TableCell>
                  <TableCell>
                    {schedule.loans?.borrowers?.given_name} {schedule.loans?.borrowers?.surname}
                  </TableCell>
                  <TableCell>{schedule.loans?.borrowers?.department_company || "N/A"}</TableCell>
                  <TableCell>{format(new Date(schedule.due_date), "PP")}</TableCell>
                  <TableCell className="text-right">K {schedule.repaymentrs?.toLocaleString() || 0}</TableCell>
                  <TableCell className="text-right">K {schedule.repayment_received?.toLocaleString() || 0}</TableCell>
                  <TableCell className="text-right">K {schedule.balance?.toLocaleString() || 0}</TableCell>
                  <TableCell>
                    {schedule.collection_rating === "full" && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Full
                      </span>
                    )}
                    {schedule.collection_rating === "partial" && (
                      <span className="flex items-center gap-1 text-yellow-600">
                        <AlertCircle className="w-4 h-4" />
                        Partial
                      </span>
                    )}
                    {schedule.collection_rating === "missed" && (
                      <span className="flex items-center gap-1 text-red-600">
                        <XCircle className="w-4 h-4" />
                        Missed
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default RepaymentsReportPage;
