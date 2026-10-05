import React, { useState } from "react";
import Confirmation from "./Confirmation";
import { API_URL } from "../api.js";

const Oneuser = ({ matricule, first_name, last_name, email, role, is_active, fetchUsers }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionType, setActionType] = useState("");
  const adminToken = localStorage.getItem("token");

  const handleConfirm = async () => {
    if (actionType === "archiver") {
      try {
        const response = await fetch(
          `${API_URL}/admin/archive-user/${email}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${adminToken}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to archive user:", errorData);
          return;
        }

        console.log("User archived successfully");
        fetchUsers();
      } catch (error) {
        console.error("Error archiving user:", error);
      }
    }
    setShowConfirmation(false);
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-4 items-center p-4 border-b border-[#EFEFEF] hover:bg-gray-50">
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
            onClick={() => {
              setActionType("archiver");
              setShowConfirmation(true);
            }}
          >
            Archiver
          </button>
        </div>
      </div>

      {showConfirmation && (
        <Confirmation
          type={actionType}
          onCancel={() => setShowConfirmation(false)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
};

export default Oneuser;