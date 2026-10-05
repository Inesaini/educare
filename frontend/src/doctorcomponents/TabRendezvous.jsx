import React, { useState, useEffect } from 'react';
import { TbCalendarFilled } from "react-icons/tb";
import axios from 'axios';
import { useParams } from "react-router-dom";
import PatientCard from '../consultationcomp/PatientCard';
import { API_URL } from "../api.js";

const TabRendezvous = () => {
  const { email } = useParams();
  const [rendezvous, setRendezvous] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRdv, setNewRdv] = useState({
    motif: '',
    date_rdv: new Date().toISOString().split('T')[0],
    heure_rdv: '08:00',
    status: 'programmé'
  });

  useEffect(() => {
    if (!email) return;

    const fetchRendezvous = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Veuillez vous connecter.");
        return;
      }

      try {
        const res = await axios.get(
          `${API_URL}/medecins/listerendezvousdupatient/${email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setRendezvous(res.data);
        console.log("Liste des rendez-vous :", res.data);
      } catch (err) {
        console.error("Erreur lors du chargement des rendez-vous :", err);
      }
    };

    fetchRendezvous();
  }, [email]);

  const getStatusClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
      case 'terminé': return 'bg-green-100 text-green-800';
      case 'annulé': return 'bg-red-100 text-red-800';
      case 'programmé': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddRendezvous = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Veuillez vous connecter.");
      return;
    }

    // Validation de date > aujourd’hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(newRdv.date_rdv);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      alert("La date du rendez-vous doit être supérieure à la date actuelle.");
      return;
    }

    const data = {
      email: email,
      motif: newRdv.motif,
      date_rdv: newRdv.date_rdv,
      heure_rdv: newRdv.heure_rdv
    };

    try {
      await axios.post(
        `${API_URL}/medecins/programmerrdvdirect`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const res = await axios.get(
        `${API_URL}/medecins/listerendezvousdupatient/${email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setRendezvous(res.data);
      console.log("Rendez-vous après ajout :", res.data);
      setShowAddModal(false);
      setNewRdv({
        motif: '',
        date_rdv: new Date().toISOString().split('T')[0],
        heure_rdv: '08:00',
        status: 'programmé'
      });
    } catch (err) {
      console.error("Erreur lors de l'ajout :", err);
    }
  };

  return (
    <div className='flex gap-2'>
      <div className='flex flex-col gap-6 w-full'>
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div className='flex flex-col gap-2'>
              <h2 className="text-xl font-semibold text-[#2E3D40]">Nouveau Rendez-vous</h2>
              <p className="text-gray-500 text-sm">Nouveau rendez-vous pour : {email}</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#679294] hover:bg-[#557f80] text-white px-4 py-2 rounded shadow"
            >
              Ajouter
            </button>
          </div>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-center text-[#679294]">Ajouter un rendez-vous</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Motif</label>
                  <input
                    type="text"
                    value={newRdv.motif}
                    onChange={(e) => setNewRdv({ ...newRdv, motif: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={newRdv.date_rdv}
                    onChange={(e) => setNewRdv({ ...newRdv, date_rdv: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Heure</label>
                  <input
                    type="time"
                    value={newRdv.heure_rdv}
                    onChange={(e) => setNewRdv({ ...newRdv, heure_rdv: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="flex justify-center gap-3 mt-6">
                <button onClick={handleAddRendezvous} className="px-4 py-2 bg-[#679294] text-white rounded hover:bg-[#5a7d7e]">
                  Confirmer
                </button>
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded hover:bg-gray-100">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {rendezvous.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">Aucun rendez-vous trouvé.</p>
        ) : (
          rendezvous.map((rdv, idx) => (
            <div key={idx} className='bg-white p-6 rounded-2xl shadow-lg flex justify-between'>
              <div className='flex flex-col gap-2 justify-center items-start'>
                <h1 className='font-semibold text-lg'>Motif : {rdv.motif}</h1>
                <div className='flex items-center gap-1'>
                  <TbCalendarFilled className='text-[#F4A261]' />
                  {new Date(rdv.date).toISOString().split('T')[0]}&nbsp;
                  <span className='text-[#F4A261] font-semibold'>à</span>&nbsp;
                  {rdv.heure?.slice(0, 5)}
                </div>
              </div>
              <div className='flex flex-col items-end'>
                <span className={`mt-2 text-sm px-3 py-1 rounded-full ${getStatusClass(rdv.statut)}`}>
                  {rdv.statut}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TabRendezvous;
