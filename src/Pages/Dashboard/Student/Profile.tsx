import { useQuery } from "@tanstack/react-query";

import SERVER from "../../../Utils/server";
import Loader from "../../loaders/Loader";
import ProfileView from "./ProfileView";

export default function StudentProfile() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["student-portal-home"],
    queryFn: async () => {
      const res = await SERVER.get("portal/student/me");
      return res?.data?.data;
    },
    retry: false,
  });

  if (isPending) return <Loader />;

  if (isError || !data) {
    return (
      <div className="max-w-[520px] py-12">
        <h1 className="text-xl font-semibold text-secondary">
          Couldn&apos;t load your profile
        </h1>
        <p className="mt-2 text-sm text-gray-1">
          Please try again, or let your school know if this keeps happening.
        </p>
      </div>
    );
  }

  return <ProfileView student={data.student} classArm={data.classArm} />;
}
