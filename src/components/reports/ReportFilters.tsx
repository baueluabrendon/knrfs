import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface YearFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const YearFilter = ({ value, onChange }: YearFilterProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Year</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="All Years" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Years</SelectItem>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

interface QuarterFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const QuarterFilter = ({ value, onChange }: QuarterFilterProps) => (
  <div>
    <label className="text-sm font-medium mb-2 block">Quarter</label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="All Quarters" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Quarters</SelectItem>
        <SelectItem value="1">Q1 (Jan-Mar)</SelectItem>
        <SelectItem value="2">Q2 (Apr-Jun)</SelectItem>
        <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
        <SelectItem value="4">Q4 (Oct-Dec)</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

interface MonthFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const MonthFilter = ({ value, onChange }: MonthFilterProps) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Month</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="All Months" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Months</SelectItem>
          {months.map((month, index) => (
            <SelectItem key={month} value={(index + 1).toString()}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

interface PayPeriodFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const PayPeriodFilter = ({ value, onChange }: PayPeriodFilterProps) => {
  const payPeriods = Array.from({ length: 26 }, (_, i) => `Pay ${i + 1}`);

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Pay Period</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="All Pay Periods" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Pay Periods</SelectItem>
          {payPeriods.map((period) => (
            <SelectItem key={period} value={period}>
              {period}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

interface PayrollTypeFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const PayrollTypeFilter = ({ value, onChange }: PayrollTypeFilterProps) => (
  <div>
    <label className="text-sm font-medium mb-2 block">Payroll Type</label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="All Types" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Types</SelectItem>
        <SelectItem value="public_servant">Public Servant</SelectItem>
        <SelectItem value="company">Company</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

interface ClientTypeFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const ClientTypeFilter = ({ value, onChange }: ClientTypeFilterProps) => (
  <div>
    <label className="text-sm font-medium mb-2 block">Client Type</label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="All Client Types" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Client Types</SelectItem>
        <SelectItem value="Public Service">Public Service</SelectItem>
        <SelectItem value="Statutory Body">Statutory Body</SelectItem>
        <SelectItem value="Private Company">Private Company</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

interface BranchFilterProps {
  value: string;
  onChange: (value: string) => void;
  branches: Array<{ id: string; branch_name: string }>;
}

export const BranchFilter = ({ value, onChange, branches }: BranchFilterProps) => (
  <div>
    <label className="text-sm font-medium mb-2 block">Branch</label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="All Branches" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Branches</SelectItem>
        {branches.map((branch) => (
          <SelectItem key={branch.id} value={branch.id}>
            {branch.branch_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

export const DateRangeFilter = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeFilterProps) => (
  <>
    <div>
      <label className="text-sm font-medium mb-2 block">Start Date</label>
      <Input type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)} />
    </div>
    <div>
      <label className="text-sm font-medium mb-2 block">End Date</label>
      <Input type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)} />
    </div>
  </>
);

interface OrganizationFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const OrganizationFilter = ({ value, onChange, placeholder }: OrganizationFilterProps) => (
  <div>
    <label className="text-sm font-medium mb-2 block">Company/Department</label>
    <Input
      type="text"
      placeholder={placeholder || "Search organization..."}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

interface CheckboxFilterProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export const CheckboxFilter = ({ checked, onChange, label }: CheckboxFilterProps) => (
  <div className="flex items-end">
    <label className="flex items-center space-x-2 cursor-pointer">
      <Checkbox checked={checked} onCheckedChange={(checked) => onChange(checked as boolean)} />
      <span className="text-sm font-medium">{label}</span>
    </label>
  </div>
);
