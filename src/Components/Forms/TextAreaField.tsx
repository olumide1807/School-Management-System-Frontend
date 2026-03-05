/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import { forwardRef } from "react";

const TextAreaField = forwardRef(
  (
    {
      label,
      handleChange,
      handleFocus,
      placeholder,
      asterisk,
      defaultValue,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <p
            className={`mb-2.5 ${props.labelColor || "text-black"} ${
              props.important ? "compulsory-input" : ""
            }`}
          >
            {label} <span className="text-asteriskRed">{asterisk}</span>
          </p>
        )}
        <div
          className={`border text-placeholder ${props.otherClass} border-[#ABABAB] rounded-[10px]`}
        >
          <textarea
            className={`text-[15px] min-h-[140px] text-black px-6 py-5 bg-transparent w-full border-none focus:outline-none outline-none`}
            onChange={handleChange}
            placeholder={placeholder}
            onFocus={handleFocus}
            defaultValue={defaultValue}
            ref={ref}
            {...props}
          />
        </div>
      </div>
    );
  }
);

export default TextAreaField;
