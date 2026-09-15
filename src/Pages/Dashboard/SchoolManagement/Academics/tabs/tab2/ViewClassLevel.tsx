import { Button } from '@mui/material';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import BasicButton from '../../../../../../Components/Forms/BasicButton';
import SubjectTab from '../otherTabs/SubjectTab';
import StudentTab from '../otherTabs/StudentTab';
import AssignTeacherModal from '../../Modals/AssignTeacherModal';
import DeleteClassLevelModal from '../../Modals/DeleteClassLevelModal';
import { useQuery } from '@tanstack/react-query';
import SERVER from '../../../../../../Utils/server';


const ViewClassLevel = () => {
    const [searchParams] = useSearchParams();
    const armId = searchParams.get('arm');
    const levelId = searchParams.get('level');
    const className = searchParams.get('name'); // e.g. "JSS1 A"

    const [subjectTab, setSubjectTab] = useState(true);
    const [studentTab, setStudentTab] = useState(false);
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

    const { data: armData } = useQuery({
        queryKey: ['class-arm', armId],
        queryFn: async () => {
            const res = await SERVER.get(`class/arm/${armId}`);
            return res?.data;
        },
        enabled: !!armId,
    });

    const { data: staffData } = useQuery({
        queryKey: ['all-staff'],
        queryFn: async () => {
            const res = await SERVER.get('staff');
            return res?.data;
        },
    });

    const arm = armData?.data;
    const allStaff = staffData?.data || [];

    const classTeacher = arm?.assignedTeacher
        ? allStaff.find((s: any) => s._id === arm.assignedTeacher)
        : null;
    const classTeacherName = classTeacher
        ? `${classTeacher.firstName || ''} ${classTeacher.surname || classTeacher.lastName || ''}`.trim()
        : 'Not assigned';


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
                <h2 className="text-2xl font-semibold text-black">{className}</h2>

                <div className="flex flex-col gap-6 md:flex-row items-center justify-between">
                    <section className="flex md:items-center gap-4">
                        <span className='text-[14px] text-[#000]'>Class Teacher:</span>
                        <strong className='text-[14px] text-[#000]'>{classTeacherName}</strong>
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
                            backgroundColor: '#e53e3e',
                            paddingY: '8px',
                            paddingX: '15px',
                            borderRadius: '10px',
                            fontWeight: 500,
                            '&:hover': { backgroundColor: '#c53030' }
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
            Subjects
            </menu>
            <menu
            className={`border-b-2 text-center cursor-pointer text-2xl ${
                studentTab ? "border-tertiary" : "border-bg-2"
            } w-1/2`}
            onClick={handleStudentTab}
            >
            Students
            </menu>
        </section>

        { subjectTab ?
            <SubjectTab/>:
            <StudentTab/>
        }

        <AssignTeacherModal
            openModal={assignTeacher}
            closeModal={() => setAssignTeacher(false)}
            classArmId={armId}
            currentTeacherId={arm?.assignedTeacher || ""}
            className={className}
        />
        
        <DeleteClassLevelModal
            openModal={deleteArm}
            closeModal={() => setDeleteArm(false)}
            btn2Name='Yes, Delete'
            desc2={`This will remove "${className}" entirely. Are you sure?`}
        />
    </div>
  )
}

export default ViewClassLevel;