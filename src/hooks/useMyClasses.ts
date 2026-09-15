import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import SERVER from "../Utils/server";

export const useMyClasses = () => {
  const userId = useSelector((state: any) => state.user?.user?._id);

  const { data, isPending } = useQuery({
    queryKey: ["all-class-arms-assignments"],
    queryFn: async () => {
      const res = await SERVER.get("class/arm");
      return res?.data;
    },
    retry: false,
  });

  const allArms = data?.data || [];
  const myClasses = userId
    ? allArms.filter((arm: any) => String(arm.assignedTeacher) === String(userId))
    : [];

  return { myClasses, allArms, isPending, userId };
};

export default useMyClasses;