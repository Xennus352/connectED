import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createStudent, getStudents } from "../apis/students";

export interface Student {
  id: number;
  name: string;
  className: string;
  rank: string;
  attendanceScore: number;
  parentId: number;
  enrollmentDate: string;
  status: string;
  email: string;
  attendances?: string;
}

// Create a new student
export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      // Refetch the list of students after creation
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

// Get all students
export const useGetStudents = () => {
  return useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: getStudents,
  });
};
