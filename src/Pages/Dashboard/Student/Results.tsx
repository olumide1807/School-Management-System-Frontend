import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import SERVER from "../../../Utils/server";
import Loader from "../../loaders/Loader";
import ResultsView from "./ResultsView";

export default function StudentResults() {
  const [selected, setSelected] = useState(""); // "termId:sessionId"

  const [termId, sessionId] = selected ? selected.split(":") : ["", ""];

  const { data, isPending, isError } = useQuery({
    queryKey: ["student-results", termId, sessionId],
    queryFn: async () => {
      const query =
        termId && sessionId ? `?termId=${termId}&sessionId=${sessionId}` : "";
      const res = await SERVER.get(`portal/student/results${query}`);
      return res?.data?.data;
    },
    retry: false,
  });

  const { data: schoolInfo } = useQuery({
    queryKey: ["school-info"],
    queryFn: async () => {
      const res = await SERVER.get("settings/school-info");
      return res?.data?.data;
    },
    retry: false,
  });

  if (isPending) return <Loader />;

  if (isError) {
    return (
      <div className="max-w-[520px] py-12">
        <h1 className="text-xl font-semibold text-secondary">
          Couldn&apos;t load your results
        </h1>
        <p className="mt-2 text-sm text-gray-1">
          Please try again, or let your school know if this keeps happening.
        </p>
      </div>
    );
  }

  return (
    <ResultsView
      data={data}
      selectedKey={selected}
      onSelect={setSelected}
      schoolInfo={schoolInfo}
    />
  );
}
