import { UserSearch } from "lucide-react";
import React from "react";

const Menubar = ({
  setSeletedFilter,
  setSearchTerm,
  searchTerm,
}: {
  searchTerm: string;
  setSeletedFilter: React.Dispatch<React.SetStateAction<string>>;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <>
      <div className="navbar bg-base-100 shadow-sm px-3">
        <div className="flex-1">
          {/* search button  */}
          <div className="flex items-center gap-3 ">
            <label htmlFor="search" className="hover:cursor-pointer">
              <UserSearch />
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              placeholder="Search with name .  .  ."
              className="input focus:outline-none"
            />
          </div>
        </div>
        <div className="flex-none">
          <div className="join">
            <input
              className="join-item btn"
              type="radio"
              name="options"
              aria-label="All"
              value={"all"}
              onChange={(e) => setSeletedFilter(e.target.value)}
            />
            <input
              className="join-item btn"
              type="radio"
              name="options"
              aria-label="Teachers"
              value={"teacher"}
              onChange={(e) => setSeletedFilter(e.target.value)}
            />
            <input
              className="join-item btn"
              type="radio"
              name="options"
              aria-label="Parents"
              value={"parent"}
              onChange={(e) => setSeletedFilter(e.target.value)}
            />
            <input
              className="join-item btn"
              type="radio"
              name="options"
              aria-label="Students"
              value={"student"}
              onChange={(e) => setSeletedFilter(e.target.value)}
            />
            <input
              className="join-item btn"
              type="radio"
              name="options"
              aria-label="Drivers"
              value={"driver"}
              onChange={(e) => setSeletedFilter(e.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Menubar;
