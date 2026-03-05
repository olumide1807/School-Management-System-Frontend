import { Button } from '@mui/material';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FilterComponent from '../../../../../../Components/FilterComponent';
import BasicButton from '../../../../../../Components/Forms/BasicButton';
import SubjectTab from '../otherTabs/SubjectTab';
import StudentTab from '../otherTabs/StudentTab';
import AssignTeacherModal from '../../Modals/AssignTeacherModal';
import DeleteClassLevelModal from '../../Modals/DeleteClassLevelModal';


export const menuOptionsLevel = [
    {
      label: "JSS1",
      value: "JSS1",
    },
    {
      label: "JSS2",
      value: "JSS2",
    },
    {
      label: "JSS3",
      value: "JSS3",
    },
  ];
  
  export const menuOptionsArm = [
    {
      label: "A",
      value: "A",
    },
    {
      label: "B",
      value: "B",
    },
    {
      label: "C",
      value: "C",
    },
  ]

const ViewClassLevel = () => {
    const [choiceArm, setChoiceArm] = useState('A')
    const [choiceLevel, setChoiceLevel] = useState('JSS 1')

    const [subjectTab, setSubjectTab] = useState(true);
    const [studentTeb, setStudentTab] = useState(false);

    const [assignTeacher, setAssignTeacher] = useState(false);
    const [deleteArm, setDeleteArm] = useState(false);

    const handleStudentTab = () => {
        setStudentTab(true);
        setSubjectTab(false);
    }

    const handleSubjectTab = () => {
        setStudentTab(false);
        setSubjectTab(true);
    }


  return (
    <div className="flex flex-col">
        <div className="flex justify-between mb-5">
            <Link
                to="/school-management/academics"
                className="text-tertiary"
            >
                Back
            </Link>
        </div>

        <div className="flex flex-col md:items-center md:justify-between md:flex-row p-9 bg-bg-1 rounded-[10px] mb-6">
            <div className="flex flex-col gap-4 p-1.5 w-full">

                <div className="flex items-center gap-2">
                <FilterComponent
                    menuOptions={menuOptionsLevel}
                    choice={choiceLevel}
                    setChoice={setChoiceLevel}
                />
                <FilterComponent
                    menuOptions={menuOptionsArm}
                    choice={choiceArm}
                    setChoice={setChoiceArm}
                />
                </div>

                <div className="flex flex-col gap-6 md:flex-row  items-center justify-between">
                    <section className="flex md:items-center gap-4">
                        <span className='text-[14px] text-[#000]'>Class Teacher</span>
                        <strong className='text-[14px] text-[#000]'>No Class Teacher</strong>
                    </section>


                    <section className="flex items-center gap-4">
                        <BasicButton 
                            onClick={() => setAssignTeacher(true)}
                            color='tertiary' 
                            variant='contained' 
                            text='Assign Class Teacher'
                        />

                        <Button 
                        onClick={() => setDeleteArm(true)}
                        variant='contained' sx={{
                            color: '#fff',
                            backgroundColor: '#000',
                            paddingY: '8px',
                            paddingX: '15px',
                            borderRadius: '10px',
                            fontWeight: 500
                        }}>
                            Delete Arm
                        </Button>
                    </section>
                </div>
            </div>

        </div>

            <section className="w-[280px] sm:w-[400px] p-1 text-lg flex sm:m-0 m-auto">
                <menu
                className={`border-b-2 text-center cursor-pointer text-2xl ${
                    subjectTab ? "border-tertiary" : "border-bg-2"
                } w-1/2`}
                onClick={handleSubjectTab}
                >
                Subject (8)
                </menu>
                <menu
                className={`border-b-2 text-center cursor-pointer text-2xl ${
                    studentTeb ? "border-tertiary" : "border-bg-2"
                } w-1/2`}
                onClick={handleStudentTab}
                >
                Student (40)
                </menu>
            </section>

        { subjectTab ?
            <SubjectTab/>:
            <StudentTab/>
        }

        <AssignTeacherModal
            openModal={assignTeacher}
            closeModal={() => setAssignTeacher(false)}
        />
        
        <DeleteClassLevelModal
            openModal={deleteArm}
            closeModal={() => setDeleteArm(false)}
            btn2Name='Yes, Delete'
            desc2='This will remove this arms entirely
    		Are you sure you want to delete this class arms?'
        />
    </div>
  )
}

export default ViewClassLevel;
