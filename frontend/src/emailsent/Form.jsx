import React, { useState } from 'react';
import { AlertCircle } from "lucide-react";
import { Outlet, Link } from "react-router-dom";
import { useLocation } from "react-router-dom";



export default function Form() {
  const location = useLocation();
  const email = location.state?.email || "your email"; // Handle undefined case

  return (
    <div className="relative bg-[#679294] h-screen p-6  lg:w-[519px] mx-auto ml-[114px] md:w-full sm:w-full">

      <h2 className=" decoration-white font-exo2 text-3xl font-bold text-center mt-[125px]">Email sent!</h2>
      <AlertCircle className="w-[30px] h-[30px] text-[#2E3D40] font-size[10px] ml-[222px] mt-[15px]" />
      <h3 className='mt-[20px] text-[#2E3D40] font-bold text-center'>
        We sent  an email to {email} click the link in the email to reset your password
      </h3>

      <div className="flex gap-x-4 justify-center mt-[20px]">
        <Link to='/forgotpassword'>
        <button 
        onMouseDown={(e) => e.target.style.opacity = "0.8"} 
        onMouseUp={(e) => e.target.style.opacity = "1"}
        className="bg-white w-[200px] h-[41px] text-[#679294] font-exo2 px-4 py-2 rounded-lg ">
          Try again
        </button>
        </Link>
        <Link to='/signin'>
        <button 
        onMouseDown={(e) => e.target.style.opacity = "0.8"} 
        onMouseUp={(e) => e.target.style.opacity = "1"}
        className="bg-[#2E3D40] w-[200px] h-[41px] text-white font-exo2 px-4 py-2 rounded-lg cursor-pointer ">
          Back to Login
        </button>
        </Link>
      </div>

      <img
          src="/logo.png"
          className="w-[150px] h-[59px] block mx-auto mt-[95px]"
        />
    </div>
  );
}
