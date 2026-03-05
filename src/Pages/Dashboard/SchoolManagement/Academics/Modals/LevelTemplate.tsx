/* eslint-disable react/prop-types */
import { useForm, FormProvider } from "react-hook-form";
import { FormGroup, FormControlLabel, Checkbox } from "@mui/material";

import Modal from "../../../../../Components/Modals";
import BasicButton from "../../../../../Components/Forms/BasicButton";

export default function LevelTemplate({ openModal, closeModal }) {
	const methods = useForm({
		mode: "all",
	});

	const onSubmit = async (data) => {
		console.log(data);
		closeModal();
	};
	return (
		<Modal
			openModal={openModal}
			closeModal={closeModal}
			maxWidth={1202}
			title="Select Class Level"
		>
			<FormProvider {...methods}>
				<form
					onSubmit={methods.handleSubmit(onSubmit)}
					className="flex flex-col divide-y"
				>
					<div id="level" className="flex flex-col gap-y-12 mb-10">
						<div className="flex flex-col gap-y-6">
							<FormControlLabel
								control={<Checkbox />}
								label={<p className="text-black">Junior Secondary Level</p>}
							/>
							<FormGroup row>
								<FormControlLabel
									control={<Checkbox />}
									label={
										<p className="text-[#5A5A5A]">
											Junior Secondary School One
										</p>
									}
								/>
								<FormControlLabel
									control={<Checkbox />}
									label={
										<p className="text-[#5A5A5A]">
											Junior Secondary School Two
										</p>
									}
								/>
								<FormControlLabel
									control={<Checkbox />}
									label={
										<p className="text-[#5A5A5A]">
											Junior Secondary School Three
										</p>
									}
								/>
							</FormGroup>
						</div>
						<div className="flex flex-col gap-y-6">
							<FormControlLabel
								control={<Checkbox />}
								label={<p className="text-black">Senior Secondary Level</p>}
							/>
							<FormGroup row>
								<FormControlLabel
									control={<Checkbox />}
									label={
										<p className="text-[#5A5A5A]">
											Senior Secondary School One
										</p>
									}
								/>
								<FormControlLabel
									control={<Checkbox />}
									label={
										<p className="text-[#5A5A5A]">
											Senior Secondary School One
										</p>
									}
								/>
								<FormControlLabel
									control={<Checkbox />}
									label={
										<p className="text-[#5A5A5A]">
											Senior Secondary School One
										</p>
									}
								/>
							</FormGroup>
						</div>
						<div className="flex flex-col gap-y-6">
							<FormControlLabel
								control={<Checkbox />}
								label={<p className="text-black">Grade Level</p>}
							/>
							<FormGroup row>
								<FormControlLabel
									control={<Checkbox />}
									label={<p className="text-[#5A5A5A]">Grade Seven</p>}
								/>
								<FormControlLabel
									control={<Checkbox />}
									label={<p className="text-[#5A5A5A]">Grade Eight</p>}
								/>
								<FormControlLabel
									control={<Checkbox />}
									label={<p className="text-[#5A5A5A]">Grade Nine</p>}
								/>
								<FormControlLabel
									control={<Checkbox />}
									label={<p className="text-[#5A5A5A]">Grade Ten</p>}
								/>
								<FormControlLabel
									control={<Checkbox />}
									label={<p className="text-[#5A5A5A]">Grade Eleven</p>}
								/>
							</FormGroup>
						</div>
					</div>
					<div id="arm" className="pt-10">
						<p className="text-black text-xl font-semibold mb-10">
							Select Class Arm
						</p>
						<div className="flex flex-col gap-y-12">
							<div className="flex flex-col gap-y-6">
								<p className="text-black">Junior Secondary School One</p>
								<FormGroup row>
									<FormControlLabel
										control={<Checkbox />}
										label={<p className="text-[#5A5A5A]">A</p>}
									/>
									<FormControlLabel
										control={<Checkbox />}
										label={<p className="text-[#5A5A5A]">B</p>}
									/>
									<FormControlLabel
										control={<Checkbox />}
										label={<p className="text-[#5A5A5A]">C</p>}
									/>
									<FormControlLabel
										control={<Checkbox />}
										label={<p className="text-[#5A5A5A]">D</p>}
									/>
									<FormControlLabel
										control={<Checkbox />}
										label={<p className="text-[#5A5A5A]">E</p>}
									/>
									<FormControlLabel
										control={<Checkbox />}
										label={<p className="text-[#5A5A5A]">F</p>}
									/>
								</FormGroup>
							</div>
							<div className="flex flex-col gap-y-6">
								<p className="text-black">Junior Secondary School Two</p>
								<FormGroup row>
									<FormControlLabel
										control={<Checkbox />}
										label={<p className="text-[#5A5A5A]">A</p>}
									/>
									<FormControlLabel
										control={<Checkbox />}
										label={<p className="text-[#5A5A5A]">B</p>}
									/>
									<FormControlLabel
										control={<Checkbox />}
										label={<p className="text-[#5A5A5A]">C</p>}
									/>
									<FormControlLabel
										control={<Checkbox />}
										label={<p className="text-[#5A5A5A]">D</p>}
									/>
									<FormControlLabel
										control={<Checkbox />}
										label={<p className="text-[#5A5A5A]">E</p>}
									/>
									<FormControlLabel
										control={<Checkbox />}
										label={<p className="text-[#5A5A5A]">F</p>}
									/>
								</FormGroup>
							</div>
							<div className="flex flex-col gap-y-6">
								<p className="text-black">Junior Secondary School Three</p>
								<FormGroup row>
									<FormControlLabel
										control={<Checkbox />}
										label={<p className="text-[#5A5A5A]">A</p>}
									/>
									<FormControlLabel
										control={<Checkbox />}
										label={<p className="text-[#5A5A5A]">B</p>}
									/>
									<FormControlLabel
										control={<Checkbox />}
										label={<p className="text-[#5A5A5A]">C</p>}
									/>
									<FormControlLabel
										control={<Checkbox />}
										label={<p className="text-[#5A5A5A]">D</p>}
									/>
									<FormControlLabel
										control={<Checkbox />}
										label={<p className="text-[#5A5A5A]">E</p>}
									/>
									<FormControlLabel
										control={<Checkbox />}
										label={<p className="text-[#5A5A5A]">F</p>}
									/>
								</FormGroup>
							</div>
						</div>
					</div>
					
				<BasicButton variant='contained' color='tertiary' text='Save' onClick={() => {}} type='submit'/>
				</form>
			</FormProvider>
		</Modal>
	);
}
