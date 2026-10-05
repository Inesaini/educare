import React, { useState } from "react";
import { API_URL } from "../api.js";

const NewUserForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    matricule: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    birth_date: "",
    sex: "",
    role: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!formData.matricule.trim()) {
      newErrors.matricule = "Le matricule est requis";
      isValid = false;
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = "Le prénom est requis";
      isValid = false;
    } else if (formData.first_name.length < 2) {
      newErrors.first_name = "Le prénom doit contenir au moins 2 caractères";
      isValid = false;
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Le nom est requis";
      isValid = false;
    } else if (formData.last_name.length < 2) {
      newErrors.last_name = "Le nom doit contenir au moins 2 caractères";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Veuillez entrer un email valide";
      isValid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Le téléphone est requis";
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Le téléphone doit contenir 10 chiffres";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
      isValid = false;
    }

    if (!formData.birth_date) {
      newErrors.birth_date = "La date de naissance est requise";
      isValid = false;
    } else {
      const birthDate = new Date(formData.birth_date);
      const currentDate = new Date();
      if (birthDate >= currentDate) {
        newErrors.birth_date = "La date de naissance doit être dans le passé";
        isValid = false;
      }
    }

    const rolesRequiringSex = ["Directeur", "Etudiant", "Enseignant", "ATS"];
    if (rolesRequiringSex.includes(formData.role) && !formData.sex) {
      newErrors.sex = "Le sexe est requis pour ce rôle";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const mapSexToBackend = (sex) => {
    if (sex === "Homme") return "Male";
    if (sex === "Femme") return "Female";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token d'authentification manquant. Veuillez vous connecter.");
      return;
    }

    let url = "";
    let dataToSend = {};
    const role = formData.role;

    const commonData = {
      email: formData.email,
      password: formData.password,
      last_name: formData.last_name,
      first_name: formData.first_name,
      birth_date: formData.birth_date,
      phone: formData.phone,
      matricule: formData.matricule,
    };

    if (role === "Directeur") {
      url = `${API_URL}/directeur/register`;
      dataToSend = {
        ...commonData,
        sex: mapSexToBackend(formData.sex),
      };
    } else if (role === "Doctor") {
      url = `${API_URL}/medecins/register`;
      dataToSend = commonData;
    } else if (["Etudiant", "Enseignant", "ATS"].includes(role)) {
      url = `${API_URL}/patients/register`;
      dataToSend = {
        ...commonData,
        categorie: formData.role,
        sex: mapSexToBackend(formData.sex),
      };
    } else {
      alert("Rôle invalide ou non spécifié.");
      return;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Erreur lors de l'inscription:", result);
        alert("Échec de l'inscription: " + (result.message || "Erreur inconnue"));
        return;
      }

      alert("Utilisateur ajouté avec succès !");
      onSuccess();
    } catch (error) {
      console.error("Erreur réseau:", error);
      alert("Erreur réseau: impossible d'inscrire l'utilisateur");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {[
          { name: "matricule", placeholder: "Matricule" },
          { name: "first_name", placeholder: "Prénom" },
          { name: "last_name", placeholder: "Nom" },
          { name: "email", placeholder: "Email", type: "email" },
          { name: "phone", placeholder: "Téléphone", type: "tel" },
          { name: "birth_date", type: "date" },
          { name: "password", placeholder: "Mot de passe", type: "password" },
        ].map(({ name, placeholder, type = "text" }) => (
          <div key={name}>
            <input
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              placeholder={placeholder}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors[name] ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm`}
            />
            {errors[name] && (
              <p className="text-sm text-red-600">{errors[name]}</p>
            )}
          </div>
        ))}

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        >
          <option value="">Sélectionner le rôle</option>
          <option value="Doctor">Médecin</option>
          <option value="Directeur">Directeur</option>
          <option value="Etudiant">Étudiant</option>
          <option value="Enseignant">Enseignant</option>
          <option value="ATS">ATS</option>
        </select>
      </div>

      {["Directeur", "Etudiant", "Enseignant", "ATS"].includes(formData.role) && (
        <div>
          <select
            name="sex"
            value={formData.sex}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          >
            <option value="">Sélectionner le sexe</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>
          {errors.sex && <p className="text-sm text-red-600">{errors.sex}</p>}
        </div>
      )}

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-md"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        >
          Enregistrer
        </button>
      </div>
    </form>
  );
};

export default NewUserForm;
