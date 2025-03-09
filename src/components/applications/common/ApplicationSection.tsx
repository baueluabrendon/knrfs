
import { ReactNode } from "react";

export interface SectionField {
  label: string;
  value: ReactNode;
}

interface ApplicationSectionProps {
  title: string;
  fields: SectionField[];
  columns?: number;
}

/**
 * Generic component for displaying a section of application data
 */
const ApplicationSection = ({ title, fields, columns = 2 }: ApplicationSectionProps) => {
  // Dynamically create the grid template class based on columns
  const gridClass = `grid grid-cols-1 md:grid-cols-${columns} gap-3`;
  
  return (
    <div className="bg-gray-50 p-4 rounded-md mb-4">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className={gridClass}>
        {fields.map((field, index) => (
          <div key={index} className="mb-2">
            <p className="text-sm font-medium text-gray-700">{field.label}</p>
            <p className="text-sm text-gray-900">{field.value || '-'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationSection;
