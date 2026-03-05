import React from 'react'

const Searching = ({onClick}) => {
  return (
    <input type='text' placeholder='Search' className='p-2 text-xl md:text-[14px] md:p-[10px] rounded-[5px] outline outline-offset-1 outline-[#9999994a]' onClick={onClick}/>
  )
}

export default Searching;
