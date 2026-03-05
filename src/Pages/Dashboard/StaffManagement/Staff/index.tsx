import { StaffCard } from "..";
import { SearchInput } from "../../../../Components/Forms";
import TableComponent from "../../../../Components/Tables";
import Modal from "../../../../Components/Modals";
import { BulkAddStaff } from "./Modals/AddStaffModal";
import { useState } from "react";
import FilterComponent from "../../../../Components/FilterComponent";
import MessageModal from "../../../../Components/Modals/MessageModal";
import { useNavigate } from "react-router-dom";

export default function ManageStaff({
  staffs,
  setStaffListState, // remove during endpoint consuption
  staffListState, // remove during endpoint consumption
}) {
  const [openAddStaff, setOpenAddStaff] = useState(false);
  const [openBulkAddStaff, setOpenBulkAddStaff] = useState(false);
  const [openRemoveStaff, setOpenRemoveStaff] = useState(false);

  const [openAddAdmin, setOpenAddAdmin] = useState(false);

  const [openAddStaff2, setOpenAddStaff2] = useState("Add Staff");

  const [staffFilter, setStaffFilter] = useState("All staff type");

  const navigate = useNavigate();
  return (
    <div className="py-4">
      {/* <p className="text-sm">A staff can only view his/her info</p> */}
      <section className="flex gap-x-3 my-4 overflow-auto horizontal-scroll">
        <StaffCard bg={"bg-bg-4"} staff="Staff" total={staffs.length}>
          <div>
            <span className="mr-1">
              {staffs.filter((staff) => staff.gender === "male").length}
            </span>
            <span>Male</span>
          </div>
          <div>
            <span className="mr-1">
              {staffs.filter((staff) => staff.gender === "female").length}
            </span>
            <span>Male</span>
          </div>
        </StaffCard>
        <StaffCard
          bg={"bg-bg-5"}
          staff="Academic staff"
          total={staffs.filter((staff) => staff["type"] === "Academic").length}
        >
          <div>
            <span className="mr-1">
              {
                staffs.filter(
                  (staff) =>
                    staff.gender === "male" && staff.type === "Academic"
                ).length
              }
            </span>
            <span>Male</span>
          </div>
          <div>
            <span className="mr-1">
              {
                staffs.filter(
                  (staff) =>
                    staff.gender === "female" && staff.type === "Academic"
                ).length
              }
            </span>
            <span>Male</span>
          </div>
        </StaffCard>
        <StaffCard
          bg={"bg-bg-6"}
          staff="Non-academic staff"
          total={
            staffs.filter((staff) => staff["type"] === "Non-academic").length
          }
        >
          <div>
            <span className="mr-1">
              {
                staffs.filter(
                  (staff) =>
                    staff.gender === "male" && staff.type === "Non-academic"
                ).length
              }
            </span>
            <span>Male</span>
          </div>
          <div>
            <span className="mr-1">
              {
                staffs.filter(
                  (staff) =>
                    staff.gender === "female" && staff.type === "Non-academic"
                ).length
              }
            </span>
            <span>Male</span>
          </div>
        </StaffCard>
      </section>
      <div className="my-5 flex justify-between">
        <div className="flex items-center flex-wrap md:flex-nowrap">
          <SearchInput
            placeholder="Search staff"
            className="border rounded pl-3 mr-5"
          />
          <FilterComponent
            choice={staffFilter}
            setChoice={setStaffFilter}
            menuOptions={[
              {
                label: "Academic",
                value: "Academic",
                handleClick: () => {
                  console.log("filtering by academics...");
                  setStaffFilter("Academic");
                },
              },
              {
                label: "Non-academic",
                value: "Non-academic",
                handleClick: () => {
                  console.log("filtering by academics...");
                  setStaffFilter("Academic");
                },
              },
            ]}
          />
        </div>
        <div>
          {staffs.length > 0 && (
            <FilterComponent
              otherClasses={"bg-tertiary"}
              otherClasses2={"text-white"}
              iconColor={"white"}
              textColor={"white"}
              choice={openAddStaff2}
              setChoice={setOpenAddStaff2}
              menuOptions={[
                {
                  label: "Individual upload staff",
                  value: "Individual upload staff",
                  handleClick: () => {
                    // setOpenAddStaffForm(true);
                    navigate("/staff-management/add-staff");
                  },
                },
                {
                  label: "Bulk upload staff",
                  value: "Bulk upload staff",
                  handleClick: () => {
                    setOpenBulkAddStaff(true);
                  },
                },
              ]}
            />
          )}
        </div>
      </div>
      {/* Remove this during endpoint consumption */}
      <button
        className="p-2 mt-3 rounded bg-red-500 text-white "
        onClick={() => setStaffListState(!staffListState)}
      >
        Toggle staff list for testing
      </button>
      <TableComponent
        headcells={[
          { key: "name", name: "Staff name" },
          { key: "gender", name: "Gender" },
          { key: "type", name: "Staff type" },
          { key: "contact", name: "Phone number" },
          { key: "action", name: "" },
        ]}
        handleClick2={() => setOpenAddStaff(true)}
        tableData={staffs.map((_) => {
          _.actions = [
            {
              name: "View Staff",
              handleClick: () =>
                navigate("/staff-management/staff-profile/" + _.id),
            },
            {
              name: "Make Admin",
              handleClick: () => setOpenAddAdmin(true),
            },
            {
              name: <RedText />,
              handleClick: () => setOpenRemoveStaff(true),
            },
          ];
          return _;
        })}
        btn2Name="Add Staff"
        message="You have no staff added"
      />

      {/* Adding staff modal */}
      <Modal openModal={openAddStaff} closeModal={() => setOpenAddStaff(false)}>
        <p className="mb-4 text-lg">How do you want to add staff?</p>
        <p
          className="hover:bg-bg-1 cursor-pointer p-3 my-7 border"
          onClick={() => navigate("/staff-management/add-staff")}
        >
          Individual upload staff
        </p>
        <p
          className="hover:bg-bg-1 cursor-pointer p-3 border"
          onClick={() => setOpenBulkAddStaff(true)}
        >
          Bulk upload staff
        </p>
      </Modal>

      {/* Removing staff */}
      <MessageModal
        openModal={openRemoveStaff}
        closeModal={() => setOpenRemoveStaff(false)}
        desc="This action will delete this staff data from the app.
"
        desc2="Do you wish to delete this staff?"
        btn1Name={"Yes, delete staff"}
        handleClick={() => console.log("removing admin")}
        btn2Name={"No"}
        column={true}
      />

      {/* Make Admin */}
      <MessageModal
        openModal={openAddAdmin}
        closeModal={() => setOpenAddAdmin(false)}
        desc="This will give this staff admin privilege."
        desc2="Are you sure you want to make this staff an admin?"
        btn1Name={"Yes, make admin"}
        handleClick={() => console.log("making admin")}
        btn2Name={"No"}
        column={true}
      />

      {/* Bulk Add staff modal */}
      <BulkAddStaff
        openBulkAddStaff={openBulkAddStaff}
        closeBulkAddStaff={() => setOpenBulkAddStaff(false)}
      />
    </div>
  );
}

function RedText() {
  return <p className="text-red-500">Delete Staff</p>;
}
