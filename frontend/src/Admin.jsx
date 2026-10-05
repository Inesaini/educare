import React, { useState } from "react";
import logo from "../public/logo.png";
import logo2 from "../public/twemoji_stethoscope.png";
import { MdDashboard } from "react-icons/md";
import { HiUsers } from "react-icons/hi";
import { FaUserDoctor } from "react-icons/fa6";
import { PiUserListFill } from "react-icons/pi";
import { IoSettingsSharp } from "react-icons/io5";

const Admin = () => {
  return (
    <div className="flex flex- bg-gradient-to-b from-[#A9C2C3] to-[#679294] h-screen">
      <div className="flex ">
        <div className="flex flex-col mt-4 gap-10">
          <img src={logo} alt="" className="w-[150px]" />
          <div className="">
            <ul className="flex flex-col gap-2 md:gap-4 px-4 md:px-6 text-[12px] md:text-[16px]">
              <li>
                <a
                  href="/Dashboard"
                  className="flex items-center gap-2 hover:bg-[#2E3D40] hover:text-white  transition-[5s]  p-2 rounded-full"
                >
                  <MdDashboard />
                  <p>Dashboard</p>
                </a>
              </li>
              <li>
                <a
                  href="/Users"
                  className="flex items-center gap-2 hover:bg-[#2E3D40] hover:text-white transition-[5s]  p-2 rounded-full"
                >
                  <HiUsers />
                  <p>Users</p>
                </a>
              </li>
              <li>
                <a
                  href="/Doctors"
                  className="flex items-center gap-2 hover:bg-[#2E3D40] hover:text-white transition-[5s]  p-2 rounded-full"
                >
                  <FaUserDoctor />
                  <p>Doctors </p>
                </a>
              </li>

              <li>
                <a
                  href="/Settings"
                  className="flex items-center gap-2  hover:bg-[#2E3D40] hover:text-white transition-[5s]  p-2 rounded-full"
                >
                  <IoSettingsSharp />
                  <p>Settings </p>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col w-[1050px]">
          <p className="uppercase font-bold -8 text-xl py-2">title</p>
          <div className="bg-white h-screen w-full screen  mb-10 mr-5 "></div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
