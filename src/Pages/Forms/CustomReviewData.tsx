import React from "react";

interface CustomReviewDataProps {
  label: string;
  value?: string;
  containerclass?: string;
  otherclass?: string;
  email?: boolean;
}

const CustomReviewData: React.FC<CustomReviewDataProps> = ({
  label,
  value,
  containerclass = "",
  otherclass = "",
  email = false,
}) => {
  return (
    <div className={`${containerclass} flex flex-col md:w-[403px] w-full`}>
      <p className="pb-2">{label}</p>
      <p
        className={`${otherclass} bg-gray-100 p-2 rounded font-light pl-6 ${
          email ? "" : "capitalize"
        }`}
      >
        {value || "N/A"}
      </p>
    </div>
  );
};

export default CustomReviewData;
