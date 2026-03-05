/* eslint-disable react/prop-types */
import { useForm, FormProvider } from "react-hook-form";
import Button from "@mui/material/Button";

import Modal from "../../../../../Components/Modals";
import ValidatedInput from "../../../../../Components/Forms/ValidatedInput";
import DatePickerField from "../../../../../Components/Forms/DatePickerField";
import { nanoid } from "@reduxjs/toolkit";

export function fetchSessionData(data, setItem, del) {
  // Using browsers session storage in the meantime...
  let arrItems;
  if (del) {
    arrItems = data;
  } else {
    arrItems = JSON.parse(sessionStorage.getItem("inventory"));
    arrItems = !arrItems || arrItems.length === 0 ? [] : arrItems;
    let [exist] = [...arrItems.filter((item) => item.id === data.id)];
    if (exist) {
      arrItems = arrItems.filter((item) => item.id !== exist.id);
    }
    arrItems.push(data);
  }
  sessionStorage.setItem("inventory", JSON.stringify(arrItems));
  let item = JSON.parse(sessionStorage.getItem("inventory"));
  setItem(item);
}

export default function AddItemModal({
  openModal,
  closeModal,
  isEditing,
  setItem,
  toEdit,
  setIsEditing,
}) {
  const method = useForm({
    mode: "all",
  });

  const onSubmit = async (data) => {
    /* Uses session storage to store data until api is being implemented */
    data["id"] = isEditing ? toEdit : nanoid();
    setIsEditing(false);
    fetchSessionData(data, setItem);
    method.reset();
  };
  return (
    <Modal
      openModal={openModal}
      closeModal={closeModal}
      title={isEditing ? "Edit item" : "Add item"}
    >
      <FormProvider {...method}>
        <form
          onSubmit={method.handleSubmit(onSubmit)}
          className="flex flex-col gap-y-[96px]"
        >
          <div className="flex flex-col gap-y-10">
            <ValidatedInput
              name="name"
              label="Item name"
              placeholder="Item name"
              otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
            />
            <ValidatedInput
              name="quantity"
              label="Quantity"
              placeholder="Number of item"
              otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
            />
            <ValidatedInput
              name="price"
              label="Price"
              placeholder="Price of an item"
              otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
            />
            <DatePickerField name="date" label="Date bought" />
            <ValidatedInput
              name="note"
              label="Note"
              placeholder="Enter more details"
              otherClass="border border-[#ABABAB] bg-[#F7F8F8] rounded-[10px]"
            />
          </div>
          <div>
            <Button
              color="tertiary"
              variant="contained"
              type="submit"
              sx={{
                color: "white",
                borderRadius: "10px",
                paddingY: "12px",
                maxWidth: "171px",
              }}
            >
              {isEditing ? "Save changes" : "Add Item"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
