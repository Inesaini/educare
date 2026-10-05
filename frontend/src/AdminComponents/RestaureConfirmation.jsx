import React from 'react';

const RestaureConfirmation = ({ onCancel, onConfirm }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-50">
      <div className="px-5 py-12 rounded-[25px] flex flex-col justify-center items-center bg-white">
        <p className="font-bold text-[26px]">Êtes-vous sûr ? </p>
        <p className="font-medium text-[15px] text-[rgba(46,61,64,0.6)] text-center">
          Êtes-vous sûr de vouloir restaurer cet utilisateur ?
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="hover:bg-[linear-gradient(to_left,#2E3D40,transparent)] px-4 py-2 cursor-pointer shadow-[0px_4px_10px_rgba(0,0,0,0.5)] 
            flex justify-center items-center gap-2 border border-[rgba(46,61,64,0.5)] text-[#2E3D40] md:px-8 rounded-[10px] my-3 text-[14px]"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="hover:bg-[linear-gradient(to_left,#2E3D40,transparent)] px-4 py-2 cursor-pointer shadow-[0px_4px_10px_rgba(0,0,0,0.5)] 
            flex justify-center items-center gap-2 bg-[#679294] md:px-8 rounded-[10px] text-white my-3 text-[14px]"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaureConfirmation;
