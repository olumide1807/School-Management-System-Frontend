/* eslint-disable react/prop-types */
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Modal from "../../../../../Components/Modals";
import DatePickerInput from "../../../../../Components/Forms/DatePicker";
import { useDispatch, useSelector } from "react-redux";
import { createSession, submitSession } from "../../../../../redux/slice/sessionSlice";
import { useReducer } from "react";
import {  Input } from "../../../../../Components/Forms";
import { sessionReducer } from "../utils/reducer";




const CreateSessionModal =({ openModal, closeModal }) => {

	const initialState = {
		sessionName: '',
		currentSession: false,
		term: [
			{
				termName: '',
				termStartDate: '',
				termEndDate: '',
				nextTermStartDate: '',
			},
			{
				termName: '',
				termStartDate: '',
				termEndDate: '',
				nextTermStartDate: '',
			},
			{
				termName: '',
				termStartDate: '',
				termEndDate: '',
				nextTermStartDate: '',
			},
		]
	}

	
	const [state, dispatchState] = useReducer(sessionReducer, initialState);
	
	const handleChange = (e)=> {
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
	
	
	const handleDateChange = (name, index, date) => {
		dispatchState({ type: 'SET_TERM_FIELD', payload: { index, name, value: date } });
    };
	
	const dispatch = useDispatch();
	const { status } = useSelector((state) => state.session);


	const handleSubmit = (e) => {
		e.preventDefault();
		try {
			dispatch(createSession(state));
			dispatch(submitSession(state));
			closeModal();
		} catch (error) {
			{error === true && status === 'failed'}
		}
	}


	return (
		<Modal
			openModal={openModal}
			closeModal={closeModal}
			title="Create session"
			maxWidth="1202px"
		>

				<form className="flex flex-col gap-y-16" onSubmit={handleSubmit}>
					<div className="flex flex-col md:flex-row items-end gap-x-[72px] max-w-[758px] md:justify-between">
						<Input
							label="Session Name"
							name="sessionName"
							placeholder="Session Name"
							value={state.sessionName}
							required={true}
							onChange={handleChange}
							otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px] w-4/5 md:w-[482px]"
						/>
						<div className="w-full flex items-center">
							<p>Make Current Session</p>
							<Checkbox
								name="currentSession"
								checked={state.currentSession}
								onChange={handleChange}
							/>
						</div>
					</div>
					<div className="flex flex-col gap-y-[50px]">

					{
						state.term.map((t, index) => (
						<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between gap-x-7" key={index}>
							<Input 
								label='Term Name' 
								placeholder={`E. g, Term ${index + 1}`}
								name={`termName${index}`}
								required={true}
								onChange={handleChange}
								value={t.termName}
								otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
							/>

							<DatePickerInput 
								name={`termStartDate${index}`}
								label='Term start date'
								value={t.termStartDate}
								onChange={(date) => handleDateChange('termStartDate', index, date)}
								placeholder="- - / - - / - - - -"
							/>
							<DatePickerInput 
								name={`termEndDate${index}`} 
								label='Term end date' 
								value={t.termEndDate}
								onChange={(date) => handleDateChange('termEndDate', index, date)}
								placeholder="- - / - - / - - - -"
							/>
							<DatePickerInput 
								name={`nextTermStartDate${index}`} 
								label='Next term start date' 
								value={t.nextTermStartDate}
								onChange={(date) => handleDateChange('nextTermStartDate', index, date)}
								placeholder="- - / - - / - - - -"
							/>
						</div>

						))
					}

					</div>
					<Button
						color="tertiary"
						variant="contained"
						type="submit"
						sx={{
							color: "white",
							borderRadius: "10px",
							paddingY: "12px",
							width: "fit-content",
						}}
						lg={{
							fontSize: '14px'
						}}
					>
						{
							status === 'pending' ? 'Creating...': 'Create session'
						}
						
					</Button>

				</form>
		</Modal>
	);
}

export default CreateSessionModal;
