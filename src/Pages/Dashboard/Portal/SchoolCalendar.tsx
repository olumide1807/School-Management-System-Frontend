import { useQuery } from "@tanstack/react-query";

import SERVER from "../../../Utils/server";
import Loader from "../../loaders/Loader";
import SchoolCalendarView from "./SchoolCalendarView";

// The school calendar page for both portals: the same endpoint and the
// same view for a student and a parent, since the calendar is school-wide.
export default function SchoolCalendar() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["portal-calendar"],
    queryFn: async () => {
      // The response body, per the CLAUDE.md rule; the calendar is data.data
      const res = await SERVER.get("portal/calendar");
      return res?.data;
    },
    retry: false,
  });

  if (isPending) return <Loader />;

  if (isError || !data?.data) {
    return (
      <div className="max-w-[520px] py-12">
        <h1 className="text-xl font-semibold text-secondary">Couldn&apos;t load the school calendar</h1>
        <p className="mt-2 text-sm text-gray-1">
          Please try again, or contact the school office if this keeps happening.
        </p>
      </div>
    );
  }

  return <SchoolCalendarView data={data.data} />;
}
