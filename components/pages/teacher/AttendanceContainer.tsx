import React from "react";
import AttendanceList from "./AttendanceList";

const AttendanceContainer = ({ searchTerm }: { searchTerm: string }) => {
  return (
    <>
      <AttendanceList searchTerm={searchTerm} />
    </>
  );
};

export default AttendanceContainer;
