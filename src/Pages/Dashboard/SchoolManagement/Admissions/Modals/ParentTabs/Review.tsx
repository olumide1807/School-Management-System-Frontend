/* eslint-disable react/prop-types */
import { getCountryCode } from "../../../../StudentManagement/StudentProfile/PersonalBio/personalBio";
import CustomReviewData from "../../../../../Forms/CustomReviewData";
import { useStudentContext } from "../../../../../../context/StudentProvider";
export default function Review() {
  const { parentData } = useStudentContext();
  console.log(parentData);
  return (
    <div className="flex flex-col">
      <div className="mb-14 flex flex-col gap-y-9">
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
          <CustomReviewData label="Title" value={parentData?.title} />
          <CustomReviewData
            label="Surname"
            value={parentData?.parent_surname}
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
          <CustomReviewData
            label="First name"
            value={parentData?.parent_first_name}
          />
          <CustomReviewData
            label="Other name"
            value={parentData?.parent_other_name}
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
          <CustomReviewData label="Gender" value={parentData?.parent_gender} />
          <CustomReviewData
            label="Marital status"
            value={parentData?.marital_status}
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
          <CustomReviewData
            label="Email address"
            email={true}
            value={parentData?.parent_email}
          />
          <div className="flex flex-col md:w-[403px] w-full">
            <p className="pb-2">Phone</p>
            <div className="bg-gray-100 rounded font-light  pl-6 flex items-center gap-3">
              <p className="p-2 border-r-[1px] border-r-borderRight pr-3">
                {getCountryCode(parentData.parent_phone)}
              </p>
              <p className="pl-3">{parentData.parent_phone}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
          <div className="flex flex-col md:w-[403px] w-full">
            <p className="pb-2">Alternate Phone</p>
            <div className="bg-gray-100 rounded font-light  pl-6 flex items-center gap-3">
              <p className="p-2 border-r-[1px] border-r-borderRight pr-3">
                {getCountryCode(parentData.alt_phone)}
              </p>
              <p className="pl-3">{parentData.alt_phone}</p>
            </div>
          </div>
          <CustomReviewData label="Occupation" value={parentData?.occupation} />
        </div>
        <CustomReviewData
          label="Relationship"
          value={parentData?.relationship}
        />
        <CustomReviewData
          label="Home address"
          value={parentData?.parent_home_address}
          containerclass="md:w-full"
          otherclass=" text-[15px] min-h-[140px] text-black w-full "
        />
      </div>
      <div className="flex items-center gap-x-5 mx-[191px] mb-4">
        <hr className="border border-black w-full flex-1" />
        <p className="text-lg">Linked Student</p>
        <hr className="border border-black w-full flex-1" />
      </div>
      <div className="flex flex-col gap-y-9">
        {parentData.student_link.map((item, e) => (
          <div
            key={e}
            className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0"
          >
            <CustomReviewData label="Student" value={item.student_name} />
            <CustomReviewData label="Relationship" value={item.relationship} />
          </div>
        ))}
      </div>
    </div>
  );
}
