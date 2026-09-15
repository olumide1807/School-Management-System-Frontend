import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import BasicTable from '../../../../../../Components/Tables/BasicTable';
import SERVER from '../../../../../../Utils/server';
import Loader from '../../../../../loaders/Loader';
import EmptyTable from '../../../../../../Components/EmptyTable';

const StudentTab = () => {
    const [searchParams] = useSearchParams();
    const armId = searchParams.get('arm');

    const { data: studentsData, isPending } = useQuery({
        queryKey: ['class-students', armId],
        queryFn: async () => {
            const res = await SERVER.get(`student/class/${armId}`);
            return res?.data;
        },
        enabled: !!armId,
        retry: false,
    });

    const students = studentsData?.data || [];

    const headcells = [
        { key: "sn", name: "S/N" },
        { key: "surname", name: "Surname" },
        { key: "firstname", name: "First name" },
        { key: "othername", name: "Other name(s)" },
        { key: "gender", name: "Gender" },
    ];

    const tableData = students.map((s: any, i: number) => ({
        sn: i + 1,
        surname: s.surName || '-',
        firstname: s.firstName || '-',
        othername: s.otherName || '-',
        gender: s.gender === 'male' ? 'M' : s.gender === 'female' ? 'F' : '-',
    }));

    return (
        <div className='flex flex-col gap-4 w-full mt-3'>
            {isPending ? (
                <Loader />
            ) : students.length === 0 ? (
                <EmptyTable
                    message='No students in this class'
                    text='Students appear here once admitted into this class'
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

export default StudentTab;