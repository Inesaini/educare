import React from 'react'

export default function DonnéesBiométrique( {formData, handleChange,readOnly}) {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 text-black">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Données Biométriques</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                  <label className="block text-[14px] text-gray-600 font-semibold mb-1">Taille</label>
                  <input 
                  type="text"
                  name="taille"
                  value={formData.taille}
                  onChange={handleChange}
                  readOnly={readOnly}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"></input>
                 </div>
                 <div>
                  <label className="block text-[14px] text-gray-600 font-semibold mb-1">Poids</label>
                  <input 
                  type="text"
                  name="poids"
                  value={formData.poids}
                  onChange={handleChange}
                  readOnly={readOnly}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"></input>
                 </div>
              </div>
            </div>
  )
}
