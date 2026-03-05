import React from 'react'
import BasicButton from './Forms/BasicButton';
import { Button } from '@mui/material';

const EmptyTable = ({onClick, message, text, btn2, text2, onClick2}) => {
  return (
    <div className='flex w-full items-center justify-center h-[280px]'>
        <div className="flex flex-col items-center gap-4">
            <p className='mb-[24px] text-xl text-[#000] '>{message}</p>
            <BasicButton variant='contained' color='tertiary' onClick={onClick} text={text}/>

          { btn2 &&

            <Button
							color="tertiary"
							variant="outlined"
							onClick={onClick2}
							sx={{
								color: "tertiary",
								borderRadius: "10px",
								textTransform: "capitalize",
								paddingY: "12px",
                paddingX: '15px'
							}}
						>
							{text2}
						</Button>
          }
        </div>
    </div>
  )
}

export default EmptyTable;
