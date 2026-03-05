import BulkUploadModal from "../../../../../Components/Modals/BulkUploadModal";

export function BulkAddStaff({ openBulkAddStaff, closeBulkAddStaff }) {
  return (
    <div>
      <BulkUploadModal
        openModal={openBulkAddStaff}
        closeModal={closeBulkAddStaff}
        title={"Bulk upload staff"}
      />
    </div>
  );
}
