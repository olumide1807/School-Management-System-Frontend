import React from "react";
import Avatar from "@mui/material/Avatar";
import CustomReviewData from "../../../../../Forms/CustomReviewData";
import { getCountryCode } from "../../../../StudentManagement/StudentProfile/PersonalBio/personalBio";
import { useStudentContext } from "../../../../../../context/StudentProvider";
export default function Review() {
  const { studentData, guardianData } = useStudentContext();
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-x-5 md:mx-[191px] md:mb-4 mb-[4em]">
        <hr className="border border-black w-full flex-1" />
        <p className="text-lg">Student data</p>
        <hr className="border border-black w-full flex-1" />
      </div>
      <div className="mb-10">
        <Avatar
          src={studentData?.profile_image}
          alt=""
          sx={{
            width: "158px",
            height: "114px",
            border: "1px solid #ABABAB",
            borderRadius: "7px",
          }}
        />
      </div>
      <div className="mb-14 flex flex-col gap-y-9">
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
          <CustomReviewData label="Surname" value={studentData?.surname} />
          <CustomReviewData
            label="First name"
            value={studentData?.first_name}
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
          <CustomReviewData
            label="Other name"
            value={studentData?.other_name}
          />
          <CustomReviewData label="Gender" value={studentData?.gender} />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
          <CustomReviewData label="Class level" value={studentData?.level} />
          <CustomReviewData label="Class Arm" value={studentData?.arm} />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
          <CustomReviewData
            label="Admission number"
            value={studentData?.student_no}
          />
          <CustomReviewData
            label="Email address"
            value={studentData?.email}
            email={true}
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
          <div className="flex flex-col md:w-[403px] w-full">
            <p className="pb-2">Phone</p>
            <div className="bg-gray-100 rounded font-light  pl-6 flex items-center gap-3">
              <p className="p-2 border-r-[1px] border-r-borderRight pr-3">
                {getCountryCode(studentData.phone)}
              </p>
              <p className="pl-3">{studentData.phone}</p>
            </div>
          </div>
          <CustomReviewData label="Religion" value={studentData?.religion} />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
          <CustomReviewData label="Date of birth" value={studentData?.dob} />
          <CustomReviewData label="Country" value={studentData?.country} />
        </div>
        <div className="flex flex-col  md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
          <CustomReviewData
            label="State of origin"
            value={studentData?.state}
          />
          <CustomReviewData
            label="Local government area"
            value={studentData?.lga}
          />
        </div>
        <CustomReviewData
          label="Home address"
          value={studentData?.home_address}
          containerclass="md:w-full"
          otherclass=" text-[15px] min-h-[140px] text-black w-full "
        />
      </div>
      <div className="flex items-center gap-x-5 mx-[191px] mb-4">
        <hr className="border border-black w-full flex-1" />
        <p className="text-lg">Linked Guardian</p>
        <hr className="border border-black w-full flex-1" />
      </div>
      <div className="flex flex-col gap-y-9 mb-[4em]">
        {guardianData.guardian_link.map((item, e) => (
          <div
            key={e}
            className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0"
          >
            <CustomReviewData
              label="Student"
              name="guardian"
              placeholder="Select student"
              value={item.guardian_name}
            />
            <CustomReviewData
              label="Relationship"
              name="relationship"
              placeholder="Select relationship"
              value={item.relationship}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-x-5 md:mx-[191px] md:mb-4 mb-[4em]">
        <hr className="border border-black w-full flex-1" />
        <p className="text-lg text-center">Parent/Guardian Data</p>
        <hr className="border border-black w-full flex-1" />
      </div>
      <div className="flex flex-col gap-y-9">
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
          <CustomReviewData label="Title" value={guardianData?.title} />
          <CustomReviewData
            label="Surname"
            value={guardianData?.parent_surname}
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
          <CustomReviewData
            label="First name"
            value={guardianData?.parent_first_name}
          />
          <CustomReviewData
            label="Other name"
            value={guardianData?.parent_other_name}
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
          <CustomReviewData
            label="Gender"
            value={guardianData?.parent_gender}
          />
          <CustomReviewData
            label="Marital status"
            value={guardianData?.marital_status}
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
          <CustomReviewData
            label="Email address"
            email={true}
            value={guardianData?.parent_email}
          />
          <div className="flex flex-col md:w-[403px] w-full">
            <p className="pb-2">Phone</p>
            <div className="bg-gray-100 rounded font-light  pl-6 flex items-center gap-3">
              <p className="p-2 border-r-[1px] border-r-borderRight pr-3">
                {getCountryCode(guardianData.parent_phone)}
              </p>
              <p className="pl-3">{guardianData.parent_phone}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[10em] md:gap-y-0">
          <div className="flex flex-col md:w-[403px] w-full">
            <p className="pb-2">Alternate Phone</p>
            <div className="bg-gray-100 rounded font-light  pl-6 flex items-center gap-3">
              <p className="p-2 border-r-[1px] border-r-borderRight pr-3">
                {getCountryCode(guardianData.alt_phone)}
              </p>
              <p className="pl-3">{guardianData.alt_phone}</p>
            </div>
          </div>
          <CustomReviewData
            label="Occupation"
            value={guardianData?.occupation}
          />
        </div>
        <CustomReviewData
          label="Relationship"
          value={guardianData?.relationship}
        />
        <CustomReviewData
          label="Home address"
          value={guardianData?.parent_home_address}
          containerclass="md:w-full"
          otherclass=" text-[15px] min-h-[140px] text-black w-full "
        />
      </div>
    </div>
  );
}
