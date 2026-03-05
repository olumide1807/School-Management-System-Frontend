/* eslint-disable react/prop-types */
import { useForm, FormProvider } from "react-hook-form";
import Button from "@mui/material/Button";

import Modal from "../../../../../Components/Modals";
import AutocompleteField from "../../../../../Components/Forms/AutocompleteField";

export default function AssignTeacherModal({ openModal, closeModal }) {
	const method = useForm({
		mode: "all",
	});

	const onSubmit = async (data) => {
		console.log(data);
	};
	return (
		<Modal openModal={openModal} closeModal={closeModal} title="Assign teacher">
			<FormProvider {...method}>
				<form
					onSubmit={method.handleSubmit(onSubmit)}
					className="flex flex-col gap-y-[134px]"
				>
					<AutocompleteField
						name="teacher"
						placeholder="Select Academic staff"
						selectOption={options}
					/>
					<div>
						<Button
							color="tertiary"
							variant="contained"
							type="submit"
							sx={{
								color: "white",
								borderRadius: "10px",
								paddingY: "12px",
								maxWidth: "221px",
							}}
						>
							Assign teacher
						</Button>
					</div>
				</form>
			</FormProvider>
		</Modal>
	);
}

const options = ["Mr Ade", "Miss Tayo", "Samuel"];
