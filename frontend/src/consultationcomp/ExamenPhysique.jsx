import React, { useEffect, useState } from "react";
import axios from "axios";
import Mesures from "./Mesures";
import ExamenAppareil from "./ExamenAppareil";
import ExplorationFonctionnels from "./ExplorationFonctionnels";
import ExamenComplementaire from "./ExamenComplementaire";
import SideBar from "./SideBar";
import { useParams } from "react-router-dom";
import { API_URL } from "../api.js";

const ExamenPhysique = () => {
  const email = localStorage.getItem("selectedEmail");
  const { id_consultation } = useParams();
  const [loading, setLoading] = useState(false);
  const [examenExists, setExamenExists] = useState(false);
  const [examenMedicalData, setExamenMedicalData] = useState(null);

  const [patientData, setPatientData] = useState({
    prenom: "",
    nom: "",
    email: "",
    isActif: "",
  });

  const [formData, setFormData] = useState({
    poids: "",
    taille: "",
    IMC: "",
    tension: "",
    vision_d: "",
    vision_g: "",
    larmoiement: "",
    douleurs: "",
    taches_yeux: "",
    audition_d: "",
    audition_g: "",
    sifflements: "",
    angines: "",
    epistaxis: "",
    rhinorrhee: "",
    cephalies: "",
    vertiges: "",
    troubles_sommeil: "",
    peau_normal: "",
    peau_anormale: "",
    douleurs_musculaires: "",
    douleurs_articulaires: "",
    douleurs_neurologiques: "",
    toux: "",
    dyspnee: "",
    douleurs_thoraciques: "",
    palpitations: "",
    oedemes: "",
    cyanose: "",
    pyrosis: "",
    vomissements: "",
    douleurs_abdominales: "",
    dysurie: "",
    hematurie: "",
    cycles_irreguliers: "",
    fonction_respiratoire: "",
    fonction_circulatoire: "",
    fonction_motrice: "",
    sanguins: "",
    urinaires: "",
    radiologiques: "",
    hepatites_pos: "",
    hepatites_neg: "",
    syphilis_pos: "",
    syphilis_neg: "",
    vih_pos: "",
    vih_neg: "",
  });

  const [imageSrc, setImageSrc] = useState('/default.png');

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const imgUrl = `${API_URL}/patients/get-patient-photo/${email}`;
        const response = await fetch(imgUrl);

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.image) {
            setImageSrc(data.image);
            console.log('Image URL loaded:', data.image);
          } else {
            console.warn('No image found in response, using fallback');
            setImageSrc('/default.png');
          }
        } else {
          console.warn('Failed to fetch image URL, using fallback');
          setImageSrc('/default.png');
        }
      } catch (error) {
        console.error('Error fetching image URL:', error);
        setImageSrc('/default.png');
      }
    };

    fetchImageUrl();
  }, [email]);

  const [id_examen, setExamenId] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!email || !id_consultation) {
        alert("Email ou ID de consultation manquant.");
        return;
      }

      console.log('Consultation ID:', id_consultation);

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Access denied. Please log in.");
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/medecins/get-user-info/${email}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error(`Failed to fetch patient data: ${response.status}`);

        const data = await response.json();
        setPatientData({
          prenom: data.prenom || "",
          nom: data.nom || "",
          email: data.email || "",
          isActif: data.isActif ,
        });

        const examenCheckRes = await fetch(
          `${API_URL}/medecins/consultations/${id_consultation}/has-examen-medical`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!examenCheckRes.ok) throw new Error(`Failed to check examen existence: ${examenCheckRes.status}`);

        const examenCheck = await examenCheckRes.json();
        console.log('Examen check response:', examenCheck);
        setExamenExists(examenCheck.exists);

        if (examenCheck.exists) {
          const examenDataRes = await fetch(
            `${API_URL}/medecins/consultations/${id_consultation}/examen-medical`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!examenDataRes.ok) throw new Error(`Failed to fetch examen medical data: ${examenDataRes.status}`);

          const examenData = await examenDataRes.json();
          console.log('Fetched examenMedicalData:', examenData);
          setExamenMedicalData(examenData);

          const dataToPopulate = examenData.data || examenData;
          setFormData({
            poids: dataToPopulate.poids?.toString() || "",
            taille: dataToPopulate.taille?.toString() || "",
            IMC: dataToPopulate.IMC?.toString() || "",
            tension: dataToPopulate.tension?.toString() || "",
            vision_d: dataToPopulate.vision_d?.toString() || "",
            vision_g: dataToPopulate.vision_g?.toString() || "",
            larmoiement: dataToPopulate.larmoiement ? "true" : "false",
            douleurs: dataToPopulate.douleurs ? "true" : "false",
            taches_yeux: dataToPopulate.taches_yeux ? "true" : "false",
            audition_d: dataToPopulate.audition_d?.toString() || "",
            audition_g: dataToPopulate.audition_g?.toString() || "",
            sifflements: dataToPopulate.sifflements ? "true" : "false",
            angines: dataToPopulate.angines ? "true" : "false",
            epistaxis: dataToPopulate.epistaxis ? "true" : "false",
            rhinorrhee: dataToPopulate.rhinorrhee ? "true" : "false",
            cephalies: dataToPopulate.cephalies ? "true" : "false",
            vertiges: dataToPopulate.vertiges ? "true" : "false",
            troubles_sommeil: dataToPopulate.troubles_sommeil ? "true" : "false",
            peau_normal: dataToPopulate.peau_normal ? "true" : "false",
            peau_anormale: dataToPopulate.peau_anormale ? "true" : "false",
            douleurs_musculaires: dataToPopulate.douleurs_musculaires ? "true" : "false",
            douleurs_articulaires: dataToPopulate.douleurs_articulaires ? "true" : "false",
            douleurs_neurologiques: dataToPopulate.douleurs_neurologiques ? "true" : "false",
            toux: dataToPopulate.toux ? "true" : "false",
            dyspnee: dataToPopulate.dyspnee ? "true" : "false",
            douleurs_thoraciques: dataToPopulate.douleurs_thoraciques ? "true" : "false",
            palpitations: dataToPopulate.palpitations ? "true" : "false",
            oedemes: dataToPopulate.oedemes ? "true" : "false",
            cyanose: dataToPopulate.cyanose ? "true" : "false",
            pyrosis: dataToPopulate.pyrosis ? "true" : "false",
            vomissements: dataToPopulate.vomissements ? "true" : "false",
            douleurs_abdominales: dataToPopulate.douleurs_abdominales ? "true" : "false",
            dysurie: dataToPopulate.dysurie ? "true" : "false",
            hematurie: dataToPopulate.hematurie ? "true" : "false",
            cycles_irreguliers: dataToPopulate.cycles_irreguliers ? "true" : "false",
            fonction_respiratoire: dataToPopulate.fonction_respiratoire || "",
            fonction_circulatoire: dataToPopulate.fonction_circulatoire || "",
            fonction_motrice: dataToPopulate.fonction_motrice || "",
            sanguins: dataToPopulate.sanguins || "",
            urinaires: dataToPopulate.urinaires || "",
            radiologiques: dataToPopulate.radiologiques || "",
            hepatites_pos: dataToPopulate.hepatites_pos ? "true" : "false",
            hepatites_neg: dataToPopulate.hepatites_neg ? "true" : "false",
            syphilis_pos: dataToPopulate.syphilis_pos ? "true" : "false",
            syphilis_neg: dataToPopulate.syphilis_neg ? "true" : "false",
            vih_pos: dataToPopulate.vih_pos ? "true" : "false",
            vih_neg: dataToPopulate.vih_neg ? "true" : "false",
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        alert(`Erreur lors du chargement : ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [email, id_consultation]);

  const toTinyInt = (val) =>
    val === "true" || val === true || val === 1 || val === "1" ? 1 : 0;

  const handleChange = (e) => {
    if (examenExists) return;
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? (checked ? "true" : "false") : value;
    console.log(`Updating field: ${name}, value: ${newValue}, type: ${type}, event target:`, {
      name: e.target.name,
      value: e.target.value,
      type: e.target.type,
    });
    setFormData((prevState) => ({
      ...prevState,
      [name]: newValue,
    }));
  };

  const handleSave = async () => {
    if (!id_consultation) {
      alert("Consultation ID manquant.");
      return;
    }

    console.log('Consultation ID for save:', id_consultation);
    console.log('Form Data before saving:', { poids: formData.poids, taille: formData.taille });

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token manquant.");
      }

      const dataToSend = {
        poids: formData.poids !== "" ? formData.poids : null,
        taille: formData.taille !== "" ? formData.taille : null,
        IMC: formData.IMC !== "" ? formData.IMC : null,
        tension: formData.tension !== "" ? formData.tension : null,
        vision_d: formData.vision_d !== "" ? formData.vision_d : null,
        vision_g: formData.vision_g !== "" ? formData.vision_g : null,
        larmoiement: toTinyInt(formData.larmoiement),
        douleurs: toTinyInt(formData.douleurs),
        taches_yeux: toTinyInt(formData.taches_yeux),
        audition_d: formData.audition_d !== "" ? formData.audition_d : null,
        audition_g: formData.audition_g !== "" ? formData.audition_g : null,
        sifflements: toTinyInt(formData.sifflements),
        angines: toTinyInt(formData.angines),
        epistaxis: toTinyInt(formData.epistaxis),
        rhinorrhee: toTinyInt(formData.rhinorrhee),
        cephalies: toTinyInt(formData.cephalies),
        vertiges: toTinyInt(formData.vertiges),
        troubles_sommeil: toTinyInt(formData.troubles_sommeil),
        peau_normal: toTinyInt(formData.peau_normal),
        peau_anormale: toTinyInt(formData.peau_anormale),
        douleurs_musculaires: toTinyInt(formData.douleurs_musculaires),
        douleurs_articulaires: toTinyInt(formData.douleurs_articulaires),
        douleurs_neurologiques: toTinyInt(formData.douleurs_neurologiques),
        toux: toTinyInt(formData.toux),
        dyspnee: toTinyInt(formData.dyspnee),
        douleurs_thoraciques: toTinyInt(formData.douleurs_thoraciques),
        palpitations: toTinyInt(formData.palpitations),
        oedemes: toTinyInt(formData.oedemes),
        cyanose: toTinyInt(formData.cyanose),
        pyrosis: toTinyInt(formData.pyrosis),
        vomissements: toTinyInt(formData.vomissements),
        douleurs_abdominales: toTinyInt(formData.douleurs_abdominales),
        dysurie: toTinyInt(formData.dysurie),
        hematurie: toTinyInt(formData.hematurie),
        cycles_irreguliers: toTinyInt(formData.cycles_irreguliers),
        fonction_respiratoire: formData.fonction_respiratoire || "",
        fonction_circulatoire: formData.fonction_circulatoire || "",
        fonction_motrice: formData.fonction_motrice || "",
        sanguins: formData.sanguins || "",
        urinaires: formData.urinaires || "",
        radiologiques: formData.radiologiques || "",
        hepatites_pos: toTinyInt(formData.hepatites_pos),
        hepatites_neg: toTinyInt(formData.hepatites_neg),
        syphilis_pos: toTinyInt(formData.syphilis_pos),
        syphilis_neg: toTinyInt(formData.syphilis_neg),
        vih_pos: toTinyInt(formData.vih_pos),
        vih_neg: toTinyInt(formData.vih_neg),
      };

      console.log('Sending dataToSend:', JSON.stringify(dataToSend, null, 2));

      const response = await axios.post(
        `${API_URL}/medecins/examen-medical-create/${id_consultation}`,
        dataToSend,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('Save response:', response.data);
      setExamenId(response.data.id);
      setExamenExists(true);
      alert("Examen médical enregistré avec succès !");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error.response?.data || error.message);
      alert(`Erreur lors de la sauvegarde : ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex bg-[#EFEFEF] min-h-screen">
      <div className="flex flex-col md:flex-row w-full overflow-hidden">
        <div className="w-full md:w-24 bg-white shadow-md fixed top-0 left-0 bottom-0 z-10">
          <SideBar />
        </div>

        <div className="flex flex-col w-full ml-[120px]">
          <div className="h-16 flex items-center px-8 shadow bg-gradient-to-r from-[#A9C2C3] to-[#BED1D1] z-10 ml-[40px]">
            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#000000] to-[#679294] text-xl md:text-2xl font-bold">
              Patients
            </h1>
          </div>

          <div className="flex flex-col md:flex-row p-4 ml-[100px] mt-[20px]">
           <div className="w-[239px] ml-[80px] mt-[20px] h-fit bg-white shadow-lg rounded-xl p-6 space-y-6 mr-4">
      <div className="flex flex-col items-center">
                <img
                  src={imageSrc}
                  alt="Patient"
                  onError={(e) => {
                    console.error('Image load error, switching to default-profile.png');
                    e.target.onerror = null;
                    e.target.src = '/default.png';
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
                    patientData.isActif ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {patientData.isActif ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-lg p-6 ml-6">
              <h1 className="text-black text-2xl font-bold mb-6">
                Examen Physique
              </h1>
              <form className="flex flex-col space-y-6" onSubmit={(e) => e.preventDefault()}>
  <Mesures formData={formData} handleChange={handleChange} readOnly={examenExists} />
  <ExamenAppareil formData={formData} handleChange={handleChange} readOnly={examenExists} />
  <ExplorationFonctionnels formData={formData} handleChange={handleChange} readOnly={examenExists} />
  <ExamenComplementaire
    formData={formData}
    handleChange={handleChange}
    readOnly={examenExists}
  />

  {!examenExists && (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="rounded text-white bg-[#679294] px-4 py-2 hover:bg-[#577b7d] transition-colors disabled:opacity-50"
      >
        {loading ? "Enregistrement..." : "Sauvegarder"}
      </button>
    </div>
  )}
</form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamenPhysique;
