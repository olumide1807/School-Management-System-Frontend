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
import { useClassLevels } from "../../../../../services/api-call";
import { useNavigate } from "react-router-dom";



const CreateLevel = ({ openModal, closeModal, isEditing }: { openModal: boolean; closeModal: () => void; isEditing?: boolean }) => {
	const methods = useForm({
		mode: "all",
	});

	const dispatch = useDispatch<any>();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { error, status } = useSelector((state: any) => state.classLevel);

	const [inputs, setInputs] = useState([{ value: '' }, { value: '' }]);
	const [levelExistsMsg, setLevelExistsMsg] = useState('');
	const [existingLevelRef, setExistingLevelRef] = useState<any>(null);

	// Get existing class levels to check for duplicates
	const classLevelsQuery = useClassLevels();
	const existingLevels = classLevelsQuery?.data?.data?.data || [];

	const onSubmit = async (data: any) => {
		const armNames = inputs
			.map((_, index) => data[`armNames${index}`])
			.filter(Boolean);

		const { levelName, levelShortName } = data;

		// Check if level already exists
		const existingLevel = existingLevels.find(
			(cl: any) => cl.levelName?.toLowerCase() === levelName?.toLowerCase() || 
			             cl.levelShortName?.toLowerCase() === levelShortName?.toLowerCase()
		);

		if (existingLevel) {
			setExistingLevelRef(existingLevel);
			setLevelExistsMsg(
				`"${existingLevel.levelShortName || existingLevel.levelName}" already exists. You can only create arms when creating a new level.`
			);
			return;
		}

		setLevelExistsMsg('');
		setExistingLevelRef(null);

		try {
			await dispatch(createClassLevel({ levelName, levelShortName, armNames })).unwrap();
			queryClient.invalidateQueries({ queryKey: ['classes'] });
			queryClient.invalidateQueries({ queryKey: ['class-arms'] });
			methods.reset();
			setInputs([{ value: '' }, { value: '' }]);
			closeModal();
		} catch (err) {
			console.error(err);
		}
	};


	const handleAddMore = () => {
		setInputs([...inputs, { value: '' }]);
	}

	const handleGoToView = () => {
		setLevelExistsMsg('');
		closeModal();
		if (existingLevelRef) {
			navigate(`/school-management/academics?level=${existingLevelRef._id}&name=${existingLevelRef.levelShortName || existingLevelRef.levelName}`);
		}
	}
	
	return (
		<>
		<Modal
			openModal={openModal}
			closeModal={() => {
				setLevelExistsMsg('');
				setExistingLevelRef(null);
				closeModal();
			}}
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

					{levelExistsMsg && (
						<div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
							<p className="text-yellow-800 text-sm">{levelExistsMsg}</p>
						</div>
					)}

					{!levelExistsMsg && (
						<>
							<div>
								<p className="mb-10 font-semibold text-black text-xl">
									Create Class Arm
								</p>
								<div className="flex flex-col gap-y-7">
									{inputs.map((input, index) => (
										<ValidatedInput
											key={index}
											name={`armNames${index}`}
											label={`Arm name ${index + 1}`}
											placeholder="e.g  A, B, Gold, Silver"
											otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
										/>
									))}
								</div>
								<Button variant="outlined" style={{marginTop: '16px'}} startIcon={<Add/>} onClick={handleAddMore}>
									Add more
								</Button>
							</div>
							<div>
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
									{status === 'pending' ? 'Saving...' : isEditing ? "Save changes" : "Save"}
								</Button>
								{error === true && status === 'failed' && <ErrorMsg text='An error occurred, please try again'/>}
							</div>
						</>
					)}
				</form>
			</FormProvider>
		</Modal>
		</>
	);
}

export default CreateLevel;