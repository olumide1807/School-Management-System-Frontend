import React from "react";
interface CustomInputProps {
  label?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  otherclass?: string;
  containerclass?: string;
}
function CustomInput({
  label,
  name,
  value,
  onChange,
  type,
  required,
  placeholder,
  otherclass,
  containerclass,
  ...props
}: CustomInputProps) {
  return (
    <div
      className={`${containerclass ? containerclass : "md:w-[403px] w-full"} `}
    >
      <label htmlFor={name} className="block mb-2 font-bold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`${otherclass}  border-[#ABABAB] bg-[#F7F8F8] rounded-[10px] w-full px-3 py-2 text-gray-700 border focus:outline-none focus:border-blue-500`}
        {...props}
      />
    </div>
  );
}

export default CustomInput;
