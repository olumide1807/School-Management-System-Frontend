import React, { useState } from 'react'
import BasicButton from '../../../../../../Components/Forms/BasicButton';
import { InputField, SearchInput } from '../../../../../../Components/Forms';
import TableComponent from '../../../../../../Components/Tables';
import { Checkbox, FormControlLabel, Button } from '@mui/material';
import Modal from "../../../../../../Components/Modals";
import MessageModal from "../../../../../../Components/Modals/MessageModal";
import AssignTeacherModal from '../../Modals/AssignTeacherModal';
import Searching from '../../../../../../Components/Forms/Search';




const tableData = Array(5)
.fill("")
.map((_, i) => ({
    sn: i + 1,
    name: "English language",
    teacher: "Faith Olaniye",
    compulsory: <Checkbox/>,
    optional:  <Checkbox/>,
    actions: '',
    id: `row_${i}`,
}));

const options = ["JSS 1", "JSS 2", "JSS 3l"];


const SubjectTab = () => {

    const [openAddSubject, setOpenAddSubject] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [openDeleteSubject, setOpenDeleteSubject] = useState(false);
    const [assignTeacher, setAssignTeacher] = useState(false);


    const headcells = [
        {
            key: "sn",
            name: "S/N",
        },
        {
            key: "name",
            name: "Subject Name",
        },
        {
            key: "teacher",
            name: "Subject Teacher",
        },
        {
            key: "compulsory",
            name: "Compulsory",
        },
        {
            key: "optional",
            name: "Optional",
        },
        {
            key: 'actions',
            name: [
                {
                    name: "Edit subject",
                    handleClick: () => {
                        setIsEditing(true);
                        setOpenAddSubject(true);
                    },
                },
                {
                    name: "Assign Subject Teacher",
                    handleClick: () => {
                       setAssignTeacher(true);
                    },
                },
                {
                    name: "Remove Subject",
                    handleClick: () => {
                        setOpenDeleteSubject(true);
                    },
                },
            ]
        }
    ]

  return (
    <>
    <div className='flex flex-col gap-4 w-full mt-3'>

        <div className="flex flex-col md:flex-row gap-2 md:justify-between md:items-center p-0 md:p-2 w-full">
            <div className="my-3 md:m-0">
                <SearchInput 
                    className="w-[1/2] md:w-full"
					otherClass="border border-[#ABABAB] rounded-[5px] px-4 md:max-w-[420px]"
                />
            </div>

            <div className="flex flex-row justify-between items-center gap-2 md:mr-4">
                <Button variant='outlined' sx={{
                    paddingY: '8px',
                    paddingX: '15px',
                    borderRadius: '10px',
                    fontWeight: 500
                }}>
                    Subject Template
                </Button>

                <BasicButton 
                    onClick={() => setOpenAddSubject(true)} 
                    text='Add Subject' 
                    variant='contained' color='tertiary'
                />
            </div>
        </div>

        <div className="flex flex-col w-full gap-4">
            <p className='text-xl text-black'>Select subjects that are compulsory for registration</p>

            <TableComponent
                headcells={headcells}
                message='No Created Subject'
                tableData={tableData}
                btn1Name='Subject Template'
                btn2Name='Add Subject'
                handleClick1={() => setOpenAddSubject(true)}
                    // handleClick2={}
            />
        </div>
    </div>

        {/* // ************************Modal ******** */}
        
        <Modal
            title={isEditing ? "Edit Subject" : "Add subject"}
            openModal={openAddSubject}
            closeModal={() => setOpenAddSubject(false)}
        >
            <form className="flex flex-col gap-y-[57px]">
            <div className="flex flex-col gap-y-6">
            <InputField
                name="subject_name"
                placeholder="Type subject name"
                otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
            />
            
            <InputField
                name="subject_name"
                placeholder="Select class"
                otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
            />
            {/* <AutocompleteField
                name="teacher"
                placeholder="Select Class"
                selectOption={options}
            /> */}

            <p className="text-xl text-black ">Make Subject:</p>

            <div className="flex">
                <FormControlLabel
                    control={<Checkbox
                    // checked={updateTerm}
                    onChange={() => {}}
                    />}
                    label={<p className="text-[#5A5A5A] text-lg">Compulsory</p>}
                />

                <FormControlLabel
                control={<Checkbox 
                // checked={updateTerm}
                    onChange={() => {}}
                    />}
                    label={<p className="text-[#5A5A5A] text-lg">Optional</p>}
                />
            </div>

            <Button
                color="tertiary"
                variant="contained"
                type="submit"
                sx={{
                    color: "white",
                    borderRadius: "10px",
                    paddingY: "12px",
                    width: 'max-content'
                }}
            >
                {isEditing ? "Save changes" : "Add Subject"}
            </Button>
            </div>
            </form>
        </Modal> 

        <AssignTeacherModal
            openModal={assignTeacher}
            closeModal={() => setAssignTeacher(false)}
        />

        <MessageModal
            column
            desc="Are you sure you want to remove English language from this class?"
            openModal={openDeleteSubject}
            closeModal={() => setOpenDeleteSubject(false)}
        />
    </>
  )
}

export default SubjectTab;

