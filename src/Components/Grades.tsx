/* eslint-disable react/prop-types */
export default function Grades({ color, grade, remark, range }) {
	return (
		<div className="flex items-center gap-x-4">
			<div
				className={`rounded-full border h-[72px] w-[72px] flex items-center justify-center`}
				style={{ border: `1px solid ${color}` }}
			>
				<p className={`font-semibold text-xl`} style={{ color }}>
					{grade}
				</p>
			</div>
			<div className="flex flex-col gap-y-1">
				<p className="text-lg">{remark}</p>
				<p className="text-lg text-[#777777]">({range})</p>
			</div>
		</div>
	);
}
