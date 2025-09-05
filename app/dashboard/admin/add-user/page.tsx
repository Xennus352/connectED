import ExcelUpload from "@/components/pages/ExcelUpload";
import AddForm from "@/components/pages/form/AddForm";
import Tabs from "@/components/ui/Tabs";
import React from "react";

const AddUser = () => {
  const tabItems = [
    {
      label: "📝 Add Manually",
      content: <AddForm />,
    },
    {
      label: "📂 Import from excel",
      content: <ExcelUpload/>,
    },
  ];
  return (
    <div>
      <Tabs tabs={tabItems} defaultIndex={0} />
    </div>
  );
};

export default AddUser;
