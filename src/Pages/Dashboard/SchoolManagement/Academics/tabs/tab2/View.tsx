/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import TableComponent from "../../../../../../Components/Tables";
import DeleteClassLevelModal from "../../Modals/DeleteClassLevelModal";
import LevelTemplate from "../../Modals/LevelTemplate";
import CreateLevel from "../../Modals/CreateLevel";
import { useClassLevels } from "../../../../../../services/api-call";





const View = () => {

	const [openDeleteClassLevel, setOpenDeleteClassLevel] = useState(false);
	const [openLevelTemplateModal, setOpenLevelTemplateModal] = useState(false);
	const [openCreateLevelModal, setOpenCreateLevelModal] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const navigate = useNavigate();

	const allClasses = useClassLevels();

	const classes = allClasses?.data?.data?.data.map((classLevel, index) => ({
		...classLevel,
		__v: index + 1,
	  }));
  

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
					handleClick: () => {
						navigate(":id");
					},
				},
				{
					name: "Edit class level",
					handleClick: () => {
						setIsEditing(true);
						setOpenCreateLevelModal(true);
					},
				},
				{
					name: "Delete class level",
					handleClick: () => {
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

				<TableComponent 
					headcells={headcells} 
					tableData={classes} 

				/>

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
