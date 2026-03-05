import Input from "./Input";

const InputBox = ({ value, onChange, maxLength, onInput, onKeyDown }) => {
  return (
    <Input
      type="tel"
      className="p-4 border-none h-16 w-16 text-3xl text-[#222]"
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      onInput={onInput}
      onKeyDown={onKeyDown}
    />
  );
};

export default InputBox;
