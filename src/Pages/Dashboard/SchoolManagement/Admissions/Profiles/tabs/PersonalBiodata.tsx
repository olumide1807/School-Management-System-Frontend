/* eslint-disable react/prop-types */
import { useForm, FormProvider } from "react-hook-form";

import AutocompleteField from "../../../../../../Components/Forms/AutocompleteField";
import ValidatedInput from "../../../../../../Components/Forms/ValidatedInput";
import ValidatedTextAreaField from "../../../../../../Components/Forms/ValidatedTextAreaField";
import DatePickerField from "../../../../../../Components/Forms/DatePickerField";

export default function PersonalBiodata({ data }) {
	const method = useForm({ mode: "all" });
	return (
		<FormProvider {...method}>
			<div className="mb-14 flex flex-col gap-y-9 w-full max-w-[925px]">
				<div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
					<AutocompleteField
						label="Class level *"
						name="level"
						placeholder="Select class level"
						selectOption={[]}
						disabled
						defaultValue={data?.level}
					/>
					<ValidatedInput
						label="Student number"
						name="student_no"
						placeholder="e.g SCH0001"
						otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
						disabled
						defaultValue={data?.student_no}
					/>
				</div>
				<div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
					<AutocompleteField
						label="Gender *"
						name="gender"
						placeholder="Select gender"
						selectOption={["Male", "Female"]}
						disabled
						defaultValue={data?.gender}
					/>
					<ValidatedInput
						label="First name"
						name="first_name"
						placeholder="Enter first name"
						otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
						disabled
						defaultValue={data?.first_name}
					/>
				</div>
				<div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
					<ValidatedInput
						label="Last name"
						name="last_name"
						placeholder="Enter last name"
						otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
						disabled
						defaultValue={data?.last_name}
					/>
					<ValidatedInput
						label="Other name"
						name="other_name"
						placeholder="Enter other name"
						otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
						disabled
						defaultValue={data?.other_name}
					/>
				</div>
				<div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
					<ValidatedInput
						label="Email address"
						name="email"
						type="email"
						placeholder="Enter email address"
						otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
						disabled
						defaultValue={data?.email}
					/>
					<ValidatedInput
						label="Phone number"
						name="phone_number"
						type="number"
						otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
						disabled
						defaultValue={data?.phone_number}
					/>
				</div>
				<div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
					<DatePickerField
						label="Email address*"
						name="dob"
						placeholder="DD / MM / YYYY"
						otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
						disabled
						defaultValue={data?.dob}
					/>
					<AutocompleteField
						label="Country *"
						name="country"
						placeholder="Select country"
						selectOption={["Nigeria", "Ghana", "Kenya"]}
						disabled
						defaultValue={data?.country}
					/>
				</div>
				<div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
					<AutocompleteField
						label="State of origin *"
						name="state"
						placeholder="Select state of origin"
						selectOption={["Lagos", "Ogun", "Kano", "Abia"]}
						disabled
						defaultValue={data?.state}
					/>
					<AutocompleteField
						label="Local government area *"
						name="lga"
						placeholder="Select local government area"
						selectOption={["Agege", "Alimosho", "Ikeja", "Badagry"]}
						disabled
						defaultValue={data?.lga}
					/>
				</div>
				<ValidatedTextAreaField
					name="home_address"
					label="Home addres *"
					placeholder="Enter home address*"
					disabled
					defaultValue={data?.home_address}
				/>
			</div>
		</FormProvider>
	);
}
