import { Button } from "@mui/material";
import AutoCompleteField from "../../../../../Components/Forms/AutocompleteField";
import InputField from "../../../../../Components/Forms/InputField";
import TextAreaField from "../../../../../Components/Forms/TextAreaField";
import { useState } from "react";

export default function StaffDataTab({ staff, edit }) {
  const [imgPointer, setImgPointer] = useState(
    "/src/assets/images/defaultBg.png"
  );
  function previewUpload(file) {
    const fp = new FileReader();
    fp.onload = (e) => {
      setImgPointer(e.target.result);
    };
    fp.readAsDataURL(file);
  }
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDragLeave={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        previewUpload(e.dataTransfer.files[0]);
      }}
    >
      <section className="bg-bg-1 rounded-lg p-5 flex my-5">
        <figure className="border w-[220px] h-[128px] rounded-lg bg-white">
          <img
            className="w-full h-full rounded-lg"
            src={imgPointer}
            // alt="staff picture"
          />
        </figure>
        <div className="flex justify-center w-full items-center">
          <p className="">Drop your image file here or</p>
          <Button
            variant="contained"
            color="tertiary"
            sx={{
              color: "white",
              padding: "10px 23px",
              borderRadius: "12px",
              marginLeft: "15px",
            }}
          >
            <label htmlFor="staff-pic">Browse file</label>
            <input
              type="file"
              id="staff-pic"
              accept="images/*"
              hidden
              onChange={(fp) => {
                previewUpload(fp.target.files[0]);
              }}
            />
          </Button>
        </div>
      </section>
      <StaffData staff={staff} edit={edit} />
    </div>
  );
}

