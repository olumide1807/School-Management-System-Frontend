import { Link } from "react-router-dom";
import OnboardingLayout from "../../Templates/OnboardingLayout";
import { useState } from "react";
import { Input, Button, ErrorMsg } from "../../Components/Forms";
import { login } from "../../redux/apiCall";
import { useDispatch, useSelector } from "react-redux";
import InputField from '../../Components/Forms/InputField'
import LoaderOverlay from "./Loader";
// import { setToken } from "../../redux/slice/authSlice";
// import login from '../../redux/slice/authSlice'


export default function Login() {

	
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);

  const { loading, error } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
     await login(dispatch, { email, password });
  };


  return (
    <>
         
        <OnboardingLayout>

          <div className="flex flex-col w-[383px] pb-32 px-5 lg:px-0">
            <div className="flex flex-col items-center mb-[44px]">
              <h3 className="font-semibold text-2xl tracking-widest mb-4 text-white">
                WELCOME BACK
              </h3>
              <p className="text-lg text-white">
                Don&apos;t have an account?{" "}
                <Link className="text-primary" to="/register">
                  Register
                </Link>
              </p>
            </div>

              <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="flex flex-col gap-y-9">
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email address"
                    onChange={(e) => setEmail(e.target.value)}
                    required={true}
                    otherClass="text-white border border-x-0 b border-t-0 rounded-[5px]"
                  />
                  <div className="flex flex-col gap-y-7S">
                    <InputField
                      name="password"
                      placeholder="Password"
                      type="password"
                      onChange={(e) => setPassword(e.target.value)}
                      required={true}
                      otherClass="text-white border border-x-0 b border-t-0 rounded-[5px]"
                    />
                    <Link
                      to="/forgot-password"
                      className="self-end text-primary text-[15px]"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <div className="mt-[10px]">
                  <Button text="Login" type="submit" />

                  {error === true && (
                    <ErrorMsg text="Please enter a valid email and password" />
                  )}
                </div>
              </form>

          </div>
        </OnboardingLayout>
        {loading === true && <LoaderOverlay />}
      {/* } */}
      
    </>
  );

}
