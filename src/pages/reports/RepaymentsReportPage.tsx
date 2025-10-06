import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, DollarSign, TrendingUp, AlertCircle, CheckCircle, XCircle, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRepaymentsReport } from "@/lib/api/reports";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { YearFilter, QuarterFilter, MonthFilter, PayPeriodFilter, PayrollTypeFilter } from "@/components/reports/ReportFilters";
import { useBranches } from "@/hooks/useBranches";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RepaymentsReportPage = () => {
  const navigate = useNavigate();
  
  // Comprehensive filter states
  const [filters, setFilters] = useState({
    year: "",
    quarter: "",
    month: "",
    payPeriod: "",
    branchId: "",
    payrollType: "",
  });

  const { data: branches } = useBranches();

  const { data, isLoading } = useQuery({
    queryKey: ["repayments-report", filters],
    queryFn: () => getRepaymentsReport({
      year: filters.year ? parseInt(filters.year) : undefined,
      quarter: filters.quarter ? parseInt(filters.quarter.replace('Q', '')) : undefined,
      month: filters.month ? parseInt(filters.month) : undefined,
      payPeriod: filters.payPeriod || undefined,
      branchId: filters.branchId || undefined,
      payrollType: filters.payrollType || undefined,
    }),
  });

  // Calculate variance and collection efficiency
  const totalVariance = useMemo(() => {
    return (data?.schedules || []).reduce((sum: number, schedule: any) => sum + (schedule.balance || 0), 0);
  }, [data]);

  const collectionEfficiency = useMemo(() => {
    const totalExpected = (data?.schedules || []).reduce((sum: number, s: any) => sum + (s.repaymentrs || 0), 0);
    const totalCollected = (data?.schedules || []).reduce((sum: number, s: any) => sum + (s.repayment_received || 0), 0);
    return totalExpected > 0 ? ((totalCollected / totalExpected) * 100).toFixed(2) : "0.00";
  }, [data]);

  const collectionRate =
    data?.summary.total_expected > 0
      ? ((data.summary.total_collected / data.summary.total_expected) * 100).toFixed(1)
      : 0;

  const getVarianceColor = (balance: number, expected: number) => {
    if (balance === 0) return "text-green-600";
    if (balance === expected) return "text-red-600";
    return "text-yellow-600";
  };

  const exportToPDF = () => {
    const doc = new jsPDF("landscape");
    doc.setFontSize(18);
    doc.text("Repayments Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated: ${format(new Date(), "PPP")}`, 14, 30);

    doc.text(`Total Expected: K ${data?.summary.total_expected?.toLocaleString() || 0}`, 14, 40);
    doc.text(`Total Collected: K ${data?.summary.total_collected?.toLocaleString() || 0}`, 14, 46);
    doc.text(`Collection Rate: ${collectionRate}%`, 14, 52);

    autoTable(doc, {
      startY: 60,
      head: [["Loan ID", "Borrower", "Due Date", "Expected", "Collected", "Variance", "Status"]],
      body: (data?.schedules || []).map((schedule: any) => [
        schedule.loans?.loan_id || "N/A",
        `${schedule.loans?.borrowers?.given_name} ${schedule.loans?.borrowers?.surname}`,
        format(new Date(schedule.due_date), "PPP"),
        `K ${schedule.repaymentrs?.toLocaleString() || 0}`,
        `K ${schedule.repayment_received?.toLocaleString() || 0}`,
        `K ${schedule.balance?.toLocaleString() || 0}`,
        schedule.statusrs,
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
        "Variance": schedule.balance,
        Status: schedule.statusrs,
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

      <h1 className="text-2xl font-bold">Repayments Collection Report</h1>

      {/* Comprehensive Filters Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <YearFilter value={filters.year} onChange={(year) => setFilters({...filters, year})} />
          <QuarterFilter value={filters.quarter} onChange={(quarter) => setFilters({...filters, quarter})} />
          <MonthFilter value={filters.month} onChange={(month) => setFilters({...filters, month})} />
          <PayPeriodFilter value={filters.payPeriod} onChange={(payPeriod) => setFilters({...filters, payPeriod})} />
          
          <div>
            <label className="text-sm font-medium mb-2 block">Branch</label>
            <Select value={filters.branchId} onValueChange={(branchId) => setFilters({...filters, branchId})}>
              <SelectTrigger>
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Branches</SelectItem>
                {(branches || []).map((branch: any) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.branch_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <PayrollTypeFilter value={filters.payrollType} onChange={(payrollType) => setFilters({...filters, payrollType})} />
        </div>
        {Object.values(filters).some(v => v) && (
          <Button variant="ghost" size="sm" onClick={() => setFilters({ year: "", quarter: "", month: "", payPeriod: "", branchId: "", payrollType: "" })} className="mt-4">
            Clear All Filters
          </Button>
        )}
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <TrendingUp className="w-10 h-10 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Variance</p>
              <p className="text-2xl font-bold text-red-600">K {totalVariance.toLocaleString()}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Collection Efficiency</p>
              <p className="text-2xl font-bold text-green-600">{collectionEfficiency}%</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Collections by Payroll Type */}
      {data?.summary?.by_payroll_type && data.summary.by_payroll_type.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Collections by Payroll Type</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payroll Type</TableHead>
                <TableHead className="text-right">Expected Collections</TableHead>
                <TableHead className="text-right">Total Collected</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead className="text-right">Collection Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.summary.by_payroll_type.map((item: any) => {
                const variance = (item.expected || 0) - (item.collected || 0);
                const rate = item.expected > 0 ? ((item.collected / item.expected) * 100).toFixed(2) : "0.00";
                return (
                  <TableRow key={item.payroll_type}>
                    <TableCell className="font-medium capitalize">{item.payroll_type?.replace("_", " ") || "N/A"}</TableCell>
                    <TableCell className="text-right">K {item.expected?.toLocaleString() || 0}</TableCell>
                    <TableCell className="text-right">K {item.collected?.toLocaleString() || 0}</TableCell>
                    <TableCell className={`text-right font-semibold ${getVarianceColor(variance, item.expected)}`}>
                      K {variance.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={rate === "100.00" ? "text-green-600 font-semibold" : "text-yellow-600"}>
                        {rate}%
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Detailed Repayment Schedule */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Detailed Repayment Schedule with Variance</h2>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Loan ID</TableHead>
              <TableHead>Borrower</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Pay Period</TableHead>
              <TableHead>Payroll Type</TableHead>
              <TableHead className="text-right">Expected</TableHead>
              <TableHead className="text-right">Collected</TableHead>
              <TableHead className="text-right">Variance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (data?.schedules || []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center">
                  No repayment schedules found for selected filters
                </TableCell>
              </TableRow>
            ) : (
              (data?.schedules || []).map((schedule: any) => {
                const variance = schedule.balance || 0;
                const expected = schedule.repaymentrs || 0;
                const variancePercentage = expected > 0 ? ((variance / expected) * 100).toFixed(1) : "0.0";
                
                return (
                  <TableRow key={schedule.schedule_id}>
                    <TableCell className="font-medium">{schedule.loans?.loan_id || "N/A"}</TableCell>
                    <TableCell>
                      {schedule.loans?.borrowers?.given_name} {schedule.loans?.borrowers?.surname}
                    </TableCell>
                    <TableCell>{schedule.loans?.borrowers?.department_company || "N/A"}</TableCell>
                    <TableCell>{format(new Date(schedule.due_date), "PP")}</TableCell>
                    <TableCell>{schedule.pay_period || "N/A"}</TableCell>
                    <TableCell className="capitalize">{schedule.payroll_type?.replace("_", " ") || "N/A"}</TableCell>
                    <TableCell className="text-right">K {expected.toLocaleString()}</TableCell>
                    <TableCell className="text-right">K {schedule.repayment_received?.toLocaleString() || 0}</TableCell>
                    <TableCell className={`text-right font-semibold ${getVarianceColor(variance, expected)}`}>
                      {variance === 0 ? (
                        <span className="flex items-center justify-end gap-1">
                          <CheckCircle className="w-4 h-4" />
                          K 0
                        </span>
                      ) : (
                        <span className="flex items-center justify-end gap-1">
                          <AlertCircle className="w-4 h-4" />
                          K {variance.toLocaleString()} ({variancePercentage}%)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          schedule.statusrs === "paid"
                            ? "bg-green-100 text-green-800"
                            : schedule.statusrs === "partial"
                            ? "bg-yellow-100 text-yellow-800"
                            : schedule.statusrs === "default"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {schedule.statusrs}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default RepaymentsReportPage;
