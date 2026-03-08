import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BasicButton from '../../../../../../Components/Forms/BasicButton';
import { SearchInput } from '../../../../../../Components/Forms';
import BasicTable from '../../../../../../Components/Tables/BasicTable';
import SERVER from '../../../../../../Utils/server';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useGetAllSubjects, useClassArms, useClassLevels } from '../../../../../../services/api-call';
import Loader from '../../../../../loaders/Loader';
import EmptyTable from '../../../../../../Components/EmptyTable';


const SubjectTab = () => {
    const [searchParams] = useSearchParams();
    const armId = searchParams.get('arm');

    const allSubjects = useGetAllSubjects();
    const subjects = allSubjects?.data?.data?.data || [];

    // Fetch specific subjects for this class arm
    const { data: armSubjectsData, isPending } = useQuery({
        queryKey: ['arm-subjects', armId],
        queryFn: async () => {
            const res = await SERVER.get(`subject/all/${armId}`);
            return res?.data;
        },
        enabled: !!armId,
        retry: false,
    });

    const armSubjects = armSubjectsData?.data || [];

    // Get subject name from subject ID
    const getSubjectName = (subjectId: string) => {
        const subject = subjects.find((s: any) => s._id === subjectId);
        return subject?.subjectName || 'Unknown';
    };

    const headcells = [
        { key: "sn", name: "S/N" },
        { key: "name", name: "Subject Name" },
        { key: "teacher", name: "Subject Teacher" },
        { key: "code", name: "Subject Code" },
    ];

    const tableData = armSubjects.map((sp: any, i: number) => ({
        sn: i + 1,
        name: getSubjectName(sp.subjectId),
        teacher: sp.subjectTeacherId || 'Not assigned',
        code: sp.subjectCode || '-',
    }));

    return (
        <div className='flex flex-col gap-4 w-full mt-3'>
            {isPending ? (
                <Loader />
            ) : armSubjects.length === 0 ? (
                <EmptyTable
                    message='No subjects assigned to this class'
                    text='Go to Subjects tab to add'
                    onClick={() => {}}
                />
            ) : (
                <BasicTable
                    headcells={headcells}
                    tableData={tableData}
                    onClick={() => {}}
                    sideIcon={false}
                />
            )}
        </div>
    );
}

export default SubjectTab;