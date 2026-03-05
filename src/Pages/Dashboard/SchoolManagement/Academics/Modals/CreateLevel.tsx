/* eslint-disable react/prop-types */
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@mui/material";
import Modal from "../../../../../Components/Modals";
import ValidatedInput from "../../../../../Components/Forms/ValidatedInput";
import { useDispatch, useSelector } from "react-redux";
import { createClassLevel, setClassLevel } from "../../../../../redux/slice/classLevel";
import { ErrorMsg } from "../../../../../Components/Forms";
import { useState } from "react";
import { toast } from 'react-toastify';
import { toastOptions } from "../../../../../Utils/toastOptions";
import { Add }from '@mui/icons-material';



const CreateLevel = ({ openModal, closeModal, isEditing }) => {
	const methods = useForm({
		mode: "all",
	});

	const dispatch = useDispatch();
	const { error, status } = useSelector((state) => state.classLevel);

	const [inputs, setInputs] = useState([{ value: '' }, { value: '' }]);

	const onSubmit = async (data) => {
		try {
			let armNames = inputs.map((input, index) => data[`armNames${index}`]);
	
			armNames.push('armNames')
			const { levelName, levelShortName } = data;
			dispatch(setClassLevel({levelName, levelShortName, armNames}));
			dispatch(createClassLevel({levelName, levelShortName, armNames}));
			if(res.data){
				toast.success('Class level created successfully!', { toastOptions });
				return;
			} else{
				toast.error('Failed, please try again later!', { toastOptions });
			}
			closeModal()
		} catch (error) {
			if(error.response.status === 400){
				toast.warn('Failed, Class Level already exist!', { toastOptions });
				return;
			} else {
				toast.error('Failed, please try again later!', { toastOptions });
				return;
			}
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
										label="Arm name"
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
							sx={{
								color: "white",
								borderRadius: "10px",
								textTransform: "capitalize",
								padding: "12px 35px",
								}}
								>
							{ status === 'pending' ? 'saving':
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
