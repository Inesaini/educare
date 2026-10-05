import React, { useState } from "react";

const ExplorationFonctionnels = ({ formData, handleChange }) => {



  return (
    <div>
      <div className="bg-white shadow-md rounded-xl p-6 space-y-6 text-black">
        <h2 className="text-2xl font-bold text-gray-800">Exploration fonctionnelles</h2>

        {/* Fonction Respiratoire */}
        <div className="grid grid-cols-1">
          <label className="block text-[14px] text-gray-600 font-semibold mb-1">
            Fonction Respiratoire
          </label>
          <textarea
            id="fonction_respiratoire"
            name="fonction_respiratoire"
            rows={4}
            value={formData.fonction_respiratoire}
            onChange={handleChange}
            placeholder="Ajouter les observations"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Fonction Circulatoire */}
        <div className="grid grid-cols-1">
          <label className="block text-[14px] text-gray-600 font-semibold mb-1">
            Fonction Circulatoire
          </label>
          <textarea
            id="fonction_circulatoire"
            name="fonction_circulatoire"
            rows={4}
            value={formData.fonction_circulatoire}
            onChange={handleChange}
            placeholder="Ajouter les observations"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Fonction Motrice */}
        <div className="grid grid-cols-1">
          <label className="block text-[14px] text-gray-600 font-semibold mb-1">
            Fonction Motrice
          </label>
          <textarea
            id="fonction_motrice"
            name="fonction_motrice"
            rows={4}
            value={formData.fonction_motrice}
            onChange={handleChange}
            placeholder="Ajouter les observations"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>
    </div>
  );
};

export default ExplorationFonctionnels;
  