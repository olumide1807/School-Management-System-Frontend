/* eslint-disable react/prop-types */
import { useFormContext, get } from "react-hook-form";
import TextAreaField from "./TextAreaField";

export default function ValidatedTextAreaField({
	name,
	required,
	showErrMsg = true,
	errMsg,
	rules,
	...otherProps
}) {
	const methods = useFormContext({
		mode: "all",
	});
	const { register, formState } = methods;
	const { errors } = formState;
	const error = get(errors, name);
	return (
		<div>
			<TextAreaField
				{...otherProps}
				{...register(name, {
					required: required ? "This field is required" : false,
					...rules,
				})}
			/>
			{showErrMsg && error && (
				<div className="text-red-600">{error.message || errMsg}</div>
			)}
		</div>
	);
}
