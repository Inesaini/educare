import React from "react";
import { Link } from "react-router-dom";
import { HiUsers } from "react-icons/hi";
import { FaUserDoctor } from "react-icons/fa6";
import { IoSettingsSharp } from "react-icons/io5";
import { MdSpaceDashboard } from "react-icons/md";

const SideBar = () => {
  return (
    <div className="fixed top-0 left-0 h-full">
      <div className="flex flex-col gap-12 h-screen bg-gradient-to-b from-[#A9C2C3] to-[#679294]">
        {/* Logo Section */}
        <div className="flex justify-between items-end mx-2 mt-4 w-[80px] md:w-[120px] gap-2">
          <img src="/logo.png" alt="Logo" className="ml-[0.5px] mt-4" />
        </div>

        {/* Navigation Links */}
        <ul className="flex flex-col gap-2 md:gap-8 px-4 md:px-6 text-[12px] md:text-[16px]">
                     <li>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 hover:bg-[linear-gradient(to_left,#2E3D40,transparent)] hover:text-white transition-all duration-300 py-2 rounded-full"
            >
              < MdSpaceDashboard  />
              <p>DashBoard</p>
            </Link>
          </li>


          <li>
            <Link
              to="/user"
              className="flex items-center gap-2 hover:bg-[linear-gradient(to_left,#2E3D40,transparent)] hover:text-white transition-all duration-300 py-2 rounded-full"
            >
              <HiUsers />
              <p>Patients</p>
            </Link>
          </li>

          <li>
            <Link
              to="/rendezvous"
              className="flex items-center gap-2 hover:bg-[linear-gradient(to_left,#2E3D40,transparent)] hover:text-white transition-all duration-300 py-2 rounded-full"
            >
              <FaUserDoctor />
              <p>Rendez-vous</p>
            </Link>
          </li>

          <li className="flex items-center gap-2 text-black">
            <IoSettingsSharp />
            <p>Paramètres</p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SideBar;
