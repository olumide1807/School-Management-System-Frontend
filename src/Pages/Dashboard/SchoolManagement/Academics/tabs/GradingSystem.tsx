import { useState } from "react";
import Button from "@mui/material/Button";

import Grades from "../../../../../Components/Grades";
import GradingFormatModal from "../Modals/GradingFormatModal";

export default function GradingSystem() {
	const [openModal, setOpenModal] = useState(false);
	const [checked1, setChecked1] = useState(true);
	const [checked2, setChecked2] = useState(true);

	const handleChecked1 = (e) => {
		setChecked1(e.target.checked);
		setChecked2(false);
	};
	const handleChecked2 = (e) => {
		setChecked2(e.target.checked);
		setChecked1(false);
	};
	return (
		<>
			{checked1 || checked2 ? (
				<div className="flex flex-col gap-y-[141px] justify-between">
					<div className={`flex`}>
						<div
							className={`flex flex-col gap-y-9 flex-wrap gap-x-[272px] ${
								checked1 ? "max-h-[290px]" : "max-h-[508px]"
							}`}
						>
							{checked1
								? tableData1.map((data) => (
										<Grades
											key={data.remark}
											color={data.color}
											grade={data.grade}
											remark={data.remark}
											range={data.range}
										/>
								  ))
								: tableData2.map((data) => (
										<Grades
											key={data.remark}
											color={data.color}
											grade={data.grade}
											remark={data.remark}
											range={data.range}
										/>
								  ))}
						</div>
					</div>
					<Button
						color="tertiary"
						variant="contained"
						onClick={() => setOpenModal(true)}
						sx={{
							color: "#fff",
							borderRadius: "10px",
							textTransform: "capitalize",
							paddingY: "12px",
							width: "221px",
							alignSelf: "center",
						}}
					>
						Create grade format
					</Button>
				</div>
			) : (
				<div className="flex items-center justify-center h-[67vh]">
					<div className="flex flex-col gap-y-7">
						<p>You have no grade format set</p>
						<Button
							color="tertiary"
							variant="contained"
							onClick={() => setOpenModal(true)}
							sx={{
								color: "#fff",
								borderRadius: "10px",
								textTransform: "capitalize",
								paddingY: "12px",
								width: "221px",
							}}
						>
							Create grade format
						</Button>
					</div>
				</div>
			)}
			<GradingFormatModal
				openModal={openModal}
				closeModal={() => setOpenModal(false)}
				checked1={checked1}
				checked2={checked2}
				handleChecked1={handleChecked1}
				handleChecked2={handleChecked2}
			/>
		</>
	);
}

const tableData1 = [
	{
		range: "70 - 100",
		grade: "A",
		remark: "Excellent",
		color: "#00A82F",
	},
	{
		range: "60 - 69",
		grade: "B",
		remark: "Good",
		color: "#61AFF8",
	},
	{
		range: "50 - 59",
		grade: "C",
		remark: "Average",
		color: "#797979",
	},
	{
		range: "40 - 49",
		grade: "D",
		remark: "Pass",
		color: "#FFA370",
	},
	{
		range: "0 - 39",
		grade: "E",
		remark: "Fail",
		color: "#C74040",
	},
];

const tableData2 = [
	{
		range: "75 - 100",
		grade: "A1",
		remark: "Excellent",
		color: "#9934E9",
	},
	{
		range: "70 - 74",
		grade: "B2",
		remark: "Very Good",
		color: "#61AFF8",
	},
	{
		range: "65 - 69",
		grade: "B3",
		remark: "Good",
		color: "#61AFF8",
	},
	{
		range: "60 - 64",
		grade: "C4",
		remark: "Credit",
		color: "#797979",
	},
	{
		range: "55 - 59",
		grade: "C5",
		remark: "Credit",
		color: "#797979",
	},
	{
		range: "50 - 54",
		grade: "C6",
		remark: "Credit",
		color: "#797979",
	},
	{
		range: "45 - 49",
		grade: "D7",
		remark: "Upper Pass",
		color: "#DEC806",
	},
	{
		range: "40 - 44",
		grade: "E8",
		remark: "Lower Pass",
		color: "#FFA370",
	},
	{
		range: "0 - 39",
		grade: "F9",
		remark: "Fail",
		color: "#C74040",
	},
];
