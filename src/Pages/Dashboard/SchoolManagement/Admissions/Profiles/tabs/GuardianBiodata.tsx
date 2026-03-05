/* eslint-disable react/prop-types */
import { useForm, FormProvider } from "react-hook-form";

import AutocompleteField from "../../../../../../Components/Forms/AutocompleteField";
import ValidatedInput from "../../../../../../Components/Forms/ValidatedInput";
import ValidatedTextAreaField from "../../../../../../Components/Forms/ValidatedTextAreaField";

export default function GuardianData({ data }) {
	const method = useForm({ mode: "all" });
	return (
		<FormProvider {...method}>
			<div className="flex flex-col gap-y-9 w-full max-w-[925px]">
				<div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
					<AutocompleteField
						label="Title *"
						name="title"
						placeholder="Select title"
						selectOption={["Mr", "Mrs", "Miss", "Dr", "Engr"]}
						disabled
						defaultValue={data?.title}
					/>
					<ValidatedInput
						label="First name"
						name="parent_first_name"
						placeholder="Enter first name"
						otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
						disabled
						defaultValue={data?.parent_first_name}
					/>
				</div>
				<div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
					<ValidatedInput
						label="Last name"
						name="parent_last_name"
						placeholder="Enter last name"
						otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
						disabled
						defaultValue={data?.parent_last_name}
					/>
					<AutocompleteField
						label="Gender *"
						name="parent_gender"
						placeholder="Select gender"
						selectOption={["Male", "Female"]}
						disabled
						defaultValue={data?.parent_gender}
					/>
				</div>
				<div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
					<AutocompleteField
						label="Marital status *"
						name="marital_status"
						placeholder="Select marital status"
						selectOption={["Single", "Married"]}
						disabled
						defaultValue={data?.marital_status}
					/>
					<ValidatedInput
						label="Email address"
						name="parent_email"
						type="email"
						placeholder="Enter email address"
						otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
						disabled
						defaultValue={data?.parent_email}
					/>
				</div>
				<div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
					<ValidatedInput
						label="Phone number"
						name="phone_number"
						type="number"
						otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
						disabled
						defaultValue={data?.phone_number}
					/>
					<ValidatedInput
						label="Occupation *"
						name="occupation"
						placeholder="Enter occupation"
						otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
						disabled
						defaultValue={data?.occupation}
					/>
				</div>
				<AutocompleteField
					label="Relationship"
					name="relationship"
					placeholder="Select relationship"
					selectOption={[]}
					disabled
					defaultValue={data?.relationship}
				/>
				<ValidatedTextAreaField
					name="parent_home_address"
					label="Home addres *"
					placeholder="Enter home address*"
					disabled
					defaultValue={data?.parent_home_address}
				/>
			</div>
		</FormProvider>
	);
}
