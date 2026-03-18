import { Avatar, Button } from "@mui/material";
import { useState } from "react";
import UserInfo from "./UserInfo";
import MessageModal from "../../Components/Modals/MessageModal";
import EditUserProfile from "./Modals/EditUserProfile";
import TimetableSettings from "./TimetableSettings";

export default function Settings() {
  const [readProfileOnly1, setReadProfileOnly1] = useState(true);
  const [readProfileOnly2, setReadProfileOnly2] = useState(true);
  const [openDelete, setOpenDelete] = useState(false);
  const [openEditProfile, setOpenEditProfile] = useState(false);

  return (
    <div>
      <UserProfile
        name={"Damilola Abdulmolik"}
        email={"damisco005@gmail.com"}
        editProfile={() => {
          setOpenEditProfile(true);
        }}
      />
      <UserInfo
        readProfileOnly1={readProfileOnly1}
        readProfileOnly2={readProfileOnly2}
        setReadProfileOnly1={setReadProfileOnly1}
        setReadProfileOnly2={setReadProfileOnly2}
      ></UserInfo>
      <UserCurrentPlan />

      <TimetableSettings />

      {/* Delete Account */}
      <Button
        variant="outlined"
        color="error"
        sx={{
          borderColor: "#D3384B",
          width: "300px",
          padding: "7px",
        }}
        onClick={() => {
          setOpenDelete(true);
        }}
      >
        Delete account
      </Button>

      {/* Delete Modals screen */}
      <MessageModal
        openModal={openDelete}
        closeModal={() => setOpenDelete(false)}
        desc="Are you sure you want to delete your account?"
        btn1Name="Yes, Delete account"
        handleClick={() => {
          setOpenDelete(false);
          console.log("Delete account");
        }}
        column
      />
      {/* Edit Modal screen */}
      <EditUserProfile
        openModal={openEditProfile}
        closeModal={() => setOpenEditProfile(false)}
      />
    </div>
  );
}

function UserProfile({ name, email, avatar, editProfile }) {
  return (
    <section className="flex mb-11">
      <Avatar
        src={avatar || "/images/placeholder.png"}
        alt="profile picture"
        sx={{ width: 120, height: 120 }}
      />
      <div className="ml-5">
        <p className="text-lg font-semibold capitalize">{name}</p>
        <p className="font-semibold my-2">{email}</p>
        <Button
          variant="contained"
          color="tertiary"
          sx={{ color: "white" }}
          onClick={editProfile}
        >
          Edit Profile
        </Button>
      </div>
    </section>
  );
}

function UserCurrentPlan({}) {
  return (
    <section className="bg-[#2C3D43] my-5 rounded-md border p-7">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold text-white">
          Current Subscription Plan
        </h1>
        <div className="px-5 py-1 rounded-2xl bg-[#647881] text-white ml-3">
          Free
        </div>
      </div>
      <div className="w-[200px] mt-6 mb-1">
        <Button
          variant="contained"
          color="tertiary"
          sx={{ color: "white", width: "inherit", borderRadius: "10px" }}
          onClick={() => {
            console.log("");
          }}
        >
          Change plan
        </Button>
      </div>
    </section>
  );
}