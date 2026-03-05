/* eslint-disable react/prop-types */
import { useForm, FormProvider } from "react-hook-form";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";

import Modal from "../../../../../Components/Modals";
import AutocompleteField from "../../../../../Components/Forms/AutocompleteField";

export default function EditPeriod({ openModal, closeModal }) {
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
			title="Edit Period"
			maxWidth="831px"
		>
			<FormProvider {...method}>
				<form onSubmit={method.handleSubmit(onSubmit)}>
					<div className="flex flex-col gap-y-12">
						<div className="flex items-center justify-between">
							<AutocompleteField
								name="session"
								placeholder="2022/2023"
								selectOption={[]}
							/>
							<AutocompleteField
								name="term"
								placeholder="First term"
								selectOption={[]}
							/>
						</div>
						<div>
							<p className="text-black">Days of the week</p>
							<p className="text-gray-2 mb-6 mt-2.5">
								Select what day this period
							</p>
							<div className="flex items-center justify-between">
								<FormGroup row>
									<FormControlLabel
										control={<Checkbox />}
										label={<p className="text-gray-1">Monday</p>}
									/>
									<FormControlLabel
										control={<Checkbox />}
										label={<p className="text-gray-1">Tuesday</p>}
									/>
									<FormControlLabel
										control={<Checkbox />}
										label={<p className="text-gray-1">Wednesday</p>}
									/>
									<FormControlLabel
										control={<Checkbox />}
										label={<p className="text-gray-1">Thursday</p>}
									/>
									<FormControlLabel
										control={<Checkbox />}
										label={<p className="text-gray-1">Friday</p>}
									/>
								</FormGroup>
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
							name="teacher"
							placeholder="Select teacher"
							label="Subject teacher"
							labelFor="teacher"
							selectOption={[]}
							multiple
						/>
					</div>
					<div className="mt-8 mb-12">
						<FormControlLabel
							control={<Checkbox />}
							label={<p className="text-text-gray">This is a break period</p>}
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
								maxWidth: "171px",
							}}
						>
							Save changes
						</Button>
					</div>
				</form>
			</FormProvider>
		</Modal>
	);
}
