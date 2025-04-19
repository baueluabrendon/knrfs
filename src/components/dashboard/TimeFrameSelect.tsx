
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimeFrameSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

const TimeFrameSelect = ({ value, onValueChange }: TimeFrameSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select time frame" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="weekly">Weekly</SelectItem>
        <SelectItem value="fortnightly">Fortnightly</SelectItem>
        <SelectItem value="monthly">Monthly</SelectItem>
        <SelectItem value="yearly">Yearly</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default TimeFrameSelect;
