import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDriver, getDrivers } from "../apis/drivers";

import { Auth } from "@/types/Type";

export interface Driver {
  id: number;
  authId: number;
  auth: Auth;
  name: string;
  email: string;
  phone: string;
  address: string;
  vehicleNo: string;
  nrcNumber?: string | null;
  licenseNumber?: string | null;
  profileImage: string | null; // raw filename or null
  profileImageUrl: string | null; // public URL from Supabase storage
  password?: string; // probably blank since handled in Auth
}

// creating a driver
export const useCreateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDriver,
    onSuccess: () => {
      // Refetch the list of drivers after creation
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
};

// getting drivers
export const useGetDrivers = () => {
  return useQuery<Driver[]>({
    queryKey: ["drivers"],
    queryFn: getDrivers,
  });
};
