import React, { useState, useEffect } from "react";
import Oneuser from "./Oneuser";
import NewUserForm from "./NewUserForm";
import { IoMdAttach } from "react-icons/io";
import { API_URL } from "../api.js";

const DisplayUsers = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [showExcelUploadForm, setShowExcelUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResults, setUploadResults] = useState(null); // Nouveau
  const adminToken = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `${API_URL}/Admin/get-users`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      setPatients(data.utilisateurs || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleExcelUpload = async () => {
    if (!selectedFile) {
      alert("Veuillez sélectionner un fichier Excel (XLSX)");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        `${API_URL}/admin/bulk-register-pdf`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Échec de l'upload du fichier Excel");

      const resultData = await response.json();
      setUploadResults(resultData.results); // Stocke le tableau de résultats
      setShowExcelUploadForm(false);
      setSelectedFile(null);
      fetchUsers();
    } catch (error) {
      console.error("Error uploading Excel file:", error);
      alert("Une erreur est survenue lors de l'upload du fichier Excel");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="relative">
      {/* Tableau des utilisateurs */}
      <div className="bg-[#FFFEFE] max-h-[420px] min-h-[250px] overflow-y-auto rounded-[15px] border border-[#CACACA] shadow-md overflow-hidden mx-6  min-w-[900px]">
        {/* En-têtes des colonnes */}
        <div className="grid grid-cols-12 gap-4 items-center p-4 border-b border-[#CACACA] text-[#BBBBBF] font-medium">
          <div className="col-span-2">Matricule</div>
          <div className="col-span-2">Nom</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Rôle</div>
          <div className="col-span-2">Statut</div>
          <div className="col-span-1">Action</div>
        </div>

        {/* Corps du tableau */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center h-full p-8 text-gray-500">
              Chargement des utilisateurs...
            </div>
          ) : patients.length > 0 ? (
            patients.map((user, index) => (
              <Oneuser
                key={index}
                matricule={user.matricule || "--"}
                first_name={user.prenom || "--"}
                last_name={user.nom || "--"}
                email={user.email}
                role={user.role}
                is_active="active"
                fetchUsers={fetchUsers}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-full p-8 text-gray-500">
              Aucun utilisateur trouvé.
            </div>
          )}
        </div>
      </div>

      {/* Boutons */}
      <div className="flex justify-end p-4  gap-4">
        <button
          onClick={() => setShowExcelUploadForm(true)}
          className="flex items-center justify-center  border border-[#679294] hover:bg-gray-200 rounded-[10px] bg-gray-100 px-2 py-1 shadow-md font-semibold text-[#679294]"
        >
          <IoMdAttach /> <span>Ajouter Étudiants via Excel</span>
        </button>

        <button
          onClick={() => setShowNewUserForm(true)}
          className="bg-[#679294] text-white px-4 py-2 rounded-md hover:bg-[#5a7e80] transition-colors"
        >
          + Ajouter
        </button>
      </div>

      {/* Formulaire Nouveau Utilisateur */}
      {showNewUserForm && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl flex justify-center text-[#679294] font-bold mb-4">
              Nouveau Utilisateur
            </h2>
            <NewUserForm
              onSuccess={() => {
                setShowNewUserForm(false);
                fetchUsers();
              }}
              onCancel={() => setShowNewUserForm(false)}
            />
          </div>
        </div>
      )}

      {/* Formulaire Upload Excel */}
      {showExcelUploadForm && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl text-[#679294] font-bold mb-5">
              Ajouter Étudiants via Excel
            </h2>

            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#679294] file:text-white hover:file:bg-[#5a7e80]"
            />
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-600">
                Fichier sélectionné : {selectedFile.name}
              </p>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowExcelUploadForm(false);
                  setSelectedFile(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={handleExcelUpload}
                className="px-4 py-2 bg-[#679294] text-white rounded-md hover:bg-[#5a7e80]"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Résultats Upload Excel */}
      {uploadResults && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.6)] flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-lg">
            <h2 className="text-2xl text-[#679294] font-bold mb-4 text-center">
              Résultat de l'import Excel
            </h2>
            <div className="space-y-2">
              {uploadResults.map((res, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md border ${
                    res.status === "success"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-red-500 bg-red-50 text-red-700"
                  }`}
                >
                  <strong>
                    {res.email} : {res.status} <br />{" "}
                    <span className="text-black text-[12px] font-light">
                      {res.error}
                    </span>{" "}
                  </strong>{" "}
                  — {res.message}
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setUploadResults(null)}
                className="px-4 py-2 bg-[#679294] text-white rounded-md hover:bg-[#5a7e80]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayUsers;
