import MessageModal from "../../../../Components/Modals/MessageModal";
import Modal from "../../../../Components/Modals";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import moment from "moment";
import { useGetAnnoucement } from "../../../../services/api-call";
import { useDispatch, useSelector } from "react-redux";
import { setAnnouncements, deleteAnnouncement } from "../../../../redux/slice/announcementSlice";
import CreateOrEditAnnouncement from "./CreateEditAnnouncement";
import Loader from "../../../loaders/Loader";




const AllAnnouncement = ({ openModal, closeModal }) => {

  const [openDelAnnouncement, setOpenDelAnnouncement] = useState(false);
  const [announcementIdToDelete, setAnnouncementIdToDelete] = useState(null);
  const [editAnnouncement, setEditAnnouncement] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data, error, isPending, refetch } = useGetAnnoucement();

  const { announcements } = useSelector((state) => state.announcements)

  const dispatch = useDispatch();

  const handleDelete = async (id) => {
      dispatch(deleteAnnouncement(id)).then(() => {
        refetch();
        setOpenDelAnnouncement(false);
      });
  };
    
    
    useEffect(() => {
      if (data?.data?.data) {
      dispatch(setAnnouncements(data.data.data));
      }
    }, [data]);

    const handleEdit = (announcement) => {
      setEditAnnouncement(announcement);
      setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
      setIsEditModalOpen(false);
      setEditAnnouncement(null);
    };
  

  return (
    <div>
      <Modal
        openModal={openModal}
        closeModal={closeModal}
        maxWidth={1000}
        title={"Announcement"}
      >
        <div className="grid md:grid-cols-2 w-full gap-x-10 gap-y-4 grid-cols-1 justify-items-center">
          {isPending ? (
              <Loader/>
          ) : error ? (
            <div className="text-3xl text-red-400">Something went wrong</div>
          ) : (
            announcements?.map((d) => (
              <div
                className={`w-full border md:w-[320px] lg:w-[400px] rounded-lg h-[250px] p-5 ${
                  d?.due ? "bg-red-100 border-red-500" : "bg-bg-2"
                }`}
                key={d._id}
              >
                <div className="flex justify-between">
                  <h2 className="text-opacity-40 text-xl">{d?.title}</h2>{" "}
                  {d?.due && (
                    <aside className="bg-[#FFABAB] rounded-3xl p-1 px-3">
                      Due
                    </aside>
                  )}
                </div>
                <div>
                  <span>{moment(d?.startDate).format("DD/MM/YYYY")}</span>{" "}
                  <small>to</small>{" "}
                  <span>{moment(d?.endDate).format("DD/MM/YYYY")}</span>
                </div>
                <h3 className="my-2">{d?.description}</h3>
                {d?.visibleTo?.map((i) => (
                  <button
                    className="border rounded-2xl border-gray-500 p-0.5 w-20  my-3 mr-2"
                    key={i}
                  >
                    {i}
                  </button>
                ))}
                <div className="flex mt-7 justify-between w-full md:w-[65%]">
                  <Button
                    variant="contained"
                    color="tertiary"
                    sx={{
                      color: "white",
                      width: "100px",
                      borderRadius: "10px",
                    }}
                    onClick={() => handleEdit(d)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      width: "100px",
                      borderRadius: "10px",
                      background: "white",
                    }}
                    onClick={() => {
                      setAnnouncementIdToDelete(d._id);
                      setOpenDelAnnouncement(true);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      <ConfirmDeleteAnnouncement
        openDelete={openDelAnnouncement}
        cancelDelete={() => setOpenDelAnnouncement(false)}
        deleteAction={handleDelete}
        announcementId={announcementIdToDelete}
      />

      <CreateOrEditAnnouncement
        openModal={isEditModalOpen}
        closeModal={closeEditModal}
        isEditing={!!editAnnouncement}
        announcement={editAnnouncement}
      />

    </div>
  );
};

export const OneAnnouncement = ({ open, close, announcement }) => {
  const [openDelAnnouncement, setOpenDelAnnouncement] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [editAnnouncement, setEditAnnouncement] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const dispatch = useDispatch();
  const { refetch } = useGetAnnoucement();


  const handleEdit = (i) => {
    setEditAnnouncement(i);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditAnnouncement(null);
  };
  
  const handleDelete = async (id) => {
    dispatch(deleteAnnouncement(id)).then(() => {
      refetch();
      close();
    });
  };

  return (
    <main>
        {
        announcement && (
          <div key={announcement._id}>
            <MessageModal
              title={announcement.title}
              desc={announcement.description}
              desc2={moment(announcement?.endDate).format("DD/MM/YYYY")}
              openModal={open}
              closeModal={close}
              handleClick={() => handleEdit(announcement)}
              holidayTo={announcement.visibleTo}
              handleClick2={() => {
                setOpenDelAnnouncement(true);
                setIdToDelete(announcement._id)
              }}
            />
            <ConfirmDeleteAnnouncement
              openDelete={openDelAnnouncement}
              cancelDelete={() => setOpenDelAnnouncement(false)}
              deleteAction={handleDelete}
              announcementId={idToDelete}
            />
            <CreateOrEditAnnouncement
              openModal={isEditModalOpen}
              closeModal={closeEditModal}
              isEditing={!!editAnnouncement}
              announcement={editAnnouncement}
            />
          </div>
        )}
    </main>
  );
};

function ConfirmDeleteAnnouncement({ openDelete, cancelDelete, deleteAction, announcementId }) {

  return (
    <MessageModal
      column
      desc="Are you sure you want to delete this announcement?"
      openModal={openDelete}
      closeModal={cancelDelete}
      handleClick={() => deleteAction(announcementId)}
    />
  );
}

export default AllAnnouncement;