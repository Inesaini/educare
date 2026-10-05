import React, { useState } from "react";
import RestaureConfirmation from "./RestaureConfirmation";

const OneArchive = ({ matricule, first_name, last_name, email, role, is_active, onDelete }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleConfirm = () => {
    onDelete(email);
    setShowConfirmation(false);
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-2 items-center p-4 border-b border-[#EFEFEF] hover:bg-gray-50">
        <div className="col-span-2 text-sm capitalize">{matricule}</div>
        <div className="col-span-2 text-sm capitalize">
          {first_name} {last_name}
        </div>
        <div className="col-span-3 text-sm truncate">{email}</div>
        <div className="col-span-2 text-sm">{role}</div>
        <div className={`col-span-2 text-sm ${is_active ? "text-green-600" : "text-red-600"}`}>
          {is_active ? "Active" : "Inactive"}
        </div>
        <div className="col-span-1">
          <button
            className="border border-[#929A9B] text-xs px-2 py-1 hover:bg-[#679294] hover:text-white rounded transition-colors"
            onClick={() => setShowConfirmation(true)}
          >
            Restaurer
          </button>
        </div>
      </div>

      {showConfirmation && (
        <RestaureConfirmation
          onCancel={() => setShowConfirmation(false)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
};

export default OneArchive;