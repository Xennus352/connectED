"use client";
import React, { useState } from "react";

interface Tab {
  label: React.ReactNode;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultIndex?: number;
  onChange?: (index: number) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, defaultIndex = 0, onChange }) => {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  const handleTabChange = (idx: number) => {
    setActiveIndex(idx);
    onChange?.(idx);
  };

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex space-x-4 border-b border-gray-700 mb-4 flex-wrap gap-2">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => handleTabChange(idx)}
            className={`py-2 px-4 text-sm font-medium cursor-pointer rounded-t-lg ${
              activeIndex === idx
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4 bg-gray-900 rounded-xl shadow">
        {tabs[activeIndex].content}
      </div>
    </div>
  );
};

export default Tabs;

