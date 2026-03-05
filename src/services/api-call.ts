import { useMutation, useQuery } from "@tanstack/react-query";
import SERVER from "../Utils/server";

export const useCreateAnnouncement = () => {
  return useMutation(async (body) => {
    const data = await SERVER.post("announcement/create", body);
    return data;
  });
};

// export const useCheckBank = (id: string) => {
//     const query = useQuery({
//       queryKey: ['check-bank'],
//       queryFn: async () => {
//         const data = await SERVER.get(/user-bank/me?userId=${id});
//         return data;
//       },
//       onError: err => {
//         handleAxiosError(err);
//       },
//     });

//     return query;
//   };

export const useGetAnnoucement = () => {
  const query = useQuery({
    queryKey: ["annoucement"],
    queryFn: async () => {
      const data = await SERVER.get("announcement");

      return data;
    },
  });
  return query;
};

export const useGetAccountDetails = () => {
    const query = useQuery({
        queryKey: ['account-details'],
        queryFn: async () => {
            const data = await SERVER.get('superadmin/account')
    
            return data;
        }
        })
        return query;
}


export const useSessionTerm = () => {
    const query = useQuery({
        queryKey: ['session'],
        queryFn: async () => {
            const data = await SERVER.get('session/current')
    
            return data;
        }
        })
        return query;
}


export const useGetAllSession = () => {
  const query = useQuery({
      queryKey: ['all-session'],
      queryFn: async () => {
          const data = await SERVER.get('session')
  
          return data;
      }
      })
      return query;
}


export const useClassLevels = () => {
  const query = useQuery({
      queryKey: ['classes'],
      queryFn: async () => {
          const data = await SERVER.get('class')
  
          return data;
      }
      })
      return query;
}


export const useClassArms = () => {
  const query = useQuery({
      queryKey: ['classes'],
      queryFn: async () => {
          const data = await SERVER.get('class/arm')
  
          return data;
      }
      })
      return query;
}


export const useGetAllSubjects = () => {
  const query = useQuery({
      queryKey: ['all-subjects'],
      queryFn: async () => {
          const data = await SERVER.get('subject')
  
          return data;
      }
      })
      return query;
}


