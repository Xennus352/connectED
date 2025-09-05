import AssignmentList from "@/components/pages/student/AssignmentList";
import EventList from "@/components/pages/student/EventList";
import StudentNav from "@/components/pages/student/StudentNav";
import Tabs from "@/components/ui/Tabs";
import React from "react";

const StudentPage = () => {

  const tabContent =[
     {
      label: "💭 Events",
      content: <EventList/>,
    },
     {
      label: "📑 Assignments",
      content: <AssignmentList/>,
    },
  ]


  return (
    <div>
      <StudentNav />
      {/* content  */}
      <div className="p-2 overflow-y-auto h-[calc(100vh-200px)]">

      <Tabs tabs={tabContent} defaultIndex={0}/>
      </div>
    </div>
  );
};

export default StudentPage;
