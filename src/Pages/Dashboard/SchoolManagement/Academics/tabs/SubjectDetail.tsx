import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button, Checkbox, FormControlLabel } from "@mui/material";
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

    const [openManageClasses, setOpenManageClasses] = useState(false);
    const [openAssignTeacher, setOpenAssignTeacher] = useState(false);
    const [selectedSpecific, setSelectedSpecific] = useState<any>(null);
    const [selectedTeacherId, setSelectedTeacherId] = useState("");
    const [saving, setSaving] = useState(false);
    const [checkedArmIds, setCheckedArmIds] = useState<string[]>([]);

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
    const assignedArmIds = specifics.map((sp: any) => sp.classArmId);

    // Sync checkedArmIds when specifics load or modal opens
    useEffect(() => {
        setCheckedArmIds(assignedArmIds);
    }, [specificsData]);

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

    // Build class list for display under header
    const assignedClassLabels = assignedArmIds.map((id: string) => getArmLabel(id)).filter(Boolean);

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

    // Toggle arm in checkedArmIds
    const handleToggleArm = (armId: string) => {
        setCheckedArmIds(prev =>
            prev.includes(armId) ? prev.filter(id => id !== armId) : [...prev, armId]
        );
    };

    const handleSaveClassAssignments = async () => {
        setSaving(true);
        const decodedName = subjectName ? decodeURIComponent(subjectName) : '';
        try {
            // Find arms to ADD (checked but not currently assigned)
            const toAdd = checkedArmIds.filter(id => !assignedArmIds.includes(id));
            // Find arms to REMOVE (currently assigned but unchecked)
            const toRemove = assignedArmIds.filter((id: string) => !checkedArmIds.includes(id));

            // Add new assignments
            for (const armId of toAdd) {
                await SERVER.post(`subject/${armId}`, { subjectName: decodedName });
            }

            // Remove unselected assignments
            for (const armId of toRemove) {
                const specific = specifics.find((sp: any) => sp.classArmId === armId);
                if (specific) {
                    await SERVER.delete(`subject/${specific._id}?find=specificSubject`);
                }
            }

            if (toAdd.length > 0 || toRemove.length > 0) {
                toast.success('Class assignments updated!', toastOptions);
            }

            queryClient.invalidateQueries({ queryKey: ['subject-specifics', subjectId] });
            queryClient.invalidateQueries({ queryKey: ['all-specific-subjects'] });
            queryClient.invalidateQueries({ queryKey: ['arm-subject-counts'] });
            setOpenManageClasses(false);
        } catch (error: any) {
            const errMsg = error?.response?.data?.error || 'Failed to update class assignments';
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

            <div className="flex flex-col gap-3 p-9 bg-bg-1 rounded-[10px] mb-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-black">{subjectName ? decodeURIComponent(subjectName) : ''}</h2>
                    <Button
                        color="tertiary"
                        variant="contained"
                        onClick={() => {
                            setCheckedArmIds(assignedArmIds);
                            setOpenManageClasses(true);
                        }}
                        sx={{
                            color: "white",
                            borderRadius: "10px",
                            paddingY: "10px",
                            paddingX: "20px",
                            textTransform: "capitalize",
                        }}
                    >
                        Add / Remove Class(es)
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-600">Classes offering this subject:</span>
                    {assignedClassLabels.length === 0 ? (
                        <span className="text-sm text-gray-400">None</span>
                    ) : (
                        assignedClassLabels.map((label: string, i: number) => (
                            <span key={i} className="bg-white border border-gray-300 rounded-full px-3 py-1 text-xs font-medium">
                                {label}
                            </span>
                        ))
                    )}
                </div>
            </div>

            <p className="text-sm text-gray-500 mb-2">Click on a row to assign/change the teacher</p>

            {isPending ? (
                <Loader />
            ) : specifics.length === 0 ? (
                <EmptyTable
                    message="Not assigned to any class yet"
                    text="Add to Class"
                    onClick={() => {
                        setCheckedArmIds([]);
                        setOpenManageClasses(true);
                    }}
                />
            ) : (
                <BasicTable
                    headcells={headcells}
                    tableData={tableData}
                    onClick={handleRowClick}
                    sideIcon={false}
                />
            )}

            {/* Manage Classes Modal */}
            <Modal
                openModal={openManageClasses}
                closeModal={() => setOpenManageClasses(false)}
                title={`Manage Classes — ${subjectName ? decodeURIComponent(subjectName) : ''}`}
            >
                <div className="flex flex-col gap-y-6">
                    <p className="text-sm text-gray-600">Check the classes that should offer this subject. Uncheck to remove.</p>
                    <div className="flex flex-col gap-1 max-h-[350px] overflow-y-auto border border-gray-200 rounded-lg p-3">
                        {classArms.map((arm: any) => {
                            const level = classLevels.find((l: any) => l._id === arm.classLevelId);
                            const label = `${level?.levelShortName || ''} ${arm.armName?.toUpperCase() || ''}`.trim();
                            const isChecked = checkedArmIds.includes(arm._id);
                            return (
                                <FormControlLabel
                                    key={arm._id}
                                    control={
                                        <Checkbox
                                            checked={isChecked}
                                            onChange={() => handleToggleArm(arm._id)}
                                        />
                                    }
                                    label={<span className="text-sm">{label}</span>}
                                />
                            );
                        })}
                    </div>
                    <Button
                        color="tertiary"
                        variant="contained"
                        onClick={handleSaveClassAssignments}
                        disabled={saving}
                        sx={{
                            color: "white",
                            borderRadius: "10px",
                            paddingY: "12px",
                            width: "fit-content",
                        }}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
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
                title={`Assign Teacher — ${subjectName ? decodeURIComponent(subjectName) : ''} (${selectedSpecific ? getArmLabel(selectedSpecific.classArmId) : ''})`}
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