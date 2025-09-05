'use client'
import EventContainer from "@/components/pages/EventContainer";
import AssignmentContainer from "@/components/pages/teacher/AssignmentContainer";
import AttendanceContainer from "@/components/pages/teacher/AttendanceContainer";
import StudentContainer from "@/components/pages/teacher/StudentContainer";
import TeacherNav from "@/components/pages/teacher/TeacherNav";
import Tabs from "@/components/ui/Tabs";
import React, { useState } from "react";

const TeacherPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const tabItems = [
    {
      label: "👤 Students",
      content: <StudentContainer searchTerm={searchTerm} />,
    },
    {
      label: "📃 Attendance",
      content: <AttendanceContainer/>,
    },
    {
      label: "📑 Assignments",
      content: <AssignmentContainer/>,
    },
    {
      label: "💭 Events",
      content: <EventContainer />,
    },
  ];
  return (
    <div>
      <TeacherNav searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      {/* content  */}
      <div className="p-2 overflow-y-auto h-[calc(100vh-200px)]">
        <Tabs tabs={tabItems} defaultIndex={0} />
      </div>
    </div>
  );
};

export default TeacherPage;
