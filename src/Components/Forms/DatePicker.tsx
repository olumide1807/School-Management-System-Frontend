import { DatePicker } from '@mui/x-date-pickers';
import { useState } from 'react';

const DatePickerField = ({label, maxDate, minDate, placeholder, defaultValue, dateRange, name, onChange, value: externalValue }) => {

    const [internalValue, setInternalValue] = useState(null);
    const value = externalValue !== undefined && externalValue !== '' ? (externalValue instanceof Date ? externalValue : new Date(externalValue)) : internalValue;

  return (
    <div className="w-full border-black">
        {label && (
		<p className='mb-2.5 text-black'>{label}</p>)}
        <div className={`rounded-xl md:rounded-2xl bg-white w-full }`}>

        <DatePicker
            sx={{
              width: '100%',
              borderRadius: "10px",
              border: "1px solid #ababab",
            }}
            maxDate={maxDate}
            minDate={minDate}
            name={name}
            placeholder={placeholder}
            format="dd/MM/yyyy"
            value={value && !isNaN(new Date(value).getTime()) ? new Date(value) : null}
            disableOpenPicker={false}
            onChange={(date) => {
              setInternalValue(date);
              onChange(date);
            }}
        />

        </div>
    </div>
  )
}

export default DatePickerField;