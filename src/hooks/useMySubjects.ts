import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import SERVER from "../Utils/server";

export const useMySubjects = () => {
  const userId = useSelector((state: any) => state.user?.user?._id);

  const { data, isPending } = useQuery({
    queryKey: ["all-specific-subjects"],
    queryFn: async () => {
      const res = await SERVER.get("subject?find=allSpecificSubjects");
      return res?.data;
    },
    retry: false,
  });

  const allSpecifics = Array.isArray(data?.data) ? data.data : [];
  const mySubjects = userId
    ? allSpecifics.filter((sp: any) => String(sp.subjectTeacherId) === String(userId))
    : [];

  return { mySubjects, allSpecifics, isPending };
};

export default useMySubjects;