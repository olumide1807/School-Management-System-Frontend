import React from "react";
interface CustomSelectProps {
  label?: string;
  name?: string;
  value?: string;
  onChange?: (
    event: React.ChangeEvent<HTMLSelectElement>,
    selectedValue: string
  ) => void;
  selectOption?: { label: string; value: string }[];
  required?: boolean;
  placeholder?: string;
  setstate?: (value: string) => void;
  containerclass?: string;
  otherclass?: string;
  arrowColor?: string;
  customIcon?: boolean;
  centerContent?: boolean;
}
function CustomSelect({
  label,
  name,
  value,
  onChange,
  selectOption,
  required,
  placeholder,
  setstate,
  containerclass,
  otherclass,
  arrowColor = "#000000",
  customIcon = true,
  centerContent = false,
  ...props
}: CustomSelectProps) {
  const svgString = encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${arrowColor}'>
      <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'></path>
    </svg>
  `);
  return (
    <div className={` ${otherclass ? otherclass : "md:w-[403px] w-full"}`}>
      <label htmlFor={name} className="block mb-2 font-bold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(event) => {
          const selectedValue = event.target.value;
          if (onChange) {
            onChange(event, selectedValue);
          }
          if (setstate) {
            setstate(selectedValue);
          }
        }}
        required={required}
        style={{
          ...(customIcon && {
            WebkitAppearance: "none",
            MozAppearance: "none",
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml,${svgString}")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: centerContent
              ? "center right 2.8rem"
              : "right 1.5rem center",
            backgroundSize: "1em 1.5em",
            // width: "max-content",
            // paddingRight: "3em",
          }),
          ...(centerContent && {
            textAlign: "center",
          }),
        }}
        className={`${containerclass} text-dropdownColor w-full px-3 py-2  border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px] focus:outline-none focus:border-blue-500`}
        {...props}
      >
        <option value="" className="text-dropdownColor">
          {placeholder}
        </option>
        {selectOption?.map((option, index) => (
          <option
            key={index}
            // value={option.value || option}
            value={option.value}
            className="text-dropdownColor"
          >
            {option.label}
            {/* {option.label || option} */}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CustomSelect;
