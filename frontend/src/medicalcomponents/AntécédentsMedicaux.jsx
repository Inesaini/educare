import React from 'react'

export default function AntécédentsMedicaux({formData, handleChange,readOnly}) {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 text-black">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Antécédents Médicaux et Chirurgicaux</h2>
      
      {/* Infections congénitales */}
      <div className="mb-4">
        <label className="block font-medium text-gray-600 mb-1">Infections congénitales</label>
        <textarea
          name="affectionsCongenitales"
          value={formData.affectionsCongenitales || ""}
          onChange={handleChange}
          readOnly={readOnly}
          placeholder="Ex: rubéole, toxoplasmose..."
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          rows="3"
        />
      </div>
      
      {/* Maladies générales */}
      <div className="mb-4">
        <label className="block font-medium text-gray-600 mb-1">Maladies générales</label>
        <textarea
          name="maladiesGenerales"
          value={formData.maladiesGenerales || ""}
          onChange={handleChange}
          readOnly={readOnly}
          placeholder="Ex: diabète, hypertension..."
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          rows="3"
        />
      </div>
      
      {/* Interventions chirurgicales */}
      <div className="mb-4">
        <label className="block font-medium text-gray-600 mb-1">Interventions chirurgicales</label>
        <textarea
          name="interventionsChirurgicales"
          value={formData.interventionsChirurgicales || ""}
          onChange={handleChange}
          readOnly={readOnly}
          placeholder="Ex: appendicectomie, amygdalectomie..."
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          rows="3"
        />
      </div>
      
      {/* Réactions allergiques */}
      <div className="mb-4">
        <label className="block font-medium text-gray-600 mb-1">Réactions allergiques</label>
        <textarea
          name="reactionsAllergiques"
          value={formData.reactionsAllergiques || ""}
          onChange={handleChange}
          readOnly={readOnly}
          placeholder="Ex: allergie à la pénicilline..."
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          rows="3"
        />
      </div>
      

    </div>
  )
}
