import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import SERVER from "../../../Utils/server";
import Loader from "../../loaders/Loader";
import AttendanceView from "../Student/AttendanceView";
import ChildPage, { ChildNotFound, firstNameOf, isNotFound } from "./ChildPage";

function ChildAttendanceBody({ childId, name }: { childId: string; name: string }) {
  const [termId, setTermId] = useState("");

  // Same shape as ["student-portal-attendance", ...] but a different child's
  // data, so the key carries childId and a prefix of its own
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["child-attendance", childId, termId],
    queryFn: async () => {
      const res = await SERVER.get(
        `portal/child/${childId}/attendance${termId ? `?termId=${termId}` : ""}`,
      );
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
          Couldn&apos;t load {name}&apos;s attendance
        </h2>
        <p className="mt-2 text-sm text-gray-1">
          Please try again, or let the school know if this keeps happening.
        </p>
      </div>
    );
  }

  return <AttendanceView data={data} onSelectTerm={setTermId} childName={name} />;
}

export default function ChildAttendance() {
  return (
    <ChildPage>
      {({ childId, profile }) => (
        <ChildAttendanceBody
          key={childId}
          childId={childId}
          name={firstNameOf(profile.child)}
        />
      )}
    </ChildPage>
  );
}
