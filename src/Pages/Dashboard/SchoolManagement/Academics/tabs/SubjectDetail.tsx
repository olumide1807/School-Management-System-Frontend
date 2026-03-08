import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Modal from "../../../../../Components/Modals";
import BasicTable from "../../../../../Components/Tables/BasicTable";
import { useClassArms, useClassLevels } from "../../../../../services/api-call";
import SERVER from "../../../../../Utils/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { toastOptions } from "../../../../../Utils/toastOptions";
import Loader from "../../../../loaders/Loader";
import EmptyTable from "../../../../../Components/EmptyTable";


const SubjectDetail = () => {
    const [searchParams] = useSearchParams();
    const subjectId = searchParams.get('subject');
    const subjectName = searchParams.get('subjectName');

    const queryClient = useQueryClient();

    const [openAddToClass, setOpenAddToClass] = useState(false);
    const [openAssignTeacher, setOpenAssignTeacher] = useState(false);
    const [selectedArmId, setSelectedArmId] = useState("");
    const [selectedTeacherId, setSelectedTeacherId] = useState("");
    const [selectedSpecific, setSelectedSpecific] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    const allArms = useClassArms();
    const allLevels = useClassLevels();
    const classArms = allArms?.data?.data?.data || [];
    const classLevels = allLevels?.data?.data?.data || [];

    // Fetch specific subjects (class assignments) for this subject
    const { data: specificsData, isPending } = useQuery({
        queryKey: ['subject-specifics', subjectId],
        queryFn: async () => {
            const res = await SERVER.get(`subject/${subjectId}/all`);
            return res?.data;
        },
        enabled: !!subjectId,
        retry: false,
    });

    // Fetch staff for teacher assignment
    const { data: staffData } = useQuery({
        queryKey: ['all-staff'],
        queryFn: async () => {
            const res = await SERVER.get('staff');
            return res?.data;
        },
    });

    const specifics = specificsData?.data || [];
    const staff = staffData?.data || [];

    // Helper to get class arm label
    const getArmLabel = (classArmId: string) => {
        const arm = classArms.find((a: any) => a._id === classArmId);
        if (!arm) return 'Unknown';
        const level = classLevels.find((l: any) => l._id === arm.classLevelId);
        return `${level?.levelShortName || ''} ${arm.armName?.toUpperCase() || ''}`.trim();
    };

    // Helper to get teacher name
    const getTeacherName = (teacherId: string) => {
        if (!teacherId) return 'Not assigned';
        const teacher = staff.find((s: any) => s._id === teacherId);
        return teacher ? `${teacher.firstName || ''} ${teacher.surname || teacher.lastName || ''}`.trim() : 'Not assigned';
    };

    // Build table data
    const headcells = [
        { key: "sn", name: "S/N" },
        { key: "class", name: "Class" },
        { key: "teacher", name: "Teacher" },
        { key: "subjectCode", name: "Subject Code" },
    ];

    const tableData = specifics.map((sp: any, i: number) => ({
        sn: i + 1,
        class: getArmLabel(sp.classArmId),
        teacher: getTeacherName(sp.subjectTeacherId),
        subjectCode: sp.subjectCode || '-',
        _raw: sp,
    }));

    // Filter out class arms that already have this subject
    const assignedArmIds = specifics.map((sp: any) => sp.classArmId);
    const availableArms = classArms.filter((arm: any) => !assignedArmIds.includes(arm._id));

    const handleAddToClass = async () => {
        if (!selectedArmId) return;
        setSaving(true);
        try {
            await SERVER.post(`subject/${selectedArmId}`, {
                subjectName: subjectName,
            });
            toast.success('Subject added to class!', toastOptions);
            queryClient.invalidateQueries({ queryKey: ['subject-specifics', subjectId] });
            queryClient.invalidateQueries({ queryKey: ['all-specific-subjects'] });
            setSelectedArmId("");
            setOpenAddToClass(false);
        } catch (error: any) {
            const errMsg = error?.response?.data?.error || 'Failed to add subject to class';
            toast.error(errMsg, toastOptions);
        } finally {
            setSaving(false);
        }
    };

    const handleAssignTeacher = async () => {
        if (!selectedSpecific || !selectedTeacherId) return;
        setSaving(true);
        try {
            await SERVER.put(`subject/specific/${selectedSpecific._id}`, {
                subjectTeacherId: selectedTeacherId,
            });
            toast.success('Teacher assigned!', toastOptions);
            queryClient.invalidateQueries({ queryKey: ['subject-specifics', subjectId] });
            setSelectedTeacherId("");
            setSelectedSpecific(null);
            setOpenAssignTeacher(false);
        } catch (error: any) {
            const errMsg = error?.response?.data?.error || 'Failed to assign teacher';
            toast.error(errMsg, toastOptions);
        } finally {
            setSaving(false);
        }
    };

    const handleRowClick = (row: any) => {
        setSelectedSpecific(row._raw);
        setSelectedTeacherId(row._raw?.subjectTeacherId || "");
        setOpenAssignTeacher(true);
    };

    return (
        <div className="flex flex-col">
            <div className="flex justify-between mb-5">
                <Link to="/school-management/academics" className="text-tertiary">
                    Back
                </Link>
            </div>

            <div className="flex items-center justify-between p-9 bg-bg-1 rounded-[10px] mb-6">
                <div>
                    <h2 className="text-2xl font-semibold text-black">{subjectName}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Offered in {specifics.length} class{specifics.length !== 1 ? 'es' : ''}
                    </p>
                </div>
                <Button
                    color="tertiary"
                    variant="contained"
                    onClick={() => setOpenAddToClass(true)}
                    disabled={availableArms.length === 0}
                    sx={{
                        color: "white",
                        borderRadius: "10px",
                        paddingY: "12px",
                        paddingX: "20px",
                    }}
                >
                    Add to Class
                </Button>
            </div>

            <p className="text-sm text-gray-500 mb-2">Click on a row to assign/change the teacher</p>

            {isPending ? (
                <Loader />
            ) : specifics.length === 0 ? (
                <EmptyTable
                    message="Not assigned to any class yet"
                    text="Add to Class"
                    onClick={() => setOpenAddToClass(true)}
                />
            ) : (
                <BasicTable
                    headcells={headcells}
                    tableData={tableData}
                    onClick={handleRowClick}
                    sideIcon={false}
                />
            )}

            {/* Add to Class Modal */}
            <Modal
                openModal={openAddToClass}
                closeModal={() => {
                    setOpenAddToClass(false);
                    setSelectedArmId("");
                }}
                title={`Add "${subjectName}" to a Class`}
            >
                <div className="flex flex-col gap-y-8">
                    {availableArms.length === 0 ? (
                        <p className="text-gray-500">All classes already have this subject.</p>
                    ) : (
                        <>
                            <FormControl fullWidth>
                                <InputLabel id="select-arm-label">Select Class</InputLabel>
                                <Select
                                    labelId="select-arm-label"
                                    value={selectedArmId}
                                    label="Select Class"
                                    onChange={(e) => setSelectedArmId(e.target.value)}
                                    sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}
                                >
                                    {availableArms.map((arm: any) => {
                                        const level = classLevels.find((l: any) => l._id === arm.classLevelId);
                                        const label = `${level?.levelShortName || ''} ${arm.armName?.toUpperCase()}`.trim();
                                        return (
                                            <MenuItem key={arm._id} value={arm._id}>
                                                {label}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                            <Button
                                color="tertiary"
                                variant="contained"
                                onClick={handleAddToClass}
                                disabled={saving || !selectedArmId}
                                sx={{
                                    color: "white",
                                    borderRadius: "10px",
                                    paddingY: "12px",
                                    width: "fit-content",
                                }}
                            >
                                {saving ? "Adding..." : "Add to Class"}
                            </Button>
                        </>
                    )}
                </div>
            </Modal>

            {/* Assign Teacher Modal */}
            <Modal
                openModal={openAssignTeacher}
                closeModal={() => {
                    setOpenAssignTeacher(false);
                    setSelectedSpecific(null);
                    setSelectedTeacherId("");
                }}
                title={`Assign Teacher — ${subjectName} (${selectedSpecific ? getArmLabel(selectedSpecific.classArmId) : ''})`}
            >
                <div className="flex flex-col gap-y-8">
                    {staff.length === 0 ? (
                        <p className="text-gray-500">No staff members available. Create staff first.</p>
                    ) : (
                        <>
                            <FormControl fullWidth>
                                <InputLabel id="select-teacher-label">Select Teacher</InputLabel>
                                <Select
                                    labelId="select-teacher-label"
                                    value={selectedTeacherId}
                                    label="Select Teacher"
                                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                                    sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}
                                >
                                    {staff.map((s: any) => (
                                        <MenuItem key={s._id} value={s._id}>
                                            {`${s.firstName || ''} ${s.surname || s.lastName || ''}`.trim()}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button
                                color="tertiary"
                                variant="contained"
                                onClick={handleAssignTeacher}
                                disabled={saving || !selectedTeacherId}
                                sx={{
                                    color: "white",
                                    borderRadius: "10px",
                                    paddingY: "12px",
                                    width: "fit-content",
                                }}
                            >
                                {saving ? "Saving..." : "Assign Teacher"}
                            </Button>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default SubjectDetail;