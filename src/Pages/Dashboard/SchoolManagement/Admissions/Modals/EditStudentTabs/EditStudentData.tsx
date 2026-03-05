import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import PhoneInput from "react-phone-input-2";
import { statesData } from "../../../../../../Data/statesData";
import "react-phone-input-2/lib/style.css";
import { useDropzone } from "react-dropzone";
import { useStudentContext } from "../../../../../../context/StudentProvider";
import CustomInput from "../../../../../Forms/CustomInput";
import CustomSelect from "../../../../../Forms/CustomSelect";
export default function EditStudentData({ isManual }) {
  const {
    studentdata,
    guardianData,
    handleStudentChange,
    handleGuardianChange,
    setGuardianData,
    genderOptions,
    classArms,
    classOptions,
    religionOptions,
    countryOptions,
    relationshipOptions,
    handleGuardianLinkChange,
    martianOptions,
    titleOptions,
  } = useStudentContext();
  const data = { ...studentdata, ...guardianData };
  const sampleParentData = [
    { value: "John Doe", label: "John Doe" },
    { value: "Jane Smith", label: "Jane Smith" },
    { value: "Michael Johnson", label: "Michael Johnson" },
  ];

  console.log(data);

  const [state, setState] = useState(data?.state || "");
  const [preview, setPreview] = useState(data?.profile_image || "");

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

  return (
    <div className="flex flex-col mb-[120px] w-full">
      <div className="flex items-center gap-x-5 md:mx-[191px] md:mb-4 mb-[4em]">
        <hr className="border border-black w-full flex-1" />
        <p className="text-lg">Student data</p>
        <hr className="border border-black w-full flex-1" />
      </div>
      <div className="mb-10 ">
        <div className="bg-[#E7F8FF] rounded-[6px] py-5 px-8 flex md:flex-row flex-col gap-y-4 items-center gap-x-[6.75rem]">
          <Avatar
            src={preview}
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
      </div>
      <div className="mb-14 flex flex-col gap-y-9">
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
          <CustomInput
            label="Surname"
            name="surname"
            type="text"
            placeholder="Enter surname"
            value={data?.surname}
            onChange={handleStudentChange}
          />
          <CustomInput
            label="First name"
            name="first_name"
            placeholder="Enter first name"
            onChange={handleStudentChange}
            value={data?.first_name}
            type="text"
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
          <CustomInput
            label="Other name"
            name="other_name"
            value={data?.other_name}
            placeholder="Enter other name"
            onChange={handleStudentChange}
          />
          <CustomSelect
            label="Gender "
            name="gender"
            placeholder="Select gender"
            value={data?.gender}
            selectOption={genderOptions}
            onChange={handleStudentChange}
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
          <CustomInput
            label="Admission number"
            name="student_no"
            placeholder="e.g SCH0001"
            onChange={handleStudentChange}
            value={data?.student_no}
            type={"text"}
          />
          <CustomSelect
            label="Class level"
            name="level"
            value={data?.level}
            placeholder="Select class level"
            selectOption={classOptions}
            onChange={handleStudentChange}
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
          <CustomSelect
            label="Class arm"
            name="arm"
            placeholder="Select class arm"
            selectOption={classArms}
            onChange={handleStudentChange}
            value={data?.arm}
          />
          <CustomInput
            label="Email address"
            name="email"
            type="email"
            placeholder="Enter email address"
            onChange={handleStudentChange}
            value={data?.email}
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
          <div className="w-full flex flex-col gap-2 md:w-[403px]">
            <label htmlFor="" className="block mb-2 font-bold text-gray-700">
              Phone number
            </label>
            <PhoneInput
              country={"ng"}
              value={data?.phone}
              onChange={(phone) =>
                handleStudentChange({
                  target: { name: "phone", value: phone },
                })
              }
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
            />
          </div>
          <CustomSelect
            label="Religion "
            name="religion"
            placeholder="Select religion"
            selectOption={religionOptions}
            value={data?.religion}
            onChange={handleStudentChange}
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
          <CustomInput
            label="Date of birth"
            name="dob"
            type="date"
            placeholder="DD / MM / YYYY"
            value={data?.dob}
            onChange={handleStudentChange}
          />
          <CustomSelect
            label="Country "
            name="country"
            placeholder="Select country"
            selectOption={countryOptions}
            value={data?.country}
            onChange={handleStudentChange}
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[1em] md:gap-y-0">
          <CustomSelect
            label="State of origin "
            name="state"
            placeholder="Select state of origin"
            selectOption={Object.keys(statesData).map((state) => ({
              value: state,
              label: state,
            }))}
            setstate={setState}
            value={data?.state}
            onChange={handleStudentChange}
          />
          <CustomSelect
            label="Local government area "
            name="lga"
            placeholder="Select local government area"
            selectOption={statesData[state] || []}
            value={data?.lga}
            onChange={handleStudentChange}
          />
        </div>
        <CustomInput
          name="home_address"
          label="Home address"
          placeholder="Enter home address"
          otherclass=" text-[15px] min-h-[140px] text-black w-full "
          containerclass="md:w-full"
          onChange={handleStudentChange}
          value={data?.home_address}
        />
      </div>
      <div className="flex items-center gap-x-5 md:mx-[191px] md:mb-4 mb-[4em]">
        <hr className="border border-black w-full flex-1" />
        <p className="text-lg">Parent/Guardian Data</p>
        <hr className="border border-black w-full flex-1" />
      </div>
      <div className="flex flex-col gap-y-9 mt-4">
        {!isManual ? (
          data.guardian_link.map((item, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0"
            >
              <CustomSelect
                label="Select parent/guardian"
                name={`guardian_name`}
                placeholder="Select Parent/Guardian"
                value={guardianData.guardian_link[index]?.guardian_name || ""}
                selectOption={sampleParentData}
                onChange={(e) => handleGuardianLinkChange(index, e)}
              />
              <CustomSelect
                label="Relationship"
                name={`relationship`}
                placeholder="Select Relationship"
                selectOption={relationshipOptions}
                value={guardianData.guardian_link[index]?.relationship || ""}
                onChange={(e) => handleGuardianLinkChange(index, e)}
              />
            </div>
          ))
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
              <CustomSelect
                label="Title"
                name="title"
                placeholder="Select title"
                selectOption={titleOptions}
                value={data?.title}
                onChange={handleGuardianChange}
              />
              <CustomInput
                label="Surname"
                name="parent_surname"
                type="text"
                placeholder="Enter surname"
                onChange={handleGuardianChange}
                value={data?.parent_surname}
              />
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
              <CustomInput
                label="First name"
                name="parent_first_name"
                type="text"
                placeholder="Enter first name"
                onChange={handleGuardianChange}
                value={data?.parent_first_name}
              />
              <CustomInput
                label="Other name"
                name="parent_other_name"
                type="text"
                placeholder="Enter other name"
                onChange={handleGuardianChange}
                value={data?.parent_other_name}
              />
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
              <CustomSelect
                label="Gender"
                name="parent_gender"
                placeholder="Select gender"
                selectOption={genderOptions}
                value={data?.parent_gender}
                onChange={handleGuardianChange}
              />
              <CustomSelect
                label="Marital status"
                name="marital_status"
                placeholder="Select marital status"
                selectOption={martianOptions}
                value={data?.marital_status}
                onChange={handleGuardianChange}
              />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
              <CustomInput
                label="Email address"
                name="parent_email"
                type="email"
                placeholder="Enter email address"
                onChange={handleGuardianChange}
                value={data?.parent_email}
              />
              <div className="w-full md:w-[403px] flex flex-col gap-2 ">
                <label
                  htmlFor=""
                  title="phone"
                  className="block mb-2 font-bold text-gray-700"
                >
                  Phone number
                </label>
                <PhoneInput
                  country={"ng"}
                  value={data?.parentPhone}
                  onChange={(parent_phone) =>
                    handleGuardianChange({
                      target: { name: "parent_phone", value: parent_phone },
                    })
                  }
                  containerClass=" w-full"
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
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
              <CustomInput
                label="Occupation"
                name="occupation"
                type="text"
                placeholder="Enter occupation"
                onChange={handleGuardianChange}
                value={data?.occupation}
              />
              <CustomSelect
                label="Relationship"
                name="relationship"
                placeholder="Select relationship"
                selectOption={relationshipOptions}
                value={data?.relationship}
                onChange={handleGuardianChange}
              />
            </div>

            <CustomInput
              name="parent_home_address"
              label="Home address"
              type="text"
              placeholder="Enter home address"
              otherclass=" text-[15px] min-h-[140px] text-black  w-full "
              containerclass="md:w-full"
              value={data?.parent_home_address}
              onChange={handleGuardianChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
