import { useState } from "react";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import plusSign from "../../../../../../assets/icons/plus.svg";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import CustomInput from "../../../../../Forms/CustomInput";
import CustomSelect from "../../../../../Forms/CustomSelect";
import { useStudentContext } from "../../../../../../context/StudentProvider";

export default function GuardianData() {
  const [format, setFormat] = useState("select");
  const [guardians, setGuardians] = useState([{ id: 1, selected: null }]);
  const {
    guardianData,
    setGuardianData,
    handleGuardianChange,
    genderOptions,
    relationshipOptions,
    martianOptions,
    titleOptions,
    handleGuardianLinkChange,
  } = useStudentContext();

  const addGuardian = () => {
    setGuardians([...guardians, { id: guardians.length + 1, selected: null }]);
    setGuardianData((prevData) => ({
      ...prevData,
      guardian_link: [
        ...prevData.guardian_link,
        { guardian_id: "", guardian_name: "", relationship: "" },
      ],
    }));
  };

  const deleteGuardian = (index) => {
    setGuardianData((prevData) => {
      const updatedStudentLink = prevData.guardian_link.filter(
        (_, idx) => idx !== index
      );
      return { ...prevData, guardian_link: updatedStudentLink };
    });
  };

  const sampleParentData = [
    { value: "John Doe", label: "John Doe" },
    { value: "Jane Smith", label: "Jane Smith" },
    { value: "Michael Johnson", label: "Michael Johnson" },
  ];

  return (
    <div className="flex flex-col">
      <FormControl>
        <section className="justify-center border border-black rounded-lg w-full max-w-md flex  overflow-hidden">
          <button
            className={`w-1/2 py-2 px-4 text-sm sm:text-base transition-colors duration-300 ${
              format === "add"
                ? "bg-tertiary text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setFormat("add")}
          >
            Select Parent/Guardian
          </button>
          <button
            className={`w-1/2 py-2 px-4 text-sm sm:text-base transition-colors duration-300 ${
              format === "select"
                ? "bg-tertiary text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setFormat("select")}
          >
            Add manually
          </button>
        </section>
      </FormControl>
      <div className="mt-10">
        {format === "add" ? (
          <div className="flex flex-col gap-y-9 mb-[425px]">
            {guardianData.guardian_link.map((guardian, index) => (
              <div
                key={index}
                className="flex relative flex-col md:mr-10 md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0"
              >
                <CustomSelect
                  label="Select Parent/Guardian"
                  name={`guardian_name`}
                  placeholder="Select Parent/Guardian"
                  selectOption={sampleParentData}
                  value={guardianData.guardian_link[index]?.guardian_name || ""}
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
                {index !== 0 && (
                  <p
                    className="absolute cursor-pointer right-0 md:right-[-2em] md:top-[2.5em] text-removeRed pl-[5px] pr-[5px] bg-bgRemoveRed rounded-[50%]"
                    onClick={() => deleteGuardian(index)}
                  >
                    X
                  </p>
                )}
              </div>
            ))}
            {/* <Button
              color="tertiary"
              variant="contained"
              onClick={addGuardian}
              sx={{
                color: "white",
                borderRadius: "10px",
                paddingY: "12px",
                maxWidth: "20rem",
                width: "100%",
              }}
            >
              <div className="flex gap-x-2">
                <img src={plusSign} alt="Plus Sign" className="" />
                <p>Add more Parent/Guardian</p>
              </div>
            </Button> */}
          </div>
        ) : (
          <div className="flex flex-col gap-y-9">
            <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
              <CustomSelect
                label="Title"
                required={true}
                name="title"
                placeholder="Select a title"
                selectOption={titleOptions}
                onChange={handleGuardianChange}
                value={guardianData?.title}
              />
              <CustomInput
                label="Surname"
                required={true}
                type="text"
                name="parent_surname"
                placeholder="Enter surname"
                onChange={handleGuardianChange}
                value={guardianData?.parent_surname}
              />
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
              <CustomInput
                label="First name"
                type="text"
                required={true}
                name="parent_first_name"
                placeholder="Enter first name"
                onChange={handleGuardianChange}
                value={guardianData?.parent_first_name}
              />
              <CustomInput
                label="Other name"
                type="text"
                name="parent_other_name"
                placeholder="Enter other name"
                onChange={handleGuardianChange}
                value={guardianData?.parent_other_name}
              />
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
              <CustomSelect
                label="Gender "
                required={true}
                name="parent_gender"
                placeholder="Select gender"
                selectOption={genderOptions}
                onChange={handleGuardianChange}
                value={guardianData?.parent_gender}
              />
              <CustomSelect
                label="Marital status "
                name="marital_status"
                placeholder="Select marital status"
                selectOption={martianOptions}
                onChange={handleGuardianChange}
                value={guardianData?.marital_status}
              />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
              <CustomInput
                label="Email address "
                required={true}
                name="parent_email"
                type="email"
                placeholder="Enter email address"
                onChange={handleGuardianChange}
                value={guardianData?.parent_email}
              />
              <div className="flex flex-col gap-2 md:w-[403px] w-full">
                <label
                  htmlFor=""
                  className="block mb-2 font-bold text-gray-700"
                >
                  Phone number
                </label>
                <PhoneInput
                  country={"ng"}
                  onChange={(parent_phone) =>
                    handleGuardianChange({
                      target: { name: "parent_phone", value: parent_phone },
                    })
                  }
                  value={guardianData?.parent_phone}
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
                  inputProps={{
                    maxLength: 17,
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
              <div className="flex flex-col gap-2 md:w-[403px] w-full">
                <label
                  htmlFor=""
                  className="block mb-2 font-bold text-gray-700"
                >
                  Alternate Phone number
                </label>
                <PhoneInput
                  country={"ng"}
                  onChange={(alt_phone) =>
                    handleGuardianChange({
                      target: { name: "alt_phone", value: alt_phone },
                    })
                  }
                  value={guardianData?.alt_phone}
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
                  inputProps={{
                    maxLength: 17,
                  }}
                />
              </div>
              <CustomInput
                label="Occupation "
                type="text"
                name="occupation"
                placeholder="Enter occupation"
                onChange={handleGuardianChange}
                value={guardianData?.occupation}
              />
            </div>
            <CustomSelect
              label="Relationship "
              required={true}
              name="relationship"
              placeholder="Select relationship"
              selectOption={relationshipOptions}
              onChange={handleGuardianChange}
              value={guardianData?.relationship}
            />
            <CustomInput
              name="parent_home_address"
              required={true}
              type="text"
              label="Home address "
              placeholder="Enter home address"
              onChange={handleGuardianChange}
              otherclass=" text-[15px] min-h-[140px] text-black w-full "
              containerclass="md:w-full"
              value={guardianData?.parent_home_address}
            />
          </div>
        )}
      </div>
    </div>
  );
}
