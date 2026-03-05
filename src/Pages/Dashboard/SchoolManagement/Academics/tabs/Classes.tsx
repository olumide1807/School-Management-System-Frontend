import { useState } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import FilterComponent from "../../../../../Components/FilterComponent";
import TableComponent from "../../../../../Components/Tables";
import LevelTemplate from "../Modals/LevelTemplate";
import CreateLevel from "../Modals/CreateLevel";
import AssignTeacherModal from "../Modals/AssignTeacherModal";
import { useClassArms, useClassLevels } from "../../../../../services/api-call";



export default function Classes() {
  const [choiceArm, setChoiceArm] = useState("Select arm");
  const [choiceLevel, setChoiceLevel] = useState("Select level");
  const [openLevelTemplateModal, setOpenLevelTemplateModal] = useState(false);
  const [openCreateLevelModal, setOpenCreateLevelModal] = useState(false);
  const [openAssignTeacherModal, setOpenAssignTeacherModal] = useState(false);


  const navigate = useNavigate();

  const classes = useClassLevels();
  const arms = useClassArms()

	const num =  classes?.data?.data?.data.length;
  const armNumber = arms?.data?.data?.data?.length;


  const headcells = [
    {
      key: "sn",
      name: "S/N",
    },
    {
      key: "name",
      name: "Class Level",
    },
    {
      key: "teacher",
      name: "Class teacher",
    },
    {
      key: "subject",
      name: "Total subject",
    },
    {
      key: "students",
      name: "Total students",
    },
    {
      key: "actions",
      name: [
        {
          name: "View class",
          handleClick: () => {
            navigate("view/:id");
          },
        },
        {
          name: "Assign teacher",
          handleClick: () => {
            setOpenAssignTeacherModal(true);
          },
        },
      ],
    },
  ];


  const tableData = Array(7)
    .fill("")
    .map((_, i) => ({
      sn: i + 1,
      name: "JSS 1A",
      teacher: "Jacob Jones",
      subject: "21",
      students: "21",
      actions: '',
      id: `row_${i}`,
    }));

  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center justify-between p-9 bg-bg-1 rounded-[10px] mb-6">
        <div className="flex flex-col md:flex-row items-center gap-x-[174px] p-1.5">
          <div className="flex items-center gap-x-10">
            <span className="text-2xl font-semibold">{num}</span>
            <p className="text-sm">Class level created</p>
          </div>
          <div className="flex items-center gap-x-10">
            <span className="text-2xl font-semibold">{armNumber}</span>
            <p className="text-sm">Class arm created</p>
          </div>
        </div>
        <div className="flex items-center gap-x-[29px]">

          <Button
            color="tertiary"
            variant="contained"
            onClick={() => navigate('view')}
            sx={{
              color: "white",
              borderRadius: "10px",
              paddingY: "12px",
              maxWidth: "221px",
            }}
            >
            View
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-x-5 mb-11">

        <div className="flex items-center gap-x-2.5 w-full">
          <FilterComponent
            menuOptions={menuOptionsLevel}
            choice={choiceLevel}
            setChoice={setChoiceLevel}
          />
          <FilterComponent
            menuOptions={menuOptionsArm}
            choice={choiceArm}
            setChoice={setChoiceArm}
          />
        </div>
      </div>
      <div>

      <TableComponent
					headcells={headcells}
					tableData={tableData}
					handleClick1={() => setOpenCreateLevelModal(true)}
					handleClick2={() => setOpenCreateLevelModal(true)}
					btn1Name="Create level with template"
					btn2Name="Create class Level"
				/>

      </div>
      <LevelTemplate
        openModal={openLevelTemplateModal}
        closeModal={() => setOpenLevelTemplateModal(false)}
      />
      <CreateLevel
        openModal={openCreateLevelModal}
        closeModal={() => setOpenCreateLevelModal(false)}
      />
      <AssignTeacherModal
        openModal={openAssignTeacherModal}
        closeModal={() => setOpenAssignTeacherModal(false)}
      />
    </div>
  );
}



export const menuOptionsLevel = [
  {
    label: "JSS1",
    value: "JSS1",
  },
  {
    label: "JSS2",
    value: "JSS2",
  },
  {
    label: "JSS3",
    value: "JSS3",
  },
];

export const menuOptionsArm = [
  {
    label: "A",
    value: "A",
  },
  {
    label: "B",
    value: "B",
  },
  {
    label: "C",
    value: "C",
  },
];
