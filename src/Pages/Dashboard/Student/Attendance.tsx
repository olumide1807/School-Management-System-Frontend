import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import SERVER from "../../../Utils/server";
import Loader from "../../loaders/Loader";
import AttendanceView from "./AttendanceView";

export default function StudentAttendance() {
  const [termId, setTermId] = useState("");

  const { data, isPending, isError } = useQuery({
    queryKey: ["student-attendance", termId],
    queryFn: async () => {
      const res = await SERVER.get(
        `portal/student/attendance${termId ? `?termId=${termId}` : ""}`,
      );
      return res?.data?.data;
    },
    retry: false,
  });

  if (isPending) return <Loader />;

  if (isError) {
    return (
      <div className="max-w-[520px] py-12">
        <h1 className="text-xl font-semibold text-secondary">
          Couldn&apos;t load your attendance
        </h1>
        <p className="mt-2 text-sm text-gray-1">
          Please try again, or let your school know if this keeps happening.
        </p>
      </div>
    );
  }

  return <AttendanceView data={data} onSelectTerm={setTermId} />;
}
