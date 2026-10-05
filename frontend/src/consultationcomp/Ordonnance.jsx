import React, { useState, useEffect } from "react";
import SideBar from "./SideBar";
import { FaPhone, FaEnvelope } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { API_URL } from "../api.js";

const Ordonnance = () => {
  console.log("we r in ordonnance");
  const { id_consultation } = useParams();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    adresse: "", // You may fetch/set this if available
    date: "", // will be set to today
    age: "",
    notes: "",
  });

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedMedicaments, setSelectedMedicaments] = useState([]);

  const [isSaved, setIsSaved] = useState(false);

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

  const email = localStorage.getItem("selectedEmail");
  console.log(email);
  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    // Set today's date in yyyy-mm-dd format
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = (today.getMonth() + 1).toString().padStart(2, "0");
    const dd = today.getDate().toString().padStart(2, "0");
    const todayFormatted = `${yyyy}-${mm}-${dd}`;

    setFormData((prev) => ({ ...prev, date: todayFormatted }));
  }, []);

  useEffect(() => {
    const fetchPatientDataAndMedicaments = async () => {
      const token = localStorage.getItem("token");
      console.log("token", token);
      try {
        setLoading(true);

        // 1. Fetch user data
        const res = await fetch(
          `${API_URL}/medecins/get-utilisateur/${email}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch patient data");

        const data = await res.json();
        const utilisateur = data.utilisateur;
        setPatientData(utilisateur);

        setFormData((prev) => ({
          ...prev,
          nom: utilisateur.nom || "",
          prenom: utilisateur.prenom || "",
          age: calculateAge(utilisateur.date_naissance),
        }));

        // 2. Fetch consultation info to get consultation_id (if you don't already have it)
        console.log("the id consultation", id_consultation);
        // 3. Check if ordonnance exists
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
          // 4. Fetch medicaments if ordonnance exists
          setIsSaved(true);

          const medicamentsRes = await fetch(
            `${API_URL}/medecins/consultations/${id_consultation}/medicaments`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const medicamentsData = await medicamentsRes.json();
          console.log(medicamentsData);
          setSelectedMedicaments(
            (medicamentsData.medicaments || []).map((med) => ({
              id: med.medicament_id,
              label: `${med.nom_de_marque}, ${med.dosage}`,
              duree: "",
            }))
          );
        } else {
          setSuggestions([]); // No medicaments
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        setPatientData(null);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDataAndMedicaments();
  }, [email]);

  const handleChange = async (e) => {
    const token = localStorage.getItem("token");

    console.log("handle change is here");
    const { name, value } = e.target;
    setShowSuggestions(true);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "notes" && value.trim().length > 1) {
      try {
        console.log("token is", token);
        const response = await fetch(
          `${API_URL}/medecins/search-medicament?q=${encodeURIComponent(
            value
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Erreur lors de la recherche");

        const data = await response.json();
        setSuggestions(data.results);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (med) => {
    const newMed = {
      id: med.id,
      label: `${med.nom_de_marque}, ${med.dosage}`,
      duree: "",
    };
    console.log(suggestions);
    console.log(newMed);
    setSelectedMedicaments((prev) => [...prev, newMed]);

    setFormData((prev) => ({
      ...prev,
      notes: "",
    }));

    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleCancel = () => {
    setFormData({
      nom: "",
      prenom: "",
      adresse: "",
      date: formData.date, // Keep today's date
      age: "",
      notes: "",
    });
    setSelectedMedicaments([]);
    setSuggestions([]);
    setShowSuggestions(false);
    setIsSaved(false);
  };
  const createOrdonnance = async (consultation_id, token) => {
    const response = await fetch(
      `${API_URL}/medecins/create-ordonnance/${consultation_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}), // You can include any required payload here if needed
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create ordonnance");
    }

    return data; // should contain the ordonnance object with id
  };

  const addMedicamentsToOrdonnance = async (
    ordonnanceId,
    medicaments,
    token
  ) => {
    for (const med of medicaments) {
      console.log({
        id_ordonnance: ordonnanceId,
        medicament_id: med.id,
        duree: med.duree,
      });

      const response = await fetch(
        `${API_URL}/medecins/add-medicament/${ordonnanceId}/${med.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            duree: med.duree || "1 semaine",
          }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to add medicament");
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const consultationId = id_consultation;
      const medicaments = selectedMedicaments;
      console.log("medicaments", medicaments);
      const ordonnance = await createOrdonnance(consultationId, token);
      console.log(ordonnance);

      // 2. Add medicaments to that ordonnance
      await addMedicamentsToOrdonnance(
        ordonnance.id_ordonnance,
        medicaments,
        token
      );

      setIsSaved(true);
      alert("Ordonnance saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save ordonnance: " + error.message);
    }
  };

  const handlePrint = () => {
    const originalContent = document.body.innerHTML;
    const originalClass = document.body.className;
    const printContent = document.getElementById("form").outerHTML;

    document.body.innerHTML = printContent;
    document.body.className = "";

    const style = document.createElement("style");
    style.innerHTML = `
      @page { margin: 0; }
      body { margin: 0; }
      button { display: none !important; }
    `;
    document.head.appendChild(style);

    window.print();

    document.body.innerHTML = originalContent;
    document.body.className = originalClass;
    document.head.removeChild(style);
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
            <div className="flex flex-row">
              {/* Patient Info displayed as text */}
              <div className="w-[239px] h-[346px] md:w-60 bg-white shadow-lg rounded-xl p-6 space-y-6">
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
                  <h2 className="mt-4 text-black text-lg font-semibold">
                    {loading
                      ? "Chargement..."
                      : patientData
                      ? `${patientData.nom} ${patientData.prenom}`
                      : "Aucun patient sélectionné"}
                  </h2>
                  <h3 className="mt-2 text-gray-600 text-sm md:text-base">
                    {loading
                      ? "Chargement..."
                      : patientData
                      ? patientData.email
                      : "-"}
                  </h3>
                  <span
                    className={`text-sm px-3 py-1 rounded-full mt-2 ${
                      patientData && patientData.isActif
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {loading
                      ? "Chargement..."
                      : patientData
                      ? patientData.isActif
                        ? "Active"
                        : "Inactive"
                      : ""}
                  </span>
                </div>
              </div>

              {/* Form with fetched data displayed as text or read-only inputs */}
              <form
                id="form"
                className="bg-white m-[20px] w-[725px] border rounded-[10px] p-[35px] space-y-3"
              >
                <h1 className="text-black font-black">
                  Cabinet Médical ESI-SBA
                </h1>
                <h2 className="text-gray-600">
                  Consultation, certificat médicaux, soins, Urgences
                </h2>
                <h2 className="text-gray-600">
                  Ecole Supérieure d'Informatique
                </h2>

                <div className="flex items-center text-gray-600">
                  <FaPhone className="mr-2" />
                  <span>00555123456/05557089</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <FaEnvelope className="mr-2" />
                  <span>cabinet.medical@esi-sba.dz</span>
                </div>

                <img
                  src="/logoecole.png"
                  alt="logo ecole"
                  className="w-[150px] h-[150px] ml-[500px] absolute top-[155px]"
                />

                <hr className="border-t-2 border-gray-300 w-[70%] mx-auto my-[50px] " />
                <h1 className="m-[50px] font-exo font-bold text-[31px] leading-[100%] tracking-[0] underline underline-offset-4 decoration-[1.5px] text-black text-center">
                  ORDONNANCE
                </h1>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <label className="w-24 text-black font-bold">Nom:</label>
                      <div className="flex-1 p-1 text-black bg-transparent">
                        {formData.nom || (loading ? "Chargement..." : "-")}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <label className="w-24 text-black font-bold">
                        Prénom:
                      </label>
                      <div className="flex-1 p-1 text-black bg-transparent">
                        {formData.prenom || (loading ? "Chargement..." : "-")}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <label className="w-24 text-black font-bold">Date:</label>
                      <div className="flex-1 p-1 text-black bg-transparent">
                        {formData.date || (loading ? "Chargement..." : "-")}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <label className="w-24 text-black font-bold">Age:</label>
                      <div className="flex-1 p-1 text-black bg-transparent">
                        {formData.age !== ""
                          ? formData.age
                          : loading
                          ? "Chargement..."
                          : "-"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected medicaments */}

                <div className="mt-6">
                  <h2 className="text-black font-semibold mb-2">
                    Médicaments ajoutés :
                  </h2>
                  <ul className="space-y-2">
                    {selectedMedicaments.map((med, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center text-black bg-white p-2 rounded-md"
                      >
                        <span>{med.label}</span>
                        {!isSaved && (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedMedicaments((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                            className="text-red-500 text-sm hover:text-red-700 font-bold rounded-full w-5 h-5 flex items-center justify-center border border-red-500 ml-2 cursor-pointer"
                            title="Supprimer"
                          >
                            ×
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                {!isSaved && (
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full h-12 p-3 text-black border border-transparent rounded-lg focus:border-[#679294] focus:outline-none resize-none"
                    placeholder="Rechercher un médicament..."
                  />
                )}

                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute z-10 bg-white border w-full rounded shadow max-h-40 overflow-y-auto mt-1">
                    {suggestions.map((med, index) => (
                      <li
                        key={index}
                        onClick={() => handleSuggestionClick(med)}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-black"
                      >
                        {med.nom_de_marque}, {med.dosage}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="border border-[#4e6979] text-[#4e6979] px-5 py-2 rounded-md hover:bg-[#4e6979] hover:text-white transition duration-300"
                  >
                    Annuler
                  </button>
                  {!isSaved ? (
                    <button
                      type="button"
                      onClick={handleSave}
                      className="px-5 py-2 rounded-md bg-[#7aa6b2] text-white hover:bg-[#679294] transition duration-300"
                    >
                      Enregistrer
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="border border-[#4e6979] text-[#4e6979] px-5 py-2 rounded-md hover:bg-[#4e6979] hover:text-white transition duration-300"
                    >
                      Imprimer
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Ordonnance;
