/* eslint-disable react/prop-types */
import Avatar from "@mui/material/Avatar";
import { useStudentContext } from "../../../../../../context/StudentProvider";
import CustomReviewData from "../../../../../Forms/CustomReviewData";
import { getCountryCode } from "../../../../StudentManagement/StudentProfile/PersonalBio/personalBio";
import "react-phone-input-2/lib/style.css";

interface ReviewProps {
  isManual: boolean;
}
export default function Review({ isManual }: ReviewProps) {
  const { studentData, guardianData } = useStudentContext();
  const data = { ...studentData, ...guardianData };
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-x-5 md:mx-[191px] md:mb-4 mb-[4em]">
        <hr className="border border-black w-full flex-1" />
        <p className="text-lg">Student Data</p>
        <hr className="border border-black w-full flex-1" />
      </div>
      <div className="mb-10">
        <Avatar
          src={data?.profile_image || ""}
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
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
          <CustomReviewData label="Surname" value={data?.surname} />
          <CustomReviewData label="First name" value={data?.first_name} />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
          <CustomReviewData label="Other name" value={data?.other_name} />
          <CustomReviewData label="Gender" value={data?.gender} />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
          <CustomReviewData label="Class level" value={data?.level} />
          <CustomReviewData label="Class Arm" value={data?.arm} />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
          <CustomReviewData label="Admission number" value={data?.student_no} />
          <CustomReviewData
            label="Email address"
            value={data?.email}
            email={true}
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
          <div className="flex flex-col md:w-[403px] w-full">
            <p className="pb-2">Phone</p>
            <div className="bg-gray-100 rounded font-light  pl-6 flex items-center gap-3">
              <p className="p-2 border-r-[1px] border-r-borderRight pr-3">
                {getCountryCode(data.phone)}
              </p>
              <p className="pl-3">{data.phone}</p>
            </div>
          </div>
          <CustomReviewData label="Religion" value={data?.religion} />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
          <CustomReviewData label="Date of birth" value={data?.dob} />
          <CustomReviewData label="Country" value={data?.country} />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
          <CustomReviewData label="State of origin" value={data?.state} />
          <CustomReviewData label="Local government area" value={data?.lga} />
        </div>
        <CustomReviewData
          label="Home address"
          value={data?.home_address}
          containerclass="md:w-full"
          otherclass=" text-[15px] min-h-[140px] text-black w-full "
        />
      </div>
      <div className="flex items-center gap-x-5 md:mx-[191px] md:mb-4 mb-[4em]">
        <hr className="border border-black w-full flex-1" />
        <p className="text-lg">Parent/Guardian Data</p>
        <hr className="border border-black w-full flex-1" />
      </div>

      <div className="flex flex-col gap-y-9">
        {!isManual ? (
          data.guardian_link.map((item, i) => (
            <div
              key={i}
              className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0"
            >
              <CustomReviewData label="Student" value={item.guardian_name} />
              <CustomReviewData
                label="Relationship"
                value={item.relationship}
              />
            </div>
          ))
        ) : (
          <>
            {" "}
            <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
              <CustomReviewData label="Title" value={data?.title} />
              <CustomReviewData label="Surname" value={data?.parent_surname} />
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
              <CustomReviewData
                label="First name"
                value={data?.parent_first_name}
              />
              <CustomReviewData
                label="Other name"
                value={data?.parent_other_name}
              />
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
              <CustomReviewData label="Gender" value={data?.parent_gender} />
              <CustomReviewData
                label="Marital status"
                value={data?.marital_status}
              />
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
              <CustomReviewData
                label="Email address"
                value={data?.parent_email}
              />
              <div className="flex flex-col md:w-[403px] w-full">
                <p className="pb-2">Phone</p>
                <div className="bg-gray-100 rounded font-light  pl-6 flex items-center gap-3">
                  <p className="p-2 border-r-[1px] border-r-borderRight pr-3">
                    {getCountryCode(data.parent_phone)}
                  </p>
                  <p className="pl-3">{data.parent_phone}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
              <CustomReviewData label="Occupation" value={data?.occupation} />
              <CustomReviewData
                label="Relationship"
                value={data?.relationship}
              />
            </div>
            <CustomReviewData
              label="Home address"
              value={data?.parent_home_address}
            />
          </>
        )}
      </div>
    </div>
  );
}
