import React from "react";

type Props = {
  label: string;
  value: string;
  onChange: (val: string) => void;
};

const DottedLineInput: React.FC<Props> = ({ label, value, onChange }) => (
  <div className="flex items-baseline space-x-2 w-full">
    <label className="text-sm text-gray-800 whitespace-nowrap font-medium">{label}:</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border-b border-dotted border-gray-500 focus:outline-none focus:border-solid focus:border-primary"
    />
  </div>
);

export default DottedLineInput;