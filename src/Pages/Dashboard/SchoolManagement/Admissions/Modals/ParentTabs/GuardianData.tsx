import React from "react";
import CustomInput from "../../../../../Forms/CustomInput";
import CustomSelect from "../../../../../Forms/CustomSelect";
import PhoneInput from "react-phone-input-2";
import { useStudentContext } from "../../../../../../context/StudentProvider";
export default function GuardianData({}) {
  const {
    parentData,
    handleParentChange,
    genderOptions,
    relationshipOptions,
    martianOptions,
    titleOptions,
  } = useStudentContext();
  return (
    <div className="flex flex-col gap-y-9">
      <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
        <CustomSelect
          label="Title"
          required={true}
          name="title"
          placeholder="Select a title"
          selectOption={titleOptions}
          onChange={handleParentChange}
          value={parentData?.title}
        />
        <CustomInput
          label="Surname"
          required={true}
          type="text"
          name="parent_surname"
          placeholder="Enter surname"
          onChange={handleParentChange}
          value={parentData?.parent_surname}
        />
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
        <CustomInput
          label="First name"
          type="text"
          required={true}
          name="parent_first_name"
          placeholder="Enter first name"
          onChange={handleParentChange}
          value={parentData?.parent_first_name}
        />
        <CustomInput
          label="Other name"
          type="text"
          name="parent_other_name"
          placeholder="Enter other name"
          onChange={handleParentChange}
          value={parentData?.parent_other_name}
        />
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
        <CustomSelect
          label="Gender "
          required={true}
          name="parent_gender"
          placeholder="Select gender"
          selectOption={genderOptions}
          onChange={handleParentChange}
          value={parentData?.parent_gender}
        />
        <CustomSelect
          label="Marital status "
          name="marital_status"
          placeholder="Select marital status"
          selectOption={martianOptions}
          onChange={handleParentChange}
          value={parentData?.marital_status}
        />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
        <CustomInput
          label="Email address "
          required={true}
          name="parent_email"
          type="email"
          placeholder="Enter email address"
          onChange={handleParentChange}
          value={parentData?.parent_email}
        />
        <div className="flex flex-col gap-2 md:w-[403px] w-full">
          <label htmlFor="" className="block mb-2 font-bold text-gray-700">
            Phone number
          </label>
          <PhoneInput
            country={"ng"}
            onChange={(parent_phone) =>
              handleParentChange({
                target: { name: "parent_phone", value: parent_phone },
              })
            }
            value={parentData?.parent_phone}
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
      <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
        <div className="flex flex-col gap-2 md:w-[403px] w-full">
          <label htmlFor="" className="block mb-2 font-bold text-gray-700">
            Alternate Phone number
          </label>
          <PhoneInput
            country={"ng"}
            onChange={(alt_phone) =>
              handleParentChange({
                target: { name: "alt_phone", value: alt_phone },
              })
            }
            value={parentData?.alt_phone}
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
          onChange={handleParentChange}
          value={parentData?.occupation}
        />
      </div>
      <CustomSelect
        label="Relationship "
        required={true}
        name="relationship"
        placeholder="Select relationship"
        selectOption={relationshipOptions}
        onChange={handleParentChange}
        value={parentData?.relationship}
      />
      <CustomInput
        name="parent_home_address"
        required={true}
        type="text"
        label="Home address "
        placeholder="Enter home address"
        onChange={handleParentChange}
        otherclass=" text-[15px] min-h-[140px] text-black w-full "
        containerclass="md:w-full"
        value={parentData?.parent_home_address}
      />
    </div>
  );
}
