import React, { useState } from "react";
import logo from "/public/logo.png";
import logo2 from "../../public/twemoji_stethoscope.png";
import { MdDashboard } from "react-icons/md";
import { HiUsers } from "react-icons/hi";
import { FaUserDoctor } from "react-icons/fa6";
import { PiUserListFill } from "react-icons/pi";
import { RiFolderUserLine } from "react-icons/ri";
import { IoSettingsSharp } from "react-icons/io5";
import { FaNotesMedical } from "react-icons/fa";
import { IoMdArchive } from "react-icons/io";
import { IoLogOut } from "react-icons/io5";
import { useNavigate } from "react-router-dom"; 
import { API_URL } from "../api.js";




const SideBar = () => {
  const navigate = useNavigate();
  
    const handleLogout = async () => {
      const token = localStorage.getItem("token");
  
      try {
        const response = await fetch(`${API_URL}/patients/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (response.ok) {
          localStorage.removeItem("token"); // Supprime le token du localStorage
          navigate("/"); // Redirige vers la page d’accueil
        } else {
          console.error("Logout failed");
        }
      } catch (error) {
        console.error("Error during logout:", error);
      }
    };
  return (
    <div>
      <div className="flex ">
        <div className="flex flex-col gap-12 h-screen bg-gradient-to-b from-[#A9C2C3] to-[#679294]">
          <div className="flex justify-between items-end mx-2 mt-4    w-[80px] md:w-[120px] gap-2 md:gap-2">
            <img src={logo} alt="" className="ml-3 mt-4" />
          </div>
          <div className="flex flex-col justify-between h-full ">

          
          <div className="flex justify-between ">
          <ul className="flex  flex-col gap-2 md:gap-4 px-4 md:px-6 text-[12px] md:text-[14px]">
            <li>
              <a
                href="/Dashboard"
                className="flex items-center gap-2 hover:bg-[linear-gradient(to_left,#2E3D40,transparent)] hover:text-white  transition-[5s]  py-2 rounded-full"
              >
                <MdDashboard />
                <p>Dashboard</p>
              </a>
            </li>
            <li>
              <a
                href="/users"
                className="flex items-center gap-2 hover:bg-[linear-gradient(to_left,#2E3D40,transparent)] hover:text-white transition-[5s]  py-2 rounded-full"
              >
                <HiUsers />
                <p>Utilisateurs</p>
              </a>
            </li>
            {/* <li>
              <a
                href=""
                className="flex  items-center gap-2 hover:bg-[linear-gradient(to_left,#2E3D40,transparent)] hover:text-white transition-[5s]  py-2 rounded-full"
              >
                <RiFolderUserLine />
                <p className="whitespace-nowrap">Roles</p>
              </a>
            </li> */}

            {/* <li>
              <a
                href=""
                className="flex items-center gap-2 hover:bg-[linear-gradient(to_left,#2E3D40,transparent)] hover:text-white transition-[5s]  py-2 rounded-full"
              >
                <FaNotesMedical />
                <p className="whitespace-nowrap">Dossier med</p>
              </a>
            </li> */}
            

            <li>
              <a
                href="/archive"
                className="flex items-center gap-2  hover:bg-[linear-gradient(to_left,#2E3D40,transparent)] hover:text-white transition-[5s]  py-2 rounded-full"
              >
                <IoMdArchive />
                <p>Archive </p>
              </a>
            </li>

            <li>
              <a
                href="/Settings"
                className="flex items-center gap-2  hover:bg-[linear-gradient(to_left,#2E3D40,transparent)] hover:text-white transition-[5s]  py-2 rounded-full"
              >
                <IoSettingsSharp />
                <p>Paramètre </p>
              </a>
            </li>
          </ul>
          </div>
          <button
                      onClick={handleLogout}
                      className="flex justify-center items-center gap-1 mb-6 font-semibold text- hover:text-white cursor-pointer"
                    >
                      <IoLogOut className="" /> Déconnexion
                    </button>
                    </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
