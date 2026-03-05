import DashboardLayout from "../../../../Templates/DashboardLayout";
import FilterComponent from "../../../../Components/FilterComponent";
import Modal from "../../../../Components/Modals";
import { useState } from "react";
import { Button } from "@mui/material";
import TableComponent from "../../../../Components/Tables";
import { AddCLV } from "./Modals/AddCLV";
import MessageModal from "../../../../Components/Modals/MessageModal";
import { useDispatch, useSelector } from "react-redux";
import { setAll } from "../../../../redux/slice/feeBreakdown";
import { PreviewBreakDown } from "./Modals/AddCLV";
import { useNavigate } from "react-router-dom";

// Fee Management Base Component
export default function FeeManagement() {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  let breakdown = useSelector((state) => state.feeBreakDown.current);
  let allBreakdown = useSelector((state) => state.feeBreakDown.all);

  const [openCLV, setOpenCLV] = useState(false);
  const [viewBreakDown, setViewBreakDown] = useState(false);
  const [choiceSession, setChoiceSesson] = useState("Session");
  const [choiceTerm, setChoiceTerm] = useState("Term");
  const [openSaveModal, setOpenSaveModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [preview, setPreview] = useState(false);
  const [edit, setedit] = useState(undefined);
  const [tableData, setTableData] = useState(mapTableData(allBreakdown));

  // Maps data to table
  function mapTableData(all) {
    let classRep = {
      1: "One",
      2: "Two",
      3: "Three",
    };
    return all.map((data) => {
      let levels = {};
      let classL = data["Class level"];
      if (classL) {
        levels["level name"] = `${
          classL[0] === "S" ? "Senior" : "Junior"
        } Secondary School ${classRep[classL.slice(-1)]}`;
        levels["short name"] = data["Class level"];
      }
      return {
        ...levels,
        status: data.Total === 0 ? "Not set" : "Set",
        arm: data["Class arm"],
        amount: data.Total === 0 ? "-" : data.Total,
        actions:
          data.Total === 0
            ? [
                {
                  name: "Create class breakdown",
                  handleClick: () => {
                    console.log("Create class breakdown");
                    setedit(data);
                    setOpenCLV(true);
                  },
                },
              ]
            : [
                {
                  name: "View Fee breakdown",
                  handleClick: () => {
                    console.log("View breakdown");
                    setViewBreakDown(true);
                    setedit(data);
                  },
                },
                {
                  name: "Edit Fee breakdown",
                  handleClick: () => {
                    setedit(data);
                    setOpenCLV(true);
                    console.log("Edit fee breakdown");
                  },
                },
              ],
      };
    });
  }

  //Integerate redux storage as an api...
  function savePaymentBreakDown() {
    let all = [...allBreakdown];
    if (!edit) {
      all.push(breakdown);
    } else {
      all = all.map((item) => {
        if (
          item["Class level"] + item["Class arm"] ===
          breakdown["Class level"] + breakdown["Class arm"]
        ) {
          console.log("trying to replace or set an item.");
          return breakdown;
        }
        return item;
      });
    }
    setTableData(mapTableData(all));
    dispatch(setAll(all));
    console.log("Saving Data");
  }

  return (
    <>
      <header>
        <div className="flex lg:flex-row flex-col">
          <p>Fee breakdown for all class levels</p>
          {tableData.length > 0 && (
            <div className="lg:ml-auto mt-5 lg:mt-0 flex">
              <Button
                variant="outlined"
                sx={{
                  marginRight: "25px",
                  color: "primary",
                  minWidth: "135px",
                }}
                color="tertiary"
                onClick={() => {
                  setedit(null);
                  setOpenCLV(true);
                }}
              >
                {window.innerWidth > 800
                  ? "Create fee breakdown"
                  : "Create fee"}
              </Button>
              <Button
                variant="contained"
                sx={{
                  marginLeft: `auto`,
                  color: "white",
                  minWidth: "135px",
                }}
                color="tertiary"
                onClick={() => {
                  console.log("view all breakdown");
                }}
              >
                {window.innerWidth > 800 ? "View all breakdown" : "View all"}
              </Button>
            </div>
          )}
        </div>
        <div className="flex my-7">
          <FilterComponent
            setChoice={setChoiceSesson}
            choice={choiceSession}
            menuOptions={[
              { label: "2021/2022", value: "2021/2022" },
              { label: "2022/2023", value: "2022/2023" },
              { label: "2023/2024", value: "2023/2024" },
            ]}
            otherClasses={"w-[40px] mr-[30px] min-w-[133px]"}
          />
          <FilterComponent
            setChoice={setChoiceTerm}
            choice={choiceTerm}
            menuOptions={[
              { label: "First Term", value: "First Term" },
              { label: "Second Term", value: "Second Term" },
              { label: "Third Term", value: "Third Term" },
            ]}
            otherClasses={"w-[40px] mr-[30px] min-w-[133px]"}
          />
        </div>
      </header>
      <TableComponent
        headcells={headcells}
        tableData={tableData}
        handleClick2={() => navigate("/school-management/academics")}
      />
      <AddCLV
        openModal={openCLV}
        closeModal={() => {
          setOpenCLV(false);
        }}
        title={"Create fee breakdown"}
        setOpenSaveModal={setOpenSaveModal}
        openSaveModal={openSaveModal}
        preview={preview}
        setPreview={setPreview}
        edit={edit}
      />

      <MessageModal
        column
        openModal={openSaveModal}
        btn1Name={"Save changes"}
        btn2Name={"Don't save"}
        closeModal={() => setOpenSaveModal(false)}
        handleClick={() => {
          savePaymentBreakDown();
          setOpenCLV(false);
          setOpenSaveModal(false);
          setPreview(false);
        }}
        desc="Do you wish to save your changes?"
      />
      
      <div className="">
        <Modal
          openModal={viewBreakDown}
          closeModal={() => {
            setViewBreakDown(false);
          }}
          title={
            edit
              ? `${edit["Class level"]}${edit["Class arm"]} fee breakdown`
              : ""
          }
        >
          <PreviewBreakDown
            data={edit}
            editOpr={() => {
              setedit(edit);
              setViewBreakDown(false);
              setOpenCLV(true);
              console.log("Edit");
            }}
            deleteOpr={() => {
              setOpenDeleteModal(true);
              console.log("Delete");
            }}
          />
        </Modal>
      </div>
      <MessageModal
        column
        openModal={openDeleteModal}
        btn1Name={"Yes, Delete"}
        btn2Name={"No"}
        closeModal={() => {
          setOpenDeleteModal(false);
          setViewBreakDown(false);
        }}
        handleClick={() => {
          console.log("click del");

          let all = [...allBreakdown];
          all = all.filter(
            (obj) =>
              obj["Class level"] + obj["Class arm"] !==
              edit["Class level"] + edit["Class arm"]
          );
          setTableData(mapTableData(all));
          dispatch(setAll(all));
          setOpenDeleteModal(false);
          setViewBreakDown(false);
        }}
        desc="Are you sure you want to delete this breakdown?"
      />
    </>
  );
}

const headcells = [
  {
    key: "level name",
    name: "Level name",
  },
  {
    key: "short name",
    name: "Short name",
  },
  {
    key: "arm",
    name: "Arm",
  },
  {
    key: "amount",
    name: "Amount",
  },
  {
    key: "status",
    name: "Status",
  },
  {
    key: "action",
    name: "",
  },
];
