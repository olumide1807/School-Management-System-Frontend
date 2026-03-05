import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import defaultProfile from "../../../assets/images/defaultBg.png";
import { Button } from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import MessageModal from "../../../Components/Modals/MessageModal";
import InputField from "../../../Components/Forms/InputField";
import TextAreaField from "../../../Components/Forms/TextAreaField";

export default function ViewStaffProfile() {
  const [bioDataTab, setBioDataTab] = useState(true);
  const [otherTab, setOtherTab] = useState(!bioDataTab);

  const navigate = useNavigate();
  return (
    <div>
      <section
        className="text-tertiary cursor-pointer w-fit"
        onClick={() => navigate("/staff-management")}
      >
        <KeyboardBackspaceIcon sx={{ color: "inherit" }} />
        <span className="mx-2">Back</span>
      </section>
      <ShortDetail />

      <section className="flex text-center mt-10 cursor-pointer">
        <div
          className={`border-bg-2 ${
            bioDataTab && "border-tertiary"
          } w-[200px] p-3 border-b-2`}
          onClick={() => {
            setBioDataTab(true);
            setOtherTab(false);
          }}
        >
          Personal Bio Data
        </div>
        <div
          className={`border-bg-2 ${
            otherTab && "border-tertiary"
          } w-[200px] p-3 border-b-2`}
          onClick={() => {
            setBioDataTab(false);
            setOtherTab(true);
          }}
        >
          Other Information
        </div>
      </section>

      {bioDataTab ? <BioDataTab /> : <OtherTab />}
    </div>
  );
}

function BioDataTab() {
  const inputFields = [
    { label: "Gender", defaultValue: "Male" },
    { label: "Email Address", defaultValue: "damisco005@gmail.com" },
    { label: "Phone Number", defaultValue: "09011593490" },
    { label: "Marital Status", defaultValue: "Single-Searching" },
    { label: "Country", defaultValue: "Nigeria" },
    { label: "State Of Origin", defaultValue: "Ogun" },
    { label: "Local Government Area", defaultValue: "Ifo" },
    { label: "Religion", defaultValue: "Peace" },
    { label: "Next Of Kin Name First Name", defaultValue: "basitech" },
    { label: "Next Of Kin Name Surname", defaultValue: "basitech" },
    { label: "Next Of Kin Phone Number", defaultValue: "091-basitech" },
    { label: "Relationship To The Next Of Kin", defaultValue: "boss" },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-x-10 gap-y-5 my-4">
        {inputFields.map((inputField) => (
          <InputField
            label={inputField.label}
            otherClass="rounded border-none border-[#ccc] h-[40px] md:h-[40px] bg-[#F3F3F3] w-[400px]"
            value={inputField.defaultValue}
            readOnly
          />
        ))}
      </div>
      <TextAreaField
        className="compulsory-input w-full border-none resize-none rounded-t-xl p-3 bg-inherit outline-none text-black"
        otherClass=" border-none bg-[#F3F3F3] w-5/6"
        label="Home Address"
        rows="4"
        value={"No 5, Ogun street, Ifo, Ogun state"}
      />
    </>
  );
}

