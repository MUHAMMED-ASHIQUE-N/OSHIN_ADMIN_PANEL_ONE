import React from "react";

type Props = {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
};

const YesNoBox: React.FC<Props> = ({ name, value, checked, onChange, label }) => (
  <td colSpan={3} className="py-2">
    <label className="flex items-center justify-center space-x-2 cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="appearance-none h-5 w-5 border border-primary rounded-full checked:bg-primary checked:border-primary cursor-pointer"
      />
      <span>{label}</span>
    </label>
  </td>
);

export default YesNoBox;