import DriverNav from "@/components/pages/driver/DriverNav";

import StudentLocationForm from "@/components/pages/driver/form/StudentLocationForm";
import RiderList from "@/components/pages/driver/RiderList";

import Tracker from "@/components/pages/driver/Tracker";

import Tabs from "@/components/ui/Tabs";
import React from "react";

const DriverPage = () => {
  const tabItems = [
    {
      label: "🗺️ Map",
      content: <Tracker />,
    },
    {
      label: "🚌 Riders List",
      content: <RiderList />,
    },
    {
      label: "🚌 Riders",
      content: <StudentLocationForm />,
    },
  ];
  return (
    <div>
      <DriverNav />
      {/* content  */}
      <div className="p-2  overflow-y-auto h-[calc(100vh-200px)]">
        <Tabs tabs={tabItems} defaultIndex={0} />
      </div>
    </div>
  );
};

export default DriverPage;
