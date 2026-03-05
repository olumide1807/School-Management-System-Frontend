import Avatar from "@mui/material/Avatar";
import { useState } from "react";
import Button from "@mui/material/Button";
import { useDropzone } from "react-dropzone";
import { statesData } from "../../../../../../Data/statesData";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import CustomInput from "../../../../../Forms/CustomInput";
import CustomSelect from "../../../../../Forms/CustomSelect";
import { useStudentContext } from "../../../../../../context/StudentProvider";
export const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];
export default function StudentData() {
  const [preview, setPreview] = useState("");
  const [state, setState] = useState("");
  const {
    studentData,
    handleStudentChange,
    genderOptions,
    classArms,
    classOptions,
    religionOptions,
    countryOptions,
  } = useStudentContext();

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        handleStudentChange({
          target: { name: "profile_image", value: reader.result },
        });
        handleStudentChange({ target: { name: "img_blob", value: file } });
      };
      reader.readAsDataURL(file);
    }
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".svg"],
    },
    multiple: false,
  });

  // console.log(state);
  return (
    <div className="flex flex-col gap-y-9  w-full">
      <div className="bg-[#E7F8FF] rounded-[6px] py-5 px-8 flex md:flex-row flex-col gap-y-4 items-center gap-x-[6.75rem]">
        <Avatar
          src={studentData?.profile_image || preview}
          alt="Profile Photo"
          sx={{
            width: "158px",
            height: "114px",
            border: "1px solid #ABABAB",
            borderRadius: "7px",
          }}
        />
        <div className="flex items-center gap-x-5">
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-400 p-4 rounded-md flex gap-y-4 flex-col md:flex-row items-center gap-x-5"
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-sm">Drop the image here ...</p>
            ) : (
              <>
                <p className="text-sm">Drop your image file here or</p>
                <Button
                  color="tertiary"
                  variant="contained"
                  sx={{
                    color: "white",
                    borderRadius: "10px",
                    paddingY: "12px",
                    maxWidth: "153px",
                  }}
                  component="span"
                >
                  Browse file
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-y-9">
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0 ">
          <CustomInput
            label="Surname"
            name="surname"
            type="text"
            value={studentData?.surname}
            placeholder="Enter surname"
            required={true}
            onChange={handleStudentChange}
          />
          <CustomInput
            label="First name"
            required={true}
            value={studentData?.first_name}
            type="text"
            name="first_name"
            onChange={handleStudentChange}
            placeholder="Enter first name"
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
          <CustomInput
            label="Other name"
            name="other_name"
            placeholder="Enter other name"
            value={studentData?.other_name}
            onChange={handleStudentChange}
            required={true}
          />
          <CustomSelect
            label="Gender"
            required={true}
            name="gender"
            placeholder="Select gender"
            value={studentData?.gender}
            selectOption={genderOptions}
            onChange={handleStudentChange}
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
          <CustomInput
            label="Admission number"
            name="student_no"
            type="text"
            placeholder="e.g SCH0001"
            onChange={handleStudentChange}
            value={studentData?.student_no}
          />
          <CustomSelect
            label="Class level "
            required={true}
            name="level"
            placeholder="Select class level"
            selectOption={classOptions}
            value={studentData?.level}
            onChange={handleStudentChange}
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
          <CustomSelect
            label="Class arm"
            required={true}
            name="arm"
            placeholder="Select class arm"
            selectOption={classArms}
            onChange={handleStudentChange}
            value={studentData?.arm}
          />
          <CustomInput
            label="Email address"
            name="email"
            type="email"
            placeholder="Enter email address"
            value={studentData?.email}
            onChange={handleStudentChange}
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
          <div className="flex flex-col gap-2 md:w-[403px] w-full">
            <label htmlFor="" className="block mb-2 font-bold text-gray-700">
              Phone number
            </label>
            <PhoneInput
              country={"ng"}
              onChange={(phone) =>
                handleStudentChange({
                  target: { name: "phone", value: phone },
                })
              }
              value={studentData?.phone}
              containerClass="w-full"
              inputStyle={{
                width: "100%",
                height: "42px",
                borderRadius: "10px",
                padding: "0 50px",
                fontSize: "16px",
                fontWeight: "400",
                color: "#333333",
                outline: "none",
                backgroundColor: "#F7F8F8",
                border: "1px solid #ABABAB",
              }}
              dropdownStyle={{
                backgroundColor: "#F7F8F8",
              }}
              buttonStyle={{
                borderTopLeftRadius: "10px",
                borderBottomLeftRadius: "10px",
              }}
              inputProps={{
                maxLength: 17,
              }}
            />
          </div>
          <CustomSelect
            label="Religion"
            required={true}
            name="religion"
            value={studentData?.religion}
            placeholder="Select religion"
            selectOption={religionOptions}
            onChange={handleStudentChange}
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
          <CustomInput
            label="Date of birth"
            required={true}
            name="dob"
            type="date"
            value={studentData?.dob}
            placeholder="DD / MM / YYYY"
            onChange={handleStudentChange}
          />
          <CustomSelect
            label="Country "
            required={true}
            name="country"
            value={studentData?.country}
            placeholder="Select country"
            selectOption={countryOptions}
            onChange={handleStudentChange}
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
          <CustomSelect
            label="State of origin "
            required={true}
            name="state"
            placeholder="Select state of origin"
            selectOption={Object.keys(statesData).map((state) => ({
              value: state,
              label: state,
            }))}
            setstate={setState}
            value={studentData?.state}
            onChange={handleStudentChange}
          />
          <CustomSelect
            label="Local government area "
            required={true}
            name="lga"
            placeholder="Select local government area"
            selectOption={statesData[state] || []}
            onChange={handleStudentChange}
            value={studentData?.lga}
          />
        </div>
        <CustomInput
          required={true}
          name="home_address"
          label="Home address "
          placeholder="Enter home address"
          otherclass=" text-[15px] min-h-[140px] text-black w-full "
          containerclass="md:w-full"
          onChange={handleStudentChange}
          value={studentData?.home_address}
        />
      </div>
    </div>
  );
}
