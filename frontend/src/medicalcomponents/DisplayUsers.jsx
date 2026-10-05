import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UsersList from './UsersList';
import axios from 'axios';
import { API_URL } from "../api.js";

const DisplayUsers = ({ searchQuery = '' }) => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all patients on initial load
  useEffect(() => {
    const fetchPatients = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Access denied. Please log in.");
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/admin/get-all-patients/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 200) {
          setPatients(response.data);
          setFilteredPatients(response.data);
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Handle search when searchQuery changes
  useEffect(() => {
    const searchPatients = async () => {
      if (!searchQuery.trim()) {
        setFilteredPatients(patients);
        return;
      }

      setIsSearching(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Access denied. Please log in.");
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/medecins/search-patient?q=${searchQuery}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFilteredPatients(response.data.results || []);
      } catch (error) {
        console.error("Search error:", error);
        setFilteredPatients([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(() => {
      searchPatients();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, patients]);

  const handleConsult = async (email) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Access denied. Please log in.");
      return;
    }

    try {
      await axios.get(
        `${API_URL}/medecins/get-dossier-medical/${email}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      localStorage.setItem('selectedEmail', email);
      navigate(`/medecin/${email}`);
    } catch (error) {
      console.error("Consult error:", error);
      // Still navigate even if medical record doesn't exist yet
      navigate(`/medecin/${email}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFEFE]">
        <p className="text-gray-500">Loading patients...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-end bg-[#FFFEFE] mx-8  mb-6 rounded-[15px] border border-[#CACACA] shadow-md py-6 px-6 ml-[200px] mt-[50px]">
      <div className="w-full">
        <div className="flex justify-between text-sm font-semibold text-[#7D7D7D] border-b pb-2 mb-2">
          <span className="w-1/2 sm:w-[150px]">Matricule</span>
          <span className="w-1/2 sm:w-[180px]">Name</span>
          <span className="w-full sm:w-[200px]">Email</span>
          <span className="w-[100px] text-center">Action</span>
        </div>

        <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {isSearching ? (
            <p className="text-center text-gray-500 mt-4">Searching patients...</p>
          ) : filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <UsersList
                key={patient.email}
                matricule={patient.matricule}
                prenom={patient.prenom}
                nom={patient.nom}
                email={patient.email}
                onConsult={() => handleConsult(patient.email)}
              />
            ))
          ) : (
            <p className="text-center text-gray-500 mt-4">
              {searchQuery ? "No matching patients found" : "No patients available"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisplayUsers;