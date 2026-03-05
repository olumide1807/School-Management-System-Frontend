/* eslint-disable react/prop-types */
import { useForm, FormProvider } from "react-hook-form";
import Button from "@mui/material/Button";

import AutocompleteField from "../../../../../Components/Forms/AutocompleteField";
import { MessageModal2 } from "../../../../../Components/Modals/MessageModal";

export default function LinkStudentModal({ openModal, closeModal }) {
	const method = useForm({ mode: "all" });
	const onSubmit = async (data) => {
		console.log(data);
	};

	return (
		<MessageModal2
			desc="Link Pricilla Jane Gator to a student"
			openModal={openModal}
			closeModal={closeModal}
		>
			<FormProvider {...method}>
				<form
					onSubmit={method.handleSubmit(onSubmit)}
					className="flex flex-col gap-y-10"
				>
					<AutocompleteField
						label="Select student"
						labelFor="guardian"
						name="guardian"
						placeholder="Select student"
						selectOption={[]}
					/>
					<AutocompleteField
						label="Relationship"
						labelFor="relationship"
						name="relationship"
						placeholder="Select relationship"
						selectOption={relationship}
					/>
					<div className="text-center">
						<Button
							color="tertiary"
							variant="contained"
							type="submit"
							sx={{
								color: "white",
								borderRadius: "10px",
								paddingY: "12px",
								maxWidth: "331px",
							}}
						>
							Link student
						</Button>
					</div>
				</form>
			</FormProvider>
		</MessageModal2>
	);
}

const relationship = ["Father", "Mother", "Brother", "Sister", "Aunt", "Uncle"];