function OtherTab({ assignedClasses = [{}, {}], assignedSubjects = [{}, {}] }) {
  return (
    <div className="grid grid-cols-2 gap-x-10 gap-y-5 my-4">
      <InputField
        label={"Staff type"}
        otherClass="rounded border-none border-[#ccc] h-[40px] md:h-[40px] bg-[#F3F3F3] w-[400px]"
        value={"Academic staff"}
        readOnly
      />{" "}
      <InputField
        label={"Salary with currency"}
        otherClass="rounded border-none border-[#ccc] h-[40px] md:h-[40px] bg-[#F3F3F3] w-[400px]"
        value={"N 40 000"}
        readOnly
      />{" "}
      <InputField
        label={"Employment Date"}
        otherClass="rounded border-none border-[#ccc] h-[40px] md:h-[40px] bg-[#F3F3F3] w-[400px]"
        value={"31 / 02 / 2009"}
        readOnly
      />
      <InputField
        label={"Minimum Qualification"}
        otherClass="rounded border-none border-[#ccc] h-[40px] md:h-[40px] bg-[#F3F3F3] w-[400px]"
        value={"ND"}
        readOnly
      />
      <aside className="">
        {assignedClasses.map((assignedClass, c) => (
          <>
            <p className="my-4">Assigned subject {c + 1}</p>
            <div className="flex justify-between w-[75%]">
              <p className="px-5 py-3 bg-[#F3F3F3] rounded-3xl">History</p>
              <p className="px-5 py-3 bg-[#F3F3F3] rounded-3xl">
                English language
              </p>
              <p className="px-5 py-3 bg-[#F3F3F3] rounded-3xl">CRS</p>
            </div>
          </>
        ))}
      </aside>
      <aside className="">
        {assignedSubjects.map((assignedSubject, c) => (
          <>
            <p className="my-4">Assigned class {c + 1}</p>
            <div className="flex justify-between w-[75%]">
              <p className="px-5 py-3 bg-[#F3F3F3] rounded-3xl uppercase">
                Jss 1b
              </p>
              <p className="px-5 py-3 bg-[#F3F3F3] rounded-3xl uppercase">
                Jss 2a
              </p>
              <p className="px-5 py-3 bg-[#F3F3F3] rounded-3xl uppercase">
                ss 1b
              </p>
            </div>
          </>
        ))}
      </aside>
    </div>
  );
}
function ShortDetail() {
  const staffId = useParams();
  const navigate = useNavigate();

  const [openRemoveStaff, setOpenRemoveStaff] = useState(false);
  const [openAddAdmin, setOpenAddAdmin] = useState(false);

  return (
    <section className="flex justify-between my-5">
      <aside className="flex gap-x-3">
        <div className="w-[130px] h-[128px]">
          <img src={defaultProfile} alt="profile-pic" className="w-full " />
        </div>
        <div>
          <p className="font-bold m-3">Mr. Peter Gator</p>
          <p className="bg-[#EAEAEA] p-2 rounded-xl m-3 w-fit">{staffId.id}</p>
          <span>
            <span className="font-semibold m-3 text-sm">Class teacher</span>
            <span className="bg-[#EAEAEA] p-2 rounded-xl m-3">SSS 1B</span>
          </span>
        </div>
      </aside>
      <aside className="mt-auto flex gap-x-2">
        <Button
          variant="outlined"
          sx={{ width: "150px", borderRadius: "10px" }}
          onClick={() => navigate("/staff-management/staff-profile/edit")}
        >
          Edit Profile
        </Button>
        <Button
          variant="contained"
          color="secondary"
          sx={{
            color: "white",
            width: "150px",
            borderRadius: "10px",
          }}
          onClick={() => setOpenAddAdmin(true)}
        >
          Make Admin
        </Button>
        <Button
          variant="contained"
          color="tertiary"
          sx={{
            color: "white",
            width: "150px",
            borderRadius: "10px",
          }}
          onClick={() => setOpenRemoveStaff(true)}
        >
          Delete Staff
        </Button>
      </aside>
      {/* Removing staff */}
      <MessageModal
        openModal={openRemoveStaff}
        closeModal={() => setOpenRemoveStaff(false)}
        desc="  This action will delete this staff data from the app.
"
        desc2="   Do you wish to delete this staff ?"
        btn1Name={"Yes, delete staff"}
        handleClick={() => console.log("removing admin")}
        btn2Name={"No"}
        column={true}
      />

      {/* Make Admin */}
      <MessageModal
        openModal={openAddAdmin}
        closeModal={() => setOpenAddAdmin(false)}
        desc="This will give this staff admin privilege."
        desc2="Are you sure you want to make this staff an admin ?"
        btn1Name={"Yes, make admin"}
        handleClick={() => console.log("making admin")}
        btn2Name={"No"}
        column={true}
      />
    </section>
  );
}
