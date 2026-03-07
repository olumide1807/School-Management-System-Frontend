/* eslint-disable react/prop-types */
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@mui/material";
import Modal from "../../../../../Components/Modals";
import ValidatedInput from "../../../../../Components/Forms/ValidatedInput";
import { useDispatch, useSelector } from "react-redux";
import { createClassLevel } from "../../../../../redux/slice/classLevel";
import { ErrorMsg } from "../../../../../Components/Forms";
import { useState } from "react";
import { Add } from '@mui/icons-material';
import { useQueryClient } from "@tanstack/react-query";



const CreateLevel = ({ openModal, closeModal, isEditing }: { openModal: boolean; closeModal: () => void; isEditing?: boolean }) => {
	const methods = useForm({
		mode: "all",
	});

	const dispatch = useDispatch<any>();
	const queryClient = useQueryClient();
	const { error, status } = useSelector((state: any) => state.classLevel);

	const [inputs, setInputs] = useState([{ value: '' }, { value: '' }]);

	const onSubmit = async (data: any) => {
		const armNames = inputs
			.map((_, index) => data[`armNames${index}`])
			.filter(Boolean); // remove empty values

		const { levelName, levelShortName } = data;

		try {
			await dispatch(createClassLevel({ levelName, levelShortName, armNames })).unwrap();
			// Refetch class data
			queryClient.invalidateQueries({ queryKey: ['classes'] });
			methods.reset();
			setInputs([{ value: '' }, { value: '' }]);
			closeModal();
		} catch (err) {
			// Error toast is handled in the slice
			console.error(err);
		}
	};


	const handleAddMore = () => {
		setInputs([...inputs, { value: '' }]);
	}
	
	return (
		<>
		<Modal
			openModal={openModal}
			closeModal={closeModal}
			title={isEditing ? "Edit Class Level" : "Create Class Level"}
		>
			<FormProvider {...methods}>
				<form
					onSubmit={methods.handleSubmit(onSubmit)}
					className="flex flex-col gap-y-[68.5px]"
				>
					<div className="flex flex-col gap-y-10">
						<ValidatedInput
							name="levelName"
							label="Level name"
							placeholder="e.g  Junior secondary school one"
							otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
						/>
						<ValidatedInput
							name="levelShortName"
							label="Level short name"
							placeholder="e.g JSS1, JSS2"
							otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
						/>
					</div>
					<div className="">
						<p className="mb-10 font-semibold text-black text-xl">
							Create Class Arm
						</p>
						<div className="flex flex-col gap-y-7">

							{
								inputs.map((input, index) => (
									<ValidatedInput
										key={index}
										name={`armNames${index}`}
										label={`Arm name ${index + 1}`}
										placeholder="e.g  A, B, Gold, Silver"
										otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
									/>
								))
							}


						</div>

						<Button variant="outlined" style={{marginTop: '16px'}} startIcon={<Add/>} onClick={handleAddMore}>
							Add more
						</Button>
							
					</div>
					<div className="">
						<Button
							color="tertiary"
							variant="contained"
							type='submit'
							disabled={status === 'pending'}
							sx={{
								color: "white",
								borderRadius: "10px",
								textTransform: "capitalize",
								padding: "12px 35px",
								}}
								>
							{ status === 'pending' ? 'Saving...':
							isEditing ? "Save changes" : "Save"
							}
						</Button>

						{error === true && <ErrorMsg text='An error occured'/>}
					</div>
				</form>
			</FormProvider>
		</Modal>

		</>


	);
}

export default CreateLevel;