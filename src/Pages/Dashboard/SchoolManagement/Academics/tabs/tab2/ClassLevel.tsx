/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import moment from "moment";

import DashboardLayout from "../../../../../../Templates/DashboardLayout";
import TableComponent from "../../../../../../Components/Tables";
import MessageModal from "../../../../../../Components/Modals/MessageModal";
import CreateLevel from "../../Modals/CreateLevel";
import AssignTeacherModal from "../../Modals/AssignTeacherModal";
import DeleteClassLevelModal from "../../Modals/DeleteClassLevelModal";

export default function ClassLevel() {
	const [isEditing, setIsEditing] = useState(false);
	const [openCreateLevelModal, setOpenCreateLevelModal] = useState(false);
	const [openAssignTeacherModal, setOpenAssignTeacherModal] = useState(false);
	const [openDeleteArm, setOpenDeleteArm] = useState(false);
	const [openDeleteClassLevel, setOpenDeleteClassLevel] = useState(false);
	const [setOpenClassView] = useState(false);

	const tableData = Array(7)
		.fill("")
		.map((_, i) => ({
			sn: i + 1,
			arm_name: "A",
			teacher: "John Doe",
			subject: "Mathematics",
			students: "42",
			date: moment(new Date()).format("MMM DD, YYYY"),
			actions: [
				{
					name: "View class",
					handleClick: () => setOpenClassView(true),
				},
				{
					name: "Assign teacher",
					handleClick: () => setOpenAssignTeacherModal(true),
				},
				{
					name: "Delete arm",
					handleClick: () => setOpenDeleteArm(true),
				},
			],
			id: `row_${i}`,
		}));

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
				<div className="flex items-center justify-between p-9 bg-bg-1 rounded-[10px] mb-6">
					<div className="flex flex-col gap-y-[22px]">
						<p className="text-black">Class Information</p>
						<p className="text-black font-semibold text-2xl">JSS 1</p>
						<p className="text-black">Junior Secondary School One</p>
					</div>
					<div className="flex gap-x-4">
						<Button
							color="tertiary"
							variant="outlined"
							onClick={() => {
								setIsEditing(true);
								setOpenCreateLevelModal(true);
							}}
							sx={{
								color: "tertiary",
								borderRadius: "10px",
								paddingY: "12px",
							}}
						>
							Edit class level
						</Button>
						<Button
							color="tertiary"
							variant="contained"
							onClick={() => setOpenDeleteClassLevel(true)}
							sx={{
								color: "white",
								borderRadius: "10px",
								paddingY: "12px",
							}}
						>
							Delete class level
						</Button>
					</div>
				</div>
				<div className="mt-14">
					<TableComponent headcells={headcells} tableData={tableData} />
				</div>
				<CreateLevel
					openModal={openCreateLevelModal}
					closeModal={() => setOpenCreateLevelModal(false)}
					isEditing={isEditing}
				/>
				<DeleteClassLevelModal
					openModal={openDeleteClassLevel}
					closeModal={() => setOpenDeleteClassLevel(false)}
				/>
				<AssignTeacherModal
					openModal={openAssignTeacherModal}
					closeModal={() => setOpenAssignTeacherModal(false)}
				/>
				<MessageModal
					column
					desc="Are you sure you want to delete this arm?"
					btn1Name="Delete arm"
					openModal={openDeleteArm}
					closeModal={() => setOpenDeleteArm(false)}
				/>
			</div>
	);
}

const headcells = [
	{
		key: "sn",
		name: "S/N",
	},
	{
		key: "arm_name",
		name: "Arm name",
	},
	{
		key: "teacher",
		name: "Class teacher",
	},
	{
		key: "subject",
		name: "Assigned subject",
	},
	{
		key: "students",
		name: "Students (234)",
	},
	{
		key: "date",
		name: "Date created",
	},
	{
		key: "action",
		name: "",
	},
];
