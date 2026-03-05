import ValidatedInput from "../../../../../Components/Forms/ValidatedInput";
import Modal from "../../../../../Components/Modals";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@mui/material";
import AutocompleteField from "../../../../../Components/Forms/AutocompleteField";
import FilterComponent from "../../../../../Components/FilterComponent";
import { useState } from "react";
import { nanoid } from "@reduxjs/toolkit";
import { Cancel } from "@mui/icons-material";
import BasicTable from "../../../../../Components/Tables/BasicTable";
import { objLen } from "../../../../../Utils";
import { useDispatch, useSelector } from "react-redux";
import { setCurrent } from "../../../../../redux/slice/feeBreakdown";
import { setAll } from "../../../../../redux/slice/feeBreakdown";

export function AddCLV({
  openModal,
  closeModal,
  title,
  setOpenSaveModal,
  preview,
  setPreview,
  edit,
}) {
  const dispatch = useDispatch();
  const [addMore, setAddMore] = useState([]);
  const [showClass, setShowClass] = useState(true);

  const [choiceSession, setChoiceSession] = useState(
    `${edit ? edit["choiceSession"] : "Session"}`
  );
  const [choiceTerm, setChoiceTerm] = useState(
    `${edit ? edit["choiceTerm"] : "Term"}`
  );
  const [choiceCurrency, setChoiceCurrency] = useState(
    `${edit ? edit["choiceCurrency"] : "Currency"}`
  );
  const [moreBreakDown, setMoreBreakDown] = useState(null);
  const classLevels = ["JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3"];
  let toSave = useSelector((state) => state.feeBreakDown.current);

  const method = useForm({ mode: "all" });

  // Function that handles canceling of breakdown
  function handleRemoveBreakDown(id) {
    let change = { ...toSave };
    console.log(change);
    if (objLen(change)) {
      const newData = toSave.feeDesc.filter((item) => item["id"] !== id);
      change["feeDesc"] = newData;
      dispatch(setCurrent(toSave));
    }
    let index = addMore.findIndex((breakdown) => breakdown.props.id === id);
    addMore.pop(index);
    setMoreBreakDown([...addMore]);
    console.log(`Description ${id} Amount ${id}`);
    method.reset({ x: `Description ${id}`, y: `Amount ${id}` });
  }

  //
  return (
    <>
      <Modal
        openModal={openModal}
        closeModal={() => {
          method.reset();
          closeModal();
        }}
        title={
          preview
            ? `Fee breakdown preview`
            : edit
            ? `Edit ${edit["Class level"]}${edit["Class arm"]} preview breakdown`
            : title
        }
        maxWidth={900}
      >
        <FormProvider {...method}>
          <div className={`flex mb-9 ${preview ? "hidden" : ""}`}>
            <ComponentFilter
              setChoiceCurrency={setChoiceCurrency}
              choiceCurrency={choiceCurrency}
              setChoiceTerm={setChoiceTerm}
              choiceTerm={choiceTerm}
              setChoiceSession={setChoiceSession}
              choiceSession={choiceSession}
            />
          </div>
          <form
            onSubmit={method.handleSubmit((data) => {
              if (preview) {
                setOpenSaveModal(true);
                method.reset();
                return;
              }
              let topLevelData = {
                choiceSession,
                choiceTerm,
                choiceCurrency,
              };
              data["feeDesc"] = [];
              data["Total"] = 0;
              for (const key in topLevelData) {
                data[key] = topLevelData[key];
              }
              let len = objLen(data);
              for (let i = 0; i < len; i++) {
                let newFee = {};
                let description = `Description ${i + 1}`;
                let amount = `Amount ${i + 1}`;
                if (
                  Object.hasOwnProperty.call(data, description) &&
                  Object.hasOwnProperty.call(data, amount) &&
                  description !== ""
                ) {
                  newFee["description"] = data[description];
                  newFee["amount"] = data[amount];
                  newFee["id"] = i + 1;
                  data["Total"] += Number(data[amount]);
                  data["feeDesc"].push(newFee);
                }
              }
              dispatch(setCurrent(data));
              // method.reset();
              setPreview(true);
            })}
          >
            {preview ? (
              <>
                <PreviewBreakDown setPreview={setPreview} />
              </>
            ) : (
              <>
                <AutocompleteField
                  label={"Class level"}
                  name={"Class level"}
                  placeholder={
                    edit ? edit["Class level"] : "Select Class level"
                  }
                  selectOption={[...classLevels]}
                  className="mb-9"
                />
                <AutocompleteField
                  label={"Class Arms"}
                  name={"Class arm"}
                  placeholder={"Select Class arms"}
                  selectOption={["A", "B", "C"]}
                  className={showClass && edit ? "" : "mb-9"}
                />
                <div
                  style={{ background: "#EFF5F8" }}
                  className={`mb-7 mt-3 px-3 py-2 rounded-2xl ${
                    showClass && edit ? "flex" : "hidden"
                  } items-center text-black w-fit`}
                >
                  {edit ? edit["Class level"] + edit["Class arm"] : ""}
                  <small
                    className="text-red-500 ml-3 px-[2.5px] py-[1px] bg-slate-200 rounded-2xl"
                    onClick={() => {
                      setShowClass(false);
                    }}
                  >
                    x
                  </small>
                </div>
                <MoreBreakDown id="1" />
                {moreBreakDown}
                <Button
                  variant="outlined"
                  color="tertiary"
                  sx={{ marginBlock: "20px" }}
                  onClick={() => {
                    addMore.push(
                      <MoreBreakDown
                        key={nanoid()}
                        id={addMore.length + 2}
                        handleRemoveBreakDown={handleRemoveBreakDown}
                      />
                    );
                    setMoreBreakDown([...addMore]);
                  }}
                >
                  Add more
                </Button>

                <div className="my-[20px] ">
                  <Button
                    variant={"contained"}
                    color="tertiary"
                    type="submit"
                    sx={{ color: "white" }}
                    onClick={() => {}}
                  >
                    Preview breakdown
                  </Button>
                </div>
              </>
            )}
          </form>
        </FormProvider>
      </Modal>
    </>
  );
}
function ComponentFilter({ ...props }) {
  const {
    choiceCurrency,
    choiceSession,
    choiceTerm,
    setChoiceTerm,
    setChoiceCurrency,
    setChoiceSession,
  } = { ...props };
  return (
    <div className="sm:flex grid grid-cols-2 gap-2">
      <FilterComponent
        setChoice={setChoiceSession}
        choice={choiceSession}
        menuOptions={[
          {
            label: "2021/2022",
            value: "2021/2022",
          },
          {
            label: "2022/2023",
            value: "2022/2023",
          },
          {
            label: "2023/2024",
            value: "2023/2024",
          },
        ]}
        otherClasses={"w-[40px] mr-[30px]"}
      />
      <FilterComponent
        setChoice={setChoiceTerm}
        choice={choiceTerm}
        menuOptions={[
          {
            label: "First Term",
            value: "First Term",
          },
          {
            label: "Second Term",
            value: "Second Term",
          },
          {
            label: "Third Term",
            value: "Third Term",
          },
        ]}
        otherClasses={"w-[40px] mr-[30px]"}
      />
      <FilterComponent
        setChoice={setChoiceCurrency}
        choice={choiceCurrency}
        menuOptions={[
          {
            label: "Naira",
            value: "Naira",
          },
          {
            label: "Dollar",
            value: "Dollar",
          },
          {
            label: "Euro",
            value: "Euro",
          },
        ]}
        otherClasses={"w-[40px] mr-[30px]"}
      />
    </div>
  );
}

