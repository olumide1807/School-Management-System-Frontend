import TableComponent from "../../../../../Components/Tables";
import { useState } from "react";
import FilterComponent from "../../../../../Components/FilterComponent";

export default function Attendance() {
  const [choiceLevel, setChoiceLevel] = useState("2019 / 2020");
  const menuOptionsLevel = [
    {
      label: "2019 / 2020",
      value: "2019 / 2020",
    },
    {
      label: "2020 / 2021",
      value: "2020 / 2021",
    },
    {
      label: "2021 / 2022",
      value: "2021 / 2022",
    },
  ];

  const tableData = Array(3)
    .fill("")
    .map((_, i) => ({
      term: "First term",
      presentTime: "121",
      absentTime: "12",
      id: `row_${i}`,
    }));
  return (
    <div className="mb-10">
      <div className="flex items-center gap-x-[2em] w-full mt-[2em] mb-[2em]">
        <FilterComponent
          menuOptions={menuOptionsLevel}
          choice={choiceLevel}
          setChoice={setChoiceLevel}
        />
      </div>

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
    key: "term",
    name: "Term",
  },
  {
    key: "presentTime",
    name: "Present time",
  },
  {
    key: "absentTime",
    name: "Absent time",
  },
];
