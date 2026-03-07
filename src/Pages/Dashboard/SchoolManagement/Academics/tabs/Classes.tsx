import { useState } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import FilterComponent from "../../../../../Components/FilterComponent";
import TableComponent from "../../../../../Components/Tables";
import LevelTemplate from "../Modals/LevelTemplate";
import CreateLevel from "../Modals/CreateLevel";
import AssignTeacherModal from "../Modals/AssignTeacherModal";
import { useClassArms, useClassLevels } from "../../../../../services/api-call";
import Loader from "../../../../loaders/Loader";
import EmptyTable from "../../../../../Components/EmptyTable";



export default function Classes() {
  const [choiceArm, setChoiceArm] = useState("All arms");
  const [choiceLevel, setChoiceLevel] = useState("All levels");
  const [openLevelTemplateModal, setOpenLevelTemplateModal] = useState(false);
  const [openCreateLevelModal, setOpenCreateLevelModal] = useState(false);
  const [openAssignTeacherModal, setOpenAssignTeacherModal] = useState(false);


  const navigate = useNavigate();

  const classes = useClassLevels();
  const arms = useClassArms();

  const classLevels = classes?.data?.data?.data || [];
  const classArms = arms?.data?.data?.data || [];
  const isLoading = classes?.isPending || arms?.isPending;

  const num = classLevels.length;
  const armNumber = classArms.length;

  // Build filter options from actual data
  const levelFilterOptions = [
    { label: "All levels", value: "All levels" },
    ...classLevels.map((cl: any) => ({
      label: cl.levelShortName || cl.levelName,
      value: cl.levelShortName || cl.levelName,
    })),
  ];

  const armFilterOptions = [
    { label: "All arms", value: "All arms" },
    ...classArms.map((arm: any) => ({
      label: arm.armName,
      value: arm.armName,
    })),
  ];

  // Build table data from real API data — combine levels with their arms
  const tableData = classArms
    .map((arm: any, i: number) => {
      const level = classLevels.find((cl: any) => cl._id === arm.classLevelId);
      return {
        sn: i + 1,
        name: `${level?.levelShortName || ''} ${arm.armName}`.trim(),
        levelShortName: level?.levelShortName || '',
        armName: arm.armName,
        teacher: arm.assignedTeacher || "Not assigned",
        subject: arm.totalSubjects || "0",
        students: arm.totalStudents || "0",
        actions: '',
        id: arm._id,
        _raw: arm,
      };
    })
    .filter((row: any) => {
      // Apply filters
      const levelMatch = choiceLevel === "All levels" || row.levelShortName === choiceLevel;
      const armMatch = choiceArm === "All arms" || row.armName === choiceArm;
      return levelMatch && armMatch;
    });


  const headcells = [
    {
      key: "sn",
      name: "S/N",
    },
    {
      key: "name",
      name: "Class",
    },
    {
      key: "teacher",
      name: "Class Teacher",
    },
    {
      key: "subject",
      name: "Total Subjects",
    },
    {
      key: "students",
      name: "Total Students",
    },
    {
      key: "actions",
      name: [
        {
          name: "View class",
          handleClick: (row: any) => {
            navigate(`view/${row.id}`);
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

      {isLoading ? (
        <Loader />
      ) : classLevels.length === 0 ? (
        <EmptyTable 
          message='No Class Levels Created' 
          text='Create Class Level' 
          onClick={() => setOpenCreateLevelModal(true)}
        />
      ) : (
        <>
          <div className="flex items-center gap-x-5 mb-11">
            <div className="flex items-center gap-x-2.5 w-full">
              <FilterComponent
                menuOptions={levelFilterOptions}
                choice={choiceLevel}
                setChoice={setChoiceLevel}
              />
              <FilterComponent
                menuOptions={armFilterOptions}
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
        </>
      )}

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


// Exported for use in other components (e.g. StudentManagement)
export const menuOptionsLevel = [
  { label: "JSS1", value: "JSS1" },
  { label: "JSS2", value: "JSS2" },
  { label: "JSS3", value: "JSS3" },
  { label: "SS1", value: "SS1" },
  { label: "SS2", value: "SS2" },
  { label: "SS3", value: "SS3" },
];

export const menuOptionsArm = [
  { label: "A", value: "A" },
  { label: "B", value: "B" },
  { label: "C", value: "C" },
];