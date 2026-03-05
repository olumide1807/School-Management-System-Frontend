import { useState } from "react";
import Button from "@mui/material/Button";
import Modal from "../../../../Components/Modals";
import CustomSelect from "../../../Forms/CustomSelect";
interface BulkUploadResultModalProps {
  openModal: boolean;
  closeModal: () => void;
}
export default function BulkUploadResultModal({
  openModal,
  closeModal,
}: BulkUploadResultModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    session: "",
    term: "",
    level: "",
    arm: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSelectChange = (event: any, field: string) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const onSubmit = async () => {
    const data = new FormData();
    if (selectedFile) {
      data.append("file", selectedFile);
    }
    data.append("session", formData.session || "");
    data.append("term", formData.term || "");
    data.append("level", formData.level || "");
    data.append("arm", formData.arm || "");

    console.log("Form Data:", Object.fromEntries(data));
    // Here you would typically send the data to your server
    // await axios.post('/api/upload', data);
  };

  return (
    <Modal
      openModal={openModal}
      closeModal={closeModal}
      title="Bulk upload student"
      maxWidth="831px"
    >
      <div className="flex flex-col gap-y-16">
        <div className="flex flex-col gap-y-9">
          <div className="h-[223px] w-full bg-bg-7 border border-dashed border-black flex items-center justify-center rounded-[5px]">
            <div className="flex flex-col gap-y-11">
              <p>Drop files here</p>
              <label htmlFor="file-upload">
                <Button
                  variant="contained"
                  color="tertiary"
                  component="span"
                  sx={{
                    color: "white",
                    borderRadius: "10px",
                    paddingY: "12px",
                    maxWidth: "153px",
                  }}
                >
                  Browse file
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".csv, .xls, .xlsx"
                onChange={handleFileChange}
                hidden
              />
              {selectedFile && <p>{selectedFile.name}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-y-5">
            <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
              <CustomSelect
                label="Session "
                required={true}
                name="session"
                placeholder="Select session"
                selectOption={[]}
                otherclass="w-[403px]"
                value={formData.session}
                onChange={(e) => handleSelectChange(e, "session")}
              />
              <CustomSelect
                label="Term"
                required={true}
                name="term"
                placeholder="Select term"
                selectOption={[]}
                otherclass="w-[403px]"
                value={formData.term}
                onChange={(e) => handleSelectChange(e, "term")}
              />
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
              <CustomSelect
                label="Class level "
                required={true}
                name="level"
                placeholder="Select class level"
                selectOption={[{ value: "knjvlbdfgs", label: "knjvlbdfgs" }]}
                otherclass="w-[403px]"
                value={formData.level}
                onChange={(e) => handleSelectChange(e, "level")}
              />
              <CustomSelect
                label="Class arm "
                required={true}
                name="arm"
                placeholder="Select class arm"
                selectOption={[]}
                otherclass="w-[403px]"
                value={formData.arm}
                onChange={(e) => handleSelectChange(e, "arm")}
              />
            </div>

            <p className="text-tertiary">
              This action adds all uploaded students to the selected class
            </p>
            <Button
              variant="contained"
              onClick={onSubmit}
              color="tertiary"
              sx={{
                color: "white",
                borderRadius: "10px",
                paddingY: "12px",
                maxWidth: "193px",
              }}
            >
              Upload csv file
            </Button>
          </div>
        </div>
        <div>
          <p className="font-semibold mb-9">
            Follow the steps below to download and use the csv file
          </p>
          <div className="flex flex-col gap-y-10">
            <div>
              <p className="mb-5">
                Step 1: Click on the button below to download the csv file
              </p>
              <Button
                variant="outlined"
                color="tertiary"
                sx={{
                  color: "tertiary",
                  borderRadius: "10px",
                  paddingY: "12px",
                  maxWidth: "193px",
                }}
              >
                Download csv file
              </Button>
            </div>
            <p>Step 2: Open the file on your computer</p>
            <p>
              Step 3: Fill all sections provided in the specified format then
              save
            </p>
            <p>
              Step 4: Click on the "Browse file" button to select the filled
              template saved on your computer
            </p>
            <p>
              Step 5: Select a class level, arm, session and term to add all
              students in the file to
            </p>
            <p>Step 6: Click on the "Upload csv file" button to upload</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
