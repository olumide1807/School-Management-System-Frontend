import { DatePicker } from '@mui/x-date-pickers';
import { useState } from 'react';

const DatePickerField = ({label, maxDate, minDate, placeholder, defaultValue, dateRange, name, onChange }) => {

    const [value, setValue] = useState(null);

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
            value={value}
            disableOpenPicker={false}
            onChange={(date)=> onChange(date)}
            setValue={setValue}
        />

        </div>
    </div>
  )
}

export default DatePickerField
