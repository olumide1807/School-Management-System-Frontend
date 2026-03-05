import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { Notice } from "../../../../Components/Vectors";
import {
  setDetails,
  submitDetails,
  getSchDetails,
} from "../../../../redux/slice/schoolDetail";
import Modal from "../../../../Components/Modals";
import {  Input } from "../../../../Components/Forms";
import { useDispatch, useSelector } from "react-redux";
import InputField from "../../../../Components/Forms/InputField";

interface SchoolAccModalProps {
  openModal: boolean;
  closeModal: () => void;
  editDetails: any;
}

const initialState = {
  schoolAccountDetails: {
    accountName: "",
    accountNumber: "",
    phoneNumber: "",
    bankName: "",
  },
}

const SchoolAccountDetails = ({ openModal, closeModal, editDetails }: SchoolAccModalProps) => {

  const [accountDetails, setAccountDetails] = useState(initialState);
  const { status } = useSelector((state: any) => state.schoolDetails);


  useEffect(() => {
    if (editDetails) {
      setAccountDetails({ schoolAccountDetails: editDetails });
    }
  }, [editDetails]);


  const dispatch = useDispatch<any>();

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountDetails((prevDetails) => ({
      ...prevDetails,
      schoolAccountDetails: {
        ...prevDetails.schoolAccountDetails,
        [name]: value,
      },
    }));
  };

  const onSubmitSchAcct = async (e: React.FormEvent) => {
    e.preventDefault();
      dispatch(setDetails(accountDetails));
      await dispatch(submitDetails(accountDetails)).unwrap();
      await dispatch(getSchDetails());
      closeModal()
    } 


  return (
    <Modal
      openModal={openModal}
      closeModal={closeModal}
      title={editDetails ? 'Edit school account details': 'Add school account details'}
    >
      <div className="mb-4">
        <Notice />
      </div>

      <form onSubmit={onSubmitSchAcct} className="flex flex-col gap-y-[20px]">
        <Input
          name="bankName"
          placeholder="E.g Access Bank PLC"
          otherClass="border border-[#ABABAB] rounded-[10px]"
          label="Full Bank Name"
          onChange={handleDetailsChange}
          required={true}
          type="text"
          value={accountDetails.schoolAccountDetails.bankName}
        />
        <InputField
          name="accountNumber"
          placeholder="E.g 0123456789"
          otherClass="border border-[#ABABAB] rounded-[10px]"
          label="Account Number"
          required={true}
          onChange={handleDetailsChange}
          value={accountDetails.schoolAccountDetails.accountNumber}
        />
        <Input
          name="accountName"
          placeholder="E.g John Doe"
          otherClass="border border-[#ABABAB] rounded-[10px]"
          label="Account Name"
          onChange={handleDetailsChange}
          required={true}
          value={accountDetails.schoolAccountDetails.accountName}
        />
        <InputField
          type="tel"
          name="phoneNumber"
          otherClass="border border-[#ABABAB] rounded-[10px]"
          label="Phone number"
          onChange={handleDetailsChange}
          required={true}
          value={accountDetails.schoolAccountDetails.phoneNumber}
          placeholder="Phone Number"
        />
        <div className="my-5">
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
           {status === 'pending' ? 'Saving...': 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SchoolAccountDetails;