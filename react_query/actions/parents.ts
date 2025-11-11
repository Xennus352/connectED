import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createParent, getParent } from "../apis/parents";

export interface Parent {
  id: number;
  name: string;
  phone: string;
  address: string;
  email: string;
  occupation: string;
  childrenCount: string;
  relation: string;
  profileUrl: string; // Supabase public image URL
}

// creating a parent
export const useCreateParent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createParent,
    onSuccess: () => {
      // Refetch the list of users after creation
      queryClient.invalidateQueries({ queryKey: ["parent"] });
    },
  });
};

// getting parent
export const useGetParent = () => {
  return useQuery<Parent>({
    queryKey: ["parent"],
    queryFn: getParent,
  });
};
