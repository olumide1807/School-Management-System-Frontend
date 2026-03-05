

const OtpInput = ({ value, onChange, maxLength, onInput, onKeyDown }) => {
    return (
      <input 
        type="tel" 
        className="p-4 border-none h-16 w-16 text-2xl text-[#222]" 
        value={value} 
        onChange={onChange} 
        maxLength={maxLength}
        onInput={onInput}
        onKeyDown={onKeyDown}
        min={0}
        required
        onKeyDownCapture={(e) => {
            if (isNaN(Number(e.key)) && e.key !== "Backspace") {
              e.preventDefault();
          }
        }}
      />
    )
  }
  
export default OtpInput
