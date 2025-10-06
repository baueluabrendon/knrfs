import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, TrendingUp, DollarSign, AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getLoansReport } from "@/lib/api/reports";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const LoansReportPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    status: "all",
    payrollType: "all",
    clientType: "all",
    includeArrears: false,
    startDate: "",
    endDate: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["loans-report", filters],
    queryFn: () =>
      getLoansReport({
        status: filters.status !== "all" ? filters.status : undefined,
        payrollType: filters.payrollType !== "all" ? filters.payrollType : undefined,
        clientType: filters.clientType !== "all" ? filters.clientType : undefined,
        includeArrears: filters.includeArrears,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      }),
  });

  const exportToPDF = () => {
    const doc = new jsPDF("landscape");
    doc.setFontSize(18);
    doc.text("Loans Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated: ${format(new Date(), "PPP")}`, 14, 30);
    doc.text(`Total Loans: ${data?.summary.total || 0}`, 14, 36);

    autoTable(doc, {
      startY: 45,
      head: [["Loan ID", "Borrower", "Organization", "Principal", "Outstanding", "Status", "Completion %"]],
      body: (data?.loans || []).map((loan: any) => [
        loan.loan_id,
        `${loan.borrowers?.given_name} ${loan.borrowers?.surname}`,
        loan.borrowers?.department_company || "N/A",
        `K ${loan.principal?.toLocaleString() || "0"}`,
        `K ${loan.outstanding_balance?.toLocaleString() || "0"}`,
        loan.loan_status,
        `${loan.repayment_completion_percentage?.toFixed(1) || "0"}%`,
      ]),
    });

    doc.save("loans-report.pdf");
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      (data?.loans || []).map((loan: any) => ({
        "Loan ID": loan.loan_id,
        "Borrower Name": `${loan.borrowers?.given_name} ${loan.borrowers?.surname}`,
        "File Number": loan.borrowers?.file_number || "N/A",
        Organization: loan.borrowers?.department_company || "N/A",
        Product: loan.product,
        Principal: loan.principal,
        "Gross Loan": loan.gross_loan,
        "Disbursement Date": format(new Date(loan.disbursement_date), "PPP"),
        "Maturity Date": loan.maturity_date ? format(new Date(loan.maturity_date), "PPP") : "N/A",
        "Loan Status": loan.loan_status,
        "Repayment Status": loan.loan_repayment_status,
        "Outstanding Balance": loan.outstanding_balance,
        Arrears: loan.arrears,
        "Completion %": loan.repayment_completion_percentage,
        "Payroll Type": loan.payroll_type || "N/A",
        "Client Type": loan.borrowers?.client_type || "N/A",
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Loans");
    XLSX.writeFile(workbook, "loans-report.xlsx");
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

      <h1 className="text-2xl font-bold">Loans Report</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Loans</p>
              <p className="text-3xl font-bold">{data?.summary.total || 0}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Loans</p>
              <p className="text-3xl font-bold text-green-600">{data?.summary.active || 0}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overdue Loans</p>
              <p className="text-3xl font-bold text-red-600">{data?.summary.overdue || 0}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-2xl font-bold">K {data?.summary.total_outstanding?.toLocaleString() || 0}</p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={filters.status} onValueChange={(val) => setFilters({ ...filters, status: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="settled">Settled</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Payroll Type</label>
            <Select value={filters.payrollType} onValueChange={(val) => setFilters({ ...filters, payrollType: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="public_servant">Public Servant</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Client Type</label>
            <Select value={filters.clientType} onValueChange={(val) => setFilters({ ...filters, clientType: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Client Types</SelectItem>
                <SelectItem value="Public Service">Public Service</SelectItem>
                <SelectItem value="Statutory Body">Statutory Body</SelectItem>
                <SelectItem value="Private Company">Private Company</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Start Date</label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">End Date</label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                checked={filters.includeArrears}
                onCheckedChange={(checked) => setFilters({ ...filters, includeArrears: checked as boolean })}
              />
              <span className="text-sm font-medium">Show only loans in arrears</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Loan ID</TableHead>
              <TableHead>Borrower</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead className="text-right">Principal</TableHead>
              <TableHead className="text-right">Outstanding</TableHead>
              <TableHead className="text-right">Arrears</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Completion %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (data?.loans || []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No loans found
                </TableCell>
              </TableRow>
            ) : (
              (data?.loans || []).map((loan: any) => (
                <TableRow key={loan.loan_id}>
                  <TableCell className="font-medium">{loan.loan_id}</TableCell>
                  <TableCell>
                    {loan.borrowers?.given_name} {loan.borrowers?.surname}
                  </TableCell>
                  <TableCell>{loan.borrowers?.department_company || "N/A"}</TableCell>
                  <TableCell className="text-right">K {loan.principal?.toLocaleString() || 0}</TableCell>
                  <TableCell className="text-right">K {loan.outstanding_balance?.toLocaleString() || 0}</TableCell>
                  <TableCell className="text-right">K {loan.arrears?.toLocaleString() || 0}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        loan.loan_status === "active"
                          ? "bg-green-100 text-green-800"
                          : loan.loan_status === "settled"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {loan.loan_status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{loan.repayment_completion_percentage?.toFixed(1) || 0}%</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default LoansReportPage;
