/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import TableComponent from "../../../../../../Components/Tables";
import DeleteClassLevelModal from "../../Modals/DeleteClassLevelModal";
import LevelTemplate from "../../Modals/LevelTemplate";
import CreateLevel from "../../Modals/CreateLevel";
import { useClassLevels, useClassArms } from "../../../../../../services/api-call";
import Loader from "../../../../../loaders/Loader";
import EmptyTable from "../../../../../../Components/EmptyTable";
import moment from "moment";



const View = () => {

	const [openDeleteClassLevel, setOpenDeleteClassLevel] = useState(false);
	const [openLevelTemplateModal, setOpenLevelTemplateModal] = useState(false);
	const [openCreateLevelModal, setOpenCreateLevelModal] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [selectedLevel, setSelectedLevel] = useState<any>(null);
	const navigate = useNavigate();

	const allClasses = useClassLevels();
	const allArms = useClassArms();

	const classLevels = allClasses?.data?.data?.data || [];
	const classArms = allArms?.data?.data?.data || [];
	const isLoading = allClasses?.isPending;

	// Build table data with arm count and formatted date
	const classes = classLevels.map((classLevel: any, index: number) => {
		const armCount = classArms.filter((arm: any) => arm.classLevelId === classLevel._id).length;
		return {
			...classLevel,
			__v: index + 1,
			arms_no: armCount,
			createdAt: classLevel.createdAt ? (() => {
				const d = new Date(classLevel.createdAt);
				const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
				const day = d.getDate();
				const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
				return `${months[d.getMonth()]} ${day}${suffix} ${d.getFullYear()}`;
			})() : '-',
		};
	});


	const headcells = [
		{
			key: "__v",
			name: "S/N",
		},
		{
			key: "levelName",
			name: "Level name",
		},
		{
			key: "levelShortName",
			name: "Short Name",
		},
		{
			key: "arms_no",
			name: "No of arms",
		},
		{
			key: "createdAt",
			name: "Date created",
		},
		{
			key: "actions",
			name: [
				{
					name: "View class level",
					handleClick: (row: any) => {
						navigate(`/school-management/academics?level=${row._id}&name=${row.levelShortName}`);
					},
				},
				{
					name: "Delete class level",
					handleClick: (row: any) => {
						setSelectedLevel(row);
						setOpenDeleteClassLevel(true);
					},
				},
			],
		},
	];


	return (
			<div className="flex flex-col">
				<div className="flex my-3 flex-col">
					<Link to="/school-management/academics" className="text-tertiary">
						Back
					</Link>

					<div className="flex flex-col gap-3 md:justify-between md:flex-row w-full">
						<div className=""></div>
						<div className="flex gap-x-4">
							<Button
								color="tertiary"
								variant="outlined"
								onClick={() => setOpenLevelTemplateModal(true)}
								sx={{
									color: "tertiary",
									borderRadius: "10px",
									paddingY: "12px",
									paddingX: '13px',
									fontSize: '12px'
								}}
							>
								Create level with template
							</Button>
							<Button
								color="tertiary"
								variant="contained"
								onClick={() => setOpenCreateLevelModal(true)}
								sx={{
									color: "white",
									borderRadius: "10px",
									paddingY: "12px",
									paddingX: '13px',
									fontSize: '12px'
								}}
							>
								Create level
							</Button>
						</div>
					</div>
				</div>

				{isLoading ? (
					<Loader />
				) : classes.length === 0 ? (
					<EmptyTable
						message="No Class Levels Created"
						text="Create Class Level"
						onClick={() => setOpenCreateLevelModal(true)}
					/>
				) : (
					<TableComponent 
						headcells={headcells} 
						tableData={classes} 
					/>
				)}

				<DeleteClassLevelModal
					openModal={openDeleteClassLevel}
					closeModal={() => setOpenDeleteClassLevel(false)}
				/>
				<LevelTemplate
					openModal={openLevelTemplateModal}
					closeModal={() => setOpenLevelTemplateModal(false)}
				/>
				<CreateLevel
					openModal={openCreateLevelModal}
					closeModal={() => setOpenCreateLevelModal(false)}
					isEditing={isEditing}
				/>
			</div>
	);
}

export default View;