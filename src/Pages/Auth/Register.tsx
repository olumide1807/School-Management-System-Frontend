import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import OnboardingLayout from "../../Templates/OnboardingLayout";
import PersonalDetails from "./Tabs/PersonalDetails";
import SchoolDetails from "./Tabs/SchoolDetails";
import { capitalize } from "../../Utils";
import axios from 'axios'
import { API_URL } from "../../Utils/apiRoute";
import Loader from "./Loader";
import Button1 from "../../Components/Forms/Button";
import { ErrorMsg } from "../../Components/Forms";
import AuthModal from '../../Components/Modals/AuthModal';


const Register = () => {
	const [presentStep, setPresentStep] = useState("personal");
	const navigate = useNavigate();

	
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	
	const [formData, setFormData] = useState({
		firstName: "",
        lastName: "",
        emailAddress: "",
        phoneNumber: "",
        schoolName: "",
        schoolEmailAddress: "",
        schoolAddress: {
			number: '',
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: ""
        }
    });
	

	const stepComponents: Record<string, JSX.Element> = {
		personal: <PersonalDetails formData={formData} setFormData={setFormData}/>,
		school: <SchoolDetails formData={formData} setFormData={setFormData}/>,
	};



	const [successMessage, setSuccessMessage] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError('')

		try {
			const res = await axios.post(API_URL + '/superadmin/register', formData)

			if(res.data){
				setSuccessMessage(res.data.message || 'Registration successful!');
				return setSuccess(true); 
			} 
		} catch (err: any) {
			console.error(err)
			const errMsg = err?.response?.data?.error || err?.response?.data?.message || 'Something went wrong! please try again later';
			setError(errMsg);
			setLoading(false)
		} finally {
			setLoading(false)
		}
	};

	return (
		<>
		{
			loading === true ? <Loader/>: 

		<OnboardingLayout>
			<div className="flex flex-col w-[483px] mb-32 relative p-6 md:p-0">

				<div
					className={`absolute left-0 md:-left-12 lg:-left-[160px] xl:-left-[270px] -top-5 md:-top-12 ${
						presentStep === "school" ? "block" : "hidden"
					}`}
				>
					<Button
						onClick={(e) => {
							e.preventDefault();
							navigate("?tab=personal");
							setPresentStep("personal");
							window.scrollTo({ top: 0, behavior: "smooth" });
						}}
						sx={{ color: "#FFFFFF" }}
					>
						Back
					</Button>
				</div>
				<div className="flex flex-col items-center mb-[50px]">
					<h3 className="font-semibold text-2xl tracking-widest mb-4 text-white">
						REGISTER
					</h3>
					<p className="text-lg text-white">
						Have an account?{" "}
						<Link className="text-primary" to="/login">
							Login
						</Link>
					</p>
				</div>
				<p className="text-lg text-center text-white">
					{capitalize(presentStep)} details
				</p>
				<div className="flex items-center justify-center space-x-[45px] mt-[44px]">
					{steps?.map((step) => {
						return (
							<span
								key={step?.id}
								className={`h-[9px] w-[97px] rounded-[20px] ${
									step.value === presentStep
									? "bg-primary"
										: presentStep === "school"
										? "bg-primary"
										: "bg-white"
									}`}
									></span>
						);
					})}
				</div>
				<form
					onSubmit={handleSubmit}
					className="flex flex-col mt-9"
					>
						{stepComponents[presentStep]}
						<div className="mt-[74px]">
							{presentStep !== "school" ? (

								<Button
								variant="contained"
								color="primary"
								onClick={() => {
									setPresentStep("school");
									navigate("?tab=school");
									window.scrollTo({ top: 0, behavior: "smooth" });
									}}
									sx={{
										borderRadius: "10px !important",
										color: "#fff !important",
										paddingY: "15px !important",
										width: "100%",
										fontWeight: "500 !important",
										fontSize: "15px"
									}}
								>
									Next
								</Button>


							) : (
								<div className="mt-[2px]">
									<Button1 text='Register' type='submit' loading={loading} onClick={() => {}}/>
	
								{ error && <ErrorMsg text={error}/>	}

								</div>
							)}
							</div>
				</form>
			</div>

			
			{ success &&
				<AuthModal 
				open={success} 
				setSuccess={setSuccess}
				desc='Registration Successful!' 
				message={successMessage}
				url='/login'
				btn='Login'
				/>
			}
			
		</OnboardingLayout>
	}
		</>
	);

}

const steps = [
	{
		id: 1,
		value: "personal",
	},
	{
		id: 2,
		value: "school",
	},
];


export default Register;