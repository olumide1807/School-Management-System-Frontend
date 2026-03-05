import React from 'react'
import BasicButton from '../../../../../../Components/Forms/BasicButton'
import { SearchInput } from '../../../../../../Components/Forms'
import TableComponent from '../../../../../../Components/Tables';
import { Button } from '@mui/material';

const StudentTab = () => {

    const headcells = [
        {
            key: "sn",
            name: "S/N",
        },
        {
            key: "name",
            name: "Surname",
        },
        {
            key: "firstname",
            name: "First name",
        },
        {
            key: "othername",
            name: "Other name(s)",
        },
        {
            key: "gender",
            name: "Gender",
        }
    ]

    const tableData = Array(5)
        .fill("")
        .map((_, i) => ({
            sn: i + 1,
            name: "James",
            firstname: "Mujeeb",
            othername: 'Adeola',
            gender: 'M',
            id: `row_${i}`,
    }));

  return (
    <div className='flex flex-col mt-3 w-full'>
         <div className="flex justify-between items-center p-2 w-full">
            <SearchInput
                 className="md:w-full"
				 otherClass="border border-[#ABABAB] gap-2 rounded-[5px] px-4 md:max-w-[420px]"
            />

            <Button
                color="tertiary"
                variant="contained"
                // onClick={() => setOpenAddSubject(true)
                sx={{
                    color: "white",
                    borderRadius: "10px",
                    paddingY: "10px",
                    paddingX: '13px',
                    fontSize: '12px',
                    fontWeight: 500,
                    marginLeft: '13px'
                }}

            >
                Download
            </Button>
        </div>

        <div className="">
            <TableComponent
                message='You have no student for this class'
                headcells={headcells}
                tableData={tableData}
                // handleClick2={}
                btn2Name='Add Student'
            />
        </div>

    </div>
  )
}

export default StudentTab;
