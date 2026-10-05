import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Paperclip, Link as LinkIcon, Plus } from "lucide-react";
import axios from "axios";
import SideBar from "./SideBar";
import { API_URL } from "../api.js";

const ConsultationForm = () => {
  const { id_consultation } = useParams();
  const navigate = useNavigate();
  const email = localStorage.getItem("selectedEmail");
  const [ordonnaceExists, setOrdonnaceExists] = useState(false);
  const [examenExists, setExamenExists] = useState(false);

  const [patientData, setPatientData] = useState({
    prenom: "",
    nom: "",
    email: "",
    isActif: "",
  });
  //fetch image
  const [imageSrc, setImageSrc] = useState('/default.png'); // default image at start

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
  }, []);

  //fetch patientcard info
  useEffect(() => {
    const email = localStorage.getItem("selectedEmail");

    const fetchPatientData = async () => {
      if (!email) return;

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Access denied. Please log in.");
        return;
      }

      try {
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

        if (!response.ok) throw new Error("Failed to fetch patient data");

        const data = await response.json();

        setPatientData({
          prenom: data.prenom,
          nom: data.nom,
          email: data.email,
          isActif: data.isActif,
        });
      } catch (error) {
        console.error("Error fetching patient data:", error);
      }
    };

    fetchPatientData();
  }, [email]);

  const token = localStorage.getItem("token");

  const [consultationData, setConsultationData] = useState({
    date: "",
    type: "routine",
    motif: "",
    symptomes: "",
    observations: "",
    diagnostic: "",
    id_rendezVous: "",
    piece: "",
    patient_id: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchConsultationData = async () => {
      if (!id_consultation) return;

      setIsLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}/medecins/get-consultation/${id_consultation}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const apiData = response.data.find(
          (item) => item.id_consultation == id_consultation
        );

        if (!apiData) {
          throw new Error("Consultation not found");
        }

        const isoDate = new Date(apiData.date);
        const formattedDate = apiData.date
          ? `${isoDate.getFullYear()}-${String(isoDate.getMonth() + 1).padStart(
              2,
              "0"
            )}-${String(isoDate.getDate()).padStart(2, "0")}`
          : "";

        setConsultationData({
          date: formattedDate,
          type: apiData.type || "generale",
          motif: apiData.motif || "",
          symptomes: apiData.symptomes || "",
          observations: apiData.observations || "",
          diagnostic: apiData.diagnostic || "",
          id_rendezVous: apiData.id_rendezVous || null,
          piece: apiData.piece || "",
          patient_id: apiData.patient_id || "",
        });
        console.log("consultation data", consultationData);

        // Check if ordonnance exists
        const ordonnanceRes = await fetch(
          `${API_URL}/medecins/consultations/${id_consultation}/has-ordonnance`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const ordonnanceCheck = await ordonnanceRes.json();
        if (ordonnanceCheck.exists) {
          setOrdonnaceExists(true);
        }

        // Check if examen medical exists
        const examenRes = await fetch(
          `${API_URL}/medecins/consultations/${id_consultation}/has-examen-medical`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const examenCheck = await examenRes.json();
        if (examenCheck.exists) {
          setExamenExists(true);
        }
      } catch (error) {
        console.error("Error fetching consultation:", error);
        alert(`Error loading consultation: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConsultationData();
  }, [id_consultation, token]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Prepare the payload according to your backend's expected format
    const payload = {
      date: consultationData.date
        ? new Date(consultationData.date).toISOString()
        : null,
      type: consultationData.type,
      motif: consultationData.motif,
      symptomes: consultationData.symptomes,
      observations: consultationData.observations,
      diagnostic: consultationData.diagnostic,
      id_rendezVous: consultationData.id_rendezVous,
      patient_id: consultationData.patient_id,
      piece: consultationData.piece,
    };

    try {
      const response = await axios.patch(
        `${API_URL}/medecins/modify-consultation/${id_consultation}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const updatedData = Array.isArray(response.data)
          ? response.data.find(
              (item) => item.id_consultation == id_consultation
            )
          : response.data;

        if (updatedData) {
          const updatedDate = updatedData.date
            ? updatedData.date.split("T")[0]
            : "";

          setConsultationData((prev) => ({
            ...prev,
            ...updatedData,
            date: updatedDate,
            piece: updatedData.piece || "",
          }));
        }

        alert("Consultation updated successfully!");
        navigate(`/consultation/${id_consultation}`);
      }
    } catch (error) {
      console.error("Error updating consultation:", {
        error: error.response?.data || error.message,
        config: error.config,
      });
      alert(
        `Error updating consultation: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setConsultationData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const getConsultationTypeColor = () => {
    switch (consultationData.type) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "routine":
        return "bg-green-100 text-green-800 border-green-200";
      case "followup":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Navigation to physical exam
  const handleAddPhysicalExam = async () => {
    navigate(`/examenphysique/${id_consultation}`);
  };

  // Navigation to prescription
  const handleAddPrescription = () => {
    navigate(`/ordonnace/${id_consultation}`);
  };

  if (!token) {
    alert("Access denied. Please log in.");
    return null;
  }

  return (
    <div className="relative flex bg-[#EFEFEF] min-h-screen">
      <div className="flex flex-col md:flex-row w-full overflow-hidden">
        <div className="w-full z-11 md:w-24 bg-white shadow-md fixed top-0 left-0 bottom-0 z-10">
          <SideBar />
        </div>

        <div className="flex flex-col w-full ml-[163px]">
          <div className="h-16 flex items-center px-8 shadow bg-gradient-to-r from-[#A9C2C3] to-[#BED1D1] z-10">
            <h1 className="text-transparent ml-[50px] bg-clip-text bg-gradient-to-r from-[#000000] to-[#679294] text-xl md:text-2xl font-bold">
              Patients
            </h1>
          </div>

          <div className="flex flex-col md:flex-row w-full">
            {/* Patient Sidebar */}
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
                <h3 className="mt-4 text-black  font-semibold">
                  {patientData.nom} {patientData.prenom}
                </h3>
                <p className="mt-4 text-gray-600  font-semibold">
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
            </div>

            {/* Consultation Form */}
            <div className="flex flex-col w-full px-4 md:px-12 mt-4">
              <form
                onSubmit={handleFormSubmit}
                className="flex flex-col w-full space-y-6 px-6"
              >
                {/* Basic Info Section */}
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Motif
                    </label>
                    <input
                      type="text"
                      name="motif"
                      value={consultationData.motif}
                      onChange={handleInputChange}
                      className="w-full text-black rounded-md border border-gray-300 py-2 px-3 bg-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="date"
                          name="date"
                          value={consultationData.date}
                          onChange={handleInputChange}
                          className="pl-10 text-black w-full rounded-md border border-gray-300 py-2 px-3 bg-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        name="type"
                        value={consultationData.type}
                        onChange={handleInputChange}
                        className={`w-full rounded-md border py-2 px-3 ${getConsultationTypeColor()}`}
                        required
                      >
                        <option value="routine">Routinière</option>
                        <option value="urgent">Urgente</option>
                        <option value="followup">Suivi</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Symptoms Section */}
                {/* Symptômes Rapportés Section */}
                <div>
                  <label className="block text-sm font-bold text-black mb-1">
                    Symptômes Rapportés
                  </label>
                  <textarea
                    name="symptomes"
                    value={consultationData.symptomes ?? ""}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Ajouter des symptômes"
                    className="w-full text-black rounded-md border border-gray-300 py-2 px-3 placeholder-gray-400"
                    required
                  />
                </div>

                {/* Observations Section */}
                <div>
                  <label className="block text-sm font-bold text-black mb-1">
                    Observations du Médecin
                  </label>
                  <textarea
                    name="observations"
                    value={consultationData.observations ?? ""}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Ajouter des observations"
                    className="w-full text-black rounded-md border border-gray-300 py-2 px-3 placeholder-gray-400"
                    required
                  />
                </div>

                {/* Diagnosis Section */}
                <div>
                  <label className="block text-sm font-bold text-black mb-1">
                    Diagnostic
                  </label>
                  <textarea
                    name="diagnostic"
                    value={consultationData.diagnostic ?? ""}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Ajouter un diagnostic"
                    className="w-full text-black rounded-md border border-gray-300 py-2 px-3 placeholder-gray-400"
                    required
                  />
                </div>

                {/* Physical Exam Section */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-[18px] leading-[100%] text-black font-['Exo_2']">
                      Ordonnance
                    </h3>
                    {!ordonnaceExists && (
                      <button
                        type="button"
                        onClick={handleAddPrescription}
                        disabled={isLoading}
                        className="flex items-center text-sm text-[#679294] hover:text-[#51797a] disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter
                      </button>
                    )}
                  </div>

                  <div className="text-gray-500 text-sm">
                    {isLoading ? (
                      "Chargement..."
                    ) : ordonnaceExists ? (
                      <span className="cursor-pointer">
                        <span className="text-black font-bold text-[14px] leading-[100%] mr-2 font-['Exo_2']">
                          Ordonnance n°1 —
                        </span>

                        <span
                          onClick={handleAddPrescription}
                          className="font-normal text-[14px] leading-[100%] underline text-[#679294] font-['Exo_2']"
                        >
                          📎 Voir l'ordonnance complète
                        </span>
                      </span>
                    ) : (
                      "Aucune ordonnance enregistrée"
                    )}
                  </div>
                </div>

                {/* Prescription Section */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-[18px] leading-[100%] text-black font-['Exo_2']">
                      Examen Médical
                    </h3>
                    {!examenExists && (
                      <button
                        type="button"
                        onClick={handleAddPhysicalExam}
                        disabled={isLoading}
                        className="flex items-center text-sm text-[#679294] hover:text-[#51797a] disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter
                      </button>
                    )}
                  </div>

                  <div className="text-gray-500 text-sm">
                    {isLoading ? (
                      "Chargement..."
                    ) : examenExists ? (
                      <span className="cursor-pointer">
                        <span className="text-black font-bold text-[14px] leading-[100%] mr-2 font-['Exo_2']">
                          Examen n°1 —
                        </span>

                        <span
                          onClick={handleAddPhysicalExam}
                          className="font-normal text-[14px] leading-[100%] underline text-[#679294] font-['Exo_2']"
                        >
                          📋 Voir l’examen complet
                        </span>
                      </span>
                    ) : (
                      "Aucun examen physique enregistré"
                    )}
                  </div>
                </div>

                {/* File Attachment */}
                <div>
                  <label className="block text-sm font-bold text-black mb-1">
                    Pièce Jointe
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer p-3 border border-gray-300 rounded-md hover:bg-gray-50">
                    <Paperclip className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {consultationData.piece || "Aucun fichier sélectionné"}
                    </span>
                    <input
                      type="text"
                      name="piece"
                      onChange={handleInputChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pb-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded text-white bg-[#679294] w-[109px] h-[34px] disabled:opacity-50"
                  >
                    {isLoading ? "En cours..." : "Sauvegarder"}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="rounded text-[#679294] bg-white w-[109px] h-[34px] border border-[#679294]"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationForm;
