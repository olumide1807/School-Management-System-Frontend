/* eslint-disable react/prop-types */
import InputField from "./InputField";

export default function SearchInput(props) {
  return (
    <InputField
      {...props}
      required={false}
      placeholder={props.placeholder || "Search"}
      className={`${props.className} py-2 outline-none`}
    />
  );
}
