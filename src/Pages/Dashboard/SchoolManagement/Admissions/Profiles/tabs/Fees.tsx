import TableComponent from "../../../../../../Components/Tables";
import { toCurrency } from "../../../../../../Utils";

export default function Fees() {
	const tableData = Array(5)
		.fill("")
		.map((_, i) => ({
			session: "2021 / 2022 session",
			term: "First term",
			amount: toCurrency(350000),
			status: <p className="text-[#009A49] capitalize py-3">Paid</p>,
			id: `row_${i}`,
		}));
	return (
		<div className="mb-10">
			<TableComponent
				headcells={headcells}
				tableData={tableData}
				message="No fees paid yet"
			/>
		</div>
	);
}

const headcells = [
	{
		key: "session",
		name: "Session",
	},
	{
		key: "term",
		name: "Term",
	},
	{
		key: "amount",
		name: "Amount",
	},
	{
		key: "status",
		name: "Status",
	},
];
