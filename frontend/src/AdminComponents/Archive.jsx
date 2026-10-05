import React, { useState, useEffect } from 'react';
import SideBar from './SideBar';
import axios from 'axios';
import OneArchive from './OneArchive';
import { API_URL } from "../api.js";

const Archive = () => {
  const [activeTab, setActiveTab] = useState('utilisateur');
  const [archivedUsers, setArchivedUsers] = useState([]);
  
  const adminToken = localStorage.getItem("token");
  
  useEffect(() => {
    if (activeTab === 'utilisateur') {
      axios.get(`${API_URL}/Admin/get-archived-users/`, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      })
      .then(res => {
        if (Array.isArray(res.data)) {
          setArchivedUsers(res.data);
        } else if (Array.isArray(res.data.utilisateurs)) {
          setArchivedUsers(res.data.utilisateurs);
        } else {
          console.error("Unexpected data:", res.data);
          setArchivedUsers([]);
        }
      })
      .catch(err => {
        console.error('Error fetching archived users:', err);
        setArchivedUsers([]);
      });
    }
  }, [activeTab]);

  const handleRestore = (email) => {
    axios.post(`${API_URL}/admin/restore-user/${email}/`, {}, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    })
    .then(res => {
      console.log(`User with email: ${email} has been restored`);
      setArchivedUsers(archivedUsers.filter(user => user.email !== email));
    })
    .catch(err => {
      console.error('Error restoring user:', err);
    });
  };

  return (
    <div className="relative flex bg-[#EFEFEF]">
      <SideBar/>
      <div className="flex flex-col w-full">
        {/* Header */}
        <div className="flex h-[40px] md:max-h-[60px] justify-between items-center px-4 md:px-12 shadow-md bg-gradient-to-r from-[#A9C2C3] to-[#BED1D1]">
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#000000] to-[#679294] text-l md:text-2xl font-bold">
            Archive
          </h1>
        </div>

        

          <div className="mx-8 my-6">
            <div className="bg-white rounded-[15px] border border-[#CACACA] shadow-md overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 items-center p-4 border-b border-[#CACACA] text-[#BBBBBF] font-medium">
                <div className="col-span-2">Matricule</div>
                <div className="col-span-2">Nom</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Rôle</div>
                <div className="col-span-2">Statut</div>
                <div className="col-span-1">Action</div>
              </div>
              
              {/* Table Body */}
              <div className="max-h-[350px] min-h-[250px] overflow-y-auto">
                {archivedUsers.length > 0 ? (
                  archivedUsers.map((user, index) => (
                    <OneArchive
                      key={index}
                      matricule={user.matricule || "—"}
                      first_name={user.nom || "—"}
                      last_name={user.prenom || "—"}
                      email={user.email || "—"}
                      role={user.role || "unknown"}
                      is_active={false}
                      onDelete={() => handleRestore(user.email)}
                    />
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full p-8 text-gray-400">
                    Aucun utilisateur archivé trouvé.
                  </div>
                )}
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Archive;