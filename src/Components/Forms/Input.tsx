const Input = ({
  onChange,
  type = 'text',
  placeholder,
  otherClass,
  name,
  value,
  required,
  min,
  label,
  max,
  pattern
}) => {
  return (
    <div className="w-full">
      
       {label &&  <p className='mb-2.5 text-black'>{label}</p>}
      <div
        className={`h-[49px] text-[#222] ${
          otherClass
            ? otherClass
            : "rounded-[5px] border text-white border-white border-x-0 border-t-0"
        } flex items-center justify-between`}
      >
        <input
          className={`text-[15px] px-6 py-5 bg-transparent w-full focus:border-none border-none focus:outline-none outline-none`}
          type={type}
          onChange={onChange}
          placeholder={placeholder}
          name={name}
          value={value}
          required={required}
          min={min}
          max={max}
          pattern={pattern}
        />
      </div>
    </div>
  );
};

export default Input;
