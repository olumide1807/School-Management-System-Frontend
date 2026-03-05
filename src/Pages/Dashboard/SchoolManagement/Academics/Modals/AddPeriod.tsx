/* eslint-disable react/prop-types */
import { useForm, FormProvider } from "react-hook-form";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

import Modal from "../../../../../Components/Modals";
import AutocompleteField from "../../../../../Components/Forms/AutocompleteField";

export default function AddPeriod({ openModal, closeModal }) {
	const method = useForm({
		mode: "all",
	});

	const onSubmit = async (body) => {
		console.log(body);
	};
	return (
		<Modal
			openModal={openModal}
			closeModal={closeModal}
			title="Add Period"
			maxWidth="831px"
		>
			<FormProvider {...method}>
				<form onSubmit={method.handleSubmit(onSubmit)}>
					<div className="flex flex-col gap-y-12">
						<div className="flex items-center justify-between">
							<AutocompleteField
								name="session"
								placeholder="2022/2023"
								label="Session"
								labelFor="session"
								selectOption={[]}
							/>
							<AutocompleteField
								name="term"
								placeholder="First term"
								label="Term"
								labelFor="term"
								selectOption={[]}
							/>
							<AutocompleteField
								name="test"
								placeholder="First test"
								label="Test"
								labelFor="test"
								selectOption={[]}
							/>
						</div>
						<div>
							<p className="text-black">Date</p>
							<div className="flex items-center justify-between">
								<AutocompleteField
									name="day"
									placeholder="Day"
									selectOption={days}
								/>
								<AutocompleteField
									name="month"
									placeholder="Month"
									selectOption={months}
								/>
								<AutocompleteField
									name="year"
									placeholder="Year"
									selectOption={[]}
								/>
							</div>
						</div>
						<AutocompleteField
							name="class"
							placeholder="Select class"
							label="Class"
							labelFor="class"
							selectOption={[]}
						/>
						<AutocompleteField
							name="subject"
							placeholder="Select subject"
							label="Subject"
							labelFor="subject"
							selectOption={[]}
						/>
						<AutocompleteField
							name="invigilator"
							placeholder="Select teacher"
							label="Invigilator"
							labelFor="invigilator"
							selectOption={[]}
							multiple
						/>
					</div>
					<div className="mt-8 mb-12">
						<FormControlLabel
							control={<Checkbox />}
							label={<p className="text-gray-1">This is a break period</p>}
						/>
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
								maxWidth: "153px",
							}}
						>
							Add period
						</Button>
					</div>
				</form>
			</FormProvider>
		</Modal>
	);
}

const days = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

const months = [
	{
		label: "January",
		value: 1,
	},
	{
		label: "February",
		value: 2,
	},
	{
		label: "March",
		value: 3,
	},
	{
		label: "April",
		value: 4,
	},
	{
		label: "May",
		value: 5,
	},
	{
		label: "June",
		value: 6,
	},
	{
		label: "July",
		value: 7,
	},
	{
		label: "August",
		value: 8,
	},
	{
		label: "September",
		value: 9,
	},
	{
		label: "October",
		value: 10,
	},
	{
		label: "November",
		value: 11,
	},
	{
		label: "December",
		value: 12,
	},
];
