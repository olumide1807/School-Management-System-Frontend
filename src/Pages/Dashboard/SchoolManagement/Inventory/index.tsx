import { useState } from "react";
import moment from "moment";

import DashboardLayout from "../../../../Templates/DashboardLayout";
import DashboardCard from "../../../../Components/DashboardCard";
import SearchInput from "../../../../Components/Forms/SearchInput";
import TableComponent from "../../../../Components/Tables";
import { toCurrency, filterItem } from "../../../../Utils";
import MessageModal, {
  MessageModal2,
} from "../../../../Components/Modals/MessageModal";
import { InventoryDetail } from "./Modals/InventoryDetail";
import AddItemModal from "./Modals/AddItemModal";
import { fetchSessionData } from "./Modals/AddItemModal";
import BulkUploadModal from "../../../../Components/Modals/BulkUploadModal";
import { useEffect } from "react";
import { Button } from "@mui/material";
// import { useDispatch, useSelector } from "react-redux";

export default function Inventory() {
  const [tableData, setTableData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [toEdit, setToEdit] = useState(null);
  const [note, setNote] = useState(null);
  const [item, setItem] = useState(
    JSON.parse(sessionStorage.getItem("inventory"))
  );
  const [openNoteItemModal, setOpenNoteItemModal] = useState(false);
  const [openAddItemModal, setOpenAddItemModal] = useState(false);
  const [openAddBulkItemModal, setOpenAddBulkItemModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  // const search = useSelector((state) => state.search.search.payload)
  useEffect(HandleSetTableData, [item]);
  function HandleSetTableData() {
    item &&
      setTableData(
        item.map((_, i) => ({
          sn: i + 1,
          item: _.name,
          qty: _.quantity,
          price: toCurrency(_.price),
          date: moment(new Date()).format("MMM DD, YYYY"),
          note: {
            title: _.note,
            handleClick() {
              setOpenNoteItemModal(true);
              setNote(_);
              setIsEditing(true);
              setToEdit(_.id);
            },
          },
          actions: [
            {
              name: "Edit item",
              handleClick: () => {
                setIsEditing(true);
                setOpenAddItemModal(true);
                setToEdit(_.id);
              },
            },
            {
              name: "Delete item",
              handleClick: () => {
                setOpenDeleteModal(true);
                setToDelete(_.id);
              },
            },
          ],
          id: `row_${i}`,
        }))
      );
  }
  return (
    <div>
      <div className="flex flex-col">
        <div>
          <DashboardCard
            bgColor={"bg-bg-3"}
            value={tableData && tableData.length}
          />
        </div>
        <div className="mt-12 mb-8 flex z-0">
          <SearchInput
            // setSearchItem={() => {
            //   let items = filterItem(item, "", true);
            //   if (items.length === 0) {
            //     let itm = JSON.parse(sessionStorage.getItem("inventory"));
            //     setItem(itm);
            //     console.log("No result found");
            //     return;
            //   }
            //   setItem(items);
            // }}
            search={item}
            placeholder="Search name of item"
            otherClass="border border-[#ABABAB] rounded-[5px] px-4 max-w-[251px]"
          />
          {!tableData || tableData.length > 0 ? (
            <>
              <Button
                color="tertiary"
                variant="outlined"
                onClick={() => setOpenAddBulkItemModal(true)}
                sx={{
                  color: "tertiary",
                  borderRadius: "10px",
                  textTransform: "capitalize",
                  paddingY: "12px",
                  width: "221px",
                  marginInline: "10px",
                }}
              >
                Bulk Add Item
              </Button>
              <Button
                color="tertiary"
                variant="contained"
                onClick={() => setOpenAddItemModal(true)}
                sx={{
                  color: "white",
                  borderRadius: "10px",
                  textTransform: "capitalize",
                  paddingY: "12px",
                  width: "221px",
                  marginInline: "10px",
                }}
              >
                Add Item
              </Button>
            </>
          ) : (
            <></>
          )}
        </div>
        <div>
          <TableComponent
            headcells={headcells}
            handleClick1={() => setOpenAddItemModal(true)}
            handleClick2={() => setOpenAddBulkItemModal(true)}
            tableData={tableData}
            btn1Name="Add item"
            btn2Name="Bulk add item"
            message="No item created"
          />
        </div>
      </div>
      {/** Modals */}
      <AddItemModal
        isEditing={isEditing}
        openModal={openAddItemModal}
        closeModal={() => setOpenAddItemModal(false)}
        setItem={setItem}
        toEdit={toEdit}
        setIsEditing={setIsEditing}
      />
      <MessageModal
        column
        desc="Are you sure you want to delete this item?"
        openModal={openDeleteModal}
        closeModal={() => setOpenDeleteModal(false)}
        handleClick={() =>
          fetchSessionData(filterItem(item, toDelete), setItem, true)
        }
      />
      <BulkUploadModal
        openModal={openAddBulkItemModal}
        closeModal={() => setOpenAddBulkItemModal(false)}
      />
      <InventoryDetail
        openModal={openNoteItemModal}
        closeModal={() => {
          setOpenNoteItemModal(false);
        }}
        direction="down"
        title={"Note"}
        note={note}
        handleClick={() => {
          setOpenNoteItemModal(false);
          setOpenAddItemModal(true);
        }}
      />
    </div>
  );
}

const headcells = [
  {
    key: "sn",
    name: "S/N",
  },
  {
    key: "item",
    name: "Item",
  },
  {
    key: "qty",
    name: "Quantity",
  },
  {
    key: "price",
    name: "Price/Qty",
  },
  {
    key: "date",
    name: "Date bought",
  },
  {
    key: "action",
    name: "",
  },
];
