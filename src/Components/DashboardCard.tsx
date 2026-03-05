/* eslint-disable react/prop-types */
export default function DashboardCard({ value, label, bgColor }) {
  return (
    <div
      className={`rounded-[10px] justify-between max-w-[420px] w-full  pl-4 pr-[2em] py-9 md:px-11 md:py-12 ${bgColor} flex flex-col md:gap-y-5`}
    >
      <p className="md:text-2xl text-xl font-semibold text-white">
        {value || 0}
      </p>
      <p className="text-white text-[0.9em] w-[150px]">
        {label || "Total Items"}
      </p>
    </div>
  );
}

export function DashboardCard2({ val1, val2, val3, label, bgColor }) {
  return (
    <div
      className={`${bgColor} md:gap-0 gap-4 flex md:flex-row flex-col items-center justify-between max-w-[420px] w-full p-4 md:px-11 md:py-5 rounded-[10px]`}
    >
      <div>
        <p className="md:text-2xl text-xl font-semibold text-white md:mb-5">
          {val1 || 0}
        </p>
        <p className="text-white text-[0.9em]">{label || "Total Students"}</p>
      </div>
      <div className="flex md:flex-col justify-btween md:gap-4 gap-6">
        <div>
          <p className="md:text-2xl text-xl font-semibold text-white md:mb-1">
            {val2 || 0}
          </p>
          <p className="text-white text-[15px] leading-6">Male</p>
        </div>
        <div>
          <p className="md:text-2xl text-xl font-semibold text-white md:mb-1">
            {val3 || 0}
          </p>
          <p className="text-white text-[15px] leading-6">Female</p>
        </div>
      </div>
    </div>
  );
}
