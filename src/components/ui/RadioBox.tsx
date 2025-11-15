import React from "react";

type Props = {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
};

const RadioBox: React.FC<Props> = ({ name, value, checked, onChange }) => (
  <td className="text-center py-2">
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      className="appearance-none h-5 w-5 rounded-full border border-primary checked:bg-primary checked:border-primary cursor-pointer"
    />
  </td>
);

export default RadioBox;