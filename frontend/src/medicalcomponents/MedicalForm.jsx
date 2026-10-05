import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AntécédentsMedicaux from "./AntécédentsMedicaux";
import AntécédentsPersonels from "./AntécédentsPersonels";
import DonnéesBiométrique from "./DonnéesBiométrique";
import DetailsPersonnels from "./DetailsPersonnels";
import { API_URL } from "../api.js";

const MedicalForm = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [recordExists, setRecordExists] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null);
  const [imageSrc, setImageSrc] = useState("/default.png");
  const { email } = useParams();

  const [patientData, setPatientData] = useState({
    prenom: "",
    nom: "",
    email: "",
    isActif: "",
  });

  const [formData, setFormData] = useState({
    email: "",
    numSecuriteSociale: "",
    groupeSanguin: "",
    nom: "",
    prenom: "",
    date_naissance: "",
    situation_famille: "",
    statut: "",
    adresse: "",
    num_tel: "",
    poids: "",
    taille: "",
    tabac_fume: false,
    tabac_fume_nombre: "",
    tabac_chique: false,
    tabac_chique_nombre: "",
    tabac_pris: false,
    tabac_pris_nombre: "",
    age_pris: "",
    ancien_fume: false,
    periode_exposition: "",
    alcool: false,
    medicaments: "",
    notes: "",
    affectionsCongenitales: "",
    maladiesGenerales: "",
    interventionsChirurgicales: "",
    reactionsAllergiques: "",
  });

  //fetch image
  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const imgUrl = `${API_URL}/patients/get-patient-photo/${email}`;
        const response = await fetch(imgUrl);

        if (response.ok) {
          const data = await response.json();

          if (data.success && data.image) {
            setImageSrc(data.image);
            console.log("Image URL loaded:", data.image);
          } else {
            console.warn("No image found in response, using fallback");
            setImageSrc("/default.png");
          }
        } else {
          console.warn("Failed to fetch image URL, using fallback");
          setImageSrc("/default.png");
        }
      } catch (error) {
        console.error("Error fetching image URL:", error);
        setImageSrc("/default.png");
      }
    };

    fetchImageUrl();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token || !email) {
        alert("Erreur : Token ou email manquant.");
        setLoading(false);
        return;
      }

      try {
        // Fetch user info
        const userRes = await fetch(
          `${API_URL}/medecins/get-user-info/${email}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!userRes.ok) {
          const errorText = await userRes.text();
          throw new Error(
            `Erreur récupération infos utilisateur : ${errorText}`
          );
        }
        const userInfo = await userRes.json();

        if (!userInfo?.nom || !userInfo?.email) {
          throw new Error("Données utilisateur incomplètes");
        }

        setPatientData({
          nom: userInfo.nom || "",
          prenom: userInfo.prenom || "",
          email: userInfo.email || "",
          isActif: userInfo.isActif ?? "",
        });

        setFormData((prev) => ({
          ...prev,
          nom: userInfo.nom,
          prenom: userInfo.prenom,
          email: userInfo.email,
          statut: userInfo.statut,
          num_tel: userInfo.num_tel,
          date_naissance: userInfo.date_naissance,
        }));

        // Fetch existing medical record
        const recordRes = await fetch(
          `${API_URL}/medecins/get-dossier-medical/${email}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        let fullData = {
          ...formData,
          nom: userInfo.nom || "",
          prenom: userInfo.prenom || "",
          email: userInfo.email || email,
          statut: userInfo.statut || "",
          num_tel: userInfo.num_tel || "",
          date_naissance: userInfo.date_naissance
            ? userInfo.date_naissance.substring(0, 10)
            : "",
        };

        if (recordRes.ok) {
          const recordData = await recordRes.json();
          console.log("Fetched recordData from backend:", recordData); // DEBUG

          fullData = {
            ...fullData,
            ...recordData,
            numSecuriteSociale: recordData.numSecuriteSociale || "",
            groupeSanguin: recordData.groupeSanguin || "",
            date_naissance: recordData.date_naissance
              ? recordData.date_naissance.substring(0, 10)
              : fullData.date_naissance,
            situation_famille: recordData.situation_famille || "",
            adresse: recordData.adresse || "",
            poids: recordData.poids || "",
            taille: recordData.taille || "",
            // For all oui/non fields:
            tabac_fume:
              recordData.tabac_fume === undefined
                ? ""
                : recordData.tabac_fume === null
                ? ""
                : !!recordData.tabac_fume,
            tabac_chique:
              recordData.tabac_chique === undefined
                ? ""
                : recordData.tabac_chique === null
                ? ""
                : !!recordData.tabac_chique,
            tabac_pris:
              recordData.tabac_pris === undefined
                ? ""
                : recordData.tabac_pris === null
                ? ""
                : !!recordData.tabac_pris,
            ancien_fume:
              recordData.ancien_fume === undefined
                ? ""
                : recordData.ancien_fume === null
                ? ""
                : !!recordData.ancien_fume,
            alcool:
              recordData.alcool === undefined
                ? ""
                : recordData.alcool === null
                ? ""
                : !!recordData.alcool,
            tabac_fume_nombre: recordData.tabac_fume_nombre || "",
            tabac_chique_nombre: recordData.tabac_chique_nombre || "",
            tabac_pris_nombre: recordData.tabac_pris_nombre || "",
            age_pris: recordData.age_pris || "",
            periode_exposition: recordData.periode_exposition || "",
            medicaments: recordData.medicaments || "",
            notes: recordData.notes || "",
            affectionsCongenitales: recordData.affectionsCongenitales || "",
            maladiesGenerales: recordData.maladiesGenerales || "",
            interventionsChirurgicales:
              recordData.interventionsChirurgicales || "",
            reactionsAllergiques: recordData.reactionsAllergiques || "",
          };
          setRecordExists(true);
          setIsEditing(false);
        } else {
          setRecordExists(false);
          setIsEditing(true); // Enable editing for new records
        }

        console.log("Full formData after fetch:", fullData); // DEBUG
        setFormData(fullData);
        setInitialFormData(fullData);
      } catch (err) {
        console.error("Erreur lors du chargement :", err);
        alert(`Erreur lors du chargement : ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [email]);

  const handleChange = (e) => {
    if (!isEditing) return;
    const { name, type, value, checked } = e.target;
    setFormData((prev) => {
      const newValue = type === "checkbox" ? checked : value;
      const updated = { ...prev, [name]: newValue };
      console.log(
        "handleChange:",
        name,
        "=",
        newValue,
        "updated formData:",
        updated
      ); // DEBUG
      return updated;
    });
  };

  // Utility to convert empty string to null or number
  const toNumberOrNull = (val) => {
    if (val === "" || val === undefined || val === null) return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  };

  // Utility to convert empty string to null
  const toNullIfEmpty = (val) => (val === "" ? null : val);

  // Prepare data before sending to backend
  const prepareFormData = (data) => ({
    groupeSanguin: toNullIfEmpty(data.groupeSanguin),
    numSecuriteSociale: toNullIfEmpty(data.numSecuriteSociale),
    adresse: toNullIfEmpty(data.adresse),
    situation_famille: toNullIfEmpty(data.situation_famille),
    taille: toNumberOrNull(data.taille),
    poids: toNumberOrNull(data.poids),
    tabac_fume: data.tabac_fume === "" ? null : data.tabac_fume ? 1 : 0,
    tabac_fume_nombre: toNumberOrNull(data.tabac_fume_nombre),
    tabac_chique: data.tabac_chique === "" ? null : data.tabac_chique ? 1 : 0,
    tabac_chique_nombre: toNumberOrNull(data.tabac_chique_nombre),
    tabac_pris: data.tabac_pris === "" ? null : data.tabac_pris ? 1 : 0,
    tabac_pris_nombre: toNumberOrNull(data.tabac_pris_nombre),
    age_pris: toNumberOrNull(data.age_pris),
    ancien_fume: data.ancien_fume === "" ? null : data.ancien_fume ? 1 : 0,
    periode_exposition: toNumberOrNull(data.periode_exposition),
    alcool: data.alcool === "" ? null : data.alcool ? 1 : 0,
    medicaments: toNullIfEmpty(data.medicaments),
    affectionsCongenitales: toNullIfEmpty(data.affectionsCongenitales),
    maladiesGenerales: toNullIfEmpty(data.maladiesGenerales),
    interventionsChirurgicales: toNullIfEmpty(data.interventionsChirurgicales),
    reactionsAllergiques: toNullIfEmpty(data.reactionsAllergiques),
    notes: toNullIfEmpty(data.notes),
    statut: toNullIfEmpty(data.statut),
    date_naissance: toNullIfEmpty(data.date_naissance),
    nom: toNullIfEmpty(data.nom),
    prenom: toNullIfEmpty(data.prenom),
    num_tel: toNullIfEmpty(data.num_tel),
    // utilisateur_id is set by backend
  });

  const handleSubmit = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    if (!token || !email) {
      alert("Erreur : Token ou email manquant.");
      setSaving(false);
      return;
    }

    if (!formData.nom || !formData.prenom) {
      alert("Veuillez remplir tous les champs obligatoires.");
      setSaving(false);
      return;
    }

    // Prepare data for backend
    const backendData = prepareFormData(formData);

    console.log("Sending formData to backend:", backendData); // DEBUG

    try {
      const url = recordExists
        ? `${API_URL}/medecins/medical-records-update/${email}`
        : `${API_URL}/medecins/dossier-medical-create/${email}`;
      const method = recordExists ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur backend :", response.status, errorData);
        throw new Error(
          errorData.message || `Erreur de sauvegarde : ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Success Response:", data); // DEBUG
      alert(
        `Dossier médical ${
          recordExists ? "mis à jour" : "sauvegardé"
        } avec succès.`
      );
      setRecordExists(true);
      setIsEditing(false);
      setInitialFormData(formData);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde :", err);
      alert(`Erreur lors de la sauvegarde : ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleEditMode = () => {
    if (isEditing) {
      handleSubmit();
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    if (!initialFormData) return;
    if (window.confirm("Voulez-vous vraiment annuler les modifications ?")) {
      setFormData(initialFormData);
      setIsEditing(false);
    }
  };

  return (
    <div className="relative flex bg-[#EFEFEF]">
      <div className="flex flex-row">
        <div className="w-[280px] ml-[80px] mt-[20px] h-fit bg-white shadow-lg rounded-xl p-6 space-y-6 mr-4">
          <div className="flex flex-col items-center">
            <img
              src={imageSrc}
              alt="Patient"
              onError={(e) => {
                console.error(
                  "Image load error, switching to default-profile.png"
                );
                e.target.onerror = null;
                e.target.src = "/default.png";
              }}
              className="text-black w-[133px] h-[194px] object-cover border-4 border-gray-300"
            />
            <h3 className="mt-4 text-black text font-semibold">
              {patientData.nom} {patientData.prenom}
            </h3>
            <p className="mt-4 text-gray-600 text font-semibold">
              {patientData.email}
            </p>
            <span
              className={`text-sm px-3 py-1 rounded-full mt-2 ${
                patientData.isActif === false
                  ? "text-red-500"
                  : "text-green-500"
              }`}
            >
              {patientData.isActif === false ? "Inactive" : "Active"}
            </span>
          </div>
          <div>
            <label className="block text-black text-sm font-bold mb-1">
              Notes du médecin
            </label>
            <textarea
              name="notes"
              value={formData.notes || ""}
              onChange={handleChange}
              placeholder="Écrire des observations ici..."
              rows="6"
              className={`w-full text-black border border-gray-300 rounded-md px-3 py-2 resize-none ${
                !isEditing ? "bg-gray-100" : ""
              }`}
              readOnly={!isEditing}
            />
          </div>
        </div>
        <div className="flex flex-col w-full px-4 md:px-12 mt-4">
          {loading ? (
            <div className="flex justify-center items-center p-6">
              <p className="text-gray-600">Chargement des données...</p>
            </div>
          ) : (
            <form
              className="flex flex-col w-full space-y-6 px-6 mt-[10px]"
              onSubmit={(e) => e.preventDefault()}
            >
              <DetailsPersonnels
                formData={formData}
                handleChange={handleChange}
                readOnly={!isEditing}
              />
              <DonnéesBiométrique
                formData={formData}
                handleChange={handleChange}
                readOnly={!isEditing}
              />
              <AntécédentsPersonels
                formData={formData}
                handleChange={handleChange}
                setFormData={setFormData}
                readOnly={!isEditing}
              />
              <AntécédentsMedicaux
                formData={formData}
                handleChange={handleChange}
                readOnly={!isEditing}
              />
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={toggleEditMode}
                  style={{ backgroundColor: "#679294" }}
                  className="text-white px-4 py-2 rounded disabled:opacity-50"
                  disabled={saving || loading}
                >
                  {isEditing
                    ? saving
                      ? "Sauvegarde..."
                      : "Sauvegarder"
                    : "Modifier"}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-400 text-white px-4 py-2 rounded disabled:opacity-50"
                    disabled={saving || loading}
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalForm;
