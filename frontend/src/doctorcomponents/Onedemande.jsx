import React from "react";
import { TbCalendarFilled } from "react-icons/tb";

const Onedemande = ({ demande, onProgrammerClick, onRefuserClick }) => {
  return (
    <div className="flex justify-between items-center bg-[#FFFEFE] p-4 m-2 rounded-[10px] shadow-lg">
      <div className="flex flex-col gap-2">
        <h1 className="font-semibold text-[22px]">Motif : {demande.motif}</h1>
        <h1 className="text-gray-500 capitalize font-medium">
          {demande.nomPrenom}
        </h1>
      </div>
      <div className="flex flex-col justify-between gap-4">
        <div className="flex items-center justify-end gap-1">
          <TbCalendarFilled className="text-[#F4A261]" />
          <h1 className="text-[16px] text-gray-500 font-medium">
            {demande.date}
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onProgrammerClick(demande)}
            className="bg-[#679294] text-white py-1 px-2 rounded-[8px] shadow-lg"
          >
            Programmer
          </button>
          <button
            onClick={() => onRefuserClick(demande.id)}
            className="bg-[#FFFEFE] shadow-lg border border-gray-200 py-1 px-2 rounded-[8px]"
          >
            Refuser
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onedemande;
