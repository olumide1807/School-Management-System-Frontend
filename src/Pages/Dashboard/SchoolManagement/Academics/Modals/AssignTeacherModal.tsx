/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Button, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import Modal from "../../../../../Components/Modals";
import SERVER from "../../../../../Utils/server";
import { toastOptions } from "../../../../../Utils/toastOptions";

export default function AssignTeacherModal({
	openModal,
	closeModal,
	classArmId,
	currentTeacherId,
	className,
}) {
	const queryClient = useQueryClient();
	const [selectedTeacherId, setSelectedTeacherId] = useState("");
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		setSelectedTeacherId(currentTeacherId || "");
	}, [currentTeacherId, openModal]);

	const { data: staffData } = useQuery({
		queryKey: ["all-staff"],
		queryFn: async () => {
			const res = await SERVER.get("staff");
			return res?.data;
		},
	});

	const teachers = (staffData?.data || []).filter(
		(s) => s.staffType === "academic" && s.isActive !== false
	);

	const handleAssign = async () => {
		if (!classArmId || !selectedTeacherId) return;
		setSaving(true);
		try {
			await SERVER.put(`class/${classArmId}/teacher/assign/${selectedTeacherId}`);
			toast.success("Class teacher assigned!", toastOptions);
			queryClient.invalidateQueries({ queryKey: ["class-arms"] });
			queryClient.invalidateQueries({ queryKey: ["class-arm", classArmId] });
			closeModal();
		} catch (error) {
			toast.error(
				error?.response?.data?.error || "Failed to assign teacher",
				toastOptions
			);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Modal
			openModal={openModal}
			closeModal={closeModal}
			title={`Assign Class Teacher${className ? ` — ${className}` : ""}`}
		>
			<div className="flex flex-col gap-y-8">
				{teachers.length === 0 ? (
					<p className="text-gray-500">
						No academic staff available. Add academic staff first.
					</p>
				) : (
					<>
						<FormControl fullWidth>
							<InputLabel id="assign-class-teacher-label">
								Select Academic Staff
							</InputLabel>
							<Select
								labelId="assign-class-teacher-label"
								value={selectedTeacherId}
								label="Select Academic Staff"
								onChange={(e) => setSelectedTeacherId(e.target.value)}
								sx={{ borderRadius: "10px", backgroundColor: "#F7F8F8" }}
							>
								{teachers.map((s) => (
									<MenuItem key={s._id} value={s._id}>
										{`${s.firstName || ""} ${s.surname || s.lastName || ""}`.trim()}
									</MenuItem>
								))}
							</Select>
						</FormControl>
						<Button
							color="tertiary"
							variant="contained"
							onClick={handleAssign}
							disabled={saving || !selectedTeacherId || !classArmId}
							sx={{
								color: "white",
								borderRadius: "10px",
								paddingY: "12px",
								maxWidth: "221px",
							}}
						>
							{saving ? "Assigning..." : "Assign teacher"}
						</Button>
					</>
				)}
			</div>
		</Modal>
	);
}