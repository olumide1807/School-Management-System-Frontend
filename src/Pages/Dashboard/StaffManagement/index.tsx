import { useState } from "react";
import AdminManagement from "./Admin";
import ManageStaff from "./Staff";

function StaffManagement() {
  const [adminTab, setAdminTab] = useState(true);
  const [staffTab, setStaffTab] = useState(false);

  const [adminListState, setAdminListState] = useState(false);
  const [staffListState, setStaffListState] = useState(false);

  function handleAdminTab() {
    setAdminTab(true);
    setStaffTab(false);
  }
  function handleStaffTab() {
    setAdminTab(false);
    setStaffTab(true);
  }

  const fakeData = {
    admins: [
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
    ],
    staffs: [
      {
        name: "Gbadejo peter",
        type: "Academic",
        gender: "male",
        contact: "08012345678",
        email: "",
        id: "STAFF003",
      },
      {
        name: "Gbadejo peter",
        type: "Academic",
        gender: "male",
        contact: "08012345678",
        email: "",
        id: "STAFF004",
      },
      {
        name: "Gbadejo peter",
        type: "Academic",
        contact: "08012345678",
        email: "male",
        gender: "male",
        id: "STAFF005",
      },
      {
        name: "Adeyemi Oluwaseun",
        type: "Non-academic",
        gender: "female",
        contact: "08012345678",
        email: "",
        id: "STAFF006",
      },
      {
        name: "Oluwaseun Oluwaseun",
        type: "Academic",
        gender: "female",

        contact: "08012345678",
        email: "",
        id: "STAFF007",
      },
      {
        name: "Oluwaseun Oluwaseun",
        type: "Non-academic",
        contact: "08012345678",
        gender: "female",
        email: "",
        id: "STAFF008",
      },
      {
        name: "Oluwaseun Oluwaseun",
        type: "Academic",
        gender: "female",
        contact: "08012345678",
        email: "",
        id: "STAFF009",
      },
      {
        name: "Oluwaseun Oluwaseun",
        type: "Academic",
        gender: "female",
        contact: "08012345678",
        email: "",
        id: "STAFF010",
      },
    ],
  };

  return (
    <div>
      <section className="w-[280px] sm:w-[400px] p-1 text-lg flex sm:m-0 m-auto">
        <menu
          className={`border-b-2 text-center cursor-pointer text-base ${
            adminTab ? "border-tertiary" : "border-bg-2"
          } w-1/2`}
          onClick={handleAdminTab}
        >
          Admin
        </menu>
        <menu
          className={`border-b-2 text-center cursor-pointer text-base ${
            staffTab ? "border-tertiary" : "border-bg-2"
          } w-1/2`}
          onClick={handleStaffTab}
        >
          Staff
        </menu>
      </section>

      {adminTab ? (
        <>
          <AdminManagement
            admins={adminListState ? fakeData.admins : []}
            staffs={fakeData.staffs}
            setAdminListState={setAdminListState}
            adminListState={adminListState}
          />
        </>
      ) : (
        <>
          <ManageStaff
            staffs={staffListState ? fakeData.staffs : []}
            setStaffListState={setStaffListState}
            staffListState={staffListState}
          />
        </>
      )}
    </div>
  );
}
export default StaffManagement;
// Path: src/Pages/Dashboard/StaffManagement/index.jsx

export function StaffCard({ bg, styles, admin, total, staff, children }) {
  return (
    <div
      className={`min-w-[350px] p-7 min-h-[10vh] rounded-lg text-white flex ${bg}`}
    >
      {admin ? (
        <div className="">
          <h1 className="text-xl font-semibold"> {total}</h1>
          <h1 className="text-lg mt-5"> Total {admin}</h1>
        </div>
      ) : (
        <div className="flex w-full justify-between">
          <div className="">
            <h1 className="text-xl"> {total}</h1>
            <h1 className="mt-4"> Total {staff}</h1>
          </div>
          <div className="flex flex-col justify-between">{children}</div>
        </div>
      )}
    </div>
  );
}
// Path: src/Pages/Dashboard/StaffManagement/StaffCard/index.jsx
