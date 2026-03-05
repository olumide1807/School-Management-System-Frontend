import { useState } from "react";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FilterComponent from "../../../../../Components/FilterComponent";
import BasicTable from "../../../../../Components/Tables/BasicTable";
import CreateSessionModal from "../Modals/CreateSessionModal";
import Modal from "../../../../../Components/Modals";
import { useGetAllSession, useSessionTerm } from "../../../../../services/api-call";
import SERVER from "../../../../../Utils/server";
import { useQuery } from "@tanstack/react-query";
import Loader from "../../../../loaders/Loader";
import BasicButton from "../../../../../Components/Forms/BasicButton";
import { InputField } from "../../../../../Components/Forms";
import EmptyTable from "../../../../../Components/EmptyTable";
import { CircularProgress } from "@mui/material";
import moment from 'moment';
import { toast } from "react-toastify";
import { toastOptions } from "../../../../../Utils/toastOptions";



const SessionTerm = () => {

	const headcells = [
		{
			key: "termName",
			name: "Term",
		},
		{
			key: "termStartDate", 
			name: "Start Date",
		},
		{
			key: `termEndDate`, 
			name: "End Date",
		},
		{
			key: "currentTerm", 
			name: "Status",
		},
	];

	const { data, isPending: sessionPending } = useSessionTerm();

	let sessionName = data?.data?.data?.session?.sessionName;


	const id = data?.data?.data?.session?._id;

	const { isPending, data: termData, error: termDataError } = useQuery({
		queryKey: ['terms'],
		queryFn: async () => {
			const res = await SERVER.get(`session/term/${id}`)
			return res?.data
		}
	});



	const allSessions = useGetAllSession();

	const [isEditing, setIsEditing] = useState(false);
	const [openCreateSession, setOpenCreateSession] = useState(false);
	const [openViewTerm, setOpenViewTerm] = useState(false);
	const [choice, setChoice] = useState(sessionName);

	const [viewTerm, setViewTerm] = useState(null);
	const [updateTerm, setUpdateTerm] = useState(false);

    const sessions = allSessions?.data?.data?.data?.map(session => ({
        label: `${session.sessionName}`,
        value: `${session.sessionName}`
    })) || [];

	const handleTerm = (term) => {
		setOpenViewTerm(true);
		setViewTerm(term);
	}


	const makeCurrentSession = async () => {
		console.log(choice);
		// try {
		// 	const res = await SERVER.put(`session/${id}`, {
		// 		sessionName: '',
		// 		currentSession: ''
		// 	})
		// } catch (error) {
		// 	console.log(error)
		// }
	}


	const makeCurrTerm = async () => {
		try {
			const res = await SERVER.put(`session/term/${viewTerm._id}`, {
				 currentTerm: updateTerm
			})
			if(res.data.success === true){
				setUpdateTerm(false);
				return toast.success('Current Term Updated Succesfully', { toastOptions });
			} else {
				toast.warn('Cannot perform this action', { toastOptions })
			}
			
		} catch (error) {
			toast.error('Something went wrong, please try again!', { toastOptions })
		}
	}



	return (
		<>
			<div className="flex flex-col">
				<div className="flex flex-col gap-3 md:flex-row md:items-center justify-between p-9 bg-bg-1 rounded-[10px] mb-6">
					<div className="flex items-center gap-x-5">
						<p className="text-black text-lg">Current session:</p>
						{ !sessionName || sessionName === null?
							<p className="text-xl text-black font-semibold">-- / -- session</p> :
							sessionPending ? 
							<CircularProgress color="primary"/> :
							<p className="text-xl text-black font-semibold">{sessionName}</p>
						}
					</div>
					<BasicButton 
						text='Create session' 
						color='tertiary' 
						variant='contained' 
						onClick={() => setOpenCreateSession(true)}
					/>
	
				</div>
				<div className="w-full gap-4 md:ml-5 md:pr-12 flex md:flex-row  md:items-center md:justify-between">

					<FilterComponent
						menuOptions={sessions}
						choice={choice}
						setChoice={(choice) => setChoice(choice)}
					/>
					{	
						termData?.data.length > 0  &&
						<BasicButton 
							text='Make Current session' 
							color='tertiary' 
							variant='contained' 
							onClick={makeCurrentSession}
						/>
					}

				</div>
				
				<>
					<BasicTable
						sideIcon
						headcells={headcells}
						onClick={handleTerm}
						tableData={termData?.data} 
						/>
					{isPending && <Loader/>}
					{!termData?.data || termData?.data.length === 0 &&
						<EmptyTable 
							message='No Created Session' 
							text='Create Session' 
							onClick={() => setOpenCreateSession(true)}
							/>
					}

					{
						termDataError &&
					<div className="flex h-full items-center justify-center text-2xl text-[#e53e3e]">Something went wrong!</div>
					}
				</>
				
			</div>

			{/** Modals */}
			<CreateSessionModal
				openModal={openCreateSession}
				closeModal={() => setOpenCreateSession(false)}
			/>
			<Modal
				openModal={openViewTerm}
				closeModal={() => setOpenViewTerm(false)}
			>

					<form className="flex flex-col gap-y-[50px]" >
						<div className="flex items-center justify-between">
							<div>
								<p className="text-[#0F0F0F] text-lg mb-3">Term name</p>
								{ !viewTerm  || termData?.data.length  <= 0 ?
									<p className="font-semibold text-black text-xl">Unset</p>:
									<p className="font-semibold text-black text-xl">{viewTerm?.termName}</p>
								}
							</div>
							<div>
								<p className="text-[#0F0F0F] text-lg mb-3">Session</p>
								<p className="font-semibold text-black text-xl">{sessionName}</p>
							</div>
						</div>
						<div className="flex flex-col gap-y-7">

								<InputField
									label="Term start date"
									name='First Term'
									placeholder={viewTerm?.termStartDate ? moment(viewTerm?.termStartDate).format('DD/MM/YYYY') : ''}
									otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
									disabled
								/>

								<InputField
									label="Term end date"
									name="first_term"
									placeholder={viewTerm?.termEndDate ? moment(viewTerm?.termEndDate).format('DD/MM/YYYY') : ''}
									otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
									disabled
								/>

						</div>
						{isEditing && (
							<div className="w-full">
								<FormControlLabel
									control={<Checkbox 
									checked={updateTerm}
									onChange={() => setUpdateTerm(!updateTerm)}
									/>}
								label={<p className="text-[#5A5A5A]">Make current Term</p>}
								/>
							</div>
						)}
						<Button
							color="tertiary"
							variant="contained"
							onClick={() => {
								if (isEditing) {
									// setOpenViewTerm(false);
									makeCurrTerm();
								} else {
									setIsEditing(true);
								}
							}}
							sx={{
								color: "white",
								borderRadius: "10px",
								paddingY: "12px",
								width: "fit-content",
							}}
						>
							{isEditing ? "Update" : "Edit"}
						</Button>
					</form>
			</Modal>
		</>
	);
}

export default SessionTerm;
