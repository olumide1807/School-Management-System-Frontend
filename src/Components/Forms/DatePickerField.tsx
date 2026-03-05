/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from "react";
import { DatePicker } from "@mui/x-date-pickers";
import { Controller, get, useForm } from "react-hook-form";

const DatePickerField = ({
  maxDate,
  minDate,
  width = "100%",
  name,
  asterisk,
  value,
  label,
  labelBreakLine,
  labelDesc,
  placeholder,
  bordered = false,
  required = true,
  bgColor,
  className,
  defaultValue,
  ...props
}) => {
  const methods = useForm({
    mode: "all",
  });
  const { formState, control } = methods;
  const { errors } = formState;

  const error = get(errors, name);
  const [dateRange, setDateRange] = useState(null);

  return (
    <div className="w-full">
      {label && (
        <p className={`mb-2.5 ${props.labelColor || "text-black"}`}>
          {label} <span className="text-asteriskRed">{asterisk}</span>{" "}
        </p>
      )}
      <div
        className={`rounded-xl md:rounded-2xl bg-white w-full ${props.className}`}
      >
        <Controller
          name={name}
          sx={{ width: "100%" }}
          rules={{
            required: "This field is required",
          }}
          control={control}
          render={({ field: { onChange } }) => {
            return (
              <DatePicker
                sx={{
                  width,
                  borderRadius: "10px",
                  border: "1px solid #ababab",
                }}
                maxDate={maxDate}
                minDate={minDate}
                placeholder={placeholder}
                format="dd/MM/yyyy"
                value={dateRange}
                // value={dateRange || (defaultValue && new Date(defaultValue))}
                disableOpenPicker={false}
                className={`${
                  bgColor || "!bg-white"
                } rounded-xl md:rounded-2xl ${className}`}
                // onChange={(date) => {
                //   setDateRange(new Date(date));
                //   console.log("dateRange", date);
                //   if (props.onDateChange) {
                //     props.onDateChange(date);
                //   }
                //   onChange(date);
                // }}
                onChange={(date) => {
                  setDateRange(date ? new Date(date) : null);
                  console.log(date);
                  if (props.onDateChange) {
                    props.onDateChange(date);
                  }
                  onChange(date);
                }}
                {...props}
              />
            );
          }}
        />
      </div>
      {error && <div className="pt-[-10rem] ">{error.message || ""}</div>}
    </div>
  );
};
export default DatePickerField;
