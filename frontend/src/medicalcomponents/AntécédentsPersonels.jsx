import React from "react";

export default function AntécédentsPersonels({
  formData,
  handleChange,
  readOnly,
  setFormData,
}) {
  // Helper for radio change
  const handleRadio = (name, value) => {
    if (readOnly) return;
    setFormData((prev) => {
      // If "Non" is selected, clear the associated number field
      let clearedFields = {};
      if (name === "tabac_fume" && value === false)
        clearedFields.tabac_fume_nombre = "";
      if (name === "tabac_chique" && value === false)
        clearedFields.tabac_chique_nombre = "";
      if (name === "tabac_pris" && value === false)
        clearedFields.tabac_pris_nombre = "";
      return { ...prev, [name]: value, ...clearedFields };
    });
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 text-black">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Antécédents Personnels
      </h2>
      <h2 className="text-[#F4A261] font-bold text-2xl">Intoxications</h2>

      {/* 🔸 Tabac - À fumer */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <label className="w-24 font-medium text-gray-600">À fumer</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="tabac_fume"
              checked={formData.tabac_fume === true}
              onChange={() => handleRadio("tabac_fume", true)}
              disabled={readOnly}
              className="mr-2"
            />
            Oui
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="tabac_fume"
              checked={formData.tabac_fume === false}
              onChange={() => handleRadio("tabac_fume", false)}
              disabled={readOnly}
              className="mr-2"
            />
            Non
          </label>
        </div>
        <label>Nombre de cigarettes</label>
        <input
          type="number"
          name="tabac_fume_nombre"
          value={formData.tabac_fume_nombre || ""}
          onChange={handleChange}
          readOnly={readOnly}
          disabled={readOnly || formData.tabac_fume !== true}
          placeholder="Boîtes / jour"
          className="border border-gray-300 rounded-md px-3 py-2 w-40"
        />
      </div>

      {/* 🔸 Tabac - À chiquer */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <label className="w-24 font-medium text-gray-600">À chiquer</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="tabac_chique"
              checked={formData.tabac_chique === true}
              onChange={() => handleRadio("tabac_chique", true)}
              disabled={readOnly}
              className="mr-2"
            />
            Oui
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="tabac_chique"
              checked={formData.tabac_chique === false}
              onChange={() => handleRadio("tabac_chique", false)}
              disabled={readOnly}
              className="mr-2"
            />
            Non
          </label>
        </div>
        <label>Nombre de boîtes</label>
        <input
          type="number"
          name="tabac_chique_nombre"
          value={formData.tabac_chique_nombre || ""}
          onChange={handleChange}
          readOnly={readOnly}
          disabled={readOnly || formData.tabac_chique !== true}
          placeholder="Boîtes / jour"
          className="border border-gray-300 rounded-md px-3 py-2 w-40"
        />
      </div>

      {/* 🔸 Tabac pris */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <label className="w-24 font-medium text-gray-600">Tabac pris</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="tabac_pris"
              checked={formData.tabac_pris === true}
              onChange={() => handleRadio("tabac_pris", true)}
              disabled={readOnly}
              className="mr-2"
            />
            Oui
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="tabac_pris"
              checked={formData.tabac_pris === false}
              onChange={() => handleRadio("tabac_pris", false)}
              disabled={readOnly}
              className="mr-2"
            />
            Non
          </label>
        </div>
        <label>Nombre de boîtes</label>
        <input
          type="number"
          name="tabac_pris_nombre"
          value={formData.tabac_pris_nombre || ""}
          onChange={handleChange}
          readOnly={readOnly}
          disabled={readOnly || formData.tabac_pris !== true}
          placeholder="Boîtes / jour"
          className="border border-gray-300 rounded-md px-3 py-2 w-40"
        />
      </div>

      {/* 🔸 Âge à la première prise */}
      <div className="mb-4">
        <label className="block font-medium text-gray-600 mb-1">
          Âge à la première prise
        </label>
        <input
          type="number"
          name="age_pris"
          value={formData.age_pris || ""}
          onChange={handleChange}
          readOnly={readOnly}
          placeholder="ex: 16"
          className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-60"
        />
      </div>

      {/* 🔸 Ancien fumeur */}
      <div className="mb-2">
        <label className="block font-medium text-gray-600 mb-1">
          Ancien fumeur :
        </label>
        <div className="flex items-center gap-6 mb-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="ancien_fume"
              checked={formData.ancien_fume === true}
              onChange={() => handleRadio("ancien_fume", true)}
              disabled={readOnly}
              className="mr-2"
            />
            Oui
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="ancien_fume"
              checked={formData.ancien_fume === false}
              onChange={() => handleRadio("ancien_fume", false)}
              disabled={readOnly}
              className="mr-2"
            />
            Non
          </label>
        </div>
        <label className="block font-medium text-gray-600 mb-1">
          Période d'exposition
        </label>
        <input
          type="text"
          name="periode_exposition"
          value={formData.periode_exposition || ""}
          onChange={handleChange}
          readOnly={readOnly}
          placeholder="ex: 2010 - 2015"
          className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-1/2"
        />
      </div>

      {/* 🔸 Alcool */}
      <div className="mt-4">
        <h3 className="font-semibold text-gray-700 mb-2">Alcool</h3>
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="alcool"
              checked={formData.alcool === true}
              onChange={() => handleRadio("alcool", true)}
              disabled={readOnly}
              className="mr-2"
            />
            Oui
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="alcool"
              checked={formData.alcool === false}
              onChange={() => handleRadio("alcool", false)}
              disabled={readOnly}
              className="mr-2"
            />
            Non
          </label>
        </div>
      </div>

      {/* 🔸 Médicaments */}
      <div className="mt-4">
        <h3 className="font-semibold text-gray-700 mb-2">Médicaments</h3>
        <textarea
          name="medicaments"
          value={formData.medicaments || ""}
          onChange={handleChange}
          readOnly={readOnly}
          placeholder="Liste ou détails de médicaments"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          rows="3"
        />
      </div>
    </div>
  );
}
