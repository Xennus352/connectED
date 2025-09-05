import React from "react";

type StatsCardProps = {
  Icon: React.ReactNode;
  percentage: number;
  name: string;
  totalUsers: number;
};

const StatsCard = ({ Icon, name, percentage, totalUsers }: StatsCardProps) => {
  return (
    <div className="w-52 h-32 border rounded-xl p-2">
      <div className="flex items-center justify-around flex-col w-full h-full rounded-lg overflow-hidden">
        {/* top layer  */}
        <div className="flex items-center justify-between w-full px-2">
          <div>{Icon}</div>
          <div className="text-emerald-300">{percentage}%</div>
        </div>
        {/* bottom layer */}
        <div className="flex flex-col items-center justify-center">
          Total {name}: <p>{totalUsers}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
