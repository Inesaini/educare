import React from 'react';




const DetailsPersonnels = ({ formData, handleChange, readOnly }) => (

  <div>
    <div className="bg-white shadow-md rounded-xl p-6 space-y-6 text-black">
      <h2 className="text-2xl font-bold text-gray-800">Détails Personnels</h2>

      {/* First Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "N° de Dossier", name: "id", type: "text" },
          { label: "N° Sécurité Sociale", name: "numSecuriteSociale", type: "text" },
        ].map(({ label, name, type }) => (
          <div key={name}>
            <label className="block text-[14px] text-gray-600 font-semibold mb-1">{label}</label>
            <input
              type={type}
              name={name}
              value={formData[name] || ''}
              onChange={handleChange}
              readOnly={readOnly}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        ))}

        {/* Groupe Sanguin */}
        <div>
          <label className="block text-[14px] text-gray-600 font-semibold mb-1">Groupe Sanguin</label>
          <select
            name="groupeSanguin"
            value={formData.groupeSanguin}
            onChange={handleChange}
            disabled={readOnly}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Nom de l'établissement */}
      <div>
        <label className="block text-[14px] text-gray-600 font-semibold mb-1">Nom de l'Établissement</label>
        <input
          type="text"
          name="etablissement"
          value="Ecole Supérieure d'Informatique de Sidi-Bel-Abbès"
          readOnly
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
        />
      </div>

      {/* Nom, Prénom, Date de Naissance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Nom", name: "nom", type: "text" },
          { label: "Prénom", name: "prenom", type: "text"},
          { label: "Date de Naissance", name: "date_naissance", type: "date"},
        ].map(({ label, name, type }) => (
          <div key={name}>
            <label className="block text-[14px] text-gray-600 font-semibold mb-1">{label}</label>
            <input
              type={type}
              name={name}
              value={formData[name] || ''}
              onChange={handleChange}
              readOnly
              className={`w-full border border-gray-300 rounded-md px-3 py-2}`}
            />
          </div>
        ))}
      </div>

      {/* Adresse, Téléphone, Situation Familiale */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-[14px] text-gray-600 font-semibold mb-1">Adresse</label>
          <input
            type="text"
            name="adresse"
            value={formData.adresse}
            onChange={handleChange}
            readOnly={readOnly}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-[14px] text-gray-600 font-semibold mb-1">Téléphone</label>
          <input
            type="tel"
            name="num_tel"
            value={formData.num_tel}
            onChange={handleChange}
            readOnly
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-[14px] text-gray-600 font-semibold mb-1">Situation Familiale</label>
          <select
            name="situation_familiale"
            value={formData.situation_familiale}
            onChange={handleChange}
            disabled={readOnly}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            {["Célibataire", "Marié(e)", "Divorcé(e)", "Veuf(ve)"].map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filière & Statut */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[14px] text-gray-600 font-semibold mb-1">Filière</label>
          <input
            type="text"
            name="filiere"
            value="Informatique"
            readOnly
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-[14px] text-gray-600 font-semibold mb-1">Statut</label>
          <input
            name="statut"
            value={formData.statut}
            onChange={handleChange}
            readOnly={readOnly}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
      </div>
    </div>
  </div>
);

export default DetailsPersonnels;