export function StaffData({ staff, edit }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-x-10 gap-y-5">
        <AutoCompleteField
          label={"Title"}
          placeholder="Select A Title"
          name={"title"}
          labelFor={"title"}
          size="small"
          selectOption={["Mr", "Mrs", "Ms", "Dr", "Prof"]}
          important={!staff}
          defaultValue={staff ? staff.title : ""}
          readOnly={!(!staff || edit)}
          bg="#F3F3F3"
        />
        <InputField
          label={"Surname"}
          placeholder="Enter Surname"
          name={"surname"}
          labelFor={"surn_name"}
          important={!staff}
          otherClass="rounded border border-[#ccc]  md:h-[40px] bg-[#F3F3F3]"
          defaultValue={staff ? staff.surname : ""}
          readOnly={!(!staff || edit)}
        />
        <InputField
          label={"First Name"}
          placeholder="Enter First Name"
          name={"first_name"}
          labelFor={"first_name"}
          important={!staff}
          otherClass="rounded border border-[#ccc] h-[40px] md:h-[40px] bg-[#F3F3F3]"
          defaultValue={staff ? staff.firstName : ""}
          readOnly={!(!staff || edit)}
        />
        <InputField
          label={"Other Name"}
          placeholder="Enter Other Name"
          name={"other_name"}
          labelFor={"other_name"}
          important={!staff}
          otherClass="rounded border border-[#ccc] h-[40px] md:h-[40px] bg-[#F3F3F3]"
          defaultValue={staff ? staff.otherName : ""}
          readOnly={!(!staff || edit)}
        />
        <AutoCompleteField
          label={"Gender"}
          placeholder="Select Gender"
          name="gender"
          labelFor={"gender"}
          size="small"
          important={!staff}
          selectOption={["Male", "Female"]}
          defaultValue={staff ? staff.gender : ""}
          readOnly={!(!staff || edit)}
          bg="#F3F3F3"
        />
        <AutoCompleteField
          label={"Marital status"}
          placeholder="Select Marital Status"
          name="marital_status"
          labelFor={"marital_status"}
          important={!staff}
          selectOption={["Single", "Married", "Divorced"]}
          defaultValue={staff ? staff.maritalStatus : ""}
          readOnly={!(!staff || edit)}
          size="small"
          bg="#F3F3F3"
        />
        <InputField
          label={"Staff ID"}
          placeholder="Enter Staff ID"
          name="staff_id"
          labelFor={"staff_id"}
          important={!staff}
          otherClass="rounded border border-[#ccc] h-[40px] md:h-[40px] bg-[#F3F3F3]"
          defaultValue={staff ? staff.staffID : ""}
          readOnly={!(!staff || edit)}
        />
        <AutoCompleteField
          label={"Minimum Qualification"}
          placeholder="Select Minimum Qualification"
          name="m_qua"
          labelFor={"m_qua"}
          important={!staff}
          size="small"
          selectOption={[
            "HND",
            "OND",
            "BSc",
            "MSc",
            "PhD",
            // "PROF",
          ]}
          bg="#F3F3F3"
          defaultValue={staff ? staff.minimumQualification : ""}
          readOnly={!(!staff || edit)}
        />
        <InputField
          label={"Email Address"}
          type="email"
          placeholder="Enter Email Address"
          name="email"
          labelFor={"email"}
          important={!staff}
          otherClass="rounded border border-[#ccc] h-[40px] md:h-[40px] bg-[#F3F3F3]"
          defaultValue={staff ? staff.emailAddress : ""}
          readOnly={!(!staff || edit)}
        />
        <InputField
          type="tel"
          label={"Phone Number"}
          placeholder="Enter Phone Number"
          name="phone_no"
          labelFor={"phone_no"}
          important={!staff}
          otherClass="rounded border border-[#ccc] h-[40px] md:h-[40px] bg-[#F3F3F3]"
          defaultValue={staff ? staff.phoneNumber : ""}
          readOnly={!(!staff || edit)}
        />
        <AutoCompleteField
          label={"Country"}
          placeholder="Select Country"
          name="country"
          labelFor={"country"}
          important={!staff}
          selectOption={["Nigeria", "Ghana", "Togo", "Benin", "Cameroon"]}
          defaultValue={staff ? staff.country : ""}
          readOnly={!(!staff || edit)}
          size="small"
          bg="#F3F3F3"
        />
        <AutoCompleteField
          label={"State of Origin"}
          placeholder="Select State of Origin"
          name="state_of_origin"
          labelFor={"state_of_origin"}
          important={!staff}
          selectOption={[
            "Lagos",
            "Ogun",
            "Oyo",
            "Osun",
            "Ondo",
            "Ekiti",
            "Kwara",
          ]}
          defaultValue={staff ? staff.stateOfOrigin : ""}
          readOnly={!(!staff || edit)}
          size="small"
          bg="#F3F3F3"
        />
        <AutoCompleteField
          label={"Local Government Area"}
          placeholder="Select Local Government Area"
          name="local_gov"
          labelFor={"local_gov"}
          important={!staff}
          selectOption={[
            "Ikeja",
            "Ikorodu",
            "Epe",
            "Badagry",
            "Lagos Island",
            "Lagos Mainland",
            "Surulere",
          ]}
          bg="#F3F3F3"
          defaultValue={staff ? staff.localGovernmentArea : ""}
          readOnly={!(!staff || edit)}
          size="small"
        />
        <InputField
          label="Religion"
          placeholder="Enter Religion"
          name="religion"
          labelFor="religion"
          important={!staff}
          otherClass="rounded border border-[#ccc] h-[40px] md:h-[40px] bg-[#F3F3F3]"
          defaultValue={staff ? staff.religion : ""}
          readOnly={!(!staff || edit)}
        />
        <InputField
          label="Next Of Kin First Name"
          placeholder="Enter Next Of Kin First Name"
          name="nok_first_name"
          labelFor="nok_first_name"
          important={!staff}
          otherClass="rounded border border-[#ccc] h-[40px] md:h-[40px] bg-[#F3F3F3]"
          defaultValue={staff ? staff.nextOfKin.firstName : ""}
          readOnly={!(!staff || edit)}
        />
        <InputField
          label="Next Of Kin Surname"
          placeholder="Enter Next Of Kin Surname"
          name="nok_surname"
          labelFor="nok_surname"
          important={!staff}
          otherClass="rounded border border-[#ccc] h-[40px] md:h-[40px] bg-[#F3F3F3]"
          defaultValue={staff ? staff.nextOfKin.surname : ""}
          readOnly={!(!staff || edit)}
        />
        <InputField
          label="Next Of Kin Phone Number"
          placeholder="Enter Next Of Kin Phone Number"
          name="nok_phone_no"
          labelFor="nok_phone_no"
          important={!staff}
          type="tel"
          otherClass="rounded border border-[#ccc] h-[40px] md:h-[40px] bg-[#F3F3F3]"
          defaultValue={staff ? staff.nextOfKin.phoneNumber : ""}
          readOnly={!(!staff || edit)}
        />
        <AutoCompleteField
          label="Relationship To The Next Of Kin"
          placeholder="Select Relationship"
          name="nok_relationship"
          labelFor="nok_relationship"
          important={!staff}
          selectOption={[
            "Father",
            "Mother",
            "Brother",
            "Sister",
            "Uncle",
            "Aunt",
            "Cousin",
          ]}
          defaultValue={staff ? staff.nextOfKin.relationship : ""}
          readOnly={!(!staff || edit)}
          size="small"
          bg="#F3F3F3"
        />
      </div>
      <div className="mt-4">
        <TextAreaField
          className="compulsory-input p-3 w-full outline-none text-black"
          label="Home Address"
          placeholder="Enter Home Address"
          important={!staff}
          labelFor="home_addr"
          rows="4"
          defaultValue={staff ? staff.homeAddress : ""}
          readOnly={!(!staff || edit)}
        />
      </div>
    </>
  );
}
