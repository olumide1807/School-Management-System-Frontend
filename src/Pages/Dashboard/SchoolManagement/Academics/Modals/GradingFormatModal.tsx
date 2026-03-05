/* eslint-disable react/prop-types */
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

import Modal from "../../../../../Components/Modals";
import BasicTable from "../../../../../Components/Tables/BasicTable";

export default function GradingFormatModal({
	openModal,
	closeModal,
	checked1,
	checked2,
	handleChecked1,
	handleChecked2,
}) {
	return (
		<Modal openModal={openModal} closeModal={closeModal} maxWidth="1202px">
			<div className="flex flex-col gap-y-10">
				<div>
					<FormControlLabel
						control={
							<Checkbox
								checked={checked1}
								onChange={handleChecked1}
								inputProps={{ "aria-label": "controlled" }}
							/>
						}
						label={
							<p className="text-black font-semibold text-xl">
								Primary Grading Format
							</p>
						}
					/>
					<BasicTable headcells={headcells1} tableData={tableData1} />
				</div>
				<div>
					<FormControlLabel
						control={
							<Checkbox
								checked={checked2}
								onChange={handleChecked2}
								inputProps={{ "aria-label": "controlled" }}
							/>
						}
						label={
							<p className="text-black font-semibold text-xl">
								WAEC Grading Format
							</p>
						}
					/>
					<BasicTable headcells={headcells1} tableData={tableData2} />
				</div>
			</div>
		</Modal>
	);
}

const headcells1 = [
	{
		key: "range",
		name: "Range",
	},
	{
		key: "grade",
		name: "Letter Grade",
	},
	{
		key: "remark",
		name: "Remark",
	},
];

const tableData1 = [
	{
		range: "0 - 39",
		grade: "E",
		remark: "Fail",
	},
	{
		range: "40 - 49",
		grade: "D",
		remark: "Pass",
	},
	{
		range: "50 - 59",
		grade: "C",
		remark: "Average",
	},
	{
		range: "60 - 69",
		grade: "B",
		remark: "Good",
	},
	{
		range: "70 - 100",
		grade: "A",
		remark: "Excellent",
	},
];

const tableData2 = [
	{
		range: "0 - 39",
		grade: "F9",
		remark: "Fail",
	},
	{
		range: "40 - 44",
		grade: "E8",
		remark: "Lower Pass",
	},
	{
		range: "45 - 49",
		grade: "D7",
		remark: "Upper Pass",
	},
	{
		range: "50 - 54",
		grade: "C6",
		remark: "Credit",
	},
	{
		range: "55 - 59",
		grade: "C5",
		remark: "Credit",
	},
	{
		range: "60 - 64",
		grade: "C4",
		remark: "Credit",
	},
	{
		range: "65 - 69",
		grade: "B3",
		remark: "Good",
	},
	{
		range: "70 - 74",
		grade: "B2",
		remark: "Very Good",
	},
	{
		range: "75 - 100",
		grade: "A1",
		remark: "Excellent",
	},
];
