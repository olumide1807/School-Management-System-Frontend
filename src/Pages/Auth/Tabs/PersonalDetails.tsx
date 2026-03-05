
import Input from '../../../Components/Forms/Input'


const PersonalDetails = ({ formData, setFormData }) => {

	const handleChange = (e) => {
		setFormData({...formData, [e.target.name]: e.target.value})
	}

	return (
		<div className="flex flex-col gap-y-9">
			<Input 
			name="firstName" 
			type='text'
			placeholder="First name" 
			onChange={handleChange} 
			value={formData.firstName}
			required='true'
			/>

			<Input 
			name="lastName" 
			type='text'
			placeholder="Last name" 
			onChange={handleChange}  
			value={formData.lastName}
			required='true'
			/>

			<Input
				name="emailAddress" 
				type='email'
				onChange={handleChange}
				value={formData.emailAddress}
				placeholder="Email address"
				required='true'

			/>

			<Input
				name="phoneNumber" 
				type='tel'
				onChange={handleChange}
				value={formData.phoneNumber}
				placeholder="Phone number"
				required='true'
				min={0}
			/>
		</div>
	);
}


export default PersonalDetails
