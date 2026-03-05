import { StaffCard } from "..";
import { SearchInput } from "../../../../Components/Forms";
import TableComponent from "../../../../Components/Tables";
import { useState } from "react";
import { Button } from "@mui/material";
import ModifiedTableComponent from "../../../../Components/Tables/ModifiedTable";
import AddAdminModal from "./Modals";
import MessageModal from "../../../../Components/Modals/MessageModal";
import { useNavigate } from "react-router-dom";
import { ta } from "date-fns/locale";

export default function AdminManagement({
  admins = [],
  staffs = [],
  setAdminListState, // remove during endpoint consuption
  adminListState, // remove during endpoint consumption
}) {
  const [openAddAdmin, setOpenAddAdmin] = useState(false);
  const [openRemoveAdmin, setOpenRemoveAdmin] = useState(false);

  const navigate = useNavigate();
  const admin1 = [
    {
      name: "Funke Badejo",
      type: "Non-Academic",
      contact: "09123456789",
      gender: "female",
      email: "",
      id: "STAFF001",
    },
    {
      name: "Taiwo Akindele",
      type: "Academic",
      contact: "09011593490",
      gender: "male",
      email: "damisco005@gmail.com",
      id: "STAFF002",
    },
    // Add more admins here
  ];
  const headcells = [
    { key: "name", name: "Admin name" },
    { key: "gender", name: "Gender" },
    { key: "phoneNum", name: "Phone number" },
    { key: "actions", name: "" },
  ];
  const tableData = admin1.map((item, i) => ({
    name: `${item.name}`,
    gender: <p>{item.gender}</p>,
    phoneNum: <p>{item.contact}</p>,
    // type: _.type,
    // action: <RedText />,
    actions: [
      {
        name: "View staff",
        handleClick: () =>
          navigate("/staff-management/staff-profile/" + item.id),
      },
      {
        name: <p className="text-red-500">Remove admin</p>,
        handleClick: () => setOpenRemoveAdmin(true),
      },
    ],
    id: `row_${i}`,
  }));

  return (
    <div className="py-4">
      <p className="text-sm">
        Admins can access everything, excluding adding or removing other admins
      </p>
      <section className="flex gap-x-[3em] my-4 overflow-auto horizontal-scroll">
        <StaffCard bg={"bg-bg-4"} admin="Admin" total={admins.length} />
        <StaffCard
          bg={"bg-bg-5"}
          admin="Male"
          total={admins.filter((admin) => admin["gender"] === "male").length}
        />
        <StaffCard
          bg={"bg-bg-6"}
          admin="Female"
          total={admins.filter((admin) => admin["gender"] === "female").length}
        />
      </section>
      <div className="my-5 flex items-center justify-between">
        <SearchInput
          placeholder="Search admin"
          className="border rounded pl-3"
        />
        {admins.length > 0 && (
          <div>
            <Button
              variant="contained"
              color="tertiary"
              // className="text-white"
              sx={{
                color: "white",
                width: "max-content",
                paddingLeft: "3em",
                paddingRight: "3em",
              }}
              onClick={() => setOpenAddAdmin(true)}
            >
              Add Admin
            </Button>
          </div>
        )}
      </div>
      {/* Remove this during endpoint consumption */}

      <button
        className="p-2 mt-3 rounded bg-red-500 text-white "
        onClick={() => setAdminListState(!adminListState)}
      >
        Toggle admin list for testing
      </button>
      {admins.length > 0 && (
        <ModifiedTableComponent
          headcells={headcells}
          handleClick2={() => setOpenAddAdmin(true)}
          tableData={tableData}
          btn2Name="Add Admin"
          message="You have no admin added"
        />
      )}

      {/* Modals */}
      <AddAdminModal
        openModal={openAddAdmin}
        closeModal={() => setOpenAddAdmin(false)}
        staffs={staffs}
      />

      <MessageModal
        openModal={openRemoveAdmin}
        closeModal={() => setOpenRemoveAdmin(false)}
        desc="This action will revoke admin access for this staff."
        desc2="Do you wish to remove this staff as admin?"
        btn1Name={"Yes, remove admin"}
        handleClick={() => console.log("removing admin")}
        btn2Name={"No"}
        column={true}
      />
    </div>
  );
}

function RedText() {
  return <p className="text-red-500">Remove admin</p>;
}
