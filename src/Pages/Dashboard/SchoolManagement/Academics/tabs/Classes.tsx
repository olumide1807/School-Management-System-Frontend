import { useState } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import FilterComponent from "../../../../../Components/FilterComponent";
import TableComponent from "../../../../../Components/Tables";
import CreateLevel from "../Modals/CreateLevel";
import { useClassArms, useClassLevels } from "../../../../../services/api-call";
import Loader from "../../../../loaders/Loader";
import EmptyTable from "../../../../../Components/EmptyTable";
import Modal from "../../../../../Components/Modals";
import ValidatedInput from "../../../../../Components/Forms/ValidatedInput";
import { useForm, FormProvider } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import SERVER from "../../../../../Utils/server";
import { toast } from "react-toastify";
import { toastOptions } from "../../../../../Utils/toastOptions";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";



export default function Classes() {
  const [choiceArm, setChoiceArm] = useState("All arms");
  const [choiceLevel, setChoiceLevel] = useState("All levels");
  const [openCreateLevelModal, setOpenCreateLevelModal] = useState(false);
  const [openAddArmModal, setOpenAddArmModal] = useState(false);
  const [selectedLevelForArm, setSelectedLevelForArm] = useState<string>("");
  const [addingArm, setAddingArm] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const methods = useForm({ mode: "all" });

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
    ...[...new Set(classArms.map((arm: any) => arm.armName?.toUpperCase()))].map((name) => ({
      label: name,
      value: name,
    })),
  ];

  // Build table data from real API data
  const tableData = classArms
    .map((arm: any, i: number) => {
      const level = classLevels.find((cl: any) => cl._id === arm.classLevelId);
      const armNameUpper = arm.armName?.toUpperCase() || '';
      return {
        sn: i + 1,
        name: `${level?.levelShortName || ''} ${armNameUpper}`.trim(),
        levelShortName: level?.levelShortName || '',
        armName: armNameUpper,
        teacher: arm.assignedTeacher || "Not assigned",
        subject: arm.totalSubjects || "0",
        students: arm.totalStudents || "0",
        actions: '',
        id: arm._id,
        levelId: arm.classLevelId,
        _raw: arm,
      };
    })
    .filter((row: any) => {
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
            navigate(`/school-management/academics?arm=${row.id}&level=${row.levelId}&name=${row.name}`);
          },
        },
      ],
    },
  ];

  const handleAddArm = async (data: any) => {
    if (!data.armName?.trim() || !selectedLevelForArm) return;
    setAddingArm(true);
    try {
      await SERVER.post(`class/${selectedLevelForArm}/arm`, { armName: data.armName.trim().toUpperCase() });
      toast.success(`Arm "${data.armName.toUpperCase()}" added successfully!`, toastOptions);
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['class-arms'] });
      methods.reset();
      setSelectedLevelForArm("");
      setOpenAddArmModal(false);
    } catch (error: any) {
      const errMsg = error?.response?.data?.error || 'Failed to add arm';
      toast.error(errMsg, toastOptions);
    } finally {
      setAddingArm(false);
    }
  };


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
        <Button
          color="tertiary"
          variant="contained"
          onClick={() => setOpenCreateLevelModal(true)}
          sx={{
            color: "white",
            borderRadius: "10px",
            paddingY: "12px",
            paddingX: "20px",
          }}
        >
          Create Class Level
        </Button>
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
          <div className="flex items-center justify-between mb-11">
            <div className="flex items-center gap-x-2.5">
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
            <Button
              color="tertiary"
              variant="outlined"
              onClick={() => setOpenAddArmModal(true)}
              sx={{
                borderRadius: "10px",
                paddingY: "10px",
                paddingX: "20px",
                textTransform: "capitalize",
              }}
            >
              Add Class Arm
            </Button>
          </div>
          <div>
            <TableComponent
              headcells={headcells}
              tableData={tableData}
              handleClick1={() => setOpenCreateLevelModal(true)}
              btn1Name="Create class Level"
            />
          </div>
        </>
      )}

      <CreateLevel
        openModal={openCreateLevelModal}
        closeModal={() => setOpenCreateLevelModal(false)}
      />

      {/* Add Arm Modal */}
      <Modal
        openModal={openAddArmModal}
        closeModal={() => {
          setOpenAddArmModal(false);
          setSelectedLevelForArm("");
          methods.reset();
        }}
        title="Add Class Arm"
      >
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleAddArm)} className="flex flex-col gap-y-8">
            <FormControl fullWidth>
              <InputLabel id="select-level-label">Select Class Level</InputLabel>
              <Select
                labelId="select-level-label"
                value={selectedLevelForArm}
                label="Select Class Level"
                onChange={(e) => setSelectedLevelForArm(e.target.value)}
                required
                sx={{
                  borderRadius: "10px",
                  backgroundColor: "#F7F8F8",
                }}
              >
                {classLevels.map((cl: any) => (
                  <MenuItem key={cl._id} value={cl._id}>
                    {cl.levelShortName || cl.levelName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <ValidatedInput
              name="armName"
              label="Arm name"
              placeholder="e.g  C, D, Gold, Silver"
              otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
            />

            <Button
              color="tertiary"
              variant="contained"
              type="submit"
              disabled={addingArm || !selectedLevelForArm}
              sx={{
                color: "white",
                borderRadius: "10px",
                textTransform: "capitalize",
                padding: "12px 35px",
                width: "fit-content",
              }}
            >
              {addingArm ? 'Adding...' : 'Add Arm'}
            </Button>
          </form>
        </FormProvider>
      </Modal>
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