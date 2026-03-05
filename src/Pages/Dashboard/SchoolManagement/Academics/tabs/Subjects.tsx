import { useState } from "react";
import { Button, Checkbox, FormControlLabel } from "@mui/material";
import { useForm, FormProvider } from "react-hook-form";
import Modal from "../../../../../Components/Modals";
import MessageModal from "../../../../../Components/Modals/MessageModal";
import ValidatedInput from "../../../../../Components/Forms/ValidatedInput";
import SearchInput from "../../../../../Components/Forms/SearchInput";
import TableComponent from "../../../../../Components/Tables";
import { useGetAllSubjects } from "../../../../../services/api-call";
import AutocompleteField from "../../../../../Components/Forms/AutocompleteField";

const options = ["JSS 1", "JSS 2", "JSS 3l"];

const Subjects = () => {
	const [openAddSubject, setOpenAddSubject] = useState(false);
	const [openDeleteSubject, setOpenDeleteSubject] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	const allSubjects = useGetAllSubjects();

	console.log(allSubjects?.data?.data?.data);

	const methods = useForm({
		mode: "all",
	});

	const onSubmit = async (data) => {
		console.log(data);
		setOpenAddSubject(false);
	};

	const headcells = [
		{
			key: "sn",
			name: "S/N",
		},
		{
			key: "name",
			name: "Name",
		},
		{
			key: "level",
			name: "Class level (s)",
		},
		{
			key: "actions",
			name: [
				{
					name: "Edit subject",
					handleClick: () => {
						setIsEditing(true);
						setOpenAddSubject(true);
					},
				},
				{
					name: "Delete subject",
					handleClick: () => {
						setOpenDeleteSubject(true);
					},
				},
			],
		},
	];


	const tableData = Array(5)
		.fill("")
		.map((_, i) => ({
			sn: i + 1,
			name: "English language",
			level: "JSS 1, JSS 2, JSS 3",
			actions: '',
			id: `row_${i}`,
		}));

	return (
		<>
			<div className="flex flex-col gap-y-[60px]">
				<div className="flex justify-between items-center gap-2">
					<SearchInput
						className="w-[1/2] md:w-full"
						otherClass="border border-[#ABABAB] rounded-[5px] px-4 md:max-w-[420px]"
					/>
					<div className="flex items-center gap-x-4 ">
						<Button
							color="tertiary"
							variant="outlined"
							onClick={() => setOpenSubjectTemplate(true)}
			
							sx={{
								color: "tertiary",
								borderRadius: "10px",
								paddingY: "12px",
								width: 'max-content',
								fontSize: '10px'
							}}
						>
							Subject template
						</Button>
						<Button
							color="tertiary"
							variant="contained"
							onClick={() => setOpenAddSubject(true)}
							sx={{
								color: "white",
								borderRadius: "10px",
								paddingY: "12px",
								width: 'max-content',
								fontSize: '10px'
							}}
						>
							Add subject
						</Button>
					</div>
				</div>
				<TableComponent
					headcells={headcells}
					tableData={tableData}
					handleClick1={() => setOpenAddSubject(true)}
					handleClick2={() => setOpenCreateLevelModal(true)}
					btn1Name="Add subject"
					btn2Name="Subject template"
				/>
			</div>
			<Modal
				title={isEditing ? "Edit Subject" : "Add subject"}
				openModal={openAddSubject}
				closeModal={() => setOpenAddSubject(false)}
			>
				<FormProvider {...methods}>
					<form
						onSubmit={methods.handleSubmit(onSubmit)}
						className="flex flex-col gap-y-[57px]"
					>
						<div className="flex flex-col gap-y-6">
			
							<ValidatedInput
								name="subject_name"
								placeholder="Type subject name"
								otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
							/>
							
							<AutocompleteField
								name="teacher"
								placeholder="Select Class"
								selectOption={options}
							/>

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
						</div>
						<div>
							<Button
								color="tertiary"
								variant="contained"
								type="submit"
								sx={{
									color: "white",
									borderRadius: "10px",
									paddingY: "12px",
								}}
							>
								{isEditing ? "Save changes" : "Add Subject"}
							</Button>
						</div>
					</form>
				</FormProvider>
			</Modal>
			<MessageModal
				column
				desc="This subject will be removed from all classes.
				Are you sure you want to remove English language ?"
				openModal={openDeleteSubject}
				closeModal={() => setOpenDeleteSubject(false)}
			/>
		</>
	);
}


export default Subjects;
