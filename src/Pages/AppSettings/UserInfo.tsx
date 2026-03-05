import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@mui/material";
import { useState } from "react";
import ValidatedInput from "../../Components/Forms/ValidatedInput";
import InputField from "../../Components/Forms/ValidatedInput";
import MessageModal from "../../Components/Modals/MessageModal";
import Success from "../../Components/Modals/SuccessModal";
import ErrorModal from "../../Components/Modals/ErrorModal";
import logo from "../../assets/icons/BasitechLogo2.svg";

export default function UserInfo({
  readProfileOnly1,
  setReadProfileOnly1,
  readProfileOnly2,
  setReadProfileOnly2,
}) {
  const [openPasswordSuccess, setOpenPasswordSuccess] = useState(false);
  const [openPasswordError, setOpenPasswordError] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  return (
    <div>
      <UserForm
        title={"School Profile Details"}
        setOnlyRead={setReadProfileOnly1}
        onlyRead={readProfileOnly1}
      >
        <div className="flex items-end w-fit">
          <div className="bg-white p-3 my-2 w-fit">
            <img src={logo} alt="" />
          </div>
          <p className="ml-3 text-primary">Replace logo</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-x-5 gap-y-4">
          <ValidatedInput
            name="Name"
            label="Name"
            readOnly={readProfileOnly1}
            otherClass="bg-white rounded-xl border-[#ccc] border"
            defaultValue={fakedata.school_name}
          />
          <ValidatedInput
            name="Email address"
            label="Email address"
            readOnly={readProfileOnly1}
            otherClass="bg-white rounded-xl border-[#ccc] border"
            defaultValue={fakedata.school_email}
          />
          <ValidatedInput
            name="Phone number"
            label="Phone number"
            readOnly={readProfileOnly1}
            otherClass="bg-white rounded-xl border-[#ccc] border"
            defaultValue={fakedata.phone}
          />
          <ValidatedInput
            name="Address"
            label="Address"
            readOnly={readProfileOnly1}
            otherClass="bg-white rounded-xl border-[#ccc] border"
            defaultValue={fakedata.school_address}
          />
          <ValidatedInput
            name="Postal Code"
            label="Postal Code"
            readOnly={readProfileOnly1}
            otherClass="bg-white rounded-xl border-[#ccc] border"
            defaultValue={fakedata.postal_code}
          />
        </div>
      </UserForm>
      <UserForm
        title={"Session Update"}
        setOnlyRead={setReadProfileOnly2}
        onlyRead={readProfileOnly2}
      >
        <div className="lg:w-[400px]">
          <ValidatedInput
            name="Current Session"
            label="Current Session"
            readOnly={readProfileOnly2}
            otherClass="bg-white rounded-xl border-[#ccc] border"
            defaultValue={fakedata.session}
          />
          <h2 className="text-lg font-semibold mt-9 mb-5">
            Admission ID format
          </h2>
          <ValidatedInput
            name="Current format"
            label="Current format (e.g BAS/2015/001)"
            readOnly={readProfileOnly2}
            otherClass="bg-white rounded-xl border-[#ccc] border"
            defaultValue={fakedata.admission_id_format}
          />
        </div>
      </UserForm>
      <UserForm
        setPasswordMatch={setPasswordMatch}
        setOpenPasswordError={setOpenPasswordError}
        setOpenPasswordSuccess={setOpenPasswordSuccess}
      >
        <h2 className="text-lg font-semibold mb-5">Manage Password </h2>
        <div className="grid lg:grid-cols-2 gap-x-5 gap-y-4">
          <ValidatedInput
            name="Current Password"
            label="Current Password"
            otherClass="bg-white rounded-xl border-[#ccc] border"
            type="password"
            onInput={() => setPasswordMatch(false)}
          />
          <ValidatedInput
            name="New Password"
            label="New Password"
            otherClass="bg-white rounded-xl border-[#ccc] border"
            type="password"
            onInput={() => setPasswordMatch(false)}
          />
          <Button
            variant="contained"
            color="tertiary"
            sx={{
              color: "white",
              width: "300px",
              padding: "10px",
              marginTop: "15px",
            }}
            disabled={passwordMatch}
            type="submit"
            onClick={() => setOpenPasswordError(false)}
          >
            Change password
          </Button>
        </div>
      </UserForm>

      {/* Modal screen */}

      {/* Password Success Modal */}
      <Success
        message={"Password change successful"}
        openModal={openPasswordSuccess}
        closeModal={() => {
          setOpenPasswordSuccess(false);
        }}
        otherClasses={"h-[50vh]"}
      />

      {/* ErrorModal */}
      <ErrorModal
        message={"Password change successful"}
        openModal={openPasswordError}
        closeModal={() => {
          setOpenPasswordError(false);
        }}
        otherClasses={"h-[50vh]"}
      />

      {/* End Modal Screen */}
    </div>
  );
}

function UserForm({
  title,
  children,
  setOnlyRead,
  onlyRead,
  setPasswordMatch,
  setOpenPasswordError,
  setOpenPasswordSuccess,
}) {
  const method = useForm({
    method: "all",
  });
  function handlePasswordMatch(curr, newP) {
    console.log(curr, newP);
    if (curr === newP) {
      setPasswordMatch(false);
      setOpenPasswordError(true);
      return;
    }
    setPasswordMatch(true);
    setOpenPasswordSuccess(true);
  }
  return (
    <FormProvider {...method}>
      <form
        className="bg-bg-2 my-5 rounded-md border p-7"
        onSubmit={method.handleSubmit((data) => {
          if (data["New Password"])
            handlePasswordMatch(data["Current Password"], data["New Password"]);
          console.log(data);
        })}
      >
        <div className="flex items-center justify-between">
          {title && (
            <>
              <h2 className="text-lg font-semibold mb-5">{title}</h2>
              <div>
                {onlyRead ? (
                  <Button
                    variant="contained"
                    color="tertiary"
                    sx={{ color: "white" }}
                    onClick={() => {
                      setOnlyRead(false);
                    }}
                  >
                    Edit
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="tertiary"
                    sx={{ color: "white" }}
                    type="submit"
                  >
                    Save Changes
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
        {children}
      </form>
    </FormProvider>
  );
}

const fakedata = {
  school_name: "ALS International school",
  school_email: "alsjuss@gmail.com",
  school_address: "12, Ajapa, Surulere, Lagos state, Nigeria",
  postal_code: "11020",
  phone: "07098989898",
  session: "2021 / 2022",
  admission_id_format: "ALS / 000",
};
