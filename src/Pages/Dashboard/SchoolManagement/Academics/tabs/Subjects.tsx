import { useState } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import Modal from "../../../../../Components/Modals";
import MessageModal from "../../../../../Components/Modals/MessageModal";
import ValidatedInput from "../../../../../Components/Forms/ValidatedInput";
import SearchInput from "../../../../../Components/Forms/SearchInput";
import TableComponent from "../../../../../Components/Tables";
import { useGetAllSubjects, useClassArms, useClassLevels } from "../../../../../services/api-call";
import SERVER from "../../../../../Utils/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { toastOptions } from "../../../../../Utils/toastOptions";
import Loader from "../../../../loaders/Loader";
import EmptyTable from "../../../../../Components/EmptyTable";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";


const Subjects = () => {
	const [openAddSubject, setOpenAddSubject] = useState(false);
	const [openDeleteSubject, setOpenDeleteSubject] = useState(false);
	const [subjectToDelete, setSubjectToDelete] = useState<any>(null);
	const [saving, setSaving] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedClassArmIds, setSelectedClassArmIds] = useState<string[]>([]);

	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const methods = useForm({ mode: "all" });

	const allSubjects = useGetAllSubjects();
	const allArms = useClassArms();
	const allLevels = useClassLevels();

	const subjects = allSubjects?.data?.data?.data || [];
	const classArms = allArms?.data?.data?.data || [];
	const classLevels = allLevels?.data?.data?.data || [];
	const isLoading = allSubjects?.isPending;

	// Fetch all specific subjects to count classes per subject
	const { data: allSpecificData } = useQuery({
		queryKey: ['all-specific-subjects'],
		queryFn: async () => {
			const promises = subjects.map((s: any) =>
				SERVER.get(`subject/${s._id}/all`).then(res => ({
					subjectId: s._id,
					specifics: res?.data?.data || []
				})).catch(() => ({ subjectId: s._id, specifics: [] }))
			);
			return Promise.all(promises);
		},
		enabled: subjects.length > 0,
	});

	const specificsBySubject = allSpecificData || [];

	// Build class arm labels for display
	const getArmLabel = (classArmId: string) => {
		const arm = classArms.find((a: any) => a._id === classArmId);
		if (!arm) return '';
		const level = classLevels.find((l: any) => l._id === arm.classLevelId);
		return `${level?.levelShortName || ''} ${arm.armName?.toUpperCase() || ''}`.trim();
	};

	// Build table data
	const tableData = subjects
		.filter((s: any) => s.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()))
		.map((subject: any, i: number) => {
			const specifics = specificsBySubject.find((sp: any) => sp.subjectId === subject._id);
			const classCount = specifics?.specifics?.length || 0;
			return {
				sn: i + 1,
				name: subject.subjectName,
				classCount: classCount,
				actions: '',
				id: subject._id,
				_raw: subject,
			};
		});

	const headcells = [
		{ key: "sn", name: "S/N" },
		{ key: "name", name: "Subject Name" },
		{ key: "classCount", name: "No. of Classes" },
		{
			key: "actions",
			name: [
				{
					name: "View subject",
					handleClick: (row: any) => {
						navigate(`/school-management/academics?subject=${row.id}&subjectName=${row.name}`);
					},
				},
				{
					name: "Delete subject",
					handleClick: (row: any) => {
						setSubjectToDelete(row);
						setOpenDeleteSubject(true);
					},
				},
			],
		},
	];

	// Toggle class arm selection
	const handleToggleArm = (armId: string) => {
		setSelectedClassArmIds(prev =>
			prev.includes(armId) ? prev.filter(id => id !== armId) : [...prev, armId]
		);
	};

	const onSubmit = async (data: any) => {
		if (!data.subjectName?.trim()) return;
		setSaving(true);
		try {
			await SERVER.post('subject', {
				subjectName: data.subjectName.trim(),
				classArmIds: selectedClassArmIds,
			});
			toast.success('Subject created successfully!', toastOptions);
			queryClient.invalidateQueries({ queryKey: ['all-subjects'] });
			queryClient.invalidateQueries({ queryKey: ['all-specific-subjects'] });
			methods.reset();
			setSelectedClassArmIds([]);
			setOpenAddSubject(false);
		} catch (error: any) {
			const errMsg = error?.response?.data?.error || 'Failed to create subject';
			toast.error(errMsg, toastOptions);
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteSubject = async () => {
		if (!subjectToDelete) return;
		try {
			await SERVER.delete(`subject/${subjectToDelete.id}`);
			toast.success('Subject deleted successfully!', toastOptions);
			queryClient.invalidateQueries({ queryKey: ['all-subjects'] });
			queryClient.invalidateQueries({ queryKey: ['all-specific-subjects'] });
			setOpenDeleteSubject(false);
			setSubjectToDelete(null);
		} catch (error: any) {
			toast.error('Failed to delete subject', toastOptions);
		}
	};

	return (
		<>
			<div className="flex flex-col gap-y-6">
				<div className="flex justify-between items-center gap-2">
					<SearchInput
						className="w-[1/2] md:w-full"
						otherClass="border border-[#ABABAB] rounded-[5px] px-4 md:max-w-[420px]"
						onChange={(e: any) => setSearchTerm(e.target.value)}
					/>
					<Button
						color="tertiary"
						variant="contained"
						onClick={() => setOpenAddSubject(true)}
						sx={{
							color: "white",
							borderRadius: "10px",
							paddingY: "12px",
							width: 'max-content',
							fontSize: '12px'
						}}
					>
						Add Subject
					</Button>
				</div>

				{isLoading ? (
					<Loader />
				) : subjects.length === 0 ? (
					<EmptyTable
						message="No Subjects Created"
						text="Add Subject"
						onClick={() => setOpenAddSubject(true)}
					/>
				) : (
					<TableComponent
						headcells={headcells}
						tableData={tableData}
						handleClick1={() => setOpenAddSubject(true)}
						btn1Name="Add Subject"
					/>
				)}
			</div>

			{/* Add Subject Modal */}
			<Modal
				title="Add Subject"
				openModal={openAddSubject}
				closeModal={() => {
					setOpenAddSubject(false);
					setSelectedClassArmIds([]);
					methods.reset();
				}}
			>
				<FormProvider {...methods}>
					<form
						onSubmit={methods.handleSubmit(onSubmit)}
						className="flex flex-col gap-y-8"
					>
						<ValidatedInput
							name="subjectName"
							label="Subject Name"
							placeholder="e.g Mathematics"
							otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
						/>

						{classArms.length > 0 && (
							<div>
								<p className="text-black font-semibold mb-4">Assign to Classes (optional)</p>
								<div className="flex flex-col gap-1 max-h-[250px] overflow-y-auto border border-gray-200 rounded-lg p-3">
									{classArms.map((arm: any) => {
										const level = classLevels.find((l: any) => l._id === arm.classLevelId);
										const label = `${level?.levelShortName || ''} ${arm.armName?.toUpperCase() || ''}`.trim();
										return (
											<FormControlLabel
												key={arm._id}
												control={
													<Checkbox
														checked={selectedClassArmIds.includes(arm._id)}
														onChange={() => handleToggleArm(arm._id)}
													/>
												}
												label={<span className="text-sm">{label}</span>}
											/>
										);
									})}
								</div>
							</div>
						)}

						<Button
							color="tertiary"
							variant="contained"
							type="submit"
							disabled={saving}
							sx={{
								color: "white",
								borderRadius: "10px",
								paddingY: "12px",
								width: "fit-content",
							}}
						>
							{saving ? "Saving..." : "Add Subject"}
						</Button>
					</form>
				</FormProvider>
			</Modal>

			{/* Delete Subject Modal */}
			<MessageModal
				column
				desc={`This will remove "${subjectToDelete?.name}" from all classes. Are you sure?`}
				openModal={openDeleteSubject}
				closeModal={() => {
					setOpenDeleteSubject(false);
					setSubjectToDelete(null);
				}}
				handleClick={handleDeleteSubject}
			/>
		</>
	);
}


export default Subjects;