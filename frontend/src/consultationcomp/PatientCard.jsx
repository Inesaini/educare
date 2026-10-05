import React, { useEffect, useState } from 'react';
import { API_URL } from "../api.js";

const PatientCard = ({ email }) => {
  const [patientData, setPatientData] = useState({
    prenom: '',
    nom: '',
    email: '',
    isActif: "",
  });

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!email) return;

      const token = localStorage.getItem('token');
      if (!token) {
        alert("Access denied. Please log in.");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/medecins/get-user-info/${email}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch patient data');

        const data = await response.json();

        setPatientData({
          prenom: data.prenom,
          nom: data.nom,
          email: data.email,
          isActif: data.isActif,
        });
      } catch (error) {
        console.error('Error fetching patient data:', error);
      }
    };

    fetchPatientData();
  }, [email]);

  return (
    <div className="w-[239px] h-fit bg-white shadow-lg rounded-xl p-6 space-y-6 mr-4">
      <div className="flex flex-col items-center">
        <img
          src="/logo.png"
          alt="Patient"
          className="text-black w-[133px] h-[194px] object-cover border-4 border-gray-300"
        />
        <h2 className="mt-4 text-black text-lg font-semibold">
          {patientData.nom} {patientData.prenom}
        </h2>
        <h2 className="mt-4 text-gray-600 text-[12px] font-semibold">
          {patientData.email}
        </h2>
        <span
          className={`text-sm px-3 py-1 rounded-full mt-2 ${
            patientData.isActif === false ? 'text-red-500' : 'text-green-500'
          }`}
        >
          {patientData.isActif === false ? 'Inactive' : 'Active'}
        </span>
      </div>
    </div>
  );
};

export default PatientCard;
