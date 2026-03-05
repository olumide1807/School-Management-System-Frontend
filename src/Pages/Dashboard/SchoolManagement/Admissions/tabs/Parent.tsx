import { useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardCard from "../../../../../Components/DashboardCard";
import FilterComponent from "../../../../../Components/FilterComponent";
import SearchInput from "../../../../../Components/Forms/SearchInput";
import TableComponent from "../../../../../Components/Tables";
import LinkStudentModal from "../Modals/LinkStudentModal";
import AddStudentParentChoiceModal from "../Modals/AddStudentParentChoiceModal";
import BulkUploadParent from "../Modals/BulkUploadParent";
import ManualUploadParent from "../Modals/ManualUploadParent";
import RemoveParentModal from "../Modals/RemoveParentModal";
import EditParentProfile from "../Modals/EditParentProfile";

export default function Parent() {
	const [choiceDownload, setChoiceDownload] = useState("Download");
	const [choiceAdd, setChoiceAdd] = useState("Add parent");
	const [openAddStudentModal, setOpenAddStudentModal] = useState(false);
	const [openDeleteParentModal, setopenDeleteParentModal] = useState(false);
	const [openLinkStudentModal, setOpenLinkStudentModal] = useState(false);
	const [openBulkUploadModal, setOpenBulkUploadModal] = useState(false);
	const [openManualUploadModal, setOpenManualUploadModal] = useState(false);
	const [openEditParent, setOpenEditParent] = useState(false);

	const navigate = useNavigate();

	const tableData = Array(5)
		.fill("")
		.map((_, i) => ({
			guardian: "Mr. Peter Adejare",
			email: "peter@gmail.com",
			number: "040 386 45678",
			ward: (
				<div>
					<p className="mb-2.5"> Peter Adejare</p>
					<p>+ 2 more</p>
				</div>
			),
			actions: [
				{
					name: "View profile",
					handleClick: () => navigate("?profile=parent"),
				},
				{
					name: "Edit profile",
					handleClick: () => setOpenEditParent(true),
				},
				{
					name: "Link student",
					handleClick: () => setOpenLinkStudentModal(true),
				},
				{
					name: "Delete parent",
					handleClick: () => setopenDeleteParentModal(true),
				},
			],
			id: `row_${i}`,
		}));

	const menuOptionsAdd = [
		{
			label: "Bulk upload parent",
			value: "Bulk upload parent",
			handleClick: () => setOpenBulkUploadModal(true),
		},
		{
			label: "Manual upload parent",
			value: "Manual upload parent",
			handleClick: () => setOpenManualUploadModal(true),
		},
	];

	return (
		<div className="flex flex-col">
			<div className="flex items-center justify-between gap-y-2 flex-wrap mb-11">
				<DashboardCard bgColor="bg-bg-4" label="Total Parents" value="0" />
				<DashboardCard bgColor="bg-bg-5" label="Students linked" value="0" />
				<DashboardCard bgColor="bg-bg-6" label="Student not linked" value="0" />
			</div>
			<div className="flex items-center justify-between mb-[52px]">
				<div className="flex items-center gap-x-9">
					<SearchInput
						placeholder="Search by student, parent"
						otherClass="border border-[#ABABAB] rounded-[5px] px-4 max-w-[251px]"
					/>
				</div>
				<div className="flex items-center gap-x-3">
					<FilterComponent
						menuOptions={menuOptionsDownload}
						choice={choiceDownload}
						setChoice={setChoiceDownload}
						otherClasses2="px-4 py-4"
						otherClasses="border-tertiary !rounded-[10px]"
						textColor="text-tertiary"
						iconColor="#0E7094"
					/>
					<FilterComponent
						menuOptions={menuOptionsAdd}
						choice={choiceAdd}
						setChoice={setChoiceAdd}
						otherClasses2="px-4 py-4"
						otherClasses="bg-tertiary !rounded-[10px]"
						textColor="text-white"
						iconColor="white"
					/>
				</div>
			</div>
			<div>
				<TableComponent
					headcells={headcells}
					handleClick2={() => setOpenAddStudentModal(true)}
					tableData={tableData}
					btn2Name="Add parent/guardian"
					message="You have no parent list"
				/>
			</div>
			{/* Modals */}
			<RemoveParentModal
				openModal={openDeleteParentModal}
				closeModal={() => setopenDeleteParentModal(false)}
			/>
			<LinkStudentModal
				openModal={openLinkStudentModal}
				closeModal={() => setOpenLinkStudentModal(false)}
			/>
			<AddStudentParentChoiceModal
				type="parent"
				openModal={openAddStudentModal}
				closeModal={() => setOpenAddStudentModal(false)}
				handleOpenBulkUploadModal={() => setOpenBulkUploadModal(true)}
			/>
			<BulkUploadParent
				openModal={openBulkUploadModal}
				closeModal={() => setOpenBulkUploadModal(false)}
			/>
			<ManualUploadParent
				openModal={openManualUploadModal}
				closeModal={() => setOpenManualUploadModal(false)}
			/>
			<EditParentProfile
				openModal={openEditParent}
				closeModal={() => setOpenEditParent(false)}
			/>
		</div>
	);
}

const menuOptionsDownload = [
	{
		label: "PDF Format",
		value: "PDF Format",
	},
	{
		label: "Excel Format",
		value: "Excel Format",
	},
];

const headcells = [
	{
		key: "guardian",
		name: "Guardian",
	},
	{
		key: "email",
		name: "Email address",
	},
	{
		key: "number",
		name: "Phone number",
	},
	{
		key: "ward",
		name: "Ward",
	},
	{
		key: "actions",
		name: "",
	},
];
