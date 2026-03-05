/* eslint-disable react/prop-types */
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import moment from "moment";

export default function freeBreakDownPreview({ breakdown }) {
  const navigate = useNavigate();
  return (
    <div
      className={`min-h-[30vh] py-3.5 px-5 md:w-1/2 w-full border border-[#E2E2E2] rounded-[10px]`}
    >
      <div className="flex justify-between">
        <p className="text-black m-3">Fee management</p>
        {breakdown.length !== 0 && (
          <p className="text-tertiary m-3">View all</p>
        )}
      </div>
      <div className="flex justify-between mt-9">
        {breakdown.map((curr) => (
          <div className="w-1/2  bg-bg-2 px-5 py-3 flex flex-col capitalize  rounded-xl mr-3 gap-y-14">
            <p>{`${
              curr["Class level"][0] === "S" ? "Senior" : "Junior"
            } Secondary School ${curr["Class level"].slice(-1)}`}</p>
            <p>N{curr["Total"]}</p>
          </div>
        ))}
      </div>
      {breakdown.length === 0 && (
        <div className="flex items-center justify-center h-2/3">
          <Button
            variant="contained"
            color="tertiary"
            sx={{ color: "white", padding: "10px 20px", borderRadius: "10px" }}
            onClick={() => navigate("/school-management/fee-management")}
          >
            Create fee breakdown
          </Button>
        </div>
      )}
    </div>
  );
}

export function AnnouncementDetails({
  announcement,
  handleViewSingle,
  handleViewAll,
  handleCreate,
}) {
  return (
    <div className="py-3.5 my-2 md:my-0 px-5 md:w-1/2 w-full flex flex-col gap-y-8 border border-[#E2E2E2] rounded-[10px]">
      <div className="flex items-center justify-between">
        <p className="text-black">Announcement</p>
        <div className="flex items-center gap-x-7">
          {announcement?.length > 0 && (
            <button className="py-3 px-4 text-tertiary" onClick={handleViewAll}>
              View all
            </button>
          )}
          <span className="hidden md:inline">
            <Button
              color="tertiary"
              variant="contained"
              onClick={handleCreate}
              sx={{
                color: "white",
                borderRadius: "10px",
                textTransform: "capitalize",
              }}
            >
              Create
            </Button>
          </span>
        </div>
      </div>
      {announcement?.length > 0 ? (
        <div className="md:flex gap-x-[22px]">
          {announcement?.slice(0, 2).map((a) => (
            <AnnouncementCard
              handleViewSingle={handleViewSingle}
              a={a}
              key={a._id}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <p className="text-text-ter">No Announcement</p>
        </div>
      )}
      <span className="md:hidden inline">
        <Button
          color="tertiary"
          variant="contained"
          onClick={handleCreate}
          sx={{
            color: "white",
            borderRadius: "7px",
            textTransform: "capitalize",
          }}
        >
          Create
        </Button>
      </span>
    </div>
  );
}

export function AnnouncementCard({ handleViewSingle, a }) {
  return (
    <div className="pl-[18px] pb-[18px] pt-4 flex flex-col gap-y-4 rounded-[10px] bg-bg-2 md:w-1/2 w-full my-2 px-1">
      <div className="flex items-center justify-between">
        <p className="text-black text-[13px]">{a?.title}</p>
        <button
          className="py-3 px-4 text-tertiary"
          onClick={() => handleViewSingle(a)}
        >
          View
        </button>
      </div>
      <p>{a?.description}</p>
      <p className="text-tertiary-2 text-[13px]">
        {moment(a.endDate).format("MMM Do YY")}
      </p>
    </div>
  );
}
