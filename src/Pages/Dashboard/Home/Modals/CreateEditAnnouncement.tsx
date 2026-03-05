import SERVER from "../../../../Utils/server";
import { useState, useEffect } from "react";
import { Button, Checkbox } from "@mui/material";
import { useGetAnnoucement } from "../../../../services/api-call";
import Modal from "../../../../Components/Modals";
import { ErrorMsg,  DatePickerInput, Input, TextAreaField } from "../../../../Components/Forms";
import { toast } from "react-toastify";
import { toastOptions } from "../../../../Utils/toastOptions";




const initialState = {
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    visibleTo: [],
}



const CreateOrEditAnnouncement = ({ openModal, closeModal, isEditing, announcement}) => {
  const [error, setError] = useState("");
  const [staff, setStaff] = useState(false);
  const [student, setStudent] = useState(false);
  const [loading, setLoading] = useState(false);


  const { refetch } = useGetAnnoucement();

  const [formState, setFormState] = useState(initialState);

  useEffect(() => {
    if (isEditing && announcement) {
      setFormState({
        title: announcement?.title,
        description: announcement?.description,
        startDate: announcement?.startDate,
        endDate: announcement?.endDate,
        visibleTo: announcement?.visibleTo,
      });
      setStaff(announcement?.visibleTo.includes("staff"));
      setStudent(announcement?.visibleTo.includes("student"));
    }
  }, [isEditing, announcement]);

  const handleChange = (e) => {
    setFormState({...formState, [e.target.name]: e.target.value})
  }


  const handleDateChange = (name, date) => {
    setFormState((prev) => ({
      ...prev,
      [name]: date ? date.toISOString() : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, startDate, endDate } = formState;
    const visibleTo = [];
    if (staff) visibleTo.push("staff");
    if (student) visibleTo.push("student");

    try {
      setLoading(true);
      if(title?.length < 7){
        toast.error('Announcement Title must be at least 7 characters!', toastOptions);
        return;
      }
      
      if(description?.length < 20){
        toast.error('Description must be at least 20 characters!', toastOptions);
        return;
      }

      if(startDate > endDate){
        toast.error('Start Date must not be greater than End Date of announcement!', toastOptions);
        return;
      }

      const payload = {
        title,
        description,
        startDate,
        endDate,
        visibleTo,
      };


      const res = isEditing
      ? await SERVER.put(`announcement/${announcement._id}`, payload)
      : await SERVER.post("announcement/create", payload);
      
      if (res.data) {
        setLoading(false);
        toast.success(`Announcement ${isEditing ? "updated" : "created"} successfully!`, toastOptions);
        setFormState(initialState);
        setStaff(false);
        setStudent(false);
        refetch();
      }
      
      closeModal();
      refetch();
    } catch (error) {
      setLoading(false);
      if(error?.response?.status === 409){
        toast.error('Announcement already exists!', toastOptions)
        setError("Announcement with this title already exists. Please choose a different title");
      } else {
        toast.error('Unable to create announcement, please try again!', toastOptions)
        setError("Unable to create announcement, please try again");
      } 
    } finally{
      setLoading(false);
    }
  };
  

  return (
    <Modal
      openModal={openModal}
      closeModal={closeModal}
      title={isEditing ? "Edit announcement" : "Create announcement"}
      maxWidth={600}
    >
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-[35px]">
          <div className="flex flex-col"></div>
          <Input
            name="title"
            placeholder="E.g Public holiday"
            otherClass="border border-[#ABABAB] rounded-[10px]"
            label="Title"
            value={formState.title}
            onChange={handleChange}
            required
          />
          <TextAreaField
            name="description"
            label="Brief description"
            placeholder="Type here"
            value={formState.description}
            handleChange={handleChange}
            required
          />
          <p>Date to make announcement visible</p>
          <div className="flex md:flex-row gap-x-10 flex-col">

            <div className="w-full sm:w-[200px]">
              <DatePickerInput
                name="startDate"
                value={formState.startDate}
                label={"Start Date"}
                onChange={(date) => handleDateChange("startDate", date)}
                minDate={Date.now()}
              />
            </div>

            <div className="w-full sm:w-[200px]">
              <DatePickerInput
                name="endDate"
                value={formState.endDate}
                label={"End Date"}
                onChange={(date) => handleDateChange("endDate", date)}
                minDate={Date.now()}
              />
            </div>
          </div>

          <div>
            <p>Make announcement visible to</p>
            {/* <div> */}
            <Checkbox
              checked={staff}
              onChange={(e) => setStaff(e.target.checked)}
              inputProps={{ "aria-label": "controlled" }}
            />{" "}
            <span>Staff</span>
            {/* </div>
              <div> */}
            <Checkbox
              checked={student}
              onChange={(e) => setStudent(e.target.checked)}
              inputProps={{ "aria-label": "controlled" }}
            />{" "}
            <span>Student</span>
            {/* </div> */}
          </div>
          <div className="mt-16">
            <Button
              color="tertiary"
              variant="contained"
              type="submit"
              sx={{
                color: "white",
                borderRadius: "10px",
                textTransform: "capitalize",
                padding: "12px 35px",
              }}
            >
              {loading ? 'Saving...': 'Save'}
            </Button>
            <ErrorMsg text={error} />
          </div>
        </form>
    </Modal>
  );
}

export default CreateOrEditAnnouncement;