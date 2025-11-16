import AllTeacherClassSubject from "@/components/pages/AllTeacherClassSubject";
import ClassContainer from "@/components/pages/ClassContainer";
import CoursesContainer from "@/components/pages/CoursesContainer";
import DashboardContainer from "@/components/pages/DashboardContainer";
import EventContainer from "@/components/pages/EventContainer";
import TeacherClassContainer from "@/components/pages/TeacherClassContainer";
import UsersContainer from "@/components/pages/UsersContainer";
import Tabs from "@/components/ui/Tabs";
import React from "react";

const AdminPage = () => {
  const tabItems = [
    {
      label: "📊 Dashboard",
      content: <DashboardContainer />,
    },
    {
      label: "👥 Users",
      content: <UsersContainer />,
    },
    {
      label: "💬 Events",
      content: <EventContainer />,
    },
    {
      label: "🏛️ Classes",
      content: <ClassContainer />,
    },
    {
      label: "📚 Courses",
      content: <CoursesContainer />,
    },
    {
      label: "📝 Assign Teachers",
      content: <TeacherClassContainer />,
    },
    {
      label: "👨‍🏫 Teacher's Class and Subject ",
      content: <AllTeacherClassSubject />,
    },
  ];
  return (
    <div>
      <Tabs tabs={tabItems} defaultIndex={0} />
    </div>
  );
};

export default AdminPage;
