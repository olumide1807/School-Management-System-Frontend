import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FilterComponent from "../../../../../Components/FilterComponent";
import BasicTable from "../../../../../Components/Tables/BasicTable";
import CreateSessionModal from "../Modals/CreateSessionModal";
import Modal from "../../../../../Components/Modals";
import { useGetAllSession, useSessionTerm } from "../../../../../services/api-call";
import SERVER from "../../../../../Utils/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Loader from "../../../../loaders/Loader";
import BasicButton from "../../../../../Components/Forms/BasicButton";
import EmptyTable from "../../../../../Components/EmptyTable";
import { CircularProgress } from "@mui/material";
import moment from 'moment';
import { toast } from "react-toastify";
import { toastOptions } from "../../../../../Utils/toastOptions";
import DatePickerInput from "../../../../../Components/Forms/DatePicker";



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

	const queryClient = useQueryClient();
	const { data, isPending: sessionPending, error: sessionError } = useSessionTerm();

	let sessionName = data?.data?.data?.session?.sessionName;
	const currentSessionId = data?.data?.data?.session?._id;

	const allSessions = useGetAllSession();

	const [openCreateSession, setOpenCreateSession] = useState(false);
	const [openViewTerm, setOpenViewTerm] = useState(false);
	const [choice, setChoice] = useState<string>("");
	const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

	const [viewTerm, setViewTerm] = useState<any>(null);
	const [editStartDate, setEditStartDate] = useState<any>('');
	const [editEndDate, setEditEndDate] = useState<any>('');
	const [editCurrentTerm, setEditCurrentTerm] = useState(false);
	const [saving, setSaving] = useState(false);

	// Build sessions list for the dropdown
	const sessionsList = allSessions?.data?.data?.data || [];
    const sessions = sessionsList.map((session: any) => ({
        label: `${session.sessionName}`,
        value: `${session.sessionName}`
    }));

	// When current session loads, set it as default choice
	useEffect(() => {
		if (sessionName && !choice) {
			setChoice(sessionName);
		}
	}, [sessionName]);

	// When choice changes, find the matching session ID
	useEffect(() => {
		if (choice && sessionsList.length > 0) {
			const found = sessionsList.find((s: any) => s.sessionName === choice);
			if (found) {
				setSelectedSessionId(found._id);
			}
		}
	}, [choice, sessionsList]);

	// If no choice selected yet but we have a current session, use that
	const activeSessionId = selectedSessionId || currentSessionId;

	const { isPending, data: termData, error: termDataError } = useQuery({
		queryKey: ['terms', activeSessionId],
		queryFn: async () => {
			const res = await SERVER.get(`session/term/${activeSessionId}`)
			return res?.data
		},
		enabled: !!activeSessionId,
		retry: false,
	});

	// Format table data to show "Active"/"Inactive" and formatted dates
	const formatDate = (dateVal: any) => {
		if (!dateVal || dateVal === '' || dateVal === null || dateVal === undefined) return 'Not set';
		// Try parsing as ISO, then as various formats
		const parsed = moment(dateVal);
		if (parsed.isValid()) return parsed.format('DD/MM/YYYY');
		// Try parsing with explicit formats
		const parsed2 = moment(dateVal, ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DDTHH:mm:ss.SSSZ'], true);
		if (parsed2.isValid()) return parsed2.format('DD/MM/YYYY');
		return 'Not set';
	};

	const formattedTermData = termData?.data?.map((term: any) => {
		return {
			...term,
			termStartDate: formatDate(term.termStartDate),
			termEndDate: formatDate(term.termEndDate),
			currentTerm: term.currentTerm ? 'Active' : 'Inactive',
			_raw: term,
		};
	}) || [];

	// No current session exists yet — not an error, just empty state
	const noSession = !sessionPending && (!data?.data?.data?.session || sessionError) && sessionsList.length === 0;

	const handleTerm = (term: any) => {
		const raw = term._raw || term;
		setViewTerm(raw);
		const startDate = raw.termStartDate && moment(raw.termStartDate).isValid() ? new Date(raw.termStartDate) : '';
		const endDate = raw.termEndDate && moment(raw.termEndDate).isValid() ? new Date(raw.termEndDate) : '';
		setEditStartDate(startDate);
		setEditEndDate(endDate);
		setEditCurrentTerm(raw.currentTerm === true);
		setOpenViewTerm(true);
	}

	const makeCurrentSession = async () => {
		if (!selectedSessionId) return;
		try {
			const res = await SERVER.put(`session/${selectedSessionId}`, {
				currentSession: true
			});
			if (res.data) {
				toast.success('Session set as current successfully!', toastOptions);
				queryClient.invalidateQueries({ queryKey: ['session'] });
				queryClient.invalidateQueries({ queryKey: ['all-session'] });
			}
		} catch (error) {
			toast.error('Something went wrong, please try again!', toastOptions);
		}
	}

	const handleUpdateTerm = async () => {
		if (!viewTerm) return;
		setSaving(true);
		try {
			const payload: any = {};
			
			if (editStartDate) {
				payload.termStartDate = editStartDate instanceof Date ? editStartDate.toISOString() : editStartDate;
			}
			if (editEndDate) {
				payload.termEndDate = editEndDate instanceof Date ? editEndDate.toISOString() : editEndDate;
			}
			payload.currentTerm = editCurrentTerm;

			const res = await SERVER.put(`session/term/${viewTerm._id}`, payload);
			if (res.data.success === true) {
				toast.success('Term updated successfully!', toastOptions);
				setOpenViewTerm(false);
				queryClient.invalidateQueries({ queryKey: ['terms'] });
				queryClient.invalidateQueries({ queryKey: ['session'] });
			} else {
				toast.warn('Cannot perform this action', toastOptions);
			}
		} catch (error) {
			toast.error('Something went wrong, please try again!', toastOptions);
		} finally {
			setSaving(false);
		}
	}

	const handleCreateModalClose = () => {
		setOpenCreateSession(false);
		queryClient.invalidateQueries({ queryKey: ['session'] });
		queryClient.invalidateQueries({ queryKey: ['all-session'] });
		queryClient.invalidateQueries({ queryKey: ['terms'] });
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
				{sessionsList.length > 0 && (
					<div className="w-full gap-4 md:ml-5 md:pr-12 flex md:flex-row md:items-center md:justify-between mb-4">
						<FilterComponent
							menuOptions={sessions}
							choice={choice}
							setChoice={(val: string) => setChoice(val)}
						/>
						{	
							selectedSessionId && selectedSessionId !== currentSessionId &&
							<BasicButton 
								text='Make Current session' 
								color='tertiary' 
								variant='contained' 
								onClick={makeCurrentSession}
							/>
						}
					</div>
				)}
				
				<>
					{sessionPending && <Loader/>}
					{noSession ? (
						<EmptyTable 
							message='No Created Session' 
							text='Create Session' 
							onClick={() => setOpenCreateSession(true)}
						/>
					) : activeSessionId && isPending ? (
						<Loader/>
					) : activeSessionId && termDataError ? (
						<div className="flex h-full items-center justify-center text-2xl text-[#e53e3e]">Something went wrong!</div>
					) : activeSessionId && formattedTermData.length > 0 ? (
						<BasicTable
							sideIcon
							headcells={headcells}
							onClick={handleTerm}
							tableData={formattedTermData} 
						/>
					) : activeSessionId ? (
						<EmptyTable 
							message='No Terms in this Session' 
							text='Create Session' 
							onClick={() => setOpenCreateSession(true)}
						/>
					) : null}
				</>
				
			</div>

			{/** Modals */}
			<CreateSessionModal
				openModal={openCreateSession}
				closeModal={handleCreateModalClose}
			/>

			{/* Edit Term Modal */}
			<Modal
				openModal={openViewTerm}
				closeModal={() => setOpenViewTerm(false)}
				title={viewTerm?.termName ? `Edit ${viewTerm.termName}` : 'Edit Term'}
			>
				<div className="flex flex-col gap-y-8">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-[#757575] text-sm mb-1">Term</p>
							<p className="font-semibold text-black text-lg">{viewTerm?.termName}</p>
						</div>
						<div>
							<p className="text-[#757575] text-sm mb-1">Session</p>
							<p className="font-semibold text-black text-lg">{choice || sessionName}</p>
						</div>
					</div>

					<div className="flex flex-col md:flex-row gap-5">
						<DatePickerInput
							name="termStartDate"
							label="Start date"
							value={editStartDate}
							onChange={(date: any) => setEditStartDate(date)}
							placeholder="- - / - - / - - - -"
						/>
						<DatePickerInput
							name="termEndDate"
							label="End date"
							value={editEndDate}
							onChange={(date: any) => setEditEndDate(date)}
							placeholder="- - / - - / - - - -"
						/>
					</div>

					<FormControlLabel
						control={
							<Checkbox 
								checked={editCurrentTerm}
								onChange={() => setEditCurrentTerm(!editCurrentTerm)}
							/>
						}
						label={<p className="text-[#5A5A5A]">Set as current term</p>}
					/>

					<Button
						color="tertiary"
						variant="contained"
						onClick={handleUpdateTerm}
						disabled={saving}
						sx={{
							color: "white",
							borderRadius: "10px",
							paddingY: "12px",
							width: "fit-content",
						}}
					>
						{saving ? "Saving..." : "Save Changes"}
					</Button>
				</div>
			</Modal>
		</>
	);
}

export default SessionTerm;