/* eslint-disable react/prop-types */
import { useFormContext, get } from "react-hook-form";
import InputField from "./InputField";

export default function ValidatedInput({
  name,
  errDesc,
  required,
  showErrMsg = true,
  errMsg,
  rules,
  ...otherProps
}) {
  const { register, formState, watch } = useFormContext({
    mode: "all",
  });
  const { errors } = formState;
  const error = get(errors, name);
  // const value = watch(name);
  return (
    <>
      {/* <div className=""> */}
      <InputField
        {...otherProps}
        {...register(name, {
          required: required ? `${errDesc ? errDesc : name} is required` : "",
          ...(otherProps.type === "password"
            ? {
                minLength: {
                  value: 8,
                  message: "Password must have at least 8 characters",
                },
                pattern: {
                  value: /(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/,
                  message:
                    "Password must have at least 1 uppercase, lowercase, number and a symbol",
                },
              }
            : {}),
          ...rules,
        })}
        // value={value}
        // defaultValue={value}
      />
      {showErrMsg && error && (
        <div className="text-red-600 ">{error.message || errMsg}</div>
      )}
      {/* </div> */}
    </>
  );
}
