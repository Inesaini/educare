import React from "react";

const Mesures = ({ formData, handleChange, readOnly }) => {
  return (
    <div>
      <div className="bg-white shadow-md rounded-xl p-6 space-y-6 text-black">
        <h2 className="text-2xl font-bold text-gray-[150]">Mesures</h2>
        <div className="grid grid-cols-2 gap-4 font-[Exo_2] text-[13px] font-bold capitalize leading-[100%] text-[#2E3D4094]">
          {/* First Column */}
          <div className="space-y-4">
            {/* Poids */}
            <div className="flex items-center space-x-4 mb-4">
              <label className="w-[100px]">Poids (kg):</label>
              <input
                type="number"
                name="poids"
                value={formData.poids || ''}
                onChange={handleChange}
                readOnly={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Entrez le poids"
              />
            </div>

            {/* IMC */}
            <div className="flex items-center space-x-4 mb-4">
              <label className="w-[100px]">IMC :</label>
              <input
                type="number"
                name="IMC"
                value={formData.IMC || ''}
                onChange={handleChange}
                readOnly={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Indice de masse corporelle"
              />
            </div>
          </div>

          {/* Second Column */}
          <div className="space-y-4">
            {/* Taille */}
            <div className="flex items-center space-x-4 mb-4">
              <label className="w-[100px] font-[Exo_2] text-[13px] font-bold capitalize leading-[100%] text-[#2E3D4094]">
                Taille(cm) :
              </label>
              <input
                type="number"
                name="taille"
                value={formData.taille || ''}
                onChange={handleChange}
                readOnly={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Entrez la taille"
              />
            </div>

            {/* Tension Artérielle */}
            <div className="flex items-center space-x-4 mb-4">
              <label className="w-[100px] font-[Exo_2] text-[13px] font-bold capitalize leading-[100%] text-[#2E3D4094]">
                Tension Artérielle :
              </label>
              <input
                type="text"
                name="tension"
                value={formData.tension || ''}
                onChange={handleChange}
                readOnly={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="120/80"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mesures;