/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import { useState, forwardRef } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";

const InputField = forwardRef(
  (
    {
      type = "text",
      handleFocus,
      placeholder = "",
      otherClass,
      label,
      required,
      asterisk,
      prefixIcon,
      suffixIcon,
      onChange,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <div className="w-full">
        {label && (
          <p
            className={`mb-2.5 ${props.labelColor || "text-black"} ${
              props.important ? "compulsory-input" : ""
            }`}
          >
            {label}
            <span className="text-asteriskRed">{asterisk}</span>
          </p>
        )}

        <div
          className={`md:h-[40px] h-[45px] ${
            otherClass
              ? otherClass
              : "rounded-[5px] border border-white border-x-0 border-t-0"
          } flex items-center justify-between`}
        >
          {prefixIcon && (
            <span className="select-none -ml-4 h-12 w-12 focus-within:!h-2 rounded-l-xl flex justify-center items-center !-my-4 md:!-my[21px] !hfull mr-1 bg-neutral-02">
              <svg
                width="23"
                height="19"
                viewBox="0 0 23 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21.7196 17.0609L16.4005 13.9899M16.4005 13.9899C16.9258 13.0801 17.2668 12.0757 17.4039 11.0341C17.5411 9.99245 17.4717 8.93402 17.1998 7.91922C16.9279 6.90442 16.4587 5.95311 15.8192 5.11961C15.1796 4.28611 14.3821 3.58674 13.4723 3.06144C12.5624 2.53614 11.558 2.19519 10.5164 2.05806C9.47478 1.92093 8.41636 1.9903 7.40156 2.26222C6.38675 2.53413 5.43544 3.00327 4.60194 3.64283C3.76845 4.2824 3.06908 5.07987 2.54378 5.98972C1.48289 7.82724 1.1954 10.0109 1.74456 12.0604C2.29371 14.1099 3.63454 15.8573 5.47206 16.9182C7.30958 17.9791 9.49328 18.2666 11.5428 17.7174C13.5923 17.1683 15.3396 15.8274 16.4005 13.9899Z"
                  stroke="#CDCDCD"
                  strokeOpacity="0.4"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
          {type === "tel" && <span className="ml-3">+234</span>}
          <input
            ref={ref}
            className={`text-[15px] text-inherit px-6 py-5 bg-transparent w-full focus:border-none border-none focus:outline-none outline-none`}
            type={showPassword ? "text" : type}
            onChange={onChange}
            placeholder={placeholder}
            onFocus={handleFocus}
            maxLength={type === "tel" || props.acc ? 10 : 100}
            value={value}
            defaultValue={defaultValue}
            required={required}
            {...props}
            onKeyDownCapture={(e) => {
              if (type === "tel" || props.acc) {
                if (isNaN(Number(e.key)) && e.key !== "Backspace") {
                  e.preventDefault();
                }
              }
              // if ((e.key !== '')) {
              // 	if (e.key === 'Enter') {
              // 		dispatch(setSearch({ payload: e.target.value }))
              // 		setSearchItem()
              // 		return;
              // 	}
              // }
              // console.log("search Item");
            }}
          />
          {suffixIcon && (
            <IconButton
              sx={{
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "#fff",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1);",
              }}
            >
              {suffixIcon}
            </IconButton>
          )}
          {type === "password" && (
            <button
              type="button"
              className="select-none ml-6"
              onClick={() => setShowPassword(!showPassword)}
            >
              <div className="px-4">
                {showPassword ? (
                  <VisibilityOffIcon color="primary" />
                ) : (
                  <VisibilityIcon color="primary" />
                )}
              </div>
            </button>
          )}
        </div>
      </div>
    );
  }
);

export default InputField;
