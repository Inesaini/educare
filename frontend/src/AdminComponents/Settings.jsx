import React, { useState } from 'react';
import SideBar from './SideBar';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('ModifierProfile');

  // Sample data - you can later replace this with data from backend
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    tel: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = () => {
    console.log('Saved data:', formData);
    // TODO: Add API call to save updated data
  };

  return (
    <div className="relative flex bg-[#EFEFEF] ">
      <SideBar />
      <div className="flex flex-col w-full">
        {/* Top Bar */}
        <div className="flex h-[40px] md:max-h-[60px] justify-between items-center px-4 md:px-12 shadow-md bg-gradient-to-r from-[#A9C2C3] to-[#BED1D1]">
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#000000] to-[#679294] text-l md:text-2xl font-bold">
            Paramètre
          </h1>
        </div>

        {/* Form Content */}
        <div className="flex justify-start my-6 mx-6">
          <div className="flex flex-col justify-between bg-white w-full mx-6 mb-6 rounded-[15px] border border-[#CACACA] shadow-md py-6 px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nom */}
              <div>
                <label className="text-sm text-gray-700 mb-1 block">Nom</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="border rounded-md w-full p-2 focus:outline-none"
                />
              </div>

              {/* Prénom */}
              <div>
                <label className="text-sm text-gray-700 mb-1 block">Prenom</label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  className="border rounded-md w-full p-2 focus:outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm text-gray-700 mb-1 block">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border rounded-md w-full p-2 focus:outline-none"
                />
              </div>

              {/* Tel */}
              <div>
                <label className="text-sm text-gray-700 mb-1 block">Tel</label>
                <input
                  type="text"
                  name="tel"
                  value={formData.tel}
                  onChange={handleChange}
                  className="border rounded-md w-full p-2 focus:outline-none"
                />
              </div>
            </div>

            {/* Change Password */}
            <div className="mt-6">
              <button className="text-sm font-semibold text-black hover:text-[#4e7a7b] transition">
                Change password &gt;
              </button>
            </div>

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-[#6D8C8D] hover:bg-[#567373] text-white font-medium py-2 px-6 rounded-md shadow-md transition duration-300"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
