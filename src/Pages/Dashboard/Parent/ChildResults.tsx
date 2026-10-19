import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import SERVER from "../../../Utils/server";
import Loader from "../../loaders/Loader";
import ResultsView from "../Student/ResultsView";
import ChildPage, { ChildNotFound, firstNameOf, isNotFound } from "./ChildPage";

function ChildResultsBody({ childId, name }: { childId: string; name: string }) {
  const [selected, setSelected] = useState(""); // "termId:sessionId"

  const [termId, sessionId] = selected ? selected.split(":") : ["", ""];

  // Same shape as ["student-results", ...] but a different child's data,
  // so the key carries childId and a prefix of its own
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["child-results", childId, termId, sessionId],
    queryFn: async () => {
      const query =
        termId && sessionId ? `?termId=${termId}&sessionId=${sessionId}` : "";
      const res = await SERVER.get(`portal/child/${childId}/results${query}`);
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
  if (isNotFound(error)) return <ChildNotFound />;

  if (isError) {
    return (
      <div className="max-w-[520px] py-6">
        <h2 className="text-lg font-semibold text-secondary">
          Couldn&apos;t load {name}&apos;s results
        </h2>
        <p className="mt-2 text-sm text-gray-1">
          Please try again, or let the school know if this keeps happening.
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
      childName={name}
    />
  );
}

export default function ChildResults() {
  return (
    <ChildPage>
      {({ childId, profile }) => (
        <ChildResultsBody
          key={childId}
          childId={childId}
          name={firstNameOf(profile.child)}
        />
      )}
    </ChildPage>
  );
}
