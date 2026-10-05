import React, { useState, useEffect } from 'react';

import {useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from "../api.js";


export default function AddFile() {
  const [status, setStatus] = useState('Active');
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('dossier');

  const location = useLocation();
  const navigate = useNavigate(); // ← add this line
   const { email } = useParams();
 

  useEffect(() => {
    if (email) {
      fetchUserInfo();
    }
  }, [email]);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/medecins/get-user-info/${email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserInfo(response.data);
      setStatus(response.data.statut || 'Active');
    } catch (err) {
      console.error("Erreur lors de la récupération des infos utilisateur:", err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'dossier', label: 'Medical Dossier' },
    { id: 'examen', label: 'Medical Exam' },
    { id: 'rendezvous', label: 'Rendez-vous' },
    { id: 'ordonnances', label: 'Prescriptions' },
  ];
  const goToMedicalForm = () => {
    if (!email || !userInfo) return;
    navigate(`/medicalform/${email}`, {
      state: { userInfo }
    });
  };

  return (
    <div className="fixed bg-[#EFEFEF] w-full h-full">
  
     

        <div className="flex flex-row">
          <div className="w-[239px] bg-white shadow-lg rounded-xl p-6 ml-[200px] mt-[10px]">
            <div className="flex flex-col items-center">
              <img
                src="/logo.png"
                alt="Patient"
                className="w-[133px] h-[194px] object-cover border-4 border-gray-300"
              />
              <span className={`text-sm px-3 py-1 rounded-full mt-2 ${status === 'Active' ? 'text-green-500' : 'text-red-500'}`}>
                {status}
              </span>
              {userInfo && (
                <div className="text-center mt-2">
                  <p className="font-semibold">{userInfo.nom} {userInfo.prenom}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col w-full px-4 md:px-12 mt-4">
            <div className="flex space-x-6 border-b border-gray-300 pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`text-black font-bold md:text-base border-b-2 transition duration-300 ${activeTab === tab.id ? 'border-[#F4A261]' : 'border-transparent hover:border-[#F4A261]'}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'dossier' && (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 bg-white shadow-md rounded-md p-4'>
                  {loading ? (
                    <div className="col-span-2 flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <button
                      className="rounded text-white bg-[#679294] w-[140px] h-[40px]"
                      onClick={goToMedicalForm}
                    >
                      Créer Dossier
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'examen' && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Medical Exam</h2>
                  <p>Recent medical exam results...</p>
                </div>
              )}

              {activeTab === 'rendezvous' && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Appointments</h2>
                </div>
              )}

              {activeTab === 'ordonnances' && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Prescriptions</h2>
                  <p>List of active prescriptions...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

  );
}