function MoreBreakDown({ id, handleRemoveBreakDown }) {
  // const desc = nanoid();
  // const amt = nanoid();
  return (
    <>
      <div className={`flex items-center justify-between mb-9 w-full`}>
        <div className="w-[400px]">
          <ValidatedInput
            name={"Description " + id}
            label={"Description " + id}
            placeholder="e.g Tuition"
            otherClass="border-2 rounded-xl"
            // required={"Description"}
            errDesc={"Description" + id}
          />
        </div>
        <div>
          <ValidatedInput
            name={"Amount " + id}
            label={"Amount " + id}
            placeholder="Enter Amount"
            otherClass="border-2 rounded-xl"
            // required={"Amount"}
            errDesc={"Amount" + id}
          />
        </div>
        <div className={`min-w-5`}>
          {id !== "1" && (
            <Cancel
              className={`text-red-500 mt-7`}
              onClick={() => handleRemoveBreakDown(id)}
            ></Cancel>
          )}
        </div>
      </div>
    </>
  );
}

export function PreviewBreakDown({ setPreview, data, editOpr, deleteOpr }) {
  let toSave = data ? data : useSelector((state) => state.feeBreakDown.current);
  return (
    <div className="">
      <div>
        <button
          type="button"
          className="px-5 py-2 border-2 border-black rounded"
        >
          {toSave.choiceSession}
        </button>
        <button
          type="button"
          className="px-5 py-2 ml-5 border-2 border-black rounded"
        >
          {toSave.choiceTerm}
        </button>
      </div>
      <BasicTable
        headcells={[
          { key: "description", name: "Description" },
          {
            key: "amount",
            name: `Amount(${
              toSave.choiceCurrency === "Dollar"
                ? "D"
                : toSave.choiceCurrency === "Euro"
                ? "E"
                : "N"
            })`,
          },
        ]}
        tableData={toSave.feeDesc}
      />
      <div className="flex bg-[#EFF5F8] mt-12">
        <span className="m-5 font-bold">Total</span>
        <span className="m-5 font-bold ml-[43%]">{`
            ${
              toSave.choiceCurrency === "Dollar"
                ? "D"
                : toSave.choiceCurrency === "Euro"
                ? "E"
                : "N"
            }
          ${toSave.Total}`}</span>
      </div>
      <div className=" flex lg:mt-auto mt-[20vh]">
        <Button
          variant={data ? "contained" : "outlined"}
          color="tertiary"
          sx={{
            minWidth: "140px",
            margin: "25px 0 20px 0",
            color: `${data ? "white" : "initial"}`,
          }}
          onClick={() => {
            !data ? setPreview(false) : editOpr();
          }}
        >
          Edit
        </Button>
        {/* <div className=""> */}
        <Button
          type={data ? "button" : `submit`}
          variant="contained"
          color={data ? "secondary" : "tertiary"}
          onClick={() => {
            data ? deleteOpr() : "";
          }}
          sx={{
            color: "white",
            minWidth: "140px",
            margin: "25px 0 20px 20px",
            background: data ? "black" : "",
          }}
        >
          {!data
            ? "Save changes"
            : `${window.innerWidth > 800 ? "Delete Breakdown" : "Delete"}`}
        </Button>
      </div>
      {/* </div> */}
    </div>
  );
}
