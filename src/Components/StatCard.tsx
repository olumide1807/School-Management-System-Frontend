/* eslint-disable react/prop-types */
export default function StatCard({ icon, value, desc, bg, items }) {
  return (
    <div className="flex flex-col gap-y-[51px] mx-3 border border-[#D1D1D1] rounded-[10px] max-w-[270px] min-w-[225px]">
      <div className="flex flex-col py-7 px-8">
        {icon}{" "}
        <p className="mt-4 mb-1 font-semibold text-black text-[40px] leading-10">
          {value}
        </p>
        <p className="text-sm text-text-pry">{desc}</p>
      </div>
      <div
        className={`flex flex-col py-7 px-8 gap-y-4 mt-auto h-32 rounded-b-[10px] ${bg}`}
      >
        {items.map((item, i) => (
          <span
            key={i}
            className="text-sm text-text-pry flex items-center gap-x-1"
          >
            <p>{item.value}</p>
            <p>{item.desc}</p>
          </span>
        ))}
      </div>
    </div>
  );
}
