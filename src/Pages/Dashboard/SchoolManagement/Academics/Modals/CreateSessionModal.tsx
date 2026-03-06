/* eslint-disable react/prop-types */
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Modal from "../../../../../Components/Modals";
import DatePickerInput from "../../../../../Components/Forms/DatePicker";
import { useDispatch, useSelector } from "react-redux";
import { createSession, submitSession } from "../../../../../redux/slice/sessionSlice";
import { useReducer, useState } from "react";
import { sessionReducer } from "../utils/reducer";
import { useGetAllSession } from "../../../../../services/api-call";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { toastOptions } from "../../../../../Utils/toastOptions";

// Generate academic year options from 2022/2023 to 2030/2031
const academicYears = Array.from({ length: 9 }, (_, i) => {
	const startYear = 2022 + i;
	return `${startYear}/${startYear + 1}`;
});

// Fixed term names
const termNames = ["Term 1", "Term 2", "Term 3"];

const CreateSessionModal = ({ openModal, closeModal }: { openModal: boolean; closeModal: () => void }) => {

	const initialState = {
		sessionName: '',
		currentSession: false,
		term: [
			{
				termName: 'Term 1',
				termStartDate: '',
				termEndDate: '',
			},
			{
				termName: 'Term 2',
				termStartDate: '',
				termEndDate: '',
			},
			{
				termName: 'Term 3',
				termStartDate: '',
				termEndDate: '',
			},
		]
	}

	
	const [state, dispatchState] = useReducer(sessionReducer, initialState);
	const [submitting, setSubmitting] = useState(false);
	
	const queryClient = useQueryClient();
	const allSessions = useGetAllSession();
	const existingSessionNames = (allSessions?.data?.data?.data || []).map((s: any) => s.sessionName);

	const handleChange = (e: any) => {
		const { name, value, type, checked } = e.target;
        if (name.startsWith('term')) {
			const index = parseInt(name.match(/\d+/)[0], 10); 
            const termField = name.replace(/\d+/, ''); 
			dispatchState({ type: 'SET_TERM_FIELD', payload: { index: parseInt(index), name: termField, value } });
        } else if (name === 'currentSession') {
			dispatchState({ type: 'SET_FIELD', payload: { name, value: type === 'checkbox' ? checked : value } });
        } else {
			dispatchState({ type: 'SET_FIELD', payload: { name, value } });
        }
	}
	
	
	const handleDateChange = (name: string, index: number, date: any) => {
		dispatchState({ type: 'SET_TERM_FIELD', payload: { index, name, value: date } });
    };
	
	const dispatch = useDispatch<any>();
	const { status } = useSelector((state: any) => state.session);


	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Check for duplicate session
		if (existingSessionNames.includes(state.sessionName)) {
			toast.error(`Session ${state.sessionName} already exists!`, toastOptions);
			return;
		}

		try {
			setSubmitting(true);
			dispatch(createSession(state));
			await dispatch(submitSession(state)).unwrap();
			// Refetch session lists
			queryClient.invalidateQueries({ queryKey: ['session'] });
			queryClient.invalidateQueries({ queryKey: ['all-session'] });
			queryClient.invalidateQueries({ queryKey: ['terms'] });
			// Reset form
			dispatchState({ type: 'RESET', payload: initialState });
			closeModal();
		} catch (error) {
			console.error(error);
		} finally {
			setSubmitting(false);
		}
	}

	// Filter out already-created sessions from the dropdown
	const availableYears = academicYears.filter(year => !existingSessionNames.includes(year));


	return (
		<Modal
			openModal={openModal}
			closeModal={closeModal}
			title="Create session"
			maxWidth="900px"
		>

				<form className="flex flex-col gap-y-10" onSubmit={handleSubmit}>
					<div className="flex flex-col md:flex-row items-end gap-x-[72px] max-w-[758px] md:justify-between">
						<FormControl fullWidth sx={{ maxWidth: 482 }}>
							<InputLabel id="session-name-label">Academic Year</InputLabel>
							<Select
								labelId="session-name-label"
								name="sessionName"
								value={state.sessionName}
								label="Academic Year"
								onChange={handleChange}
								required
								sx={{
									borderRadius: "10px",
									backgroundColor: "#F7F8F8",
								}}
							>
								{availableYears.map((year) => (
									<MenuItem key={year} value={year}>
										{year}
									</MenuItem>
								))}
							</Select>
						</FormControl>
						<div className="w-full flex items-center mt-4 md:mt-0">
							<p>Make Current Session</p>
							<Checkbox
								name="currentSession"
								checked={state.currentSession}
								onChange={handleChange}
							/>
						</div>
					</div>
					<div className="flex flex-col gap-y-[40px]">

					{
						state.term.map((t: any, index: number) => (
						<div key={index}>
							<p className="font-semibold text-black text-lg mb-4">{termNames[index]}</p>
							<div className="flex flex-col gap-3 md:flex-row md:items-center gap-x-7">
								<DatePickerInput 
									name={`termStartDate${index}`}
									label='Start date'
									value={t.termStartDate}
									onChange={(date: any) => handleDateChange('termStartDate', index, date)}
									placeholder="- - / - - / - - - -"
								/>
								<DatePickerInput 
									name={`termEndDate${index}`} 
									label='End date' 
									value={t.termEndDate}
									onChange={(date: any) => handleDateChange('termEndDate', index, date)}
									placeholder="- - / - - / - - - -"
								/>
							</div>
						</div>

						))
					}

					</div>
					<Button
						color="tertiary"
						variant="contained"
						type="submit"
						disabled={submitting}
						sx={{
							color: "white",
							borderRadius: "10px",
							paddingY: "12px",
							width: "fit-content",
						}}
					>
						{
							submitting ? 'Creating...': 'Create session'
						}
						
					</Button>

				</form>
		</Modal>
	);
}

export default CreateSessionModal;