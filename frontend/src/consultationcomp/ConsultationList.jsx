import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { PlusCircle, Calendar, Loader2 } from "lucide-react";
import { API_URL } from "../api.js";

const ConsultationList = () => {
  const { email } = useParams();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);

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

  useEffect(() => {
    const fetchConsultations = async () => {
      if (!email) return;

      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Access denied. Please log in.");
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/medecins/consultations-patient/${email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setConsultations(response.data);
      } catch (error) {
        console.error("Error fetching consultations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, [email]);

  const handleAddNew = async () => {
    setLoadingAdd(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in first");
        return;
      }

      // Prepare the data to send
      const consultationPayload = {
        type: null, //
        motif: null,
        symptomes: null,
        observations: null,
        diagnostic: null,
        id_rendezVous: null,
        piece: null,
      };

      // Create the new consultation
      const response = await axios.post(
        `${API_URL}/medecins/consultation-create/${email}`,
        consultationPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Validate the response
      if (!response.data?.id_consultation) {
        throw new Error("Server didn't return a consultation ID");
      }

      // Store the new consultation ID
      localStorage.setItem(
        "currentConsultationId",
        response.data.id_consultation
      );

      // Navigate to the consultation page
      setLoadingAdd(true);
      console.log("this is the consultation id", response.data.id_consultation);
      navigate(`/consultation/${response.data.id_consultation}`);
    } catch (error) {
      console.error("Error creating consultation:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create consultation";
      alert(errorMessage);
    }
  };

  const handleConsultationClick = (id_consultation) => {
    navigate(`/consultation/${id_consultation}`);
  };
  return (
    <div className="p-4 bg-white ml-[150px] rounded-lg shadow-sm">
      <div className="text-black flex justify-between items-center mb-6">
        <p className="font-semibold">Ajouter une nouvelle consultation</p>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-[#679294] text-white px-4 py-2 rounded-md hover:bg-[#577f7f]"
        >
          {loadingAdd ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <PlusCircle size={18} />
          )}
          Ajouter
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Chargement...</p>
      ) : consultations.length > 0 ? (
        <div className="space-y-4">
          {consultations.map((consultation) => (
            <div
              key={consultation.id_consultation}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between">
                <h3 className="font-semibold text-black flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  Consultation du{" "}
                  {consultation.date
                    ? new Date(consultation.date).toLocaleDateString()
                    : "Date inconnue"}
                </h3>
                <span
                  className={`px-2 py-1 rounded-[10px] text-xs ${
                    consultation.type === "urgent"
                      ? "bg-red-100 text-red-800"
                      : consultation.type === "routine"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {consultation.type || "Autre"}
                </span>
              </div>
              <p className="text-gray-600 mt-1">
                {consultation.motif || "Pas de motif précisé"}
              </p>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() =>
                    handleConsultationClick(consultation.id_consultation)
                  }
                  className="flex items-center gap-1 text-[#679294] px-3 py-1.5 rounded-[10px] hover:bg-[#f0f7f7] transition-all"
                >
                  Voir détail
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">Aucune consultation trouvée</p>
      )}
    </div>
  );
};

export default ConsultationList;
