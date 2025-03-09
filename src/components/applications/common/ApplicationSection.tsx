
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
  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className={`grid grid-cols-${columns} gap-2`}>
        {fields.map((field, index) => (
          <p key={index}>
            <span className="font-medium">{field.label}:</span> {field.value}
          </p>
        ))}
      </div>
    </div>
  );
};

export default ApplicationSection;
