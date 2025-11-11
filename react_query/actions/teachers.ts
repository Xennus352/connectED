import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTeacher, getTeacher } from "../apis/teachers";

export interface Teacher {
  id: number;
  name: string;
  email: string;
  subject: string;
  experience: string;
  qualification: string;
  classAssigned: string;
  profileUrl: string; // Supabase public image URL
  phone: string;
  address: string;
}

// creating a teacher
export const useCreateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeacher,
    onSuccess: () => {
      // Refetch the list of users after creation
      queryClient.invalidateQueries({ queryKey: ["teacher"] });
    },
  });
};

// getting teacher
export const useGetTeacher = () => {
  return useQuery<Teacher>({
    queryKey: ["teacher"],
    queryFn: getTeacher,
  });
};
