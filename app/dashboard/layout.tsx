import Navbar from "@/components/pages/Navbar";
import React from "react";

const DashboardLayout = ({children}:{children:React.ReactNode}) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

export default DashboardLayout;
