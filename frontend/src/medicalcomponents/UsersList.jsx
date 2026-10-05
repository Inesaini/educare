import React from "react";

const UsersList = ({ matricule, prenom, nom, email, onConsult }) => {
  return (
    <div className="text-[13px] w-full  ">
      <div className="flex flex-wrap sm:flex-nowrap gap-4 items-center justify-between px-2 py-3 ">
        <span className="capitalize w-1/2 sm:w-[150px] text-gray-800">{matricule}</span>
        <span className="capitalize w-1/2 sm:w-[180px] text-gray-800">
          {prenom} {nom}
        </span>
        <span className="w-full sm:w-[200px] truncate text-gray-700">{email}</span>
        <div className="p-1">
          <button
            onClick={() => onConsult?.(email)}
            className="bg-[#679294] border border-[#929A9B] text-[13px] px-3 py-1 hover:bg-[#679294] hover:text-white transition-colors duration-200 rounded"
          >
            Consulter
          </button>
        </div>
      </div>
      <div className="h-[1px] bg-[#E0E0E0] w-full" />
    </div>
  );
};

export default UsersList;

