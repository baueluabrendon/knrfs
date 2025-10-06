import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, AlertTriangle, Mail, FileText, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRecoveriesReport } from "@/lib/api/reports";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { YearFilter, PayPeriodFilter, ClientTypeFilter, OrganizationFilter, PayrollTypeFilter } from "@/components/reports/ReportFilters";
import { useBranches } from "@/hooks/useBranches";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RecoveriesReportPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"missed" | "partial" | "notices">("missed");
  
  // Comprehensive filter states
  const [filters, setFilters] = useState({
    year: "",
    payPeriod: "",
    clientType: "",
    organizationName: "",
    payrollType: "",
    branchId: "",
  });

  const { data: branches } = useBranches();

  const { data: missedData, isLoading: missedLoading } = useQuery({
    queryKey: ["recoveries-report", "missed", filters],
    queryFn: () => getRecoveriesReport({ 
      reportType: "missed", 
      year: filters.year ? parseInt(filters.year) : undefined,
      payPeriod: filters.payPeriod || undefined,
      clientType: filters.clientType || undefined,
      organizationName: filters.organizationName || undefined,
      payrollType: filters.payrollType || undefined,
      branchId: filters.branchId || undefined,
    }),
  });

  const { data: partialData, isLoading: partialLoading } = useQuery({
    queryKey: ["recoveries-report", "partial", filters],
    queryFn: () => getRecoveriesReport({ 
      reportType: "partial",
      year: filters.year ? parseInt(filters.year) : undefined,
      payPeriod: filters.payPeriod || undefined,
      clientType: filters.clientType || undefined,
      organizationName: filters.organizationName || undefined,
      payrollType: filters.payrollType || undefined,
      branchId: filters.branchId || undefined,
    }),
  });

  const { data: noticesData, isLoading: noticesLoading } = useQuery({
    queryKey: ["recoveries-report", "notices", filters],
    queryFn: () => getRecoveriesReport({ 
      reportType: "notices",
      year: filters.year ? parseInt(filters.year) : undefined,
      payPeriod: filters.payPeriod || undefined,
      clientType: filters.clientType || undefined,
      organizationName: filters.organizationName || undefined,
      payrollType: filters.payrollType || undefined,
      branchId: filters.branchId || undefined,
    }),
  });

  const exportMissedToPDF = () => {
    const doc = new jsPDF("landscape");
    doc.setFontSize(18);
    doc.text("Missed Payments Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated: ${format(new Date(), "PPP")}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [["Loan ID", "Borrower", "Organization", "Due Date", "Expected", "Default Fee"]],
      body: (missedData?.schedules || []).map((schedule: any) => [
        schedule.loans?.loan_id || "N/A",
        `${schedule.loans?.borrowers?.given_name} ${schedule.loans?.borrowers?.surname}`,
        schedule.loans?.borrowers?.department_company || "N/A",
        format(new Date(schedule.due_date), "PP"),
        `K ${schedule.repaymentrs?.toLocaleString() || 0}`,
        `K ${schedule.default_charged?.toLocaleString() || 0}`,
      ]),
    });

    doc.save("missed-payments-report.pdf");
  };

  const exportNoticesToPDF = () => {
    const doc = new jsPDF("landscape");
    doc.setFontSize(18);
    doc.text("Recovery Notices Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated: ${format(new Date(), "PPP")}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [["Date", "Type", "Loan ID", "Borrower", "Sent By", "Status"]],
      body: (noticesData?.notices || []).map((notice: any) => [
        format(new Date(notice.sent_at), "PP"),
        notice.notice_type,
        notice.loan_id || "N/A",
        `${notice.loans?.borrowers?.given_name || ""} ${notice.loans?.borrowers?.surname || ""}`.trim(),
        notice.sent_by_name,
        notice.status,
      ]),
    });

    doc.save("recovery-notices-report.pdf");
  };

  const exportToExcel = (data: any, type: string) => {
    let worksheet;

    if (type === "notices") {
      worksheet = XLSX.utils.json_to_sheet(
        (data?.notices || []).map((notice: any) => ({
          "Date Sent": format(new Date(notice.sent_at), "PPP"),
          "Notice Type": notice.notice_type,
          "Loan ID": notice.loan_id || "N/A",
          "Borrower Name": `${notice.loans?.borrowers?.given_name || ""} ${notice.loans?.borrowers?.surname || ""}`.trim(),
          Organization: notice.loans?.borrowers?.department_company || "N/A",
          "Sent By": notice.sent_by_name,
          "Recipient Email": notice.recipient_email,
          Subject: notice.subject || "N/A",
          Status: notice.status,
        }))
      );
    } else {
      worksheet = XLSX.utils.json_to_sheet(
        (data?.schedules || []).map((schedule: any) => ({
          "Loan ID": schedule.loans?.loan_id || "N/A",
          "Borrower Name": `${schedule.loans?.borrowers?.given_name} ${schedule.loans?.borrowers?.surname}`,
          "File Number": schedule.loans?.borrowers?.file_number || "N/A",
          Organization: schedule.loans?.borrowers?.department_company || "N/A",
          "Due Date": format(new Date(schedule.due_date), "PPP"),
          "Pay Period": schedule.pay_period || "N/A",
          "Expected Amount": schedule.repaymentrs,
          "Amount Collected": schedule.repayment_received,
          Shortfall: schedule.balance,
          "Default Fee": schedule.default_charged,
        }))
      );
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, type === "notices" ? "Notices" : "Payments");
    XLSX.writeFile(workbook, `${type}-recovery-report.xlsx`);
  };

  const totalMissed = missedData?.summary.total || 0;
  const totalPartial = partialData?.summary.total || 0;
  const totalDefaultFees = (missedData?.summary.total_default_fees || 0) + (partialData?.summary.total_default_fees || 0);

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
          {activeTab === "notices" ? (
            <>
              <Button onClick={exportNoticesToPDF} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button onClick={() => exportToExcel(noticesData, "notices")} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={exportMissedToPDF} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button
                onClick={() => exportToExcel(activeTab === "missed" ? missedData : partialData, activeTab)}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </>
          )}
        </div>
      </div>

      <h1 className="text-2xl font-bold">Recoveries Report</h1>

      {/* Comprehensive Filters Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Filters (Apply to All Tabs)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <YearFilter value={filters.year} onChange={(year) => setFilters({...filters, year})} />
          <PayPeriodFilter value={filters.payPeriod} onChange={(payPeriod) => setFilters({...filters, payPeriod})} />
          <ClientTypeFilter value={filters.clientType} onChange={(clientType) => setFilters({...filters, clientType})} />
          <OrganizationFilter value={filters.organizationName} onChange={(organizationName) => setFilters({...filters, organizationName})} placeholder="Filter by organization" />
          <PayrollTypeFilter value={filters.payrollType} onChange={(payrollType) => setFilters({...filters, payrollType})} />
          
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
        </div>
        {Object.values(filters).some(v => v) && (
          <Button variant="ghost" size="sm" onClick={() => setFilters({ year: "", payPeriod: "", clientType: "", organizationName: "", payrollType: "", branchId: "" })} className="mt-4">
            Clear All Filters
          </Button>
        )}
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Missed Payments</p>
              <p className="text-3xl font-bold text-red-600">{totalMissed}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Partial Payments</p>
              <p className="text-3xl font-bold text-yellow-600">{totalPartial}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Default Fees</p>
              <p className="text-2xl font-bold">K {totalDefaultFees?.toLocaleString() || 0}</p>
            </div>
            <FileText className="w-10 h-10 text-orange-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Notices Sent</p>
              <p className="text-3xl font-bold">{noticesData?.summary.total || 0}</p>
            </div>
            <Mail className="w-10 h-10 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="missed">Missed Payments</TabsTrigger>
          <TabsTrigger value="partial">Partial Payments</TabsTrigger>
          <TabsTrigger value="notices">Notices & Communications</TabsTrigger>
        </TabsList>

        {/* Missed Payments Tab */}
        <TabsContent value="missed">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan ID</TableHead>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Pay Period</TableHead>
                  <TableHead className="text-right">Expected Amount</TableHead>
                  <TableHead className="text-right">Default Fee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {missedLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : (missedData?.schedules || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No missed payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  (missedData?.schedules || []).map((schedule: any) => (
                    <TableRow key={schedule.schedule_id}>
                      <TableCell className="font-medium">{schedule.loans?.loan_id || "N/A"}</TableCell>
                      <TableCell>
                        {schedule.loans?.borrowers?.given_name} {schedule.loans?.borrowers?.surname}
                      </TableCell>
                      <TableCell>{schedule.loans?.borrowers?.department_company || "N/A"}</TableCell>
                      <TableCell>{format(new Date(schedule.due_date), "PP")}</TableCell>
                      <TableCell>{schedule.pay_period || "N/A"}</TableCell>
                      <TableCell className="text-right">K {schedule.repaymentrs?.toLocaleString() || 0}</TableCell>
                      <TableCell className="text-right text-red-600 font-semibold">
                        K {schedule.default_charged?.toLocaleString() || 0}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Partial Payments Tab */}
        <TabsContent value="partial">
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
                  <TableHead className="text-right">Shortfall</TableHead>
                  <TableHead className="text-right">Default Fee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partialLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : (partialData?.schedules || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No partial payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  (partialData?.schedules || []).map((schedule: any) => (
                    <TableRow key={schedule.schedule_id}>
                      <TableCell className="font-medium">{schedule.loans?.loan_id || "N/A"}</TableCell>
                      <TableCell>
                        {schedule.loans?.borrowers?.given_name} {schedule.loans?.borrowers?.surname}
                      </TableCell>
                      <TableCell>{schedule.loans?.borrowers?.department_company || "N/A"}</TableCell>
                      <TableCell>{format(new Date(schedule.due_date), "PP")}</TableCell>
                      <TableCell className="text-right">K {schedule.repaymentrs?.toLocaleString() || 0}</TableCell>
                      <TableCell className="text-right">K {schedule.repayment_received?.toLocaleString() || 0}</TableCell>
                      <TableCell className="text-right text-yellow-600">K {schedule.balance?.toLocaleString() || 0}</TableCell>
                      <TableCell className="text-right text-red-600 font-semibold">
                        K {schedule.default_charged?.toLocaleString() || 0}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Notices Tab */}
        <TabsContent value="notices">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date Sent</TableHead>
                  <TableHead>Notice Type</TableHead>
                  <TableHead>Loan ID</TableHead>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Sent By</TableHead>
                  <TableHead>Recipient Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {noticesLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : (noticesData?.notices || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No notices found
                    </TableCell>
                  </TableRow>
                ) : (
                  (noticesData?.notices || []).map((notice: any) => (
                    <TableRow key={notice.id}>
                      <TableCell>{format(new Date(notice.sent_at), "PP")}</TableCell>
                      <TableCell className="capitalize">{notice.notice_type?.replace("_", " ")}</TableCell>
                      <TableCell className="font-medium">{notice.loan_id || "N/A"}</TableCell>
                      <TableCell>
                        {notice.loans?.borrowers?.given_name} {notice.loans?.borrowers?.surname}
                      </TableCell>
                      <TableCell>{notice.loans?.borrowers?.department_company || "N/A"}</TableCell>
                      <TableCell>{notice.sent_by_name}</TableCell>
                      <TableCell>{notice.recipient_email}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            notice.status === "sent" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {notice.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecoveriesReportPage;
